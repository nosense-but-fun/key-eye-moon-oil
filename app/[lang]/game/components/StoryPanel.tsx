"use client";

import { useRef, useEffect } from "react";
import { TurnResult, WorldSetting } from "../utils/gameLogic";
import { useLanguage } from "../../../contexts/LanguageContext";

interface StoryPanelProps {
  turnHistory: TurnResult[];
  worldSetting: WorldSetting;
}

export default function StoryPanel({
  turnHistory,
  worldSetting,
}: StoryPanelProps) {
  const storyEndRef = useRef<HTMLDivElement>(null);
  const { dictionary } = useLanguage();
  const dict = dictionary.game.story_panel;
  const worldDict =
    dictionary.game.world_settings[
      worldSetting.name as keyof typeof dictionary.game.world_settings
    ];

  // Scroll to the bottom when new story content is added
  useEffect(() => {
    if (storyEndRef.current) {
      storyEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [turnHistory]);

  // Apply random chaos to text
  const applyChaos = (text: string, index: number) => {
    // Different chaos styles for different paragraphs
    switch (index % 4) {
      case 0:
        return (
          <p key={index} className="mb-3">
            {text}
          </p>
        );
      case 1:
        return (
          <p
            key={index}
            className="mb-3 italic text-gray-700 dark:text-gray-400"
          >
            {text}
          </p>
        );
      case 2:
        return (
          <p key={index} className="mb-3 font-bold">
            {text}
          </p>
        );
      case 3:
        return (
          <p
            key={index}
            className="mb-3 transform -rotate-1 bg-gray-100 dark:bg-gray-700 p-2 rounded"
          >
            {text}
          </p>
        );
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg dark:shadow-gray-900/30 p-4 h-[600px] overflow-hidden flex flex-col dark:text-gray-100">
      <h2 className="text-2xl font-bold mb-3 transform rotate-1">
        {dict.title}
      </h2>

      {worldDict && (
        <div className="bg-gradient-to-r from-purple-200 to-blue-200 dark:from-purple-900 dark:to-blue-900 p-3 rounded-md mb-4">
          <h3 className="text-lg font-semibold mb-2">
            {dict.world_setting_prefix} {worldDict.name}
          </h3>
          <p className="text-sm dark:text-gray-300">{worldDict.description}</p>
        </div>
      )}

      <div className="flex-1 overflow-y-auto pr-2 relative">
        {turnHistory.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500 dark:text-gray-400 italic">
              {dict.empty_story}
            </p>
          </div>
        ) : (
          <div>
            {turnHistory.map((turn, index) => (
              <div key={index} className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {dict.turn_prefix} {index + 1}
                  </span>
                  <span
                    className={`text-xs font-bold px-2 py-1 rounded ${
                      turn.winner === "A"
                        ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                        : turn.winner === "B"
                        ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                        : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                    }`}
                  >
                    {turn.winner === "tie"
                      ? dict.tie
                      : `${turn.winner} ${dict.wins}`}
                  </span>
                </div>

                <div>
                  <div className="bg-red-50 dark:bg-red-900/30 p-2 rounded-t border-l-2 border-red-500">
                    <span className="text-xs font-bold text-red-800 dark:text-red-300">
                      {dict.player_a_prefix}
                    </span>
                    {applyChaos(turn.playerAAction, index * 2)}
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-900/30 p-2 rounded-b border-l-2 border-blue-500 mb-2">
                    <span className="text-xs font-bold text-blue-800 dark:text-blue-300">
                      {dict.player_b_prefix}
                    </span>
                    {applyChaos(turn.playerBAction, index * 2 + 1)}
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-800 p-2 rounded border-l-2 border-gray-500">
                    <span className="text-xs font-bold">
                      {dict.outcome_prefix}
                    </span>
                    {applyChaos(turn.outcome, index + turnHistory.length)}
                  </div>
                </div>
              </div>
            ))}
            <div ref={storyEndRef} />
          </div>
        )}

        {/* Random chaotic elements */}
        <div className="absolute top-10 right-2 w-6 h-6 bg-yellow-200 dark:bg-yellow-800 rounded-full opacity-60"></div>
        <div className="absolute bottom-20 left-4 w-4 h-4 bg-red-200 dark:bg-red-800 rounded-full opacity-60"></div>
      </div>

      <div className="text-xs text-gray-500 dark:text-gray-400 mt-3 border-t border-gray-200 dark:border-gray-700 pt-2">
        {dict.footer}
      </div>
    </div>
  );
}
