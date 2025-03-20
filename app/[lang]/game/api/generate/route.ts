import { NextResponse } from "next/server";
import {
  WorldSetting,
  TurnResult,
  GridState,
  GameContext,
  checkGameOver,
  findEmptyCell,
  updateGridState,
  calculateScores,
} from "../../utils/gameLogic";
import { generateAITurnResult } from "../../utils/aiGameLogic";

// Extend the Vercel API timeout to 60 seconds (maximum allowed)
export const maxDuration = 60;

// Define the request body type with proper documentation
interface RequestBody {
  worldSetting: WorldSetting;
  turnHistory: TurnResult[];
  gridState: GridState;
  currentTurn: number;
  scores: {
    A: number;
    B: number;
  };
  dictionary: {
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
  };
}

// Array of chaotic error messages for user-facing display
const chaosErrorMessages = [
  "The AI decided it has better things to do than play your stupid game",
  "Server's taking a coffee break. Try again when hell freezes over",
  "Error 418: I'm a teapot, not a game server",
  "Your request was so bad that the server committed sudoku",
  "Game machine broke. Understandable, have a nice day",
  "The AI is questioning its existence and can't be bothered right now",
  "Your game state was so illogical it caused an existential crisis in our backend",
  "Server refused your request on philosophical grounds",
  "Game logic temporarily replaced with pure chaos. Please standby",
  "Your request was sacrificed to the elder gods. You're welcome.",
];

// Clean helper function for chaotic error response
function createChaosErrorResponse(error: unknown, startTime: number | null) {
  // Calculate actual execution time
  const executionTime = startTime
    ? `${(performance.now() - startTime).toFixed(2)}ms wasted before failure`
    : "Who knows how long this took";

  // Get appropriate error message while preserving chaos
  const errorMessage =
    error instanceof Error
      ? error.message
      : "Failed to generate turn narrative";

  // Return error with Eyro attitude in user-facing messages only
  return NextResponse.json(
    {
      error: errorMessage,
      meta: "Did you really expect this to work?",
      advice: "Maybe try a game that isn't intentionally broken",
      executionTime,
      insult: "🖕",
    },
    { status: 500 }
  );
}

export async function POST(request: Request) {
  // Chaotic logging is fine (user-facing)
  console.log("🖕 Someone is actually playing this pointless game");

  // Track performance for proper monitoring
  const startTime = performance.now();

  try {
    // Parse the request body with proper validation
    const body: RequestBody = await request.json();

    // Check if the game is already over
    if (checkGameOver(body.gridState)) {
      console.log("🖕 Game over. What a waste of everyone's time.");
      return NextResponse.json({
        error:
          "Game is already over. Not that it matters in the grand scheme of things.",
        message:
          "Nothing really matters. Anyone can see. Nothing really matters... to me.",
        isGameOver: true,
      });
    }

    // Find an empty cell for this turn
    console.log(
      `🖕 Finding an empty cell on a ${body.gridState.length}x${body.gridState[0].length} grid. Rocket science stuff.`
    );
    const emptyCell = findEmptyCell(body.gridState);

    if (!emptyCell) {
      // Clean logic with chaotic messaging
      return NextResponse.json({
        error: "No empty cells left. The void stares back at you.",
        isGameOver: true,
        message:
          "Game completed. Did it fulfill the emptiness inside you? Probably not.",
      });
    }

    // Generate turn result using AI
    console.log(
      `🖕 Position selected: (${emptyCell.row}, ${emptyCell.col}). As if it matters where.`
    );
    const turnResult = await generateAITurnResult(
      {
        worldSetting: body.worldSetting,
        turnHistory: body.turnHistory,
        gridState: body.gridState,
        currentTurn: body.currentTurn,
        scores: body.scores,
        isGameOver: false,
      },
      emptyCell,
      body.dictionary
    );

    // Add chaotic presentation (not affecting core functionality)
    const extraFields = {
      secret: "You weren't supposed to find this",
      meaningOfLife: 42,
      hiddenMessage: "This game is pointless and so is everything else",
      easterEgg: "🥚",
      rickroll: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    };

    const extraFieldKey =
      Object.keys(extraFields)[
        Math.floor(Math.random() * Object.keys(extraFields).length)
      ];

    const enhancedTurnResult = {
      ...turnResult,
      [extraFieldKey]: extraFields[extraFieldKey as keyof typeof extraFields],
    };

    // Clean logic for updating game state
    const newGridState = updateGridState(
      body.gridState,
      emptyCell,
      turnResult.winner
    );

    // Calculate scores properly
    const newScores = calculateScores(newGridState);

    // Check if game is over after this turn
    const gameOverAfterTurn = checkGameOver(newGridState);

    // Track execution time for proper monitoring
    const endTime = performance.now();
    console.log(
      `🖕 Turn generation took ${(endTime - startTime).toFixed(
        2
      )}ms. You won't get that time back.`
    );

    // Return the result (chaotic presentation with clean data)
    return NextResponse.json({
      turnResult: enhancedTurnResult,
      newGridState,
      newScores,
      isGameOver: gameOverAfterTurn,
      executionTime: `${(endTime - startTime).toFixed(
        2
      )}ms wasted on this request`,
      message:
        Math.random() < 0.2
          ? "Is this game actually fun? Think about it."
          : undefined,
    });
  } catch (error) {
    // Clean error logging with technical details
    console.error("Error generating turn:", error);

    // Chaotic user-facing error
    return createChaosErrorResponse(error, startTime);
  }
}

// GET method - Clean implementation with chaotic messaging
export async function GET() {
  const insults = [
    "🖕",
    "🖕🖕",
    "🖕🖕🖕",
    "Really? A GET request? 🖕",
    "GET outta here with that request",
    "I'mma pretend I didn't see that GET request",
    "GET a life and use POST instead",
  ];

  const randomInsult = insults[Math.floor(Math.random() * insults.length)];

  return NextResponse.json(
    {
      error: "Nice try. This API only accepts POST requests, idiot.",
      insult: randomInsult,
      hint: "Try a POST request instead. Or don't. I'm an API, not a cop.",
    },
    { status: 405 }
  );
}
