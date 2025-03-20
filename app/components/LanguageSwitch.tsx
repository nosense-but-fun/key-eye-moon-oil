"use client";

import { useRouter } from "next/navigation";
import { useLanguage } from "../contexts/LanguageContext";
import { useState, useCallback, useEffect } from "react";
import { getLanguages, getTones, ValidLanguage } from "../dictionaries";

export default function LanguageSwitch() {
  const { language, tone, setLanguage, setTone } = useLanguage();
  const router = useRouter();
  const [isChanging, setIsChanging] = useState(false);
  const [complainMode, setComplainMode] = useState(false);

  // Initialize complaint mode with 10% chance
  useEffect(() => {
    setComplainMode(Math.random() < 0.1);
  }, []);

  const handleLanguageChange = useCallback(
    (newLang: ValidLanguage) => {
      if (language === newLang) return;

      setIsChanging(true);

      // Get the appropriate tone for the new language
      const availableTones = getTones(newLang);
      const newTone =
        availableTones.length > 0 ? availableTones[0].code : "normal";

      // Update context
      setLanguage(newLang);
      setTone(newTone);

      // Navigate to new URL
      router.push(`/${newLang}?tone=${newTone}`);

      // Fake delay to show sarcastic loading message
      setTimeout(() => {
        setIsChanging(false);
      }, 800);
    },
    [language, router, setLanguage, setTone]
  );

  const handleToneChange = useCallback(
    (newTone: string) => {
      if (tone === newTone) return;

      setIsChanging(true);

      // Update context
      setTone(newTone);

      // Navigate to new URL
      router.push(`/${language}?tone=${newTone}`);

      // Fake delay to show sarcastic loading message
      setTimeout(() => {
        setIsChanging(false);
      }, 600);
    },
    [language, tone, router, setTone]
  );

  const languages = getLanguages();
  const tones = getTones(language as ValidLanguage);

  // Sarcastic loading messages
  const loadingMessages = [
    "Translating nonsense...",
    "Changing languages (why bother?)...",
    "Reconfiguring pointless settings...",
    "Loading different words for the same garbage...",
    "🖕 Switching to another language you don't speak...",
  ];

  // Complaint messages about language choice
  const getComplaintMessage = (lang: string) => {
    if (!complainMode) return null;

    const complaints = {
      en: "🖕 English? How original. Next you'll tell me you like oxygen.",
      zh: "中文？你真的会说中文，还是只是在炫耀？", // "Chinese? Do you actually speak it or just showing off?"
    };

    return complaints[lang as keyof typeof complaints] || null;
  };

  if (isChanging) {
    const randomMessage =
      loadingMessages[Math.floor(Math.random() * loadingMessages.length)];
    return (
      <div className="language-switcher opacity-70">
        <div className="flex items-center gap-2">
          <div className="animate-spin">⚙️</div>
          <span>{randomMessage}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="language-switcher flex flex-col gap-2">
      <div className="language-buttons flex gap-2">
        {languages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => handleLanguageChange(lang.code as ValidLanguage)}
            className={`px-3 py-1 rounded ${
              language === lang.code
                ? "bg-purple-600 text-white"
                : "bg-gray-200 text-gray-800 hover:bg-gray-300"
            }`}
          >
            {lang.name}
          </button>
        ))}
      </div>

      {tones.length > 0 && (
        <div className="tone-buttons flex gap-2">
          {tones.map((t) => (
            <button
              key={t.code}
              onClick={() => handleToneChange(t.code)}
              className={`px-2 py-1 text-sm rounded ${
                tone === t.code
                  ? "bg-indigo-500 text-white"
                  : "bg-gray-200 text-gray-800 hover:bg-gray-300"
              }`}
            >
              {t.name}
            </button>
          ))}
        </div>
      )}

      {complainMode && (
        <div className="text-sm text-gray-500 italic mt-1">
          {getComplaintMessage(language)}
        </div>
      )}
    </div>
  );
}
