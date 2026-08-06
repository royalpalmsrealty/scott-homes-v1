import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  // TODO-CLIENT-ASSET: swap for the real production domain before launch.
  metadataBase: new URL("https://www.royalpalmsrealty.com"),
  title: {
    default: "Royal Palms Realty | Key West, FL Real Estate",
    template: "%s | Royal Palms Realty",
  },
  description:
    "Royal Palms Realty is a boutique luxury real estate brokerage serving Key West, Florida, led by Broker/Owner Scott Forman.",
};

// Kept deliberately minimal — the public site's header/footer/chat widget
// live in (site)/layout.tsx so /admin doesn't inherit them. Everything here
// is genuinely shared across both: fonts, global CSS, base HTML metadata.
export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-white text-body">{children}</body>
    </html>
  );
}
