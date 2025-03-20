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

// World setting keys for translation lookup
const worldSettingKeys = [
  "cyberpunk",
  "wasteland",
  "fantasy",
  "space",
  "underwater",
  "microscopic",
  "office",
];

// Create a 10x10 grid filled with nulls
const createEmptyGrid = (): GridState => {
  return Array(10)
    .fill(null)
    .map(() => Array(10).fill(null));
};

// Get a random world setting key
const getRandomWorldSettingKey = (): string => {
  // For hydration stability, we use a fixed index with frequent rotation
  // This ensures both server and client render the same world
  const date = new Date();
  const daySeed = date.getUTCDate();
  // Rotate world settings daily to keep it fresh but stable within a day
  const index = daySeed % worldSettingKeys.length;

  return worldSettingKeys[index];
};

// Initialize a new game context
export const createGameContext = (): GameContext => {
  console.log("🖕 Creating a new pointless game. Why? Who knows!");

  // Note: The actual world setting will be populated from the dictionary
  // when the component renders
  const worldSettingKey = getRandomWorldSettingKey();

  return {
    worldSetting: {
      name: worldSettingKey,
      description: "",
      rules: "",
    },
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
