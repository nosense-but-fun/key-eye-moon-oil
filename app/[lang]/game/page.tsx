"use client";

import { useState, useEffect } from "react";
import GameBoard from "./components/GameBoard";
import StoryPanel from "./components/StoryPanel";
import ScoreDisplay from "./components/ScoreDisplay";
import GameControls from "./components/GameControls";
import { createGameContext } from "./utils/gameLogic";
import { useLanguage } from "../../contexts/LanguageContext";
import { useParams } from "next/navigation";

// Custom hook to detect client-side rendering
function useLoaded() {
  const [loaded, setLoaded] = useState(false);
  useEffect(() => setLoaded(true), []);
  return loaded;
}

export default function ChaoticBattleGame() {
  const isLoaded = useLoaded();
  const [gameState, setGameState] = useState(() => createGameContext());
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { dictionary } = useLanguage();
  const dict = dictionary.game;
  const params = useParams();

  // Update world setting with translated content when dictionary changes
  useEffect(() => {
    if (gameState.worldSetting.name) {
      const worldDict =
        dict.world_settings[
          gameState.worldSetting.name as keyof typeof dict.world_settings
        ];
      if (worldDict) {
        setGameState((prev) => ({
          ...prev,
          worldSetting: {
            name: gameState.worldSetting.name,
            description: worldDict.description,
            rules: worldDict.rules,
          },
        }));
      }
    }
  }, [dict, gameState.worldSetting.name]);

  useEffect(() => {
    // Random chaos effect on page load
    const interval = setInterval(() => {
      const randomElement = document.getElementById("chaos-effect");
      if (randomElement) {
        randomElement.style.transform = `rotate(${Math.random() * 2 - 1}deg)`;
      }
    }, 500);

    return () => clearInterval(interval);
  }, []);

  const startNewTurn = async () => {
    if (isGenerating || gameState.isGameOver) return;

    setIsGenerating(true);
    setErrorMessage(null);

    try {
      const response = await fetch(`/${params.lang}/game/api/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          worldSetting: gameState.worldSetting,
          turnHistory: gameState.turnHistory,
          gridState: gameState.gridState,
          currentTurn: gameState.currentTurn,
          scores: gameState.scores,
          dictionary: {
            game: {
              world_settings: dict.world_settings,
              fallback_narratives: dict.fallback_narratives,
            },
          },
        }),
      });

      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        console.error("Failed to parse API response:", parseError);
        throw new Error(
          "🖕 The API response was pure garbage. Try again, I guess."
        );
      }

      // If the response contains an error but it's intentional chaos
      if (data.error && data.isIntentionalChaos) {
        // Display the error as a message but continue the game
        setErrorMessage(`🖕 ${data.error}`);

        // Wait a bit to simulate a turn passing despite the error
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Increment turn counter but don't change the grid
        setGameState((prevState) => ({
          ...prevState,
          currentTurn: prevState.currentTurn + 1,
        }));

        return;
      }

      // If response was not OK and not intentional chaos
      if (!response.ok && !data.isIntentionalChaos) {
        throw new Error(
          data.error ||
            "🖕 AI broke itself trying to think up something stupid enough"
        );
      }

      // Validate that we have the necessary data to update the game state
      if (!data.turnResult || !data.newGridState || !data.newScores) {
        console.error("Invalid game data returned:", data);
        throw new Error("🖕 The game data was incomplete. Zyro strikes again!");
      }

      setGameState((prevState) => ({
        ...prevState,
        turnHistory: [...prevState.turnHistory, data.turnResult],
        currentTurn: prevState.currentTurn + 1,
        gridState: data.newGridState,
        scores: data.newScores,
        isGameOver: data.isGameOver,
      }));
    } catch (error) {
      console.error("Failed to generate turn:", error);

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "🖕 Chaos happened in a bad way. Not even I know what went wrong."
      );

      // If we've had multiple consecutive errors, suggest a reset
      if (errorMessage) {
        setErrorMessage(
          (prevError) =>
            `${
              typeof prevError === "string" ? prevError : "Error"
            }\n\nMaybe try resetting the game? Just a thought.`
        );
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const resetGame = () => {
    const newGame = createGameContext();
    // Update world setting with translated content
    const worldDict =
      dict.world_settings[
        newGame.worldSetting.name as keyof typeof dict.world_settings
      ];
    if (worldDict) {
      newGame.worldSetting = {
        name: newGame.worldSetting.name,
        description: worldDict.description,
        rules: worldDict.rules,
      };
    }
    setGameState(newGame);
    setErrorMessage(null);
  };

  return (
    <main className="min-h-screen p-4 max-w-7xl mx-auto dark:bg-gray-900 dark:text-white">
      <h1
        className="text-4xl font-bold mb-6 text-center transform -rotate-1 dark:text-gray-100"
        id="chaos-effect"
      >
        {dict.title}
      </h1>

      <p className="text-lg mb-8 text-center italic dark:text-gray-300">
        {dict.subtitle}
      </p>

      {errorMessage && (
        <div className="bg-red-100 dark:bg-red-900 border-l-4 border-red-500 text-red-700 dark:text-red-300 p-4 mb-4 rounded transform rotate-1 transition-all">
          <div className="flex items-center justify-between">
            <p className="font-bold">{dict.error.title}</p>
            <span className="text-xl">🖕</span>
          </div>
          <p className="my-2">{errorMessage}</p>
          <p className="text-xs mt-1 dark:text-red-200 italic">
            {dict.error.hint}
          </p>
        </div>
      )}

      {!isLoaded ? (
        <div className="flex items-center justify-center h-64">
          <p className="text-xl font-bold animate-pulse">{dict.loading}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 order-2 lg:order-1">
            <StoryPanel
              turnHistory={gameState.turnHistory}
              worldSetting={gameState.worldSetting}
            />
          </div>

          <div className="order-1 lg:order-2 flex flex-col gap-4">
            <ScoreDisplay scores={gameState.scores} dictionary={dict.score} />
            <GameBoard
              gridState={gameState.gridState}
              turnHistory={gameState.turnHistory}
            />
            <GameControls
              onNextTurn={startNewTurn}
              onReset={resetGame}
              isGenerating={isGenerating}
              isGameOver={gameState.isGameOver}
              turnCount={gameState.currentTurn}
              dictionary={dict.controls}
            />
          </div>
        </div>
      )}
    </main>
  );
}
