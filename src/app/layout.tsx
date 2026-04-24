import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import DevIndicatorsHider from "@/components/DevIndicatorsHider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#ffffff",
};

export const metadata: Metadata = {
  title: "TaxCore360 - Professional Tax Filing Platform",
  description: "Complete tax filing and compliance solution for businesses. File 1099, W-2, W-3 forms with ease.",
  keywords: "tax filing, 1099, W-2, W-3, IRS compliance, business taxes",
  authors: [{ name: "TaxCore360" }],
  creator: "TaxCore360",
  publisher: "TaxCore360",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://taxcore360.com",
    title: "TaxCore360 - Professional Tax Filing Platform",
    description: "Complete tax filing and compliance solution for businesses",
    siteName: "TaxCore360",
  },
  twitter: {
    card: "summary_large_image",
    title: "TaxCore360 - Professional Tax Filing Platform",
    description: "Complete tax filing and compliance solution for businesses",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <DevIndicatorsHider />
        {children}
      </body>
    </html>
  );
}
