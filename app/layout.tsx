import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import SiteChrome from "@/components/layout/SiteChrome";
import { Toaster } from "sonner";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Kajjansi Aquaculture Service Centre | Fish Farming Solutions in East Africa",
    template: "%s | Kajjansi Aquaculture Service Centre",
  },
  description:
    "East Africa's premier one-stop aquaculture solutions centre. Offering fish pond construction, dam liner supply & installation, fish fingerlings, feed, equipment, consultancy, and training across Uganda, Kenya, Tanzania, and beyond.",
  keywords: [
    "aquaculture Uganda",
    "fish farming East Africa",
    "fish fingerlings Uganda",
    "dam liners Uganda",
    "fish pond construction",
    "aquaculture consultancy",
    "Kajjansi fish farm",
    "Nile tilapia fingerlings",
    "African catfish fingerlings",
    "fish feed Uganda",
  ],
  authors: [{ name: "Kajjansi Aquaculture Service Centre" }],
  openGraph: {
    type: "website",
    locale: "en_UG",
    siteName: "Kajjansi Aquaculture Service Centre",
    title: "Kajjansi Aquaculture Service Centre | Your Complete Fish Farming Partner",
    description:
      "From fingerlings to full farm setup — Kajjansi Aquaculture Service Centre is your trusted partner for profitable fish farming in East Africa.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Kajjansi Aquaculture Service Centre",
    description: "East Africa's leading aquaculture solutions provider.",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${plusJakarta.variable} h-full`}>
      <body className="min-h-full flex flex-col antialiased">
        <SiteChrome>{children}</SiteChrome>
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
