// Valid languages and tones
export const validLanguages = ["en", "zh"] as const;
export type ValidLanguage = (typeof validLanguages)[number];

export const validTones = {
  en: ["normal", "chaotic"] as const,
  zh: ["standard", "internet"] as const,
};

export type ValidTone = {
  [K in ValidLanguage]: (typeof validTones)[K][number];
}[ValidLanguage];

// Default language and tone
export const defaultLanguage: ValidLanguage = "en";
export const defaultTones: Record<ValidLanguage, string> = {
  en: "normal",
  zh: "standard",
};

// Dictionary types
type Dictionary = Record<string, any>;
type DictionaryLoader = () => Promise<Dictionary>;
type LanguageDictionaries = Record<string, DictionaryLoader>;

// Dictionary definitions with language and tone combinations
const dictionaries: Record<ValidLanguage, Record<string, DictionaryLoader>> = {
  en: {
    normal: () =>
      import("./dictionaries/en/normal.json").then((module) => module.default),
    chaotic: () =>
      import("./dictionaries/en/chaotic.json").then((module) => module.default),
  },
  zh: {
    standard: () =>
      import("./dictionaries/zh/standard.json").then(
        (module) => module.default
      ),
    internet: () =>
      import("./dictionaries/zh/internet.json").then(
        (module) => module.default
      ),
  },
};

/**
 * Deep merge two dictionaries, with fallback values for missing fields
 */
const mergeDictionaries = (
  target: Dictionary,
  fallback: Dictionary
): Dictionary => {
  const result: Dictionary = { ...fallback };

  for (const key in target) {
    const targetValue = target[key];
    const fallbackValue = fallback[key];

    if (
      targetValue &&
      fallbackValue &&
      typeof targetValue === "object" &&
      typeof fallbackValue === "object" &&
      !Array.isArray(targetValue) &&
      !Array.isArray(fallbackValue)
    ) {
      // Recursively merge nested objects
      result[key] = mergeDictionaries(targetValue, fallbackValue);
    } else if (targetValue !== undefined) {
      // Use target value if it exists
      result[key] = targetValue;
    }
    // If target value is undefined, keep fallback value
  }

  return result;
};

/**
 * Try to load a dictionary, returning null if it fails
 */
const tryLoadDictionary = async (
  locale: ValidLanguage,
  tone: string
): Promise<Dictionary | null> => {
  try {
    const dictionary = await dictionaries[locale][tone]();
    return dictionary;
  } catch (error) {
    console.warn(`Failed to load dictionary for ${locale}/${tone}`);
    return null;
  }
};

/**
 * Get the dictionary for the specified language and tone with fallback chain:
 * 1. Try requested language + tone
 * 2. Try requested language + default tone for that language
 * 3. Try English + normal tone (base fallback)
 *
 * For each level, we merge with the fallback dictionary to ensure all keys exist
 */
export const getDictionary = async (
  locale: string,
  tone: string
): Promise<Dictionary> => {
  // Validate and coerce locale
  const validatedLocale = validLanguages.includes(locale as ValidLanguage)
    ? (locale as ValidLanguage)
    : defaultLanguage;

  if (validatedLocale !== locale) {
    console.warn(
      `Invalid language: ${locale}, falling back to ${defaultLanguage}`
    );
  }

  // Get default tone for the validated locale
  const defaultTone = defaultTones[validatedLocale];

  // Validate tone is valid for this language
  const isValidTone =
    validatedLocale === "en"
      ? validTones.en.includes(tone as any)
      : validTones.zh.includes(tone as any);

  if (!isValidTone) {
    console.warn(
      `Invalid tone for ${validatedLocale}: ${tone}, falling back to ${defaultTone}`
    );
  }

  // Load the base fallback dictionary (English normal)
  const baseDictionary = await tryLoadDictionary("en", "normal");
  if (!baseDictionary) {
    throw new Error("Failed to load base dictionary (en/normal)");
  }

  let resultDictionary = baseDictionary;

  // If not English, try to merge with the target language's default tone
  if (validatedLocale !== "en") {
    const defaultLangDictionary = await tryLoadDictionary(
      validatedLocale,
      defaultTone
    );
    if (defaultLangDictionary) {
      resultDictionary = mergeDictionaries(
        defaultLangDictionary,
        resultDictionary
      );
    }
  }

  // Finally, try to merge with the requested tone if different from default
  if (isValidTone && tone !== defaultTone) {
    const requestedDictionary = await tryLoadDictionary(validatedLocale, tone);
    if (requestedDictionary) {
      resultDictionary = mergeDictionaries(
        requestedDictionary,
        resultDictionary
      );
    }
  }

  return resultDictionary;
};

/**
 * Get all available languages with their display names
 * @returns {Array<{code: string, name: string}>} Languages list
 */
export const getLanguages = () => [
  { code: "en", name: "English" },
  { code: "zh", name: "中文" },
];

/**
 * Get all available tones for a specific language
 * @param {string} locale - The language code
 * @returns {Array<{code: string, name: string}>} Tones list for the language
 */
export const getTones = (locale: string) => {
  if (locale === "en") {
    return [
      { code: "normal", name: "Normal" },
      { code: "chaotic", name: "Chaotic" },
    ];
  } else if (locale === "zh") {
    return [
      { code: "standard", name: "标准" },
      { code: "internet", name: "网络冲浪" },
    ];
  }

  return [];
};
