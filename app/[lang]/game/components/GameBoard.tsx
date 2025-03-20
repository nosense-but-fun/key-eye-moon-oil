"use client";

import { useState } from "react";
import { GridState, TurnResult } from "../utils/gameLogic";

interface GameBoardProps {
  gridState: GridState;
  turnHistory: TurnResult[];
}

export default function GameBoard({ gridState, turnHistory }: GameBoardProps) {
  const [hoveredCell, setHoveredCell] = useState<number | null>(null);

  const getCellColor = (value: string | null, index: number) => {
    // Apply different styling based on cell state
    if (value === "A") return "bg-red-500 hover:bg-red-600";
    if (value === "B") return "bg-blue-500 hover:bg-blue-600";

    // Create chaotic pattern for empty cells
    const row = Math.floor(index / 10);
    const col = index % 10;

    // Generate a pseudo-random pattern for empty cells
    const pattern = (row * 3 + col * 7) % 9;

    switch (pattern) {
      case 0:
        return "bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600";
      case 1:
        return "bg-gray-200 hover:bg-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700";
      case 2:
        return "bg-gray-300 hover:bg-gray-400 dark:bg-gray-700 dark:hover:bg-gray-600";
      case 3:
        return "bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700";
      case 4:
        return "bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600";
      case 5:
        return "bg-gray-300 hover:bg-gray-400 dark:bg-gray-800 dark:hover:bg-gray-700";
      case 6:
        return "bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600";
      case 7:
        return "bg-gray-200 hover:bg-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700";
      default:
        return "bg-gray-300 hover:bg-gray-400 dark:bg-gray-700 dark:hover:bg-gray-600";
    }
  };

  const getCellInfo = (index: number) => {
    const row = Math.floor(index / 10);
    const col = index % 10;

    // Find the most recent turn result for this cell
    const relevantTurn = turnHistory.find(
      (turn) => turn.gridPosition?.row === row && turn.gridPosition?.col === col
    );

    return relevantTurn
      ? `Turn ${turnHistory.indexOf(relevantTurn) + 1}: ${
          relevantTurn.winner
        } won`
      : `Grid position: (${row}, ${col})`;
  };

  return (
    <div className="relative">
      <h2 className="text-xl font-bold mb-3 transform rotate-1 dark:text-white">
        Pointless Battle Grid
      </h2>

      <div className="w-full aspect-square border-4 border-gray-800 dark:border-gray-600 p-1 rounded-lg overflow-hidden relative bg-white dark:bg-gray-800">
        <div className="grid grid-cols-10 gap-1 h-full">
          {gridState.flat().map((cell, index) => (
            <div
              key={index}
              className={`${getCellColor(
                cell,
                index
              )} transition-all duration-300 rounded-sm flex items-center justify-center text-white font-bold`}
              onMouseEnter={() => setHoveredCell(index)}
              onMouseLeave={() => setHoveredCell(null)}
              style={{
                transform: cell ? "scale(1.05)" : "scale(1)",
                zIndex: cell ? 2 : 1,
              }}
            >
              {cell && <span>{cell}</span>}
            </div>
          ))}
        </div>
      </div>

      {/* Tooltip for cell */}
      {hoveredCell !== null && (
        <div className="absolute -bottom-16 left-0 right-0 bg-black text-white text-xs p-2 rounded opacity-80">
          {getCellInfo(hoveredCell)}
        </div>
      )}

      {/* Weird decorative elements because KEMO */}
      <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 dark:bg-yellow-600 rounded-full flex items-center justify-center transform rotate-12">
        🖕
      </div>
      <div className="absolute -bottom-2 -left-2 w-6 h-6 bg-purple-500 dark:bg-purple-700 rounded-full"></div>
    </div>
  );
}
