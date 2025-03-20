"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  defaultLanguage,
  defaultTones,
  validLanguages,
  validTones,
  ValidLanguage,
  getDictionary,
} from "../dictionaries";
import Cookies from "js-cookie";

// Storage keys
const STORAGE_KEYS = {
  LANGUAGE: "EYRO-language",
  TONE: "EYRO-tone",
};

// Cookie configuration
const COOKIE_OPTIONS = {
  expires: 365, // 1 year
  path: "/",
  sameSite: "lax",
} as const;

// Cookie names
const COOKIE_NAMES = {
  LANGUAGE: "eyro-language",
  TONE: "eyro-tone",
} as const;

// Define the context type
interface LanguageContextType {
  language: string;
  tone: string;
  dictionary: any; // TODO: Type this properly
  setLanguage: (newLang: string) => void;
  setTone: (newTone: string) => void;
}

// Define the provider props type
interface LanguageProviderProps {
  children: ReactNode;
  initialLanguage?: string;
  initialTone?: string;
  initialDictionary?: any; // TODO: Type this properly
}

// Context for language and tone state
const LanguageContext = createContext<LanguageContextType>({
  language: defaultLanguage,
  tone: defaultTones[defaultLanguage],
  dictionary: {},
  setLanguage: () => {},
  setTone: () => {},
});

// Helper function to safely interact with storage (both localStorage and cookies)
const getStorageItem = (key: string, fallback: string): string => {
  if (typeof window === "undefined") return fallback;
  try {
    // Try cookies first (for middleware compatibility)
    const cookieValue = Cookies.get(key);
    if (cookieValue) return cookieValue;

    // Then try localStorage
    const localValue = localStorage.getItem(key);
    if (localValue) {
      // If found in localStorage but not in cookies, sync to cookies
      Cookies.set(key, localValue, COOKIE_OPTIONS);
      return localValue;
    }

    return fallback;
  } catch (error) {
    console.warn("Error accessing storage:", error);
    return fallback;
  }
};

const setStorageItem = (key: string, value: string): void => {
  if (typeof window === "undefined") return;
  try {
    // Set both localStorage and cookies
    localStorage.setItem(key, value);
    Cookies.set(key, value, COOKIE_OPTIONS);
  } catch (error) {
    console.warn("Error writing to storage:", error);
  }
};

/**
 * Provider for language and tone state
 */
