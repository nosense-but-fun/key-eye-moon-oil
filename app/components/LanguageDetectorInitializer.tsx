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
        "%c🖕 Eyro Language Detector Initialized. Aren't you special?",
        "color: #ff69b4; font-weight: bold; font-size: 12px;"
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
