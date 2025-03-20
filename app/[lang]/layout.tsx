import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";
import EyroHeader from "../components/EyroHeader";
import EyroFooter from "../components/EyroFooter";
import { LanguageProvider } from "../contexts/LanguageContext";
import Script from "next/script";
import LanguageDetectorInitializer from "../components/LanguageDetectorInitializer";
import {
  getDictionary,
  defaultTones,
  validLanguages,
  defaultLanguage,
} from "../dictionaries";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Define the dictionary type
interface Dictionary {
  layout: {
    html_lang: string;
    title: string;
    description: string;
  };
  [key: string]: any;
}

// Helper function to validate language
function validateLang(langParam: string | undefined): string {
  return langParam === "en" || langParam === "zh" ? langParam : defaultLanguage;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  // Await params before accessing properties
  const { lang: langParam } = await params;

  // Validate language - only accept 'en' or 'zh'
  const lang = validateLang(langParam);

  // Get the default tone for this language
  const tone = lang === "en" ? defaultTones.en : defaultTones.zh;

  // Get dictionary for the language with default tone
  const dictionary = (await getDictionary(lang, tone)) as Dictionary;

  return {
    title: dictionary.layout.title,
    description: dictionary.layout.description,
    // Set html lang attribute using Next.js 13+ metadata format
    metadataBase: new URL("https://example.com"),
    alternates: {
      languages: {
        "en-US": "/en",
        "zh-CN": "/zh",
      },
    },
  };
}

export default async function LanguageLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}>) {
  // Await params before accessing properties
  const { lang: langParam } = await params;

  // Validate language - only accept 'en' or 'zh'
  const lang = validateLang(langParam);

  // Get the default tone for this language
  const tone = lang === "en" ? defaultTones.en : defaultTones.zh;

  // Get dictionary
  const dictionary = (await getDictionary(lang, tone)) as Dictionary;

  // Define HTML lang attribute settings
  const htmlLang = dictionary.layout.html_lang;

  return (
    <>
      {/* Initialize language detector */}
      <LanguageDetectorInitializer />

      {/* Inline script to set HTML lang attribute on client side */}
      <Script id="set-html-lang" strategy="afterInteractive">
        {`
          if (document && document.documentElement) {
            document.documentElement.lang = "${htmlLang}";
          }
        `}
      </Script>

      <div
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
      >
        <LanguageProvider
          initialLanguage={lang}
          initialTone={tone}
          initialDictionary={dictionary}
        >
          <EyroHeader dictionary={dictionary} />
          <main className="flex-grow">{children}</main>
          <EyroFooter dictionary={dictionary} />
        </LanguageProvider>
      </div>
    </>
  );
}
