import { NextResponse } from "next/server";
import { NeighborhoodAlertSchema } from "@/lib/schemas/neighborhoodAlert";
import { checkRateLimit } from "@/lib/rateLimit";
import { queueLead } from "@/lib/leadQueue";
import { isGhlConfigured, sendToGhl } from "@/lib/ghl";

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

  const rate = checkRateLimit(`neighborhood-alert:${ip}`, 5, 10 * 60 * 1000);
  if (!rate.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please try again shortly." },
      { status: 429 }
    );
  }

  const json = await request.json().catch(() => null);
  const parsed = NeighborhoodAlertSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid submission." }, { status: 400 });
  }

  const { company, ...data } = parsed.data;
  if (company) {
    return NextResponse.json({ ok: true });
  }

  // Tag pattern matches build brief §11: neighborhood-{slug}.
  const leadPayload = {
    ...data,
    tags: ["neighborhood-alert", `neighborhood-${data.neighborhoodSlug}`],
    source: "neighborhood-alert-form",
  };

  try {
    if (isGhlConfigured()) {
      await sendToGhl({
        name: data.name,
        email: data.email,
        tags: leadPayload.tags,
        customFields: { neighborhood: data.neighborhoodName },
      });
    } else {
      await queueLead(leadPayload);
    }
  } catch (error) {
    await queueLead({ ...leadPayload, ghlError: String(error) });
  }

  return NextResponse.json({ ok: true });
}
