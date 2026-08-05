// Single call site for GoHighLevel contact creation. Nothing else in the codebase
// should call the GHL API directly — swapping in real field mappings/workflow
// names (build brief §11) only touches this file.
export function isGhlConfigured() {
  return Boolean(process.env.GHL_API_KEY && process.env.GHL_LOCATION_ID);
}

type GhlLeadPayload = {
  name: string;
  email: string;
  phone?: string;
  tags: string[];
  customFields?: Record<string, string>;
};

export async function sendToGhl(payload: GhlLeadPayload) {
  // TODO: confirm exact field mapping and trigger the matching workflow
  // (e.g. `general-followup`) once GHL_API_KEY / GHL_LOCATION_ID / workflow
  // names are confirmed with the client (build brief §15).
  const res = await fetch("https://services.leadconnectorhq.com/contacts/", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.GHL_API_KEY}`,
      "Content-Type": "application/json",
      Version: "2021-07-28",
    },
    body: JSON.stringify({
      locationId: process.env.GHL_LOCATION_ID,
      name: payload.name,
      email: payload.email,
      phone: payload.phone,
      tags: payload.tags,
      customFields: payload.customFields,
    }),
  });

  if (!res.ok) {
    throw new Error(`GHL request failed with status ${res.status}`);
  }
}
