import type { Metadata } from "next";
import { Accordion, type AccordionItem } from "@/components/ui/Accordion";
import { CalendlyButton } from "@/components/scheduling/CalendlyButton";
import { brand } from "@/lib/brand";

export const metadata: Metadata = {
  title: "Homestead Exemption Info",
  description:
    "Florida homestead exemption explained for Key West / Monroe County homeowners — eligibility, filing, deadlines, and the Save Our Homes cap.",
};

const proofOfResidency = [
  "Previous residency outside Florida, and date it ended",
  "Florida driver license or ID card number",
  "Evidence of giving up a driver license from another state",
  "Florida vehicle tag number",
  "Florida voter registration number (if a US citizen)",
  "Declaration of domicile, with residency date",
  "Current employer",
  "Address listed on your last IRS return",
  "School location of dependent children",
  "Bank statement and checking account mailing address",
  "Proof of payment of utilities at the homestead address",
];

const filingQuestions = [
  "Whose name or names were recorded on the title on January 1?",
  "What is the street address of the property?",
  "Were you living in the dwelling on January 1?",
  "Do you claim homestead in another county or state?",
];

const examples = [
  { assessed: "$44,885", base: "$25,000", additional: "—", note: "Below $50,000 — additional exemption doesn't apply." },
  { assessed: "$67,455", base: "$25,000", additional: "$17,455", note: "Additional exemption covers the amount between $50,000–$75,000." },
  { assessed: "$204,429", base: "$25,000", additional: "$25,000", note: "Full additional exemption — value exceeds $75,000." },
];

