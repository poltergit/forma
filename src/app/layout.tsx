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
  title: { default: "FORMA — Matter in Motion", template: "%s — FORMA" },
  description: "Nothing is finished. Everything is becoming. FORMA is a digital atelier for shaping ideas through matter, force, motion, and trace.",
  applicationName: "FORMA",
  icons: { icon: "/forma-mark.svg", shortcut: "/forma-mark.svg" },
  metadataBase: siteUrl ? new URL(siteUrl) : undefined,
  openGraph: {
    type: "website",
    siteName: "FORMA",
    title: "FORMA — Matter in Motion",
    description: "Nothing is finished. Everything is becoming. Enter the digital atelier of Matter in Motion.",
  },
};

export const viewport: Viewport = { themeColor: "#100D18", colorScheme: "dark" };

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
