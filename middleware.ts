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
  try {
    const { pathname } = request.nextUrl;

    // Ignore files and API routes
    if (
      pathname.startsWith("/_next") ||
      pathname.includes("/api/") ||
      pathname.match(/\.(jpg|png|svg|css|js)$/)
    ) {
      return NextResponse.next();
    }

    // Check if the pathname starts with a locale
    const pathnameHasLocale = validLanguages.some(
      (locale) =>
        pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
    );

    // If there's already a locale in the pathname, we're good
    if (pathnameHasLocale) {
      return NextResponse.next();
    }

    // Otherwise, get the preferred locale and redirect
    const locale = getLocale(request);

    // Redirect to the new URL with locale
    // Add the default tone for this language as a query param
    const newPathname = `/${locale}${pathname === "/" ? "" : pathname}`;
    request.nextUrl.pathname = newPathname;

    // Get tone based on language
    const tone = locale === "en" ? defaultTones.en : defaultTones.zh;
    request.nextUrl.searchParams.set("tone", tone);

    return NextResponse.redirect(request.nextUrl);
  } catch (error) {
    console.error("Error in middleware:", error);
    // Fallback to default language if middleware fails
    const newUrl = new URL(`/${defaultLanguage}`, request.url);
    return NextResponse.redirect(newUrl);
  }
}

export const config = {
  matcher: ["/((?!_next|api|.*\\..*).*)"],
};
