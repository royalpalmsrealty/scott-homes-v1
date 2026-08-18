import type { Metadata } from "next";
import { CalendlyButton } from "@/components/scheduling/CalendlyButton";
import { brand } from "@/lib/brand";

export const metadata: Metadata = {
  title: "Utilities Set Up Instructions and Forms",
  description:
    "Step-by-step instructions for setting up Keys Energy, FKAA water, and Comcast service after your Key West home closing.",
};

export default function UtilitySetupPage() {
  return (
    <section className="mx-auto max-w-[1280px] px-4 py-14 sm:px-6 sm:py-24 lg:px-8">
      <div className="flex flex-col items-start gap-2">
        <span className="font-sans text-[11px] font-medium uppercase tracking-[0.18em] text-gold-deep">
          For Buyers
        </span>
        <h1 className="mt-2 font-display text-3xl leading-tight text-ink sm:text-4xl">
          Utilities Set Up Instructions and Forms
        </h1>
        <span className="mt-4 h-px w-16 bg-gold" aria-hidden="true" />
      </div>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1.5fr_1fr] lg:gap-16">
        <div className="max-w-[65ch] font-sans text-base leading-relaxed text-body">
          <p>Congratulations on your upcoming closing! It&rsquo;s time to turn our attention to utility transfer.</p>
          <p className="mt-5">
            Attached below are the forms and instructions for filling them out. We&rsquo;ll need the completed
            forms and a copy of your driver&rsquo;s license (whoever&rsquo;s name is on the form — only one can
            be used). An iPhone photo is fine, we just need something that can be printed. Once closing is
            official, the title company will fax a copy of the warranty deed, and we&rsquo;ll take the paperwork
            to the utility offices to complete the setup.
          </p>
          <p className="mt-5">
            Please see the instructions below, and be sure to let us know which option you want for the water
            bill. Send everything back with your driver&rsquo;s license, and we&rsquo;ll take care of the rest.
          </p>

          {/* Keys Energy */}
          <div className="mt-14 border-t border-line pt-10">
            <h2 className="font-display text-2xl text-ink">Keys Energy</h2>

            <div className="mt-6 border border-line p-6 sm:p-8">
              <p className="font-sans text-xs font-medium uppercase tracking-[0.18em] text-gold-deep">
                Page 1 — Keys Energy Deposit Requirement Form
              </p>
              <ul className="mt-4 flex flex-col gap-2.5 text-sm">
                <li className="flex gap-3">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" aria-hidden="true" />
                  Complete the top section, Deposit Agreement. You only need to complete and sign the top box.
                </li>
                <li className="flex gap-3">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" aria-hidden="true" />
                  The credit card information is for the $125 deposit only.
                </li>
                <li className="flex gap-3">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" aria-hidden="true" />
                  Be sure to sign the bottom!
                </li>
              </ul>
            </div>

            <div className="mt-5 border border-line p-6 sm:p-8">
              <p className="font-sans text-xs font-medium uppercase tracking-[0.18em] text-gold-deep">
                Page 2 — Keys Energy Service Agreement
              </p>
              <ul className="mt-4 flex flex-col gap-2.5 text-sm">
                <li className="flex gap-3">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" aria-hidden="true" />
                  Complete section one as much as you can.
                </li>
                <li className="flex gap-3">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" aria-hidden="true" />
                  Initial the box in the middle of the page.
                </li>
                <li className="flex gap-3">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" aria-hidden="true" />
                  Sign and date at the bottom — but do not check the box &ldquo;I accept.&rdquo;
                </li>
              </ul>
            </div>
          </div>

          {/* FKAA */}
          <div className="mt-14 border-t border-line pt-10">
            <h2 className="font-display text-2xl text-ink">FKAA (Water)</h2>
            <div className="mt-6 border border-line p-6 sm:p-8">
              <p className="font-sans text-xs font-medium uppercase tracking-[0.18em] text-gold-deep">
                FKAA Application — Agreement for Service
              </p>
              <p className="mt-4 text-sm">
                In the payment information, provide your credit card number, expiration date, and security
                code. You have two options:
              </p>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div className="border border-line bg-paper p-5">
                  <p className="font-display text-lg text-ink">Option 1 — Autopay</p>
                  <p className="mt-2 text-sm text-body">
                    Sign up for Autopay and a $20 service charge is billed to your card — the deposit is
                    waived. You&rsquo;ll be billed monthly with automatic payment.
                  </p>
                </div>
                <div className="border border-line bg-paper p-5">
                  <p className="font-display text-lg text-ink">Option 2 — Deposit Only</p>
                  <p className="mt-2 text-sm text-body">
                    Use the credit card for the deposit only ($125) and pay monthly by another method. In the
                    remarks section, write &ldquo;credit card for deposit only.&rdquo;
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Comcast */}
          <div className="mt-14 border-t border-line pt-10">
            <h2 className="font-display text-2xl text-ink">Comcast — High-Speed Internet &amp; Cable TV</h2>
            <div className="mt-6 border border-line p-6 sm:p-8">
              <p className="text-sm text-body">
                We also have a concierge-type service for phone, internet, and cable through Comcast. The
                contact is <strong className="text-ink">Cassandra</strong>, who can explain the different
                services and plans so you can select what&rsquo;s best for you.
              </p>
              <a
                href="tel:3059248677"
                className="mt-4 inline-flex min-h-11 items-center justify-center bg-ink px-5 py-2.5 font-sans text-sm font-medium text-white transition-colors hover:bg-teal hover:text-ink"
              >
                Call Cassandra: 305-924-8677
              </a>
            </div>
          </div>

          {/* Forms note — no PDFs supplied yet, so no fake download links. */}
          <div className="mt-10 border-l-4 border-teal bg-paper p-6 text-sm text-body">
            The Keys Energy and FKAA forms referenced above will be available to download directly from this
            page once uploaded — for now, our office will send them to you directly by email.
          </div>
        </div>

        {/* Contact card */}
        <div className="flex flex-col gap-6 lg:sticky lg:top-24 lg:self-start">
          <div className="border border-line p-6 sm:p-8">
            <p className="font-sans text-xs font-medium uppercase tracking-[0.18em] text-gold-deep">
              Questions About Setup?
            </p>
            <p className="mt-3 font-sans text-sm text-body">
              Reach out to our office directly and we&rsquo;ll walk you through the forms and next steps.
            </p>
            <div className="mt-4 flex flex-col gap-3">
              <a
                href={brand.phone.href}
                className="inline-flex min-h-11 items-center justify-center bg-ink px-5 py-2.5 font-sans text-sm font-medium text-white transition-colors hover:bg-teal hover:text-ink"
              >
                Call {brand.phone.display}
              </a>
              <CalendlyButton
                utmContent="utility-setup-page"
                className="inline-flex min-h-11 items-center justify-center bg-teal px-5 py-2.5 font-sans text-sm font-medium text-ink transition-opacity hover:opacity-90"
              >
                Book a 15-Minute Call
              </CalendlyButton>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
