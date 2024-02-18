import type { Viewport } from "next";
import { cn } from "@/lib/utils";

import "@/styles/globals.css";

import { Amiri, Inter } from "next/font/google";
import localFont from "next/font/local";

const amiri = Amiri({
  subsets: ["latin", "arabic"],
  variable: "--font-serif",
  weight: ["400", "700"],
});

const calSansFont = localFont({
  src: "../fonts/CalSans-SemiBold.ttf",
  variable: "--font-sans",
});

const interFont = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata = {
  title: "OpenITI Search",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
  openGraph: {
    type: "website",
    siteName: "OpenITI Search",
    locale: "en_US",
    url: "/",
    title: "OpenITI Search",
  },
  alternates: {
    canonical: "/",
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
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#2A4DD0",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={cn(
        "font-sans",
        calSansFont.variable,
        amiri.variable,
        interFont.variable,
      )}
    >
      <body className="bg-gray-200">
        <main className="min-h-screen w-full pb-40">{children}</main>
      </body>
    </html>
  );
}
