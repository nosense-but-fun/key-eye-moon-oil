"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "@/app/contexts/LanguageContext";

export default function RandomPicker() {
  console.log("[RandomPicker] Component rendering");

  const { dictionary } = useLanguage();
  console.log("[RandomPicker] Received dictionary:", {
    exists: !!dictionary,
    keys: dictionary ? Object.keys(dictionary) : [],
    randomPickerTool: dictionary?.random_picker_tool
      ? Object.keys(dictionary.random_picker_tool)
      : "undefined",
  });

  // Validate dictionary structure and provide fallbacks
  const dict = {
    title: dictionary?.random_picker_tool?.title || "Random Picker",
    description:
      dictionary?.random_picker_tool?.description ||
      "Pick a random option from your list",
    input: {
      title: dictionary?.random_picker_tool?.input?.title || "Options",
      option_placeholder:
        dictionary?.random_picker_tool?.input?.option_placeholder ||
        "Enter an option",
      add_button:
        dictionary?.random_picker_tool?.input?.add_button || "Add Option",
      remove_button:
        dictionary?.random_picker_tool?.input?.remove_button || "Remove",
    },
    button: {
      default: dictionary?.random_picker_tool?.button?.default || "Pick Random",
      loading: dictionary?.random_picker_tool?.button?.loading || "Picking...",
    },
    validation: {
      min_options:
        dictionary?.random_picker_tool?.validation?.min_options ||
        "Please add at least 2 options",
      max_options:
        dictionary?.random_picker_tool?.validation?.max_options ||
        "Maximum 100 options allowed",
      duplicate_options:
        dictionary?.random_picker_tool?.validation?.duplicate_options ||
        "Duplicate options are not allowed",
    },
    output: {
      title: dictionary?.random_picker_tool?.output?.title || "Result",
      copy_button: {
        default:
          dictionary?.random_picker_tool?.output?.copy_button?.default ||
          "Copy",
        copied:
          dictionary?.random_picker_tool?.output?.copy_button?.copied ||
          "Copied!",
      },
    },
  };

  const [options, setOptions] = useState<string[]>([""]);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const [copied, setCopied] = useState(false);

  const addOption = () => {
    if (options.length >= 100) {
      setError(dict.validation.max_options);
      return;
    }
    setOptions([...options, ""]);
  };

  const removeOption = (index: number) => {
    const newOptions = options.filter((_, i) => i !== index);
    setOptions(newOptions.length ? newOptions : [""]);
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const validateOptions = () => {
    // Remove empty options
    const nonEmptyOptions = options.filter((opt) => opt.trim() !== "");

    if (nonEmptyOptions.length < 2) {
      setError(dict.validation.min_options);
      return false;
    }

    // Check for duplicates
    const uniqueOptions = new Set(nonEmptyOptions);
    if (uniqueOptions.size !== nonEmptyOptions.length) {
      setError(dict.validation.duplicate_options);
      return false;
    }

    return true;
  };

  const pickRandom = () => {
    setError(null);

    if (!validateOptions()) {
      return;
    }

    setIsSelecting(true);
    const nonEmptyOptions = options.filter((opt) => opt.trim() !== "");

    // Simulate a selection process with multiple steps
    let steps = 20;
    let interval = 50;
    let currentStep = 0;

    const intervalId = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * nonEmptyOptions.length);
      setSelectedOption(nonEmptyOptions[randomIndex]);
      currentStep++;

      if (currentStep >= steps) {
        clearInterval(intervalId);
        setIsSelecting(false);
      }
    }, interval);
  };

  const copyToClipboard = async () => {
    if (selectedOption) {
      try {
        await navigator.clipboard.writeText(selectedOption);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error("Failed to copy:", err);
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{dict.title}</h1>
        <p className="text-gray-600 dark:text-gray-300">{dict.description}</p>
      </div>

      {/* Input Section */}
      <div className="mb-8">
        <h2 className="text-lg font-bold mb-4">{dict.input.title}</h2>
        <div className="space-y-2">
          {options.map((option, index) => (
            <div key={index} className="flex gap-2">
              <input
                type="text"
                value={option}
                onChange={(e) => updateOption(index, e.target.value)}
                placeholder={dict.input.option_placeholder}
                className="flex-1 p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
              />
              <button
                onClick={() => removeOption(index)}
                className="px-3 py-2 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                title={dict.input.remove_button}
              >
                ×
              </button>
            </div>
          ))}
        </div>

        <button
          onClick={addOption}
          className="mt-4 px-4 py-2 text-sm border border-gray-300 rounded hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-700"
        >
          {dict.input.add_button}
        </button>
      </div>

      {/* Action Section */}
      <div className="mb-8">
        <button
          onClick={pickRandom}
          disabled={isSelecting}
          className={`w-full px-4 py-2 rounded ${
            isSelecting
              ? "bg-gray-400 dark:bg-gray-600 cursor-not-allowed"
              : "bg-black text-white dark:bg-gray-600 hover:bg-gray-800 dark:hover:bg-gray-700 transition-colors"
          }`}
        >
          {isSelecting ? dict.button.loading : dict.button.default}
        </button>

        {error && (
          <div className="mt-4 p-4 bg-red-100 border-l-4 border-red-500 text-red-700 dark:bg-red-900 dark:text-red-200">
            {error}
          </div>
        )}
      </div>

      {/* Result Section */}
      {selectedOption && (
        <div className="mb-8">
          <h2 className="text-lg font-bold mb-4">{dict.output.title}</h2>
          <div className="relative">
            <div className="bg-gray-100 dark:bg-gray-700 p-6 rounded text-center text-xl font-bold dark:text-gray-300">
              {selectedOption}
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
        </div>
      )}
    </div>
  );
}
