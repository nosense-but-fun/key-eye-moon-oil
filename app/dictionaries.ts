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
 * Get the dictionary for the specified language and tone
 * @param {string} locale - The language code (e.g., 'en', 'zh')
 * @param {string} tone - The tone (e.g., 'normal', 'chaotic', 'standard', 'internet')
 * @returns {Promise<object>} - The dictionary object
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
  let validatedTone = tone;
  const isValidTone =
    validatedLocale === "en"
      ? validTones.en.includes(tone as any)
      : validTones.zh.includes(tone as any);

  if (!isValidTone) {
    console.warn(
      `Invalid tone for ${validatedLocale}: ${tone}, falling back to ${defaultTone}`
    );
    validatedTone = defaultTone;
  }

  // Return the dictionary
  return dictionaries[validatedLocale][validatedTone]();
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
