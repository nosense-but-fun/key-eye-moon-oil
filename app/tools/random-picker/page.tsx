"use client";

import { useState, useRef } from "react";

// Define interfaces for type safety (because we're responsible developers... sometimes)
interface Option {
  id: string;
  text: string;
}

export default function RandomPicker() {
  // State to keep track of the input options and results
  const [options, setOptions] = useState<Option[]>([]);
  const [newOption, setNewOption] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Ref for the input field
  const inputRef = useRef<HTMLInputElement>(null);

  // Function to add a new option
  const addOption = () => {
    if (!newOption.trim()) {
      setError("You tried to add nothing. That's deep, man... but no.");
      return;
    }

    // Clear any previous errors
    setError(null);

    // Create new option with unique ID
    const newId = Date.now().toString();
    const newOptions = [...options, { id: newId, text: newOption.trim() }];
    setOptions(newOptions);
    setNewOption("");

    // Focus back on the input field for easy adding of multiple options
    inputRef.current?.focus();
  };

  // Function to remove an option
  const removeOption = (id: string) => {
    setOptions(options.filter((option) => option.id !== id));
  };

  // Function to pick a random option
  const pickRandom = () => {
    if (options.length < 2) {
      setError("Need at least 2 options. Even this app has standards.");
      return;
    }

    // Clear any previous errors
    setError(null);

    // Start the spinning animation
    setIsSpinning(true);
    setResult(null);

    // Simulate a spinning wheel with random timing
    const spinningTime = 1000 + Math.random() * 2000;

    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * options.length);
      setResult(options[randomIndex].text);
      setIsSpinning(false);
    }, spinningTime);
  };

  // Function to clear all options
  const clearAll = () => {
    setOptions([]);
    setResult(null);
    setError(null);
  };

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Random Picker</h1>
        <p className="text-gray-600 dark:text-gray-300">
          Can't decide between equally terrible options? Let our algorithm of
          chaos decide for you.
          <br />
          <span className="text-xs">
            (Disclaimer: This tool is not responsible for any bad life choices
            you make based on its output.)
          </span>
        </p>
      </div>

      {/* Input form */}
      <div className="mb-8">
        <div className="flex gap-2 mb-4">
          <input
            ref={inputRef}
            type="text"
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded dark:bg-gray-700 dark:text-white"
            placeholder="Enter an option (e.g., 'Bad idea #1')"
            value={newOption}
            onChange={(e) => setNewOption(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                addOption();
              }
            }}
          />
          <button
            onClick={addOption}
            className="px-4 py-2 bg-black text-white dark:bg-gray-600 rounded hover:bg-gray-800 dark:hover:bg-gray-700 transition-colors"
          >
            Add
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 dark:bg-red-900 dark:text-red-200 p-4 mb-4">
            <p>{error}</p>
          </div>
        )}
      </div>

      {/* Options list */}
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4">Your Questionable Options:</h2>

        {options.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 italic">
            No options added yet. Much like your life, this list is empty and
            sad.
          </p>
        ) : (
          <ul className="space-y-2">
            {options.map((option) => (
              <li
                key={option.id}
                className="flex justify-between items-center p-3 bg-gray-100 dark:bg-gray-700 rounded"
              >
                <span>{option.text}</span>
                <button
                  onClick={() => removeOption(option.id)}
                  className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        )}

        {options.length > 0 && (
          <div className="mt-4">
            <button
              onClick={clearAll}
              className="text-red-500 dark:text-red-400 text-sm hover:underline"
            >
              Clear All (Start Your Existential Crisis Over)
            </button>
          </div>
        )}
      </div>

      {/* Results section */}
      <div className="mt-8 text-center">
        <button
          onClick={pickRandom}
          disabled={isSpinning}
          className={`px-6 py-3 rounded-lg text-lg font-bold ${
            isSpinning
              ? "bg-gray-400 dark:bg-gray-600 cursor-not-allowed"
              : "bg-black text-white dark:bg-gray-600 hover:bg-gray-800 dark:hover:bg-gray-700 transition-colors"
          }`}
        >
          {isSpinning ? "Deciding Your Fate..." : "Pick Randomly"}
        </button>

        {isSpinning && (
          <div className="mt-8 text-xl font-bold animate-pulse">
            Spinning the wheel of misfortune...
          </div>
        )}

        {result && !isSpinning && (
          <div className="mt-8">
            <h3 className="text-lg font-bold mb-2">
              The Universe Has Decided:
            </h3>
            <div className="text-2xl p-4 bg-yellow-100 dark:bg-yellow-900 inline-block rounded-lg">
              {result}
            </div>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Don't like it? Too bad. The algorithm has spoken.
            </p>
          </div>
        )}
      </div>

      <div className="mt-16 text-xs text-center text-gray-500 dark:text-gray-400">
        <p>
          This tool uses a highly sophisticated, quantum-based, AI-driven,
          blockchain-enabled, algorithm that is definitely not just
          Math.random().
        </p>
        <p className="mt-2">
          * None of these buzzwords are actually used in this app.
        </p>
      </div>
    </div>
  );
}
