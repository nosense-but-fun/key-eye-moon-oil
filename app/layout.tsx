import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "KEMO Collection",
  description:
    "A collection of completely unrelated and possibly useless tools.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <html data-next-lang-support="true">{children}</html>;
}