const faqs: AccordionItem[] = [
  {
    question: "What is a Homestead Exemption?",
    answer: (
      <>
        <p>
          There are a number of state and local laws providing exemptions that can lower the taxable value of
          certain properties. The homestead exemption is the most common, and can provide up to $50,000 off
          the assessed value of a property used as the owner&rsquo;s primary residence — an initial $25,000
          exemption, plus an additional exemption (up to $25,000) off the assessed value over $50,000. The
          additional $25,000 doesn&rsquo;t apply to the school tax levy, and doesn&rsquo;t require a separate
          application.
        </p>
        <p>
          The homestead exemption also establishes the &ldquo;Save Our Homes&rdquo; cap on annual increases in
          assessed value — it can&rsquo;t rise more than 3% a year unless the property changes or the
          homestead is removed.
        </p>
      </>
    ),
  },
  {
    question: "Are there other protections tied to homestead status?",
    answer: (
      <p>
        Real estate used and owned as a homestead — less any portion used for commercial purposes — by any
        quadriplegic is exempt from taxation entirely (F.S. §196.031).
      </p>
    ),
  },
  {
    question: "Can I receive a homestead exemption on a mobile home?",
    answer: (
      <p>
        Yes, if you own both the land and the mobile home and they&rsquo;re titled identically. You must
        declare the mobile home a permanent structure and make a one-time purchase of an RP tag. Once that&rsquo;s
        done, the home is included on the real estate tax roll and no further license tag fee is required.
      </p>
    ),
  },
  {
    question: "Do I qualify for the Homestead Exemption?",
    answer: (
      <>
        <p>You&rsquo;re entitled to a Homestead Exemption if, as of January 1:</p>
        <ul>
          <li>You have legal title to the home;</li>
          <li>You have established Monroe County as your legal domicile;</li>
          <li>You reside on the property; and</li>
          <li>You are a US citizen or permanent resident.</li>
        </ul>
      </>
    ),
  },
  {
    question: "What documents do I need to apply?",
    answer: (
      <>
        <p>Consider bringing the following to establish ownership and residency in Monroe County:</p>
        <ul>
          <li>Deed as recorded in the Official Records of Monroe County</li>
          <li>Florida driver&rsquo;s license or ID card reflecting the property address</li>
          <li>Vehicle registration reflecting the property address</li>
          <li>Social Security number</li>
          <li>Proof that residency-based exemptions on a previous home have been canceled</li>
          <li>Address of any co-owner(s) not residing on the property</li>
          <li>Mobile home owners: title/registration for the mobile home, and deed to the real estate</li>
          <li>Voter registration card or declaration of domicile (Permanent Resident Alien Card holders must also file a declaration of domicile)</li>
        </ul>
        <p>
          Note: these documents must be dated prior to January 1 of the year you plan to file. You&rsquo;ll
          also need the address on your last income tax return, your current employer, each owner&rsquo;s
          permanent Florida residence date, occupancy date, and information about any exemptions filed last
          year. In some cases, proof of utility payment, banking institution details, or evidence of where
          dependent children attend school may also be requested.
        </p>
      </>
    ),
  },
  {
    question: "Do I have to be a citizen to qualify?",
    answer: (
      <p>
        No — citizenship isn&rsquo;t required. An applicant who isn&rsquo;t a US citizen must present a
        Permanent Resident Card when applying.
      </p>
    ),
  },
  {
    question: "Where and when do I apply?",
    answer: (
      <p>
        March 1 is the deadline to apply for the current tax year. You can apply at any of the three Monroe
        County offices, or submit by mail — since original signatures are required, faxed or emailed
        applications can&rsquo;t be accepted. If you&rsquo;re not yet eligible this year but will be next year,
        you may pre-file any time after March 1.
      </p>
    ),
  },
  {
    question: "Is there any appeal if I miss the deadline for filing?",
    answer: (
      <p>
        Yes. You&rsquo;ll need to file an appeal with the Value Adjustment Board and a late application in
        person at the Property Appraiser&rsquo;s office. The deadline is set by law — on or before the 25th day
        following the mailing of the notice of proposed property taxes (the TRIM notice), usually in early
        September. Approval or denial is decided by the Value Adjustment Board, which will hear your reasons
        for filing late. A filing fee applies to the appeal.
      </p>
    ),
  },
  {
    question: "Is renewal automatic?",
    answer: (
      <p>
        Yes — if there&rsquo;s no change in residency or ownership on a property currently receiving
        exemptions, the exemption automatically renews for the following year.
      </p>
    ),
  },
  {
    question: "Do I lose my homestead exemption due to death of a spouse, marriage, or divorce?",
    answer: <p>Not necessarily — each case is different. Contact the Property Appraiser&rsquo;s office directly if one of these events occurs.</p>,
  },
  {
    question: "What if my property is in a trust?",
    answer: (
      <p>
        The possessory right in the property must be in a written instrument granting a beneficial interest
        for life to the applicant(s), reflecting the legal description of the property. A copy of the trust,
        or a memorandum of trust, must be submitted for review.
      </p>
    ),
  },
  {
    question: "What if I move? What is “Portability”?",
    answer: (
      <p>
        Portability lets previously homesteaded Florida owners transfer, or &ldquo;port,&rdquo; some or all of
        their Save Our Homes benefit to a new home. If the new home&rsquo;s market value is higher, you may
        transfer the full benefit; if lower, the benefit transfers as a percentage applied to the new
        home&rsquo;s market value. You can&rsquo;t port more than $500,000, and you must have had a homestead
        exemption in either of the two preceding tax roll years — note this isn&rsquo;t the same as two years
        between your sale and purchase dates.
      </p>
    ),
  },
  {
    question: "What happens if I make improvements or additions?",
    answer: (
      <p>
        Additions or improvements are valued at market value as of the first January 1 after they&rsquo;re
        substantially completed. In future years, annual increases are capped under Save Our Homes as usual.
      </p>
    ),
  },
  {
    question: "Can I rent my home?",
    answer: (
      <p>
        Generally, no — renting the entire dwelling, even temporarily or seasonally, constitutes abandonment of
        the homestead until you occupy it again (F.S. §196.061). Abandonment after January 1 doesn&rsquo;t
        affect that year&rsquo;s exemption, but a second consecutive year of abandonment loses it. The
        exception is military personnel transferred out of the county (transfer orders required). You may
        rent part of your primary residence, but that portion must be recorded with the Property Appraiser and
        is excluded from the exemption and Save Our Homes protection.
      </p>
    ),
  },
  {
    question: "Is the Homestead Exemption removed when the property is sold?",
    answer: (
      <p>
        It stays on the property for the year of the sale, then is removed the following tax year. The new
        owner must apply for their own exemption no later than March 1 of the next tax year.
      </p>
    ),
  },
];

