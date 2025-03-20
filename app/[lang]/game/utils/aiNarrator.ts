import { WorldSetting, TurnResult, GridState } from "./gameLogic";

interface GameDictionary {
  game: {
    fallback_narratives: {
      player_a: string[];
      player_b: string[];
      outcomes: {
        a_wins: string[];
        b_wins: string[];
        tie: string[];
      };
    };
    world_settings: {
      [key: string]: {
        name: string;
        description: string;
        rules: string;
      };
    };
  };
}

// Generate a turn result with fallback data
export function generateFallbackTurnResult(
  worldSetting: WorldSetting,
  turnHistory: TurnResult[],
  gridState: GridState,
  position: { row: number; col: number },
  dictionary: GameDictionary
): TurnResult {
  console.log("🖕 Generating fallback narrative because who needs AI anyway");

  // Helper function to get a random element from an array
  const getRandomElement = <T>(arr: T[]): T => {
    return arr[Math.floor(Math.random() * arr.length)];
  };

  // Get random narrative elements from the dictionary
  const narratives = dictionary.game.fallback_narratives;
  if (
    !narratives ||
    !Array.isArray(narratives.player_a) ||
    !Array.isArray(narratives.player_b) ||
    !narratives.outcomes ||
    !Array.isArray(narratives.outcomes.a_wins) ||
    !Array.isArray(narratives.outcomes.b_wins) ||
    !Array.isArray(narratives.outcomes.tie)
  ) {
    console.error(
      "❌ Invalid fallback narratives structure in dictionary:",
      dictionary
    );
    // Return a default narrative if dictionary is missing or invalid
    return {
      playerAAction: "Player A did something (dictionary error) 🖕",
      playerBAction: "Player B responded somehow (dictionary error) 🖕",
      outcome: "Nothing made sense (dictionary error) 🖕",
      winner: Math.random() < 0.4 ? "A" : Math.random() < 0.8 ? "B" : "tie",
      gridPosition: position,
    };
  }

  const playerAAction = getRandomElement(narratives.player_a);
  const playerBAction = getRandomElement(narratives.player_b);

  // Determine winner and get appropriate outcome
  const winner = Math.random() < 0.4 ? "A" : Math.random() < 0.8 ? "B" : "tie";
  let outcome: string;

  switch (winner) {
    case "A":
      outcome = getRandomElement(narratives.outcomes.a_wins);
      break;
    case "B":
      outcome = getRandomElement(narratives.outcomes.b_wins);
      break;
    default:
      outcome = getRandomElement(narratives.outcomes.tie);
  }

  return {
    playerAAction,
    playerBAction,
    outcome,
    winner,
    gridPosition: position,
  };
}

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
