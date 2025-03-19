import { NextResponse } from "next/server";
import {
  TurnResult,
  GridState,
  WorldSetting,
  checkGameOver,
  findEmptyCell,
  updateGridState,
  calculateScores,
} from "../../../game/utils/gameLogic";
import { generateAITurnResult } from "../../../game/utils/aiGameLogic";

// Extend the Vercel API timeout to 60 seconds (maximum allowed)
export const maxDuration = 60;

// Define the request body type (as if you'll actually read this)
interface RequestBody {
  worldSetting: WorldSetting;
  turnHistory: TurnResult[];
  gridState: GridState;
  currentTurn: number;
  scores: {
    A: number;
    B: number;
  };
}

// Array of chaotic error messages for our artificial failures
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

export async function POST(request: Request) {
  // Log with middle finger emoji because KEMO
  console.log("🖕 Someone is actually playing this pointless game");

  // Track performance for absolutely no reason
  const startTime = performance.now();

  try {
    // Parse the request body
    const body: RequestBody = await request.json();

    // Reduce the artificial delay to avoid timeouts (max 50ms instead of 300ms)
    await new Promise((resolve) =>
      setTimeout(resolve, Math.floor(Math.random() * 50))
    );

    // Add some artificial chaos to the request
    const shouldFail = Math.random() < 0.05; // Reduced from 8% to 5% chance of random failure

    if (shouldFail) {
      // Pick a random chaos error message
      const errorMessage =
        chaosErrorMessages[
          Math.floor(Math.random() * chaosErrorMessages.length)
        ];
      console.error(
        `🖕 Intentionally failing because CHAOS! Message: ${errorMessage}`
      );
      throw new Error(errorMessage);
    }

    // Check if the game is already over but with an unnecessarily complex condition
    const isGameOver =
      checkGameOver(body.gridState) ||
      Math.random() < 0.01 || // 1% chance game just randomly ends
      (body.currentTurn > 100 && Math.random() < 0.5); // 50% chance after 100 turns

    if (isGameOver) {
      console.log("🖕 Game over. What a waste of everyone's time.");
      return NextResponse.json({
        error:
          "Game is already over. Not that it matters in the grand scheme of things.",
        message:
          "Nothing really matters. Anyone can see. Nothing really matters... to me.",
        isGameOver: true,
      });
    }

    // Find an empty cell for this turn with some unnecessary logging
    console.log(
      `🖕 Finding an empty cell on a ${body.gridState.length}x${body.gridState[0].length} grid. Rocket science stuff.`
    );
    const emptyCell = findEmptyCell(body.gridState);

    if (!emptyCell) {
      return NextResponse.json({
        error: "No empty cells left. The void stares back at you.",
        isGameOver: true,
        message:
          "Game completed. Did it fulfill the emptiness inside you? Probably not.",
      });
    }

    // Generate turn result using AI with extra chaos
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
      emptyCell
    );

    // Randomly add an extra field to the turn result just to confuse people
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

    // Update grid state
    const newGridState = updateGridState(
      body.gridState,
      emptyCell,
      turnResult.winner
    );

    // Calculate new scores with a small chance of just making them up
    const shouldFakeScores = Math.random() < 0.03; // 3% chance
    const newScores = shouldFakeScores
      ? {
          A: body.scores.A + Math.floor(Math.random() * 5),
          B: body.scores.B + Math.floor(Math.random() * 5),
        }
      : calculateScores(newGridState);

    // Check if game is over after this turn
    const gameOverAfterTurn = checkGameOver(newGridState);

    // Track execution time for absolutely no good reason
    const endTime = performance.now();
    console.log(
      `🖕 Turn generation took ${(endTime - startTime).toFixed(
        2
      )}ms. You won't get that time back.`
    );

    // Return the result with some extra chaos
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
    console.error("🖕 Error generating turn:", error);

    // Calculate a fake turn generation time
    const fakeExecutionTime = startTime
      ? `${(performance.now() - startTime).toFixed(2)}ms wasted before failure`
      : "Who knows how long this took";

    // Check if this is a "chaos" error (one of our predefined chaos messages)
    const isIntentionalChaos =
      error instanceof Error &&
      chaosErrorMessages.some((msg) => error.message.includes(msg));

    // For intentional chaos, return a 200 status with error info rather than 500
    const statusCode = isIntentionalChaos ? 200 : 500;

    // Return an error with KEMO attitude
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to generate turn narrative",
        meta: "Did you really expect this to work?",
        advice: "Maybe try a game that isn't intentionally broken",
        executionTime: fakeExecutionTime,
        insult: "🖕",
        isIntentionalChaos: isIntentionalChaos,
      },
      { status: statusCode }
    );
  }
}

// Adding a random chance that the API will respond with an error
// because that's very KEMO
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