export function LanguageProvider({
  children,
  initialLanguage,
  initialTone,
  initialDictionary,
}: LanguageProviderProps) {
  console.log("[LanguageProvider] Initializing with:", {
    initialLanguage,
    initialTone,
    initialDictionaryExists: !!initialDictionary,
    initialDictionaryKeys: initialDictionary
      ? Object.keys(initialDictionary)
      : [],
  });

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Initialize state with storage values or defaults
  const [language, setLanguageState] = useState<string>(() => {
    // Priority: 1. URL param, 2. storage, 3. default
    if (
      initialLanguage &&
      (initialLanguage === "en" || initialLanguage === "zh")
    ) {
      // If URL has valid language, save it to storage
      setStorageItem(STORAGE_KEYS.LANGUAGE, initialLanguage);
      return initialLanguage;
    }
    return getStorageItem(STORAGE_KEYS.LANGUAGE, defaultLanguage);
  });

  const [tone, setToneState] = useState<string>(() => {
    // Priority: 1. URL param (if valid), 2. storage (if valid), 3. default for language
    if (initialTone) {
      const isValidTone =
        (language === "en" &&
          (initialTone === "normal" || initialTone === "chaotic")) ||
        (language === "zh" &&
          (initialTone === "standard" || initialTone === "internet"));

      if (isValidTone) {
        setStorageItem(STORAGE_KEYS.TONE, initialTone);
        return initialTone;
      }
    }

    // Try storage
    const storedTone = getStorageItem(STORAGE_KEYS.TONE, "");

    // Validate stored tone for current language
    const isStoredToneValid =
      (language === "en" &&
        (storedTone === "normal" || storedTone === "chaotic")) ||
      (language === "zh" &&
        (storedTone === "standard" || storedTone === "internet"));

    if (storedTone && isStoredToneValid) {
      return storedTone;
    }

    // Fallback to default for language
    const defaultTone = language === "en" ? defaultTones.en : defaultTones.zh;
    setStorageItem(STORAGE_KEYS.TONE, defaultTone);
    return defaultTone;
  });

  const [dictionary, setDictionary] = useState<any>(initialDictionary || {});
  const [error, setError] = useState<Error | null>(null);

  // Update dictionary when language or tone changes
  const updateDictionary = async (lang: string, newTone: string) => {
    console.log(
      `[LanguageProvider] Updating dictionary for ${lang}/${newTone}`
    );
    try {
      const newDictionary = await getDictionary(lang, newTone);
      console.log(
        "[LanguageProvider] Got new dictionary with keys:",
        Object.keys(newDictionary)
      );
      setDictionary(newDictionary);
      setError(null);
    } catch (err) {
      console.error("[LanguageProvider] Error updating dictionary:", err);
      setError(
        err instanceof Error ? err : new Error("Failed to load dictionary")
      );
      // Keep the previous dictionary to prevent complete UI failure
    }
  };

  // Handle language change
  const setLanguage = async (newLang: string) => {
    console.log(`[LanguageProvider] Setting language to ${newLang}`);

    // Check if the language is valid
    if (newLang !== "en" && newLang !== "zh") {
      console.warn(`[LanguageProvider] Invalid language: ${newLang}`);
      return;
    }

    // Update state and storage
    setLanguageState(newLang);
    setStorageItem(STORAGE_KEYS.LANGUAGE, newLang);

    // Check if the current tone is valid for the new language
    const isValidTone =
      newLang === "en"
        ? tone === "normal" || tone === "chaotic"
        : tone === "standard" || tone === "internet";

    // If current tone isn't valid for the new language, use default
    const newTone = isValidTone
      ? tone
      : newLang === "en"
      ? defaultTones.en
      : defaultTones.zh;

    if (!isValidTone) {
      console.log(
        `[LanguageProvider] Tone ${tone} not valid for ${newLang}, using ${newTone}`
      );
      setToneState(newTone);
      setStorageItem(STORAGE_KEYS.TONE, newTone);
    }

    // Update dictionary
    await updateDictionary(newLang, newTone);

    // Extract the current path without the language prefix
    const pathSegments = pathname.split("/").filter(Boolean);
    const currentLang =
      pathSegments[0] === "en" || pathSegments[0] === "zh"
        ? pathSegments[0]
        : null;

    // Build the new path
    let newPath = `/${newLang}`;
    if (currentLang) {
      // Replace the language segment
      newPath += pathname.substring(currentLang.length + 1);
    } else {
      // Add the language segment
      newPath += pathname;
    }

    // Preserve existing query parameters except tone
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.set("tone", newTone);

    // Navigate to the new URL
    console.log(
      `[LanguageProvider] Navigating to ${newPath}?${newParams.toString()}`
    );
    router.push(`${newPath}?${newParams.toString()}`);
  };

  // Handle tone change
  const setTone = async (newTone: string) => {
    console.log(`[LanguageProvider] Setting tone to ${newTone}`);

    // Check if tone is valid for current language
    const isValidTone =
      language === "en"
        ? newTone === "normal" || newTone === "chaotic"
        : newTone === "standard" || newTone === "internet";

    if (!isValidTone) {
      console.warn(
        `[LanguageProvider] Invalid tone for ${language}: ${newTone}`
      );
      return;
    }

    // Update state and storage
    setToneState(newTone);
    setStorageItem(STORAGE_KEYS.TONE, newTone);

    // Update dictionary
    await updateDictionary(language, newTone);

    // Update URL query parameter
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.set("tone", newTone);
    router.push(`${pathname}?${newParams.toString()}`);
  };

  // Sync state with URL on navigation
  useEffect(() => {
    const updateFromURL = async () => {
      console.log("[LanguageProvider] Updating from URL navigation");

      // Extract language from path
      const pathSegments = pathname.split("/").filter(Boolean);
      const pathLang = pathSegments[0];

      // If valid language in path and different from current, update it
      if ((pathLang === "en" || pathLang === "zh") && pathLang !== language) {
        console.log(`[LanguageProvider] URL language changed to ${pathLang}`);
        setLanguageState(pathLang);
        setStorageItem(STORAGE_KEYS.LANGUAGE, pathLang);
      }

      // Extract tone from query parameter
      const urlTone = searchParams.get("tone");

      // If valid tone for the current language, and different from current, update it
      if (urlTone) {
        const isValidTone =
          language === "en"
            ? urlTone === "normal" || urlTone === "chaotic"
            : urlTone === "standard" || urlTone === "internet";

        if (isValidTone && urlTone !== tone) {
          console.log(`[LanguageProvider] URL tone changed to ${urlTone}`);
          setToneState(urlTone);
          setStorageItem(STORAGE_KEYS.TONE, urlTone);
          await updateDictionary(language, urlTone);
        }
      }
    };

    updateFromURL();
  }, [pathname, searchParams]);

  return (
    <LanguageContext.Provider
      value={{
        language,
        tone,
        dictionary,
        setLanguage,
        setTone,
      }}
    >
      {error ? (
        <div className="max-w-4xl mx-auto p-8">
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4">
            <h1 className="text-xl font-bold">Error Loading Language</h1>
            <p>
              Sorry, we encountered an error while loading the language
              settings.
            </p>
            <p className="text-sm mt-2">Error: {error.message}</p>
          </div>
        </div>
      ) : (
        children
      )}
    </LanguageContext.Provider>
  );
}

/**
 * Hook to use the language context
 */
export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
