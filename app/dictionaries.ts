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
    normal: async () => {
      try {
        console.debug(
          "[DictionaryLoader] Attempting to load en/normal dictionary"
        );
        const module = await import("./dictionaries/en/normal.json");
        console.debug("[DictionaryLoader] en/normal module loaded:", {
          moduleExists: !!module,
          moduleType: typeof module,
          hasDefault: "default" in module,
          keys: Object.keys(module),
        });
        return module.default || module;
      } catch (error) {
        console.error(
          "[DictionaryLoader] Failed to load en/normal dictionary:",
          error
        );
        if (error instanceof Error) {
          console.error("[DictionaryLoader] Error details:", {
            name: error.name,
            message: error.message,
            stack: error.stack,
          });
        }
        throw error;
      }
    },
    chaotic: async () => {
      try {
        console.debug(
          "[DictionaryLoader] Attempting to load en/chaotic dictionary"
        );
        const module = await import("./dictionaries/en/chaotic.json");
        console.debug("[DictionaryLoader] en/chaotic module loaded:", {
          moduleExists: !!module,
          moduleType: typeof module,
          hasDefault: "default" in module,
          keys: Object.keys(module),
        });
        return module.default || module;
      } catch (error) {
        console.error(
          "[DictionaryLoader] Failed to load en/chaotic dictionary:",
          error
        );
        if (error instanceof Error) {
          console.error("[DictionaryLoader] Error details:", {
            name: error.name,
            message: error.message,
            stack: error.stack,
          });
        }
        throw error;
      }
    },
  },
  zh: {
    standard: async () => {
      try {
        console.debug(
          "[DictionaryLoader] Attempting to load zh/standard dictionary"
        );
        const module = await import("./dictionaries/zh/standard.json");
        console.debug("[DictionaryLoader] zh/standard module loaded:", {
          moduleExists: !!module,
          moduleType: typeof module,
          hasDefault: "default" in module,
          keys: Object.keys(module),
        });
        return module.default || module;
      } catch (error) {
        console.error(
          "[DictionaryLoader] Failed to load zh/standard dictionary:",
          error
        );
        if (error instanceof Error) {
          console.error("[DictionaryLoader] Error details:", {
            name: error.name,
            message: error.message,
            stack: error.stack,
          });
        }
        throw error;
      }
    },
    internet: async () => {
      try {
        console.debug(
          "[DictionaryLoader] Attempting to load zh/internet dictionary"
        );
        const module = await import("./dictionaries/zh/internet.json");
        console.debug("[DictionaryLoader] zh/internet module loaded:", {
          moduleExists: !!module,
          moduleType: typeof module,
          hasDefault: "default" in module,
          keys: Object.keys(module),
        });
        return module.default || module;
      } catch (error) {
        console.error(
          "[DictionaryLoader] Failed to load zh/internet dictionary:",
          error
        );
        if (error instanceof Error) {
          console.error("[DictionaryLoader] Error details:", {
            name: error.name,
            message: error.message,
            stack: error.stack,
          });
        }
        throw error;
      }
    },
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
      targetValue !== null &&
      targetValue !== undefined &&
      fallbackValue !== null &&
      fallbackValue !== undefined &&
      typeof targetValue === "object" &&
      typeof fallbackValue === "object" &&
      !Array.isArray(targetValue) &&
      !Array.isArray(fallbackValue)
    ) {
      // Recursively merge nested objects
      result[key] = mergeDictionaries(targetValue, fallbackValue);
    } else if (targetValue !== undefined && targetValue !== null) {
      // Use target value if it exists and is not null/undefined
      result[key] = targetValue;
    }
    // If target value is undefined/null, keep fallback value
  }

  // Also merge keys that exist in fallback but not in target
  for (const key in fallback) {
    if (!(key in target)) {
      result[key] = fallback[key];
    }
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
    console.debug(
      `[tryLoadDictionary] Attempting to load dictionary for ${locale}/${tone}`
    );

    if (!dictionaries[locale]) {
      console.warn(
        `[tryLoadDictionary] No dictionary loader found for language: ${locale}`
      );
      return null;
    }

    if (!dictionaries[locale][tone]) {
      console.warn(
        `[tryLoadDictionary] No dictionary loader found for tone: ${tone} in language: ${locale}`
      );
      return null;
    }

    console.debug(
      `[tryLoadDictionary] Found dictionary loader for ${locale}/${tone}, attempting import`
    );
    const module = await dictionaries[locale][tone]();

    console.debug(`[tryLoadDictionary] Import result for ${locale}/${tone}:`, {
      moduleExists: !!module,
      moduleType: typeof module,
      keys: module ? Object.keys(module) : [],
      randomPickerExists: module?.random_picker_tool ? true : false,
      layoutExists: module?.layout ? true : false,
    });

    if (!module) {
      console.warn(
        `[tryLoadDictionary] Dictionary for ${locale}/${tone} exists but failed to load`,
        module
      );
      return null;
    }

    console.debug(
      `[tryLoadDictionary] Successfully loaded dictionary for ${locale}/${tone}`
    );
    return module;
  } catch (error) {
    console.error(
      `[tryLoadDictionary] Failed to load dictionary for ${locale}/${tone}:`,
      error instanceof Error
        ? {
            name: error.name,
            message: error.message,
            stack: error.stack,
          }
        : "Unknown error"
    );
    return null;
  }
};

