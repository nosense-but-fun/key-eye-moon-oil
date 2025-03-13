import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import KemoHeader from "./components/KemoHeader";
import KemoFooter from "./components/KemoFooter";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "KEMO Collection | Pointlessly Awesome",
  description:
    "A collection of completely unrelated and possibly useless tools. Enter at your own risk.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
      >
        <KemoHeader />
        <main className="flex-grow">{children}</main>
        <KemoFooter />
      </body>
    </html>
  );
}
