import { redirect } from "next/navigation";
import { isAdminAuthed, isAdminPasswordConfigured } from "@/lib/adminAuth";
import { getSupabase } from "@/lib/supabase";
import { StoredIntakeSchema, intakeFields } from "@/lib/offerIntake";
import { MlsPropertySchema } from "@/lib/offerProperty";

export const dynamic = "force-dynamic";

export default async function OfferRequestsPage() {
  // Existing admin helpers allow access in an unconfigured development setup.
  // Offer requests contain personal data: explicitly fail closed here.
  if (!isAdminPasswordConfigured() || !(await isAdminAuthed())) redirect("/admin/login");
  const { data, error } = await getSupabase().from("leads").select("id,payload,created_at")
    .eq("source", "website-offer-intake").order("created_at", { ascending: false }).limit(100);
  return <section className="space-y-6">
    <div><h1 className="font-display text-3xl">Offer requests</h1><p className="mt-2 text-sm text-muted">Buyer-confirmed inquiries awaiting your review. Verify the property record and terms before preparing an offer. These requests have not been sent to a seller or to DocuSign.</p></div>
    {error && <p role="alert">Requests could not be loaded. Please try again.</p>}
    {!error && !data?.length && <p>No offer requests yet.</p>}
    {data?.map(row => {
      const parsed = StoredIntakeSchema.safeParse(row.payload?.draft);
      const property = MlsPropertySchema.safeParse(row.payload?.property);
      if (!parsed.success) return <article key={row.id} className="border border-line bg-white p-6"><p>Request {row.id} needs manual review because its stored format is unexpected.</p></article>;
      return <article key={row.id} className="rounded-lg border border-line bg-white p-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-teal-deep">Awaiting broker review · {property.success ? "MLS record attached" : "Property unverified"}</p>
        <h2 className="mt-2 break-words font-display text-2xl">{parsed.data.propertyReference}</h2>
        <p className="mt-2 text-xs text-muted">{new Date(row.created_at).toLocaleString("en-US", { timeZone: "America/New_York" })} ET · {row.id}</p>
        {property.success && <div className="mt-4 space-y-3 rounded border border-line bg-paper p-4 text-sm">
          <a href={property.data.mlsUrl} target="_blank" rel="noreferrer" className="font-semibold text-teal-deep underline">Open listing in FlexMLS</a>
          <p>{property.data.address} · MLS {property.data.listingId} · {property.data.status} · {property.data.listPrice === null ? "Price not supplied" : property.data.listPrice.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 })}</p>
          <p>Listing key: {property.data.listingKey} · MLS source: {property.data.mlsId}</p>
          <p>Listing agent: {property.data.listingAgent.name ?? "Not supplied"} · {property.data.listingAgent.phone ?? "Phone not supplied"} · {property.data.listingAgent.email ?? "Email not supplied"}</p>
          <p>Listing office: {property.data.listingOffice.name ?? "Not supplied"} · {property.data.listingOffice.phone ?? "Phone not supplied"}</p>
          <p className="text-xs text-muted">MLS data retrieved {property.data.retrievedAt}. Review the current record before preparing an offer.</p>
          <details><summary className="cursor-pointer font-medium">Full property details</summary><pre className="mt-3 max-h-96 overflow-auto whitespace-pre-wrap break-words text-xs">{JSON.stringify(property.data.propertyDetails, null, 2)}</pre></details>
        </div>}
        <dl className="mt-4 grid gap-4 sm:grid-cols-2">{intakeFields.map(field => <div key={field.key}><dt className="text-xs text-muted">{field.label}</dt><dd className="mt-1 whitespace-pre-wrap break-words text-sm">{parsed.data[field.key] || (field.key === "financingContingency" && parsed.data.financing === "Cash" ? "Not applicable — cash purchase" : "Not provided")}</dd></div>)}</dl>
        <div className="mt-5 flex flex-wrap gap-3"><a href={`/api/admin/offer-requests/${row.id}`} className="inline-flex rounded-full border border-teal-deep px-4 py-2 text-sm text-teal-deep">Download complete request</a><a href="https://scottforman.app.n8n.cloud/form/5f03d1a2-cd72-4926-b5ee-65c96b1e2286" target="_blank" rel="noreferrer" className="inline-flex rounded-full bg-teal-deep px-4 py-2 text-sm text-white">Open Florida AS-IS contract intake</a></div>
        <p className="mt-2 text-xs text-muted">The download includes the buyer’s terms, available MLS record and identifiers. Choose the next automation after your review.</p>
        <p className="mt-2 text-xs text-muted">Opens your existing broker workflow. Review and enter the verified terms there; this link does not transfer buyer details or submit the form.</p>
      </article>;
    })}
    {data?.length === 100 && <p className="text-sm text-muted">Showing the 100 most recent requests.</p>}
  </section>;
}
