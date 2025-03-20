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
  LANGUAGE: "kemo-language",
  TONE: "kemo-tone",
};

// Cookie configuration
const COOKIE_OPTIONS = {
  expires: 365, // 1 year
  path: "/",
  sameSite: "lax",
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

  // Handle language change
  const setLanguage = async (newLang: string) => {
    // Check if the language is valid
    if (newLang !== "en" && newLang !== "zh") {
      console.warn(`Invalid language: ${newLang}`);
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
      setToneState(newTone);
      setStorageItem(STORAGE_KEYS.TONE, newTone);
    }

    // Update dictionary
    const newDictionary = await getDictionary(newLang, newTone);
    setDictionary(newDictionary);

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
    router.push(`${newPath}?${newParams.toString()}`);
  };

  // Handle tone change
  const setTone = async (newTone: string) => {
    // Check if tone is valid for current language
    const isValidTone =
      language === "en"
        ? newTone === "normal" || newTone === "chaotic"
        : newTone === "standard" || newTone === "internet";

    if (!isValidTone) {
      console.warn(`Invalid tone for ${language}: ${newTone}`);
      return;
    }

    // Update state and storage
    setToneState(newTone);
    setStorageItem(STORAGE_KEYS.TONE, newTone);

    // Update dictionary
    const newDictionary = await getDictionary(language, newTone);
    setDictionary(newDictionary);

    // Update URL query parameter
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.set("tone", newTone);
    router.push(`${pathname}?${newParams.toString()}`);
  };

  // Sync state with URL on navigation
  useEffect(() => {
    // Extract language from path
    const pathSegments = pathname.split("/").filter(Boolean);
    const pathLang = pathSegments[0];

    // If valid language in path and different from current, update it
    if ((pathLang === "en" || pathLang === "zh") && pathLang !== language) {
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
        setToneState(urlTone);
        setStorageItem(STORAGE_KEYS.TONE, urlTone);
      }
    }

    // Update dictionary when language or tone changes
    const updateDictionary = async () => {
      const newDictionary = await getDictionary(language, tone);
      setDictionary(newDictionary);
    };
    updateDictionary();
  }, [pathname, searchParams, language, tone]);

  const contextValue: LanguageContextType = {
    language,
    tone,
    dictionary,
    setLanguage,
    setTone,
  };

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
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
