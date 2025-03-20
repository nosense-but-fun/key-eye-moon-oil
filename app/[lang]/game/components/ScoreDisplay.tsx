"use client";

import { useEffect, useState } from "react";

interface ScoreDisplayProps {
  scores: {
    A: number;
    B: number;
  };
  dictionary: {
    title: string;
    player_a: {
      name: string;
      description: string;
    };
    player_b: {
      name: string;
      description: string;
    };
    versus: string;
    turn_score: string;
    status: {
      a_winning: string;
      b_winning: string;
      tie: string;
    };
  };
}

export default function ScoreDisplay({
  scores,
  dictionary,
}: ScoreDisplayProps) {
  const [rotationA, setRotationA] = useState(0);
  const [rotationB, setRotationB] = useState(0);

  // Random chaotic animations
  useEffect(() => {
    const intervalA = setInterval(() => {
      setRotationA((prev) => (prev + Math.random() * 0.5) % 3);
    }, 500);

    const intervalB = setInterval(() => {
      setRotationB((prev) => (prev - Math.random() * 0.5) % 3);
    }, 700);

    return () => {
      clearInterval(intervalA);
      clearInterval(intervalB);
    };
  }, []);

  // Calculate who's winning for additional flair
  const getWinningText = () => {
    if (scores.A > scores.B) return dictionary.status.a_winning;
    if (scores.B > scores.A) return dictionary.status.b_winning;
    return dictionary.status.tie;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg dark:shadow-gray-900/30 p-4 dark:text-white">
      <h2 className="text-xl font-bold mb-3 transform -rotate-1">
        {dictionary.title}
      </h2>

      <div className="flex justify-around items-center">
        <div
          className="text-center"
          style={{ transform: `rotate(${rotationA}deg)` }}
        >
          <div className="w-16 h-16 bg-red-500 dark:bg-red-600 rounded-full mb-2 flex items-center justify-center text-white text-2xl font-bold mx-auto shadow-lg dark:shadow-red-900/40">
            {scores.A}
          </div>
          <p className="font-bold text-red-800 dark:text-red-400">
            {dictionary.player_a.name}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {dictionary.player_a.description}
          </p>
        </div>

        <div className="text-center">
          <div className="text-2xl font-bold mb-2">{dictionary.versus}</div>
          <div className="bg-gray-200 dark:bg-gray-700 rounded-lg p-2 text-xs">
            {getWinningText()}
          </div>
          <div className="mt-2 text-center">
            <span className="inline-block px-3 py-1 bg-black text-white dark:bg-gray-900 text-xs rounded-full transform -rotate-2">
              {dictionary.turn_score
                .replace("{{a}}", String(scores.A))
                .replace("{{b}}", String(scores.B))}
            </span>
          </div>
        </div>

        <div
          className="text-center"
          style={{ transform: `rotate(${rotationB}deg)` }}
        >
          <div className="w-16 h-16 bg-blue-500 dark:bg-blue-600 rounded-full mb-2 flex items-center justify-center text-white text-2xl font-bold mx-auto shadow-lg dark:shadow-blue-900/40">
            {scores.B}
          </div>
          <p className="font-bold text-blue-800 dark:text-blue-400">
            {dictionary.player_b.name}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {dictionary.player_b.description}
          </p>
        </div>
      </div>

      {/* Chaotic decoration elements */}
      <div className="relative h-2 mt-4">
        <div className="absolute top-0 left-1/4 w-2 h-2 bg-red-300 dark:bg-red-700 rounded-full"></div>
        <div className="absolute top-0 right-1/4 w-2 h-2 bg-blue-300 dark:bg-blue-700 rounded-full"></div>
      </div>
    </div>
  );
}
