"use client";

/**
 * KEMO Language Detector
 *
 * A purposefully over-engineered utility that watches for language changes
 * and updates the HTML lang attribute accordingly. Also logs sarcastic messages
 * to the console because... KEMO.
 */

interface LanguageDetectorOptions {
  debugMode?: boolean;
  complainChance?: number;
}

export class LanguageDetector {
  private static instance: LanguageDetector;
  private observer: MutationObserver | null = null;
  private complainChance: number;
  private debugMode: boolean;
  private currentLang: string = "en";

  private constructor(options: LanguageDetectorOptions = {}) {
    this.debugMode = options.debugMode || false;
    this.complainChance = options.complainChance || 0.1;

    this.log("🖕 Language detector initialized... like anyone cares.");
  }

  public static getInstance(
    options?: LanguageDetectorOptions
  ): LanguageDetector {
    if (!LanguageDetector.instance) {
      LanguageDetector.instance = new LanguageDetector(options);
    }
    return LanguageDetector.instance;
  }

  public startWatching(): void {
    if (typeof window === "undefined") {
      return;
    }

    this.stopWatching();

    // Check for existing lang attribute
    const htmlElement = document.documentElement;
    if (htmlElement.lang) {
      this.currentLang = htmlElement.lang;
      this.log(`🔍 Initial language detected: ${this.currentLang}`);
    }

    // Set up mutation observer to detect changes to data attributes
    this.observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (
          mutation.type === "attributes" &&
          (mutation.attributeName === "data-next-lang" ||
            mutation.attributeName === "data-language")
        ) {
          const target = mutation.target as HTMLElement;
          const newLang = target.getAttribute(mutation.attributeName);
          if (newLang && newLang !== this.currentLang) {
            this.updateLanguage(newLang);
          }
        }
      });
    });

    // Observe the HTML element for attribute changes
    this.observer.observe(htmlElement, {
      attributes: true,
      attributeFilter: ["data-next-lang", "data-language"],
    });

    // Also check URL changes
    this.watchURLChanges();

    this.log("👀 Now watching for language changes... exciting stuff.");
  }

  public stopWatching(): void {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
      this.log("🛑 Stopped watching language changes. Who cares anyway?");
    }
  }

  private watchURLChanges(): void {
    if (typeof window === "undefined") return;

    // Extract language from URL (assuming /{lang} pattern)
    const checkURLForLanguage = () => {
      const pathParts = window.location.pathname.split("/");
      if (pathParts.length > 1) {
        const langFromPath = pathParts[1];
        if (langFromPath && ["en", "zh"].includes(langFromPath)) {
          if (langFromPath !== this.currentLang) {
            this.updateLanguage(langFromPath);
          }
        }
      }
    };

    // Check immediately
    checkURLForLanguage();

    // And on navigation
    window.addEventListener("popstate", checkURLForLanguage);

    // Monkey patch pushState and replaceState
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;

    history.pushState = function (...args) {
      originalPushState.apply(this, args);
      checkURLForLanguage();
    };

    history.replaceState = function (...args) {
      originalReplaceState.apply(this, args);
      checkURLForLanguage();
    };
  }

  private updateLanguage(newLang: string): void {
    if (typeof document === "undefined") return;

    const htmlElement = document.documentElement;

    // Update the HTML lang attribute
    htmlElement.lang = newLang;
    this.currentLang = newLang;

    // Complain randomly
    if (Math.random() < this.complainChance) {
      const complaints: Record<string, string> = {
        en: "🖕 Switched to English. How adventurous of you.",
        zh: "🖕 切换到中文。你真的能读懂吗？",
      };

      const complaint = complaints[newLang] || "🖕 Language changed. Whatever.";
      console.warn(complaint);
    } else {
      this.log(`✅ Language updated to: ${newLang}`);
    }

    // Dispatch a custom event for other components
    const event = new CustomEvent("languageChanged", {
      detail: { language: newLang },
    });
    document.dispatchEvent(event);
  }

  private log(message: string): void {
    if (this.debugMode) {
      console.log(`%c${message}`, "color: #9333ea");
    }
  }

  // Utility method to manually set language
  public setLanguage(lang: string): void {
    this.updateLanguage(lang);
  }
}

// Export a ready-to-use instance
export const languageDetector =
  typeof window !== "undefined"
    ? LanguageDetector.getInstance({
        debugMode: process.env.NODE_ENV === "development",
      })
    : null;

// Initialize automatically
export function initLanguageDetector(): void {
  if (languageDetector) {
    languageDetector.startWatching();
  }
}
