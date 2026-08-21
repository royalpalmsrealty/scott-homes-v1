// Single source of truth for utility-provider fees, phone numbers, and
// addresses shown on /buyers/utility-setup. All of this is third-party data
// (set by the providers, not us) and goes stale on its own schedule — when
// any of it changes, this is the one file to edit; nothing here should be
// duplicated inline in the page component.
//
// Content authoritative as of 2026-08-20, supplied directly by the client —
// do not add, "correct," or infer any fee/number/requirement beyond this.

export type UtilityProvider = {
  number: string;
  name: string;
  lastVerified: string; // human-readable, shown small/secondary per section
  steps: string[]; // ordered process, rendered as a numbered list
  contact: { label: string; value: string; href?: string }[];
  note?: string; // secondary/smaller-text caveat, e.g. FKAA's deposit note
};

const LAST_VERIFIED = "August 20, 2026";

export const utilityProviders: UtilityProvider[] = [
  {
    number: "1",
    name: "Electricity — Keys Energy Services",
    lastVerified: LAST_VERIFIED,
    steps: [
      'Complete the official <a href="https://www.keysenergy.com/contract-for-service" target="_blank" rel="noopener noreferrer">Contract for Service</a>.',
      "Provide a valid photo ID plus a rent receipt, lease, or warranty deed.",
      'For the deposit, either enroll in the <a href="https://www.keysenergy.com/electronic-debit-authorization" target="_blank" rel="noopener noreferrer">Electronic Debit Program</a> while establishing service to waive the initial residential deposit, or pay the current $125 residential deposit (previous KEYS customers in good standing may qualify for a waiver).',
      "A $40 service fee is added to the first bill.",
    ],
    contact: [
      {
        label: "Full instructions",
        value: "Keys Energy Residential Service",
        href: "https://www.keysenergy.com/resources/residential-service",
      },
      { label: "Connect / disconnect / transfer", value: "305-295-1090" },
      { label: "Main number", value: "305-295-1000" },
      { label: "Office", value: "1001 James Street, Key West, FL 33040" },
      { label: "Fax", value: "305-295-1085" },
    ],
  },
  {
    number: "2",
    name: "Water — Florida Keys Aqueduct Authority (FKAA)",
    lastVerified: LAST_VERIFIED,
    steps: [
      'Visit the <a href="https://www.fkaa.com/192/Establish-Service" target="_blank" rel="noopener noreferrer">FKAA Establish Service page</a> and complete the online start-service form.',
      "Have ready: account name, service and mailing addresses, phone number, driver&rsquo;s-license number, date of birth, email, and a copy of the lease, deed, or HUD-1.",
      "Select an accepted payment method: credit card, check, Google Pay, or Apple Pay.",
      'After the account is created, use the <a href="https://www.myfkaa.com/login" target="_blank" rel="noopener noreferrer">MyFKAA portal</a> for registration, billing, and payment management.',
    ],
    contact: [
      { label: "Customer service / start or transfer", value: "305-296-2454 (Mon–Fri, 8am–5pm)" },
      { label: "Office", value: "1100 Kennedy Drive, Key West, FL 33040" },
    ],
    note: "If FKAA requires a deposit, confirm the amount or waiver directly with customer service. The official start-service page does not publish a general deposit amount.",
  },
  {
    number: "3",
    name: "Internet, Wi-Fi & TV — Xfinity/Comcast",
    lastVerified: LAST_VERIFIED,
    steps: [
      'Go to the <a href="https://www.xfinity.com/local/fl/key-west" target="_blank" rel="noopener noreferrer">official Xfinity Key West page</a>.',
      "Enter the exact service address, confirm availability, and select a plan.",
      "Choose self-install pickup/delivery or professional installation during checkout.",
    ],
    contact: [
      {
        label: "Existing customers moving service",
        value: "xfinity.com/moving",
        href: "https://www.xfinity.com/moving",
      },
      { label: "Customer support", value: "1-800-XFINITY (1-800-934-6489)" },
      {
        label: "Online chat",
        value: "Xfinity Assistant",
        href: "https://www.xfinity.com/chat",
      },
      { label: "Local store", value: "Xfinity Store by Comcast, 1010 Kennedy Drive, Suite 101, Key West, FL 33040" },
    ],
  },
];

export const utilityStandingNote =
  "Fees and requirements are set by the providers and may change. Confirm current details directly with each provider.";
