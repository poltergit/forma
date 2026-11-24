import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/shell/site-header";
import { SiteFooter } from "@/components/shell/site-footer";
import { SpatialTransitionProvider } from "@/components/shell/spatial-transition";

const displayFont = Space_Grotesk({ subsets: ["latin"], variable: "--font-space-grotesk", display: "swap" });
const bodyFont = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const monoFont = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains-mono", display: "swap" });
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

export const metadata: Metadata = {
  title: { default: "FORMA — An independent digital atelier", template: "%s — FORMA" },
  description: "A creative instrument for shaping ideas through geometry, motion, typography, and digital space.",
  applicationName: "FORMA",
  metadataBase: siteUrl ? new URL(siteUrl) : undefined,
  openGraph: {
    type: "website",
    siteName: "FORMA",
    title: "FORMA — An independent digital atelier",
    description: "Make a mark. Bend a system. Find a form you didn't know you were looking for.",
  },
};

export const viewport: Viewport = { themeColor: "#f4f1e8", colorScheme: "light" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-scroll-behavior="smooth" className={`${displayFont.variable} ${bodyFont.variable} ${monoFont.variable}`}>
      <body>
        <SpatialTransitionProvider>
          <a className="skip-link" href="#main-content">Skip to content</a>
          <SiteHeader />
          {children}
          <SiteFooter />
        </SpatialTransitionProvider>
      </body>
    </html>
  );
}
