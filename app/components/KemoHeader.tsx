"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

// The most unnecessary header component you'll ever see
export default function KemoHeader() {
  const [randomQuote, setRandomQuote] = useState("");
  const [middleFingerVisible, setMiddleFingerVisible] = useState(false);

  const quotes = [
    "Using this app may cause existential dread",
    "Your sanity left the chat",
    "Warning: May contain traces of actual functionality",
    "Built by developers who should know better",
    "KEMO: Because someone had to make this monstrosity",
    "Abandon hope, all ye who enter here",
  ];

  useEffect(() => {
    // Get a random quote on mount and every 8 seconds
    const getRandomQuote = () => {
      const randomIndex = Math.floor(Math.random() * quotes.length);
      setRandomQuote(quotes[randomIndex]);
    };

    getRandomQuote();
    const interval = setInterval(getRandomQuote, 8000);

    return () => clearInterval(interval);
  }, []);

  return (
    <header className="w-full bg-black text-white p-4 flex flex-col md:flex-row justify-between items-center">
      <div className="flex items-center">
        <Link
          href="/"
          className="text-2xl font-bold tracking-tight hover:text-gray-300 transition-colors"
          onMouseEnter={() => setMiddleFingerVisible(true)}
          onMouseLeave={() => setMiddleFingerVisible(false)}
        >
          KEMO{middleFingerVisible && <span className="ml-1">🖕</span>}
        </Link>
        <span className="hidden md:inline-block ml-4 text-sm text-gray-400 italic">
          {randomQuote}
        </span>
      </div>

      <nav className="mt-4 md:mt-0">
        <ul className="flex space-x-4">
          <li>
            <Link href="/" className="hover:text-gray-300 transition-colors">
              Home
            </Link>
          </li>
          <li>
            <Link
              href="/tools/random-picker"
              className="hover:text-gray-300 transition-colors"
            >
              Random Picker
            </Link>
          </li>
          <li>
            <Link
              href="/tools/cryptic-generator"
              className="hover:text-gray-300 transition-colors"
            >
              Cryptic Generator
            </Link>
          </li>
          <li>
            <Link
              href="https://github.com"
              className="hover:text-gray-300 transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              <span title="This button does absolutely nothing useful">
                ???
              </span>
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}
