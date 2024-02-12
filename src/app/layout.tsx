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
        <main className="flex min-h-screen w-full justify-center">
          <div className="mt-36 w-full max-w-6xl pb-40">{children}</div>
        </main>
      </body>
    </html>
  );
}
