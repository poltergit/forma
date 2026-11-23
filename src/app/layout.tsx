import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/shell/site-header";
import { SiteFooter } from "@/components/shell/site-footer";

const displayFont = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

const bodyFont = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const monoFont = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

export const metadata: Metadata = {
  title: {
    default: "FORMA — Where form meets function",
    template: "%s — FORMA",
  },
  description:
    "An interactive digital playground for design, motion, creative coding, generative systems, and 3D experiences.",
  applicationName: "FORMA",
  metadataBase: siteUrl ? new URL(siteUrl) : undefined,
  openGraph: {
    type: "website",
    siteName: "FORMA",
    title: "FORMA — Where form meets function",
    description:
      "Design should be experienced, not simply viewed. Explore the FORMA creative technology playground.",
  },
};

export const viewport: Viewport = {
  themeColor: "#111214",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${displayFont.variable} ${bodyFont.variable} ${monoFont.variable}`}
    >
      <body>
        <a className="skip-link" href="#main-content">
          Skip to content
        </a>
        <SiteHeader />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
