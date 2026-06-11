import type { Metadata } from "next";
import localFont from "next/font/local";
import { Toaster } from "sonner";

import { SiteHeader } from "@/components/site-header";
import { Providers } from "./providers";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: "Products · Universe",
  description: "Manage your product catalog",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <Providers>
          <SiteHeader />
          <main>{children}</main>
        </Providers>
        <Toaster richColors position="bottom-right" />
      </body>
    </html>
  );
}
