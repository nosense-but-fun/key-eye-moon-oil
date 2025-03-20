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
} from "../dictionaries";

// Define the context type
interface LanguageContextType {
  language: string;
  tone: string;
  setLanguage: (newLang: string) => void;
  setTone: (newTone: string) => void;
}

// Define the provider props type
interface LanguageProviderProps {
  children: ReactNode;
  initialLanguage?: string;
  initialTone?: string;
}

// Context for language and tone state
const LanguageContext = createContext<LanguageContextType>({
  language: defaultLanguage,
  tone: defaultTones[defaultLanguage],
  setLanguage: () => {},
  setTone: () => {},
});

/**
 * Provider for language and tone state
 */
export function LanguageProvider({
  children,
  initialLanguage,
  initialTone,
}: LanguageProviderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Initialize state with provided values or defaults
  const [language, setLanguageState] = useState<string>(
    initialLanguage || defaultLanguage
  );

  const [tone, setToneState] = useState<string>(() => {
    // Get the initial tone value based on language
    if (!initialTone) {
      // If no initialTone is provided, use the default for the language
      if (language === "en") return defaultTones.en;
      if (language === "zh") return defaultTones.zh;
      return defaultTones.en; // Fallback
    }
    return initialTone;
  });

  // Handle language change
  const setLanguage = (newLang: string) => {
    // Check if the language is valid
    if (newLang !== "en" && newLang !== "zh") {
      console.warn(`Invalid language: ${newLang}`);
      return;
    }

    // Update state
    setLanguageState(newLang);

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
    }

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
  const setTone = (newTone: string) => {
    // Check if tone is valid for current language
    const isValidTone =
      language === "en"
        ? newTone === "normal" || newTone === "chaotic"
        : newTone === "standard" || newTone === "internet";

    if (!isValidTone) {
      console.warn(`Invalid tone for ${language}: ${newTone}`);
      return;
    }

    // Update state
    setToneState(newTone);

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
      }
    }
  }, [pathname, searchParams, language, tone]);

  const contextValue: LanguageContextType = {
    language,
    tone,
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
