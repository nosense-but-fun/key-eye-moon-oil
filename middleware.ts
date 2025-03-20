import { NextResponse } from "next/server";
import { match } from "@formatjs/intl-localematcher";
import Negotiator from "negotiator";
import {
  validLanguages,
  defaultLanguage,
  defaultTones,
  ValidLanguage,
} from "./app/dictionaries";
import type { NextRequest } from "next/server";

/**
 * Get the preferred locale from the request
 * @param {NextRequest} request
 * @returns {string} The detected locale
 */
function getLocale(request: NextRequest): string {
  try {
    // For simplicity in testing, we'll check URL first for locale override
    const url = new URL(request.url);
    const override = url.searchParams.get("locale");
    if (override === "en" || override === "zh") {
      return override;
    }

    // Negotiator expects plain objects
    const headers = Object.fromEntries(request.headers.entries());

    let languages: string[] = [];
    try {
      languages = new Negotiator({ headers }).languages();
    } catch (e) {
      console.error("Error detecting language:", e);
      return defaultLanguage;
    }

    // Match the preferred language against our supported locales
    try {
      return match(languages, validLanguages, defaultLanguage);
    } catch (e) {
      console.error("Error matching language:", e);
      return defaultLanguage;
    }
  } catch (error) {
    console.error("Error in getLocale:", error);
    return defaultLanguage;
  }
}

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // If the path already includes a language prefix, let it pass through
  if (pathname.match(/^\/[a-z]{2}(?:\/|$)/)) {
    return NextResponse.next();
  }

  // Get stored language from cookies (localStorage isn't available in middleware)
  const storedLang = request.cookies.get("kemo-language")?.value;
  const storedTone = request.cookies.get("kemo-tone")?.value;

  // Use stored language if valid, otherwise use default
  const lang =
    storedLang === "en" || storedLang === "zh" ? storedLang : defaultLanguage;

  // Use stored tone if valid for the language, otherwise use default
  let tone = storedTone;
  if (lang === "en" && tone !== "normal" && tone !== "chaotic") {
    tone = defaultTones.en;
  } else if (lang === "zh" && tone !== "standard" && tone !== "internet") {
    tone = defaultTones.zh;
  }

  // Construct the new URL with language prefix and tone
  const newUrl = new URL(`/${lang}${pathname}`, request.url);
  if (tone) {
    newUrl.searchParams.set("tone", tone);
  }

  // Redirect to the new URL
  return NextResponse.redirect(newUrl);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    "/((?!api|_next/static|_next/image|favicon.ico|public).*)",
  ],
};
