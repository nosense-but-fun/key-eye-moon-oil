"use client";

import { useState, useEffect } from "react";
import GameBoard from "./components/GameBoard";
import StoryPanel from "./components/StoryPanel";
import ScoreDisplay from "./components/ScoreDisplay";
import GameControls from "./components/GameControls";
import { createGameContext } from "./utils/gameLogic";

export default function ChaoticBattleGame() {
  const [gameState, setGameState] = useState(() => createGameContext());
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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
      const response = await fetch("/api/game/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          worldSetting: gameState.worldSetting,
          turnHistory: gameState.turnHistory,
          gridState: gameState.gridState,
          currentTurn: gameState.currentTurn,
          scores: gameState.scores,
        }),
      });

      if (!response.ok) {
        throw new Error(
          "🖕 AI broke itself trying to think up something stupid enough"
        );
      }

      const data = await response.json();

      setGameState((prevState) => ({
        ...prevState,
        turnHistory: [...prevState.turnHistory, data.turnResult],
        currentTurn: prevState.currentTurn + 1,
        gridState: data.newGridState,
        scores: data.newScores,
        isGameOver: data.isGameOver,
      }));
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Chaos happened in a bad way"
      );
      console.error("Failed to generate turn:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const resetGame = () => {
    setGameState(createGameContext());
    setErrorMessage(null);
  };

  return (
    <main className="min-h-screen p-4 max-w-7xl mx-auto dark:bg-gray-900 dark:text-white">
      <h1
        className="text-4xl font-bold mb-6 text-center transform -rotate-1 dark:text-gray-100"
        id="chaos-effect"
      >
        KEMO's Pointlessly AI Narrative Battle
      </h1>

      <p className="text-lg mb-8 text-center italic dark:text-gray-300">
        Two AI players fight to the death in a grid. Why? No reason. Welcome to
        KEMO.
      </p>

      {errorMessage && (
        <div className="bg-red-100 dark:bg-red-900 border-l-4 border-red-500 text-red-700 dark:text-red-300 p-4 mb-4 rounded">
          <p>{errorMessage}</p>
          <p className="text-xs mt-1 dark:text-red-200">
            Just refresh the page. Or don't. We don't care.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 order-2 lg:order-1">
          <StoryPanel
            turnHistory={gameState.turnHistory}
            worldSetting={gameState.worldSetting}
          />
        </div>

        <div className="order-1 lg:order-2 flex flex-col gap-4">
          <ScoreDisplay scores={gameState.scores} />
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
          />
        </div>
      </div>
    </main>
  );
}
