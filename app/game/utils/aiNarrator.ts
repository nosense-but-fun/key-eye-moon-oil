import { WorldSetting, TurnResult, GridState } from "./gameLogic";

// Sample narrative elements to use if AI generation fails
const fallbackNarratives = {
  playerA: [
    "Player A deployed advanced tech to claim territory.",
    "Player A launched a surprise attack from the shadows.",
    "Player A executed a brilliant strategy with precision.",
    "Player A utilized forbidden knowledge to gain advantage.",
    "Player A called upon ancient powers in a desperate gambit.",
    "Player A hacked the system to change the rules.",
    "Player A built a secret fortress in disputed territory.",
  ],

  playerB: [
    "Player B countered with superior numbers and firepower.",
    "Player B orchestrated a clever trap that nearly worked.",
    "Player B rallied allies to defend against the onslaught.",
    "Player B used technology and wisdom in equal measure.",
    "Player B unleashed a devastating counterattack.",
    "Player B deployed defensive measures with surgical precision.",
    "Player B revealed a hidden weapon that changed everything.",
  ],

  outcomes: {
    A: [
      "Player A's superior strategy won the day.",
      "Player A claimed victory through sheer determination.",
      "Player A's resources proved too much for Player B to handle.",
      "Player A exploited a weakness in Player B's defenses.",
    ],
    B: [
      "Player B turned the tables at the last moment.",
      "Player B's persistence paid off with a decisive victory.",
      "Player B outmaneuvered Player A in a brilliant tactical move.",
      "Player B's defensive strategy proved impenetrable.",
    ],
    tie: [
      "Neither player could gain the upper hand in a tense standoff.",
      "Both players exhausted their resources, ending in stalemate.",
      "A surprise intervention forced both players to retreat.",
      "Mutual destruction was narrowly avoided through reluctant compromise.",
    ],
  },
};

// Generate a turn result with fallback data
export const generateFallbackTurnResult = (
  worldSetting: WorldSetting,
  turnHistory: TurnResult[],
  gridState: GridState,
  position: { row: number; col: number }
): TurnResult => {
  console.log("🖕 Generating fallback narrative because who needs AI anyway");

  // Determine a winner randomly but with some bias based on existing scores
  const scores = calculateScoresFromGrid(gridState);
  let winnerChances: Record<string, number> = {
    A: 0.33,
    B: 0.33,
    tie: 0.34,
  };

  // If someone is winning, make it slightly more likely they'll continue winning
  if (scores.A > scores.B) {
    winnerChances = { A: 0.45, B: 0.3, tie: 0.25 };
  } else if (scores.B > scores.A) {
    winnerChances = { A: 0.3, B: 0.45, tie: 0.25 };
  }

  // Select winner based on weighted chances
  const rand = Math.random();
  let winner: "A" | "B" | "tie";

  if (rand < winnerChances.A) {
    winner = "A";
  } else if (rand < winnerChances.A + winnerChances.B) {
    winner = "B";
  } else {
    winner = "tie";
  }

  // Get random narrative elements
  const playerAAction = getContextualNarrative(
    fallbackNarratives.playerA,
    worldSetting,
    turnHistory,
    "A"
  );

  const playerBAction = getContextualNarrative(
    fallbackNarratives.playerB,
    worldSetting,
    turnHistory,
    "B"
  );

  const outcome = getRandomElement(fallbackNarratives.outcomes[winner]);

  return {
    playerAAction,
    playerBAction,
    outcome,
    winner,
    gridPosition: position,
  };
};

// Calculate scores from grid for fallback mechanism
const calculateScoresFromGrid = (
  gridState: GridState
): { A: number; B: number } => {
  const flatGrid = gridState.flat();
  const aCount = flatGrid.filter((cell) => cell === "A").length;
  const bCount = flatGrid.filter((cell) => cell === "B").length;

  return { A: aCount, B: bCount };
};

// Get a random element from an array
const getRandomElement = <T>(array: T[]): T => {
  return array[Math.floor(Math.random() * array.length)];
};

// Get narrative that's somewhat contextual
const getContextualNarrative = (
  options: string[],
  worldSetting: WorldSetting,
  turnHistory: TurnResult[],
  player: "A" | "B"
): string => {
  // In a real implementation, we'd use this context to generate better narratives
  // For now, just return a random option
  return getRandomElement(options);
};