const mapSrc =
  "https://www.google.com/maps?q=" + encodeURIComponent("500 Whitehead St, Key West, FL 33040") + "&output=embed";

export default function HomesteadInfoPage() {
  return (
    <>
      {/* Stat-forward hero — the $50,000 figure is the one thing every reader
          needs to walk away with, so it leads instead of hiding in paragraph three. */}
      <section className="relative overflow-hidden bg-ink py-20 sm:py-28">
        <span
          className="pointer-events-none absolute -left-24 -top-24 h-96 w-96 rounded-full opacity-[0.12] blur-[110px]"
          aria-hidden="true"
          style={{ background: "var(--teal)" }}
        />
        <span
          className="pointer-events-none absolute -right-24 bottom-0 h-96 w-96 rounded-full opacity-[0.12] blur-[110px]"
          aria-hidden="true"
          style={{ background: "var(--gold)" }}
        />
        <div className="relative mx-auto max-w-[1000px] px-4 text-center sm:px-6">
          <span className="font-sans text-[11px] font-medium uppercase tracking-[0.18em] text-gold">
            For Buyers
          </span>
          <h1 className="mt-4 font-display text-4xl leading-tight text-white sm:text-5xl lg:text-6xl">
            Florida Homestead Exemption
          </h1>
          <p className="mx-auto mt-5 max-w-2xl font-sans text-base text-white/90 sm:text-lg">
            Own it, live in it on January 1st, and Monroe County can take up to{" "}
            <span className="font-display text-teal">$50,000</span> off your taxable value.
          </p>

          <div className="mx-auto mt-12 grid max-w-3xl gap-6 sm:grid-cols-3">
            {[
              { value: "$25,000", label: "Initial exemption — applies to all property taxes" },
              { value: "$25,000", label: "Additional exemption — assessed value $50k–$75k, non-school taxes only" },
              { value: "3% cap", label: "Maximum annual increase in assessed value (“Save Our Homes”)" },
            ].map((stat) => (
              <div key={stat.label} className="border border-white/15 bg-white/5 p-6">
                <p className="font-display text-3xl text-white">{stat.value}</p>
                <p className="mt-2 font-sans text-xs leading-relaxed text-white/70">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1280px] px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[1.5fr_1fr] lg:gap-16">
          <div>
            <div className="max-w-[65ch] font-sans text-base leading-relaxed text-body">
              <p>
                Every person who owns and resides on real property in Florida on January 1, and makes that
                property their permanent residence, is eligible for a homestead exemption up to $50,000. The
                first $25,000 applies to all property taxes, including school district taxes. The additional
                exemption of up to $25,000 applies to the assessed value between $50,000 and $75,000, and only
                to non-school taxes.
              </p>
              <p className="mt-5">
                The application for homestead exemption (Form DR-501) and other property tax forms are
                available through the county property appraiser&rsquo;s office. If filing for the first time,
                be ready to answer a few questions about the property and your residency there — and if only
                one spouse holds the title, the other spouse may file with the titleholder&rsquo;s consent.
              </p>
            </div>

            {/* Worked examples */}
            <div className="mt-12">
              <p className="font-sans text-xs font-medium uppercase tracking-[0.18em] text-gold-deep">
                How the Additional Exemption Works
              </p>
              <div className="mt-5 grid gap-4 sm:grid-cols-3">
                {examples.map((ex) => (
                  <div key={ex.assessed} className="border border-line p-5">
                    <p className="font-sans text-xs text-muted">Assessed Value</p>
                    <p className="font-display text-2xl text-ink">{ex.assessed}</p>
                    <div className="mt-4 flex flex-col gap-2 border-t border-line pt-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-body">Base exemption</span>
                        <span className="font-medium text-ink">{ex.base}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-body">Additional exemption</span>
                        <span className="font-medium text-ink">{ex.additional}</span>
                      </div>
                    </div>
                    <p className="mt-4 font-sans text-xs leading-relaxed text-muted">{ex.note}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Filing + proof-of-residency checklists */}
            <div className="mt-12 grid gap-6 sm:grid-cols-2">
              <div className="border border-line p-6">
                <p className="font-sans text-xs font-medium uppercase tracking-[0.18em] text-gold-deep">
                  First-Time Filing? Be Ready to Answer
                </p>
                <ul className="mt-4 flex flex-col gap-2.5">
                  {filingQuestions.map((q) => (
                    <li key={q} className="flex gap-3 text-sm text-body">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" aria-hidden="true" />
                      {q}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="border border-line p-6">
                <p className="font-sans text-xs font-medium uppercase tracking-[0.18em] text-gold-deep">
                  Proof of Residency May Include
                </p>
                <ul className="mt-4 flex flex-col gap-2.5">
                  {proofOfResidency.map((item) => (
                    <li key={item} className="flex gap-3 text-sm text-body">
                      <CheckIcon />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* FAQ */}
            <div className="mt-14">
              <p className="font-sans text-xs font-medium uppercase tracking-[0.18em] text-gold-deep">
                Common Questions
              </p>
              <div className="mt-4">
                <Accordion items={faqs} />
              </div>
            </div>

            <p className="mt-8 font-sans text-xs text-muted">
              See Section 196.031, Florida Statutes. For local information, contact your county property
              appraiser.
            </p>
          </div>

          {/* Sidebar */}
          <div className="flex flex-col gap-6 lg:sticky lg:top-24 lg:self-start">
            <div className="border border-line p-6 sm:p-8">
              <p className="font-sans text-xs font-medium uppercase tracking-[0.18em] text-gold-deep">
                Where to File
              </p>
              <address className="mt-3 font-sans text-sm not-italic text-body">
                500 Whitehead St.
                <br />
                Rear of Building
                <br />
                Key West, FL 33040
              </address>
              <p className="mt-3 font-sans text-sm text-body">
                Ask for <strong className="text-ink">Maggie Diaz</strong> — she&rsquo;s very nice and helpful!
              </p>
              <div className="mt-4 aspect-square w-full overflow-hidden border border-line">
                <iframe
                  title="Map to the Monroe County Property Appraiser office"
                  src={mapSrc}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="h-full w-full border-0"
                />
              </div>
            </div>

            <div className="border border-line p-6 sm:p-8">
              <p className="font-sans text-xs font-medium uppercase tracking-[0.18em] text-gold-deep">
                Questions Before You Close?
              </p>
              <p className="mt-3 text-sm text-body">
                {brand.broker.name} can point you toward the right forms and timing as part of your purchase.
              </p>
              <div className="mt-4 flex flex-col gap-3">
                <a
                  href={brand.phone.href}
                  className="inline-flex min-h-11 items-center justify-center bg-ink px-5 py-2.5 font-sans text-sm font-medium text-white transition-colors hover:bg-teal hover:text-ink"
                >
                  Call {brand.phone.display}
                </a>
                <CalendlyButton
                  utmContent="homestead-info-page"
                  className="inline-flex min-h-11 items-center justify-center bg-teal px-5 py-2.5 font-sans text-sm font-medium text-ink transition-opacity hover:opacity-90"
                >
                  Book a 15-Minute Call
                </CalendlyButton>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="mt-0.5 shrink-0 text-teal-deep">
      <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
