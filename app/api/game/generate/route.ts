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
import { generateFallbackTurnResult } from "../../../game/utils/aiNarrator";

// Define the request body type
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

export async function POST(request: Request) {
  console.log("🖕 Someone is actually playing this pointless game");

  try {
    // Parse the request body
    const body: RequestBody = await request.json();

    // Add some artificial chaos to the request
    const shouldFail = Math.random() < 0.05; // 5% chance of random failure

    if (shouldFail) {
      console.error("Intentionally failing because CHAOS!");
      throw new Error("The AI decided it has better things to do");
    }

    // Check if the game is already over
    const isGameOver = checkGameOver(body.gridState);

    if (isGameOver) {
      return NextResponse.json({
        error: "Game is already over",
        isGameOver: true,
      });
    }

    // Find an empty cell for this turn
    const emptyCell = findEmptyCell(body.gridState);

    if (!emptyCell) {
      return NextResponse.json({
        error: "No empty cells left",
        isGameOver: true,
      });
    }

    // In a real version, we'd call the OpenAI API here to generate the narrative
    // For now, we'll use our fallback generator for everything

    // Add a random delay to simulate AI "thinking"
    await new Promise((resolve) =>
      setTimeout(resolve, 1000 + Math.random() * 2000)
    );

    // Generate turn result
    const turnResult = generateFallbackTurnResult(
      body.worldSetting,
      body.turnHistory,
      body.gridState,
      emptyCell
    );

    // Update grid state
    const newGridState = updateGridState(
      body.gridState,
      emptyCell,
      turnResult.winner
    );

    // Calculate new scores
    const newScores = calculateScores(newGridState);

    // Check if game is over after this turn
    const gameOverAfterTurn = checkGameOver(newGridState);

    // Return the result
    return NextResponse.json({
      turnResult,
      newGridState,
      newScores,
      isGameOver: gameOverAfterTurn,
    });
  } catch (error) {
    console.error("Error generating turn:", error);

    return NextResponse.json(
      { error: "Failed to generate turn narrative" },
      { status: 500 }
    );
  }
}

// Adding a random chance that the API will respond with an error
// because that's very KEMO
export async function GET() {
  return NextResponse.json(
    {
      error: "Nice try. This API only accepts POST requests, idiot.",
      insult: "🖕",
    },
    { status: 405 }
  );
}