/**
 * Get the dictionary for the specified language and tone with fallback chain
 */
export const getDictionary = async (
  locale: string,
  tone: string
): Promise<Dictionary> => {
  console.log(`[getDictionary] Starting dictionary load for ${locale}/${tone}`);

  // Validate and coerce locale
  const validatedLocale = validLanguages.includes(locale as ValidLanguage)
    ? (locale as ValidLanguage)
    : defaultLanguage;

  if (validatedLocale !== locale) {
    console.warn(
      `[getDictionary] Invalid language: ${locale}, falling back to ${defaultLanguage}`
    );
  }

  // Get default tone for the validated locale
  const defaultTone = defaultTones[validatedLocale];
  console.log(
    `[getDictionary] Default tone for ${validatedLocale} is ${defaultTone}`
  );

  // Validate tone is valid for this language
  const isValidTone =
    validatedLocale === "en"
      ? validTones.en.includes(tone as any)
      : validTones.zh.includes(tone as any);

  if (!isValidTone) {
    console.warn(
      `[getDictionary] Invalid tone for ${validatedLocale}: ${tone}, falling back to ${defaultTone}`
    );
  }

  try {
    // Load the base fallback dictionary (English normal)
    console.log(
      "[getDictionary] Attempting to load base dictionary (en/normal)"
    );
    const baseDictionary = await tryLoadDictionary("en", "normal");
    if (!baseDictionary) {
      console.error(
        "[getDictionary] Failed to load base dictionary (en/normal)"
      );
      throw new Error(
        "Failed to load base dictionary (en/normal). This is a critical error as the base dictionary must exist."
      );
    }
    console.log(
      "[getDictionary] Successfully loaded base dictionary with keys:",
      Object.keys(baseDictionary)
    );

    let resultDictionary = baseDictionary;

    // If not English, try to merge with the target language's default tone
    if (validatedLocale !== "en") {
      console.log(
        `[getDictionary] Loading default tone dictionary for ${validatedLocale}/${defaultTone}`
      );
      const defaultLangDictionary = await tryLoadDictionary(
        validatedLocale,
        defaultTone
      );
      if (defaultLangDictionary) {
        console.log(
          `[getDictionary] Merging ${validatedLocale}/${defaultTone} dictionary with base dictionary`
        );
        resultDictionary = mergeDictionaries(
          defaultLangDictionary,
          resultDictionary
        );
        console.log(
          "[getDictionary] Merged dictionary now has keys:",
          Object.keys(resultDictionary)
        );
      } else {
        console.warn(
          `[getDictionary] Failed to load default tone dictionary for ${validatedLocale}, using base dictionary`
        );
      }
    }

    // Finally, try to merge with the requested tone if different from default
    if (isValidTone && tone !== defaultTone) {
      console.log(
        `[getDictionary] Loading requested tone dictionary for ${validatedLocale}/${tone}`
      );
      const requestedDictionary = await tryLoadDictionary(
        validatedLocale,
        tone
      );
      if (requestedDictionary) {
        console.log(
          `[getDictionary] Merging ${validatedLocale}/${tone} dictionary with previous dictionary`
        );
        resultDictionary = mergeDictionaries(
          requestedDictionary,
          resultDictionary
        );
        console.log(
          "[getDictionary] Final merged dictionary has keys:",
          Object.keys(resultDictionary)
        );
      } else {
        console.warn(
          `[getDictionary] Failed to load requested tone dictionary ${validatedLocale}/${tone}, using previous dictionary`
        );
      }
    }

    return resultDictionary;
  } catch (error) {
    console.error("[getDictionary] Error during dictionary loading:", error);
    throw error; // Re-throw to let the error boundary handle it
  }
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
