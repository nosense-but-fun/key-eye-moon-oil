// Types
export type GridState = (string | null)[][];

export interface WorldSetting {
  name: string;
  description: string;
  rules?: string;
}

export interface TurnResult {
  playerAAction: string;
  playerBAction: string;
  outcome: string;
  winner: "A" | "B" | "tie";
  gridPosition?: {
    row: number;
    col: number;
  };
}

export interface GameContext {
  worldSetting: WorldSetting;
  turnHistory: TurnResult[];
  gridState: GridState;
  currentTurn: number;
  scores: {
    A: number;
    B: number;
  };
  isGameOver: boolean;
}

// Predefined world settings
const worldSettings: WorldSetting[] = [
  {
    name: "Cyberpunk Dystopia",
    description:
      "A neon-soaked urban hellscape where megacorps rule and hackers are the new rockstars. Player A is a rogue AI, Player B is a human hacker.",
    rules:
      "Technology rules the world, players compete for digital territories.",
  },
  {
    name: "Post-Apocalyptic Wasteland",
    description:
      "Nuclear fallout has left the world a barren wasteland. Player A is a mutant warlord, Player B is the leader of the last human settlement.",
    rules: "Resource scarcity drives conflict, survival is the ultimate goal.",
  },
  {
    name: "Fantasy Kingdom",
    description:
      "A realm of magic and monsters. Player A is a dark sorcerer, Player B is a noble paladin. They battle for the soul of the kingdom.",
    rules: "Magic is real, ancient prophecies guide destiny.",
  },
  {
    name: "Space Opera",
    description:
      "The far future among the stars. Player A is an alien hive mind, Player B is the galactic federation's finest captain.",
    rules:
      "Advanced technology, strange new worlds, and the vastness of space.",
  },
  {
    name: "Underwater Civilization",
    description:
      "Beneath the waves, two factions fight for dominance. Player A leads the deep sea creatures, Player B commands the advanced human submarine fleet.",
    rules:
      "Water pressure, oxygen limitations, and aquatic terrain affect all actions.",
  },
  {
    name: "Microscopic Universe",
    description:
      "Inside a human body, a war rages. Player A is a virus, Player B is the immune system.",
    rules: "Tiny scale, massive consequences, complex biological systems.",
  },
  {
    name: "Corporate Office",
    description:
      "The most mundane and yet cutthroat battlefield: a corporate office. Player A is middle management, Player B is a new startup employee.",
    rules:
      "Passive-aggressive emails, coffee theft, and the battle for the good chair.",
  },
];

// Create a 10x10 grid filled with nulls
const createEmptyGrid = (): GridState => {
  return Array(10)
    .fill(null)
    .map(() => Array(10).fill(null));
};

// Get a random world setting
const getRandomWorldSetting = (): WorldSetting => {
  // For hydration stability, we use a fixed index with frequent rotation
  // This ensures both server and client render the same world
  const date = new Date();
  const daySeed = date.getUTCDate();
  // Rotate world settings daily to keep it fresh but stable within a day
  const index = daySeed % worldSettings.length;

  return worldSettings[index];
};

// Initialize a new game context
export const createGameContext = (): GameContext => {
  console.log("🖕 Creating a new pointless game. Why? Who knows!");

  return {
    worldSetting: getRandomWorldSetting(),
    turnHistory: [],
    gridState: createEmptyGrid(),
    currentTurn: 0,
    scores: {
      A: 0,
      B: 0,
    },
    isGameOver: false,
  };
};

// Check if game is over (grid full or max turns reached)
export const checkGameOver = (gridState: GridState): boolean => {
  // Game ends when all cells are filled or 50 turns have passed
  const flatGrid = gridState.flat();
  const filledCells = flatGrid.filter((cell) => cell !== null).length;

  return filledCells >= 100; // 10x10 grid fully filled
};

// Find an empty cell in the grid
export const findEmptyCell = (
  gridState: GridState
): { row: number; col: number } | null => {
  const emptyPositions: { row: number; col: number }[] = [];

  for (let row = 0; row < gridState.length; row++) {
    for (let col = 0; col < gridState[row].length; col++) {
      if (gridState[row][col] === null) {
        emptyPositions.push({ row, col });
      }
    }
  }

  if (emptyPositions.length === 0) return null;

  // Return a random empty position
  return emptyPositions[Math.floor(Math.random() * emptyPositions.length)];
};

// Update grid state after a turn
export const updateGridState = (
  gridState: GridState,
  position: { row: number; col: number },
  winner: "A" | "B" | "tie"
): GridState => {
  const newGridState = gridState.map((row) => [...row]);

  // If it's a tie, leave the cell empty
  if (winner === "tie") return newGridState;

  newGridState[position.row][position.col] = winner;

  return newGridState;
};

// Calculate scores
export const calculateScores = (
  gridState: GridState
): { A: number; B: number } => {
  const flatGrid = gridState.flat();
  const aCount = flatGrid.filter((cell) => cell === "A").length;
  const bCount = flatGrid.filter((cell) => cell === "B").length;

  return { A: aCount, B: bCount };
};
