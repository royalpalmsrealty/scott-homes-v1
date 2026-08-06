import { NextResponse } from "next/server";
import crypto from "crypto";
import { isGhlConfigured, sendToGhl } from "@/lib/ghl";
import { queueLead } from "@/lib/leadQueue";

// Configure this URL as a webhook subscription in your Calendly account
// (invitee.created + invitee.canceled) once a paid plan is active — webhooks
// aren't available on Calendly's free tier. Signing key comes from that
// subscription's setup screen.
function verifySignature(rawBody: string, signatureHeader: string | null): boolean {
  const signingKey = process.env.CALENDLY_WEBHOOK_SIGNING_KEY;
  if (!signingKey) return true; // not configured yet — see D1, processed unverified for now
  if (!signatureHeader) return false;

  const parts = Object.fromEntries(
    signatureHeader.split(",").map((p) => p.split("=") as [string, string])
  );
  if (!parts.t || !parts.v1) return false;

  const expected = crypto
    .createHmac("sha256", signingKey)
    .update(`${parts.t}.${rawBody}`)
    .digest("hex");

  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(parts.v1));
}

export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("Calendly-Webhook-Signature");

  if (!verifySignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const payload = JSON.parse(rawBody);
  const eventType = payload.event as string | undefined;
  const invitee = payload.payload?.invitee ?? {};
  const eventDetails = payload.payload?.event ?? {};

  const leadPayload = {
    name: invitee.name ?? "Unknown",
    email: invitee.email ?? "",
    eventStartTime: eventDetails.start_time,
    source: "calendly-webhook",
    calendlyEventType: eventType,
  };

  try {
    if (eventType === "invitee.created") {
      if (isGhlConfigured()) {
        await sendToGhl({
          name: leadPayload.name,
          email: leadPayload.email,
          tags: ["booked-call"],
          customFields: { eventStartTime: String(leadPayload.eventStartTime ?? "") },
        });
      } else {
        await queueLead({ ...leadPayload, tags: ["booked-call"] });
      }
    } else if (eventType === "invitee.canceled") {
      if (isGhlConfigured()) {
        await sendToGhl({
          name: leadPayload.name,
          email: leadPayload.email,
          tags: ["booking-canceled"],
        });
      } else {
        await queueLead({ ...leadPayload, tags: ["booking-canceled"] });
      }
    }
  } catch (error) {
    await queueLead({ ...leadPayload, tags: ["booking-webhook-error"], error: String(error) });
  }

  return NextResponse.json({ ok: true });
}
