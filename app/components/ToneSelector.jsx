"use client";

import { useLanguage } from "../contexts/LanguageContext";
import { getTones } from "../dictionaries";

/**
 * Tone selector dropdown
 */
export default function ToneSelector({ dictionary }) {
  const { language, tone, setTone } = useLanguage();
  const tones = getTones(language);

  return (
    <div className="relative inline-block ml-2">
      <select
        value={tone}
        onChange={(e) => setTone(e.target.value)}
        className="appearance-none bg-gray-800 text-white py-1 px-3 pr-8 rounded border border-gray-700 cursor-pointer text-sm"
        aria-label={dictionary.tone_selector.label}
      >
        {tones.map((t) => (
          <option key={t.code} value={t.code}>
            {t.name}
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-white">
        <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </div>
    </div>
  );
}
