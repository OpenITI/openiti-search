import { cn } from "@/lib/utils";
import "@/styles/globals.css";

import { Amiri } from "next/font/google";
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

export const metadata = {
  title: "OpenITI Search",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={cn("font-sans", calSansFont.variable, amiri.variable)}
    >
      <body className="bg-gray-200">
        <main className="min-h-screen w-full pb-40">{children}</main>
      </body>
    </html>
  );
}
