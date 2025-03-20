"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import LanguageSelector from "./LanguageSelector";
import ToneSelector from "./ToneSelector";

// The most unnecessary header component you'll ever see
export default function EyroHeader({ dictionary }: { dictionary: any }) {
  const [randomQuote, setRandomQuote] = useState("");
  const [middleFingerVisible, setMiddleFingerVisible] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const quotes = dictionary.header.quotes;

  useEffect(() => {
    // Get a random quote on mount and every 8 seconds
    const getRandomQuote = () => {
      const randomIndex = Math.floor(Math.random() * quotes.length);
      setRandomQuote(quotes[randomIndex]);
    };

    // Useless loading state that never ends
    const loadingInterval = setInterval(() => {
      setIsLoading((prev) => !prev);
    }, 2000);

    // Pointless rotation animation
    const rotationInterval = setInterval(() => {
      setRotation((prev) => (prev + 1) % 360);
    }, 50);

    getRandomQuote();
    const quoteInterval = setInterval(getRandomQuote, 8000);

    return () => {
      clearInterval(quoteInterval);
      clearInterval(loadingInterval);
      clearInterval(rotationInterval);
    };
  }, [quotes]);

  return (
    <header className="w-full bg-black text-white p-4 flex flex-col md:flex-row justify-between items-center shadow-lg">
      <div className="flex items-center">
        <Link
          href="/"
          className="text-2xl font-bold tracking-tight hover:text-gray-300 transition-colors"
          onMouseEnter={() => setMiddleFingerVisible(true)}
          onMouseLeave={() => setMiddleFingerVisible(false)}
        >
          <span
            style={{
              transform: `rotate(${rotation}deg)`,
              display: "inline-block",
            }}
          >
            EYRO
          </span>
          {middleFingerVisible && (
            <span className="ml-1 animate-bounce">🖕</span>
          )}
        </Link>
        <span className="hidden md:inline-block ml-4 text-sm text-gray-400 italic">
          {randomQuote}
          {isLoading && <span className="ml-2 animate-pulse">⚡</span>}
        </span>
      </div>

      <div className="flex items-center mt-4 md:mt-0">
        <nav className="mr-4">
          <ul className="flex space-x-4">
            <li>
              <Link href="/" className="hover:text-gray-300 transition-colors">
                {dictionary.header.home}
              </Link>
            </li>
            <li>
              <Link
                href="https://github.com/nosense-but-fun/key-eye-moon-oil"
                className="hover:text-gray-300 transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                <span
                  title="View source code on GitHub"
                  className="animate-pulse"
                >
                  {isLoading
                    ? dictionary.header.loading
                    : dictionary.header.github}
                </span>
              </Link>
            </li>
          </ul>
        </nav>

        <div className="flex items-center">
          <LanguageSelector dictionary={dictionary} />
          <ToneSelector dictionary={dictionary} />
        </div>
      </div>
    </header>
  );
}
