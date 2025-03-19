"use client";

import { useState, useEffect } from "react";

interface GameControlsProps {
  onNextTurn: () => void;
  onReset: () => void;
  isGenerating: boolean;
  isGameOver: boolean;
  turnCount: number;
}

export default function GameControls({
  onNextTurn,
  onReset,
  isGenerating,
  isGameOver,
  turnCount,
}: GameControlsProps) {
  const [buttonOffset, setButtonOffset] = useState({ x: 0, y: 0 });
  const [buttonScale, setButtonScale] = useState(1);
  const [buttonRotation, setButtonRotation] = useState(0);

  // Add some chaotic motion to the buttons
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isGenerating) {
        setButtonOffset({
          x: Math.random() * 3 - 1.5,
          y: Math.random() * 3 - 1.5,
        });
        setButtonRotation(Math.random() * 2 - 1);
        setButtonScale(1 + Math.random() * 0.05);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isGenerating]);

  // Random unhelpful tips
  const randomTips = [
    "Tip: This game makes no sense by design",
    "Pro-tip: Don't play this game",
    "Fact: This game was created by an AI to confuse humans",
    "Tip: Clicking buttons randomly is a valid strategy",
    "Warning: Playing this game may cause existential crisis",
    "Note: All decisions are meaningless, just like life",
    "Tip: The real game is convincing yourself this has value",
  ];

  const [tip, setTip] = useState(randomTips[0]);

  useEffect(() => {
    // Change tip randomly
    const tipInterval = setInterval(() => {
      const newTip = randomTips[Math.floor(Math.random() * randomTips.length)];
      setTip(newTip);
    }, 5000);

    return () => clearInterval(tipInterval);
  }, []);

  const getButtonText = () => {
    if (isGameOver) return "Game Finished";
    if (isGenerating) return "AI is thinking...";

    const options = [
      "Next Pointless Turn",
      "Generate More Chaos",
      "Continue This Nonsense",
      "One More Useless Action",
      "Waste More Time",
    ];

    return options[turnCount % options.length];
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg dark:shadow-gray-900/30 p-4 relative dark:text-white">
      <div className="flex flex-col gap-3">
        <button
          onClick={onNextTurn}
          disabled={isGenerating || isGameOver}
          className={`px-4 py-2 rounded font-bold transition-all 
            ${
              isGameOver
                ? "bg-gray-500 text-white cursor-not-allowed opacity-70"
                : isGenerating
                ? "bg-yellow-500 text-white animate-pulse"
                : "bg-gradient-to-r from-purple-500 to-blue-600 text-white hover:from-purple-600 hover:to-blue-700"
            }`}
          style={{
            transform: `translate(${buttonOffset.x}px, ${buttonOffset.y}px) rotate(${buttonRotation}deg) scale(${buttonScale})`,
          }}
        >
          {getButtonText()}
        </button>

        <button
          onClick={onReset}
          className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 font-bold transition-all"
        >
          Reset This Pointless Game
        </button>
      </div>

      <div className="mt-4 text-xs text-gray-500 dark:text-gray-400 italic border-t border-gray-200 dark:border-gray-700 pt-2">
        {tip}
      </div>

      {/* Chaotic UI element */}
      <div className="absolute -right-2 -bottom-2 w-6 h-6 bg-green-400 dark:bg-green-600 rounded-full opacity-60 transform rotate-45"></div>
    </div>
  );
}
