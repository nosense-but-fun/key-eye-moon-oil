"use client";

import { useState } from "react";
import { useLanguage } from "@/app/contexts/LanguageContext";

export default function CrypticGenerator() {
  const { dictionary } = useLanguage();
  const dict = dictionary.cryptic_generator_tool;

  // State for our form and output
  const [complexity, setComplexity] = useState<number>(3);
  const [bullshitLevel, setBullshitLevel] = useState<number>(5);
  const [output, setOutput] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [devMode, setDevMode] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  // Function to generate text using our Next.js API route
  const generateWithAPI = async (complexity: number, bullshitLevel: number) => {
    try {
      // Call our own API route instead of OpenRouter directly
      const response = await fetch("/api/generate-cryptic", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          complexity,
          bullshitLevel,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || `API request failed with status ${response.status}`
        );
      }

      const data = await response.json();

      // Check if we're in development mode (using fallback responses)
      if (data.note) {
        setDevMode(true);
        console.warn(data.note);
      } else {
        setDevMode(false);
      }

      return data.text;
    } catch (err) {
      console.error("Error generating text with API:", err);
      throw err;
    }
  };

  // Function to generate cryptic nonsense
  const generateCryptic = async () => {
    setIsGenerating(true);
    setOutput("");
    setError(null);

    try {
      // Call our API to generate the text
      const result = await generateWithAPI(complexity, bullshitLevel);
      setOutput(result);
    } catch (err: any) {
      const errorMessage = err.message || "Something went wrong.";
      // Provide a more helpful message for timeout errors
      if (
        errorMessage.includes("timed out") ||
        errorMessage.includes("timeout")
      ) {
        setError(
          "The AI took too long to respond. Try using a lower complexity setting or try again later."
        );
      } else {
        setError(
          errorMessage ||
            "The AI is currently too confused to generate nonsense. Try again later."
        );
      }
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{dict.title}</h1>
        <p className="text-gray-600 dark:text-gray-300">{dict.description}</p>
      </div>

      {/* Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div className="p-4 border border-gray-300 dark:border-gray-700 rounded dark:bg-gray-800">
          <h2 className="text-lg font-bold mb-4">{dict.input.level_label}</h2>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              {dict.input.levels.mild}
            </label>
            <input
              type="range"
              min="1"
              max="5"
              value={complexity}
              onChange={(e) => setComplexity(parseInt(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
              <span>{dict.input.levels.mild}</span>
              <span>{dict.input.levels.medium}</span>
              <span>{dict.input.levels.extreme}</span>
            </div>
            {complexity > 3 && (
              <div className="text-yellow-600 dark:text-yellow-400 text-xs mt-1">
                Note: Values above 3 may be limited due to API timeouts
              </div>
            )}
          </div>

          <button
            onClick={generateCryptic}
            disabled={isGenerating}
            className={`w-full px-4 py-2 rounded ${
              isGenerating
                ? "bg-gray-400 dark:bg-gray-600 cursor-not-allowed"
                : "bg-black text-white dark:bg-gray-600 hover:bg-gray-800 dark:hover:bg-gray-700 transition-colors"
            }`}
          >
            {isGenerating
              ? dict.input.button.loading
              : dict.input.button.default}
          </button>
        </div>
      </div>

      {/* Output */}
      <div className="mb-8">
        <h2 className="text-lg font-bold mb-4">{dict.output.title}</h2>

        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 dark:bg-red-900 dark:text-red-200 p-4 mb-4">
            <p>{error}</p>
          </div>
        )}

        {devMode && !error && (
          <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 dark:bg-yellow-800 dark:text-yellow-200 p-4 mb-4">
            <p>
              <strong>Development Mode:</strong> Using built-in generator
              instead of AI. Set your OpenRouter API key in .env.local to use
              the AI.
            </p>
          </div>
        )}

        {isGenerating ? (
          <div className="bg-gray-100 dark:bg-gray-700 p-6 rounded animate-pulse flex justify-center items-center min-h-40">
            <p className="dark:text-gray-300">{dict.input.button.loading}</p>
          </div>
        ) : output ? (
          <div className="relative">
            <div className="bg-gray-100 dark:bg-gray-700 p-6 rounded whitespace-pre-wrap dark:text-gray-300">
              {output}
            </div>
            <button
              onClick={copyToClipboard}
              className="absolute top-2 right-2 bg-white dark:bg-gray-600 p-2 rounded-full shadow hover:shadow-md transition-shadow"
              title={dict.output.copy_button.default}
            >
              {copied
                ? dict.output.copy_button.copied
                : dict.output.copy_button.default}
            </button>
          </div>
        ) : (
          <div className="bg-gray-100 dark:bg-gray-700 p-6 rounded text-gray-500 dark:text-gray-400 italic min-h-40 flex items-center justify-center">
            <p>{dict.output.placeholder}</p>
          </div>
        )}
      </div>
    </div>
  );
}
