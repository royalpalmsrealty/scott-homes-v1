import { NextResponse } from "next/server";
import { HomeValueSchema } from "@/lib/schemas/homeValue";
import { checkRateLimit } from "@/lib/rateLimit";
import { queueLead } from "@/lib/leadQueue";
import { isGhlConfigured, sendToGhl } from "@/lib/ghl";

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

  const rate = checkRateLimit(`home-value:${ip}`, 5, 10 * 60 * 1000);
  if (!rate.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please try again shortly." },
      { status: 429 }
    );
  }

  const json = await request.json().catch(() => null);
  const parsed = HomeValueSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid submission." }, { status: 400 });
  }

  const { company, ...data } = parsed.data;
  // Honeypot tripped — report success to whatever filled it in, drop the payload.
  if (company) {
    return NextResponse.json({ ok: true });
  }

  const leadPayload = {
    ...data,
    tags: ["home-valuation", `timeframe-${data.timeframe}`],
    source: "home-value-form",
  };

  try {
    if (isGhlConfigured()) {
      await sendToGhl({
        name: data.name,
        email: data.email,
        phone: data.phone,
        tags: leadPayload.tags,
        customFields: { address: data.address, timeframe: data.timeframe },
      });
    } else {
      await queueLead(leadPayload);
    }
  } catch (error) {
    // GHL failed — fall back to the local queue rather than dropping the lead.
    await queueLead({ ...leadPayload, ghlError: String(error) });
  }

  return NextResponse.json({ ok: true });
}
