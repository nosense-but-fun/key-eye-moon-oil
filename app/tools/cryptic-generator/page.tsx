"use client";

import { useState } from "react";

// Sample data for our cryptic generator
const buzzwords = [
  "quantum",
  "blockchain",
  "AI-driven",
  "synergy",
  "paradigm shift",
  "disruptive",
  "leverage",
  "scalable",
  "ecosystem",
  "deep learning",
  "neural",
  "algorithm",
  "metadata",
  "framework",
  "serverless",
  "microservices",
  "blockchain",
  "IoT",
  "responsive",
  "revolutionary",
];

const nouns = [
  "matrix",
  "interface",
  "solution",
  "architecture",
  "mindshare",
  "convergence",
  "strategy",
  "bandwidth",
  "portal",
  "optimization",
  "visualization",
  "implementation",
  "integration",
  "analytics",
  "paradigm",
  "innovation",
  "experience",
  "framework",
  "platform",
  "pipeline",
];

const verbs = [
  "optimize",
  "iterate",
  "transform",
  "revolutionize",
  "visualize",
  "redefine",
  "empower",
  "enable",
  "orchestrate",
  "architect",
  "harness",
  "leverage",
  "reinvent",
  "aggregate",
  "streamline",
  "deploy",
  "matrix",
  "facilitate",
  "synergize",
  "morph",
];

export default function CrypticGenerator() {
  // State for our form and output
  const [complexity, setComplexity] = useState<number>(3);
  const [bullshitLevel, setBullshitLevel] = useState<number>(5);
  const [output, setOutput] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  // Function to generate random BS
  const generateCryptic = () => {
    setIsGenerating(true);
    setOutput("");

    // Simulate "thinking" with a delay
    setTimeout(() => {
      let result = "";
      const paragraphs = complexity;

      for (let p = 0; p < paragraphs; p++) {
        // Generate sentences based on bullshit level (sentences per paragraph)
        const sentences = Math.max(2, Math.floor(bullshitLevel * 1.5));
        const paragraph = [];

        for (let s = 0; s < sentences; s++) {
          // Construct a sentence with random bullshit
          const getRandomItem = (array: string[]) =>
            array[Math.floor(Math.random() * array.length)];

          const patterns = [
            // Different sentence patterns
            () =>
              `Our ${getRandomItem(buzzwords)} ${getRandomItem(
                nouns
              )} will ${getRandomItem(verbs)} your ${getRandomItem(nouns)}.`,
            () =>
              `We need to ${getRandomItem(verbs)} the ${getRandomItem(
                buzzwords
              )} ${getRandomItem(nouns)}.`,
            () =>
              `The ${getRandomItem(nouns)} is down, ${getRandomItem(
                verbs
              )} the ${getRandomItem(buzzwords)} ${getRandomItem(
                nouns
              )} so we can ${getRandomItem(verbs)} the ${getRandomItem(
                nouns
              )}!`,
            () =>
              `Try to ${getRandomItem(verbs)} the ${getRandomItem(
                buzzwords
              )} ${getRandomItem(nouns)}, maybe it will ${getRandomItem(
                verbs
              )} the ${getRandomItem(buzzwords)} ${getRandomItem(nouns)}!`,
            () =>
              `You can't ${getRandomItem(verbs)} the ${getRandomItem(
                nouns
              )} without ${getRandomItem(verbs)}ing the ${getRandomItem(
                buzzwords
              )} ${getRandomItem(nouns)}!`,
            () =>
              `Use the ${getRandomItem(buzzwords)} ${getRandomItem(
                nouns
              )}, then you can ${getRandomItem(verbs)} the ${getRandomItem(
                buzzwords
              )} ${getRandomItem(nouns)}!`,
            () =>
              `The ${getRandomItem(buzzwords)} ${getRandomItem(
                nouns
              )} is down, ${getRandomItem(verbs)} the ${getRandomItem(
                nouns
              )} so we can ${getRandomItem(verbs)} the ${getRandomItem(
                buzzwords
              )} ${getRandomItem(nouns)}!`,
          ];

          const patternIndex = Math.floor(Math.random() * patterns.length);
          paragraph.push(patterns[patternIndex]());
        }

        result += paragraph.join(" ") + "\n\n";
      }

      setOutput(result.trim());
      setIsGenerating(false);
    }, 1500); // Dramatic pause for effect
  };

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Cryptic Generator</h1>
        <p className="text-gray-600 dark:text-gray-300">
          Generate meaningless jargon that will make you sound smarter than you
          actually are.
          <br />
          <span className="text-xs">
            (Perfect for impressing investors or confusing your boss.)
          </span>
        </p>
      </div>

      {/* Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div className="p-4 border border-gray-300 dark:border-gray-700 rounded dark:bg-gray-800">
          <h2 className="text-lg font-bold mb-4">Configuration</h2>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              Complexity (Paragraphs)
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
              <span>Simple</span>
              <span>Confusing</span>
              <span>Kafka-esque</span>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              Bullshit Level
            </label>
            <input
              type="range"
              min="1"
              max="10"
              value={bullshitLevel}
              onChange={(e) => setBullshitLevel(parseInt(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
              <span>Mild BS</span>
              <span>Corporate</span>
              <span>Pure Nonsense</span>
            </div>
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
            {isGenerating ? "Generating Nonsense..." : "Generate Cryptic Text"}
          </button>
        </div>

        <div className="dark:text-gray-300">
          <h2 className="text-lg font-bold mb-2">When to Use This Tool</h2>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start">
              <span className="mr-2">👔</span>
              <span>When your presentation has zero substance</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">💼</span>
              <span>When you need to pad your resume</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">💸</span>
              <span>When pitching to venture capitalists</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">📊</span>
              <span>When your project is behind schedule</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">🤷‍♂️</span>
              <span>When you want to sound important in meetings</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Output */}
      <div className="mb-8">
        <h2 className="text-lg font-bold mb-4">Your Meaningless Jargon:</h2>

        {isGenerating ? (
          <div className="bg-gray-100 dark:bg-gray-700 p-6 rounded animate-pulse flex justify-center items-center min-h-40">
            <p className="dark:text-gray-300">
              Generating corporate nonsense...
            </p>
          </div>
        ) : output ? (
          <div className="relative">
            <div className="bg-gray-100 dark:bg-gray-700 p-6 rounded whitespace-pre-wrap dark:text-gray-300">
              {output}
            </div>
            <button
              onClick={() => {
                navigator.clipboard.writeText(output);
                alert("Copied! Now go confuse someone with this nonsense.");
              }}
              className="absolute top-2 right-2 bg-white dark:bg-gray-600 p-2 rounded-full shadow hover:shadow-md transition-shadow"
              title="Copy to clipboard"
            >
              📋
            </button>
          </div>
        ) : (
          <div className="bg-gray-100 dark:bg-gray-700 p-6 rounded text-gray-500 dark:text-gray-400 italic min-h-40 flex items-center justify-center">
            <p>Generate some text to see the magic of meaningless jargon...</p>
          </div>
        )}
      </div>

      <div className="mt-16 text-xs text-center text-gray-500 dark:text-gray-400">
        <p>
          <strong>Warning:</strong> Excessive use of this generator may lead to
          promotion to middle management or becoming a tech influencer.
        </p>
      </div>
    </div>
  );
}
