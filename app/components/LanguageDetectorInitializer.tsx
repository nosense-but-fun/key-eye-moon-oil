"use client";

import { useEffect } from "react";
import { initLanguageDetector } from "../lib/languageDetector";

export default function LanguageDetectorInitializer() {
  useEffect(() => {
    // Initialize the language detector on component mount
    initLanguageDetector();

    // Log a pointlessly elaborate message
    if (process.env.NODE_ENV === "development") {
      console.log(
        "%c🖕 KEMO Language Detector Initialized. Aren't you special?",
        "background: #111; color: #f0f; padding: 5px; border-radius: 3px; font-weight: bold;"
      );
    }

    // Clean up on unmount (though this component should never unmount)
    return () => {
      console.log("Language detector destroyed. As if anyone cares.");
    };
  }, []);

  // This component doesn't render anything
  return null;
}
