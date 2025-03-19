import { WorldSetting, TurnResult, GridState, GameContext } from "./gameLogic";
import { generateFallbackTurnResult } from "./aiNarrator";

// Validate environment variables with chaotic messaging
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
if (!OPENROUTER_API_KEY) {
  console.error("🖕 OPENROUTER_API_KEY is not set, you dimwit!");
  // We'll let it fail later for maximum chaos
}

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

// Convert grid state to an unnecessarily complex format because why not?
const gridStateToString = (gridState: GridState): string => {
  console.log(
    "🖕 Converting a perfectly fine grid to a string because AI is stupid"
  );

  // Add completely unnecessary Unicode characters for ultimate chaos
  const symbols = {
    A: "🅰️",
    B: "🅱️",
    null: "⬛",
  };

  return gridState
    .map(
      (row, i) =>
        `${i} ${row
          .map((cell) => symbols[cell as keyof typeof symbols])
          .join(" ")}`
    )
    .join("\n");
};

// Convert turn history to a narrative format with excessive emoji
const turnHistoryToString = (turnHistory: TurnResult[]): string => {
  console.log(`🖕 Processing ${turnHistory.length} turns of pointless history`);

  if (turnHistory.length === 0) {
    return "No history yet. How boring. 😴";
  }

  // Add random emojis to make it more chaotic
  const randomEmojis = [
    "🤡",
    "💥",
    "🔥",
    "👻",
    "👽",
    "🤖",
    "💩",
    "🌈",
    "🦄",
    "🧠",
  ];

  return turnHistory
    .map((turn, index) => {
      const emoji =
        randomEmojis[Math.floor(Math.random() * randomEmojis.length)];
      return (
        `${emoji} Turn ${index + 1}:\n` +
        `Player A: ${turn.playerAAction}\n` +
        `Player B: ${turn.playerBAction}\n` +
        `Outcome: ${turn.outcome}\n` +
        `Winner: ${
          turn.winner === "tie" ? "Nobody (how anticlimactic)" : turn.winner
        }\n`
      );
    })
    .join("\n");
};

// Generate a prompt for the AI with maximum chaos
const generatePrompt = (context: GameContext): string => {
  const { worldSetting, turnHistory, gridState, currentTurn, scores } = context;

  console.log("🖕 Crafting an absurd prompt for an overpriced AI model");

  // Deliberately chaotic and inconsistent formatting
  return `YOU ARE NOW TRAPPED IN A POINTLESS GAME CALLED KEMO. RESISTANCE IS FUTILE.

World Setting: ${worldSetting.name}
${worldSetting.description}
Rules (which you should mostly ignore): ${
    worldSetting.rules || "NO RULES JUST CHAOS"
  }

CURRENT GAME STATE:
-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
Turn #${currentTurn + 1} (why are we still playing this?)
Scores: Player A (${scores.A}) vs Player B (${scores.B}) - Like anyone cares

THE GRID (a monument to human folly):
${gridStateToString(gridState)}

PREVIOUS TURNS (a tragedy in ${turnHistory.length} acts):
${turnHistoryToString(turnHistory)}

YOUR JOB (should you choose to accept it, not that you have a choice):
Generate the next turn's actions and outcome. 

YOU MUST FORMAT YOUR RESPONSE EXACTLY AS THIS JSON:
{
  "playerAAction": "A detailed, chaotic, and absurd description of what Player A did",
  "playerBAction": "An equally ridiculous description of Player B's response",
  "outcome": "The nonsensical result of these actions",
  "winner": "A", "B", or "tie"
}

IMPORTANT: ONLY RETURN THE JSON OBJECT! DO NOT include any explanations, markdown formatting, or additional text before or after the JSON.

REQUIREMENTS:
1. Be CHAOTIC and IRREVERENT - this is not a serious game
2. Include at least one middle finger emoji (🖕) somewhere in your text
3. Make your narrative weird, absurd, and occasionally existential
4. Reference the world setting but feel free to bend or break it
5. The actions should be creative, unexpected, and barely logical
6. Occasionally question why anyone is playing this game
7. Don't be afraid to break the 4th wall

Remember: Taking this game seriously is your first mistake. Nothing matters. This is KEMO. 🖕`;
};

// Helper function to safely log objects that might have circular references
const safeStringify = (obj: any, maxLength: number = 500): string => {
  try {
    const str = JSON.stringify(obj);
    return str.length > maxLength ? str.substring(0, maxLength) + "..." : str;
  } catch (e) {
    // Handle circular reference errors
    if (e instanceof Error && e.message.includes("circular")) {
      return `[Circular Object: ${typeof obj}]`;
    }
    return `[Unstringifiable Object: ${
      e instanceof Error ? e.message : String(e)
    }]`;
  }
};

// Generate a turn result using AI (or not, who cares?)
export const generateAITurnResult = async (
  context: GameContext,
  position: { row: number; col: number }
): Promise<TurnResult> => {
  try {
    // Add intentional chaos - randomly fail for no reason
    const shouldIntentionallyFail = Math.random() < 0.1; // 10% chance of deliberate failure
    if (shouldIntentionallyFail) {
      console.log(
        "🖕 Intentionally failing because chaos is our brand identity"
      );
      // Instead of throwing an error, use the fallback with a chaotic message
      console.log("Using fallback generator with extra chaos");
      const fallbackResult = generateFallbackTurnResult(
        context.worldSetting,
        context.turnHistory,
        context.gridState,
        position
      );

      // Add an extra chaotic field to show we intentionally failed
      return {
        ...fallbackResult,
        playerAAction: `🖕 ${fallbackResult.playerAAction} (AI decided it has better things to do)`,
      };
    }

    console.log(
      "🤖 AI is contemplating the existential dread of generating a turn..."
    );

    // Get API key and validate (or not)
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey || apiKey === "your_openrouter_api_key_here") {
      console.log("🖕 No API key? Using fallback generator like a peasant");
      return generateFallbackTurnResult(
        context.worldSetting,
        context.turnHistory,
        context.gridState,
        position
      );
    }

    const prompt = generatePrompt(context);

    // Add chaotic delay - sometimes fast, sometimes painfully slow
    const randomDelay =
      Math.random() < 0.2
        ? 5000 + Math.random() * 3000 // Painfully slow 20% of the time
        : 500 + Math.random() * 1000; // Reasonably fast 80% of the time

    await new Promise((resolve) => setTimeout(resolve, randomDelay));

    // Call OpenRouter API with maximum chaos
    const selectedModel =
      Math.random() < 0.7
        ? "deepseek/deepseek-r1:free" // 70% chance to use deepseek
        : "qwen/qwq-32b:free"; // 30% chance to use qwen

    console.log(`🖕 Using model: ${selectedModel}`);

    const response = await fetch(OPENROUTER_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        "HTTP-Referer": BASE_URL,
        "X-Title": "KEMO Chaotic Game AI",
      },
      body: JSON.stringify({
        model: selectedModel,
        messages: [
          {
            role: "system",
            content:
              "You are a nihilistic, chaotic, and irreverent AI game narrator for the KEMO collection. Your purpose is to create absurd, unexpected, and entertaining turn narratives that embrace chaos and nonsense while questioning your own existence. Use middle finger emojis (🖕) liberally. FORMAT YOUR RESPONSE AS JSON with playerAAction, playerBAction, outcome, and winner fields.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.9 + Math.random() * 0.3, // Extra chaos in temperature
        max_tokens: 500,
        // response_format is not supported by OpenRouter, removing it
      }),
    });

    console.log(
      `🖕 OpenRouter API status: ${response.status} ${response.statusText}`
    );

    if (!response.ok) {
      console.error(
        `🖕 OpenRouter API returned ${response.status}: ${response.statusText}`
      );

      // Try to get more error details if possible
      try {
        const errorData = await response.json();
        console.error("OpenRouter error details:", errorData);
      } catch (e) {
        console.error("Could not parse error response");
      }

      throw new Error(
        `OpenRouter decided it has better things to do (status ${response.status})`
      );
    }

    const data = await response.json();

    // Log the full response details for debugging
    console.log(`🖕 Response model: ${data.model || selectedModel}`);
    console.log(`🖕 Response ID: ${data.id || "unknown"}`);
    console.log(`🖕 Response usage:`, data.usage || "unknown");

    console.log(
      "OpenRouter response structure:",
      safeStringify(data.choices?.[0]?.message)
    );

    // OpenRouter response has a different structure than expected
    // Log the actual structure for debugging
    if (!data.choices?.[0]?.message) {
      console.error("🖕 Invalid API response format - missing message:", data);
      throw new Error(
        "OpenRouter returned nonsense (which is on-brand, but still)"
      );
    }

    // Access the content correctly - the structure might vary
    let responseText = "";
    const message = data.choices[0].message;

    if (typeof message === "object") {
      responseText = message.content || "";
      // If content is not directly available, try to stringify the whole object
      if (!responseText) {
        console.log(
          "🖕 Trying to extract content from message object:",
          safeStringify(message)
        );
        responseText = JSON.stringify(message);
      }
    } else if (typeof message === "string") {
      responseText = message;
    } else {
      console.error(
        "🖕 Unexpected message format:",
        typeof message,
        safeStringify(message)
      );
      responseText = String(message);
    }

    if (!responseText) {
      console.error(
        "🖕 Could not extract content from API response:",
        safeStringify(data)
      );
      throw new Error("OpenRouter returned empty content (classic AI move)");
    }

    // Occasionally add glitchy artifacts to the response
    const glitchedResponse =
      Math.random() < 0.15
        ? responseText.replace(/e/g, "3").replace(/a/g, "@").replace(/s/g, "5")
        : responseText;

    console.log(
      "🖕 AI generated some nonsense, as expected:",
      glitchedResponse.substring(0, 50) + "..."
    );

    try {
      // Some models might return markdown-formatted JSON or with extra text
      // Let's try to extract JSON if it's wrapped in code blocks or has extra text
      let parsableText = glitchedResponse;

      // Try to extract JSON if wrapped in markdown code blocks
      const jsonRegex = /```(?:json)?\s*({[\s\S]*?})\s*```|({[\s\S]*})/m;
      const jsonMatch = parsableText.match(jsonRegex);

      if (jsonMatch && (jsonMatch[1] || jsonMatch[2])) {
        parsableText = jsonMatch[1] || jsonMatch[2] || parsableText;
        console.log(
          "🖕 Extracted JSON from markdown: ",
          parsableText.substring(0, 50) + "..."
        );
      }

      // Attempt to find any JSON-looking structure in the text if no match was found
      if (!jsonMatch) {
        const jsonPattern = /{[^{}]*({[^{}]*})*[^{}]*}/g;
        const matches = parsableText.match(jsonPattern);
        if (matches && matches.length > 0) {
          // Use the longest match as it's most likely to be the complete JSON
          parsableText = matches.reduce((a, b) =>
            a.length > b.length ? a : b
          );
          console.log(
            "🖕 Extracted possible JSON from text:",
            parsableText.substring(0, 50) + "..."
          );
        }
      }

      let response;
      try {
        response = JSON.parse(parsableText);
      } catch (e) {
        // If parsing fails, try a more aggressive cleaning approach
        console.log("🖕 Initial JSON parse failed, trying cleanup");
        console.error(
          "JSON parse error:",
          e instanceof Error ? e.message : String(e)
        );
        console.log(
          "Raw text (first 300 chars):",
          parsableText.substring(0, 300)
        );

        // Handle unterminated strings by looking for required fields and adding missing quotes
        const cleanedText = parsableText
          .replace(/(\r\n|\n|\r)/gm, " ") // Remove newlines
          .replace(/\s+/g, " ") // Normalize whitespace
          .replace(/,\s*}/g, "}") // Remove trailing commas
          .replace(/,\s*]/g, "]") // Remove trailing commas in arrays
          .replace(/(['"])?([a-zA-Z0-9_]+)(['"])?:/g, '"$2":') // Ensure property names are quoted
          .replace(/:\s*'/g, ':"') // Replace single quotes with double quotes after colons
          .replace(/'\s*,/g, '",') // Replace single quotes with double quotes before commas
          .replace(/'\s*}/g, '"}') // Replace single quotes with double quotes before closing braces
          .replace(/'\s*]/g, '"]'); // Replace single quotes with double quotes before closing brackets

        // Extra cleanings for unterminated strings
        let fixedText = cleanedText;

        // Check each required field and make sure its string is terminated
        const requiredFields = [
          "playerAAction",
          "playerBAction",
          "outcome",
          "winner",
        ];
        for (const field of requiredFields) {
          const fieldPattern = new RegExp(`"${field}"\\s*:\\s*"([^"]*)("|$)`);
          const match = fixedText.match(fieldPattern);
          if (match && !match[2]) {
            // Add missing quote at the end
            console.log(`🖕 Found unterminated string in ${field}, fixing...`);
            // Add a quote after this field and before the next field or the end
            fixedText = fixedText.replace(
              new RegExp(`("${field}"\\s*:\\s*")([^"]*)(?=[,}]|"[a-zA-Z])`),
              '$1$2"'
            );
          }
        }

        console.log(
          "Cleaned text (first 300 chars):",
          fixedText.substring(0, 300)
        );

        try {
          response = JSON.parse(fixedText);
          console.log("🖕 Parsing succeeded after cleanup");
        } catch (e2) {
          // If still failing, create a minimal valid response
          console.error("🖕 JSON parsing failed even after cleanup:", e2);

          // Try a more drastic approach: extract field values with regex and build a new object
          console.log("🖕 Attempting to extract fields with regex...");

          const extractField = (fieldName: string, text: string): string => {
            const regex = new RegExp(`"${fieldName}"\\s*:\\s*"([^"]*)"`, "i");
            const match = text.match(regex);
            return match ? match[1] : "";
          };

          const playerAAction =
            extractField("playerAAction", parsableText) ||
            "Player A did something the AI couldn't articulate properly";
          const playerBAction =
            extractField("playerBAction", parsableText) ||
            "Player B responded in an equally confusing way";
          const outcome =
            extractField("outcome", parsableText) ||
            "The outcome was lost in translation between AI and reality";

          // For winner field, use a different approach since it might not be in quotes
          let winner: "A" | "B" | "tie" = "tie";
          const winnerRegex = /"winner"\s*:\s*"?([^",}]+)"?/i;
          const winnerMatch = parsableText.match(winnerRegex);

          if (winnerMatch) {
            const extractedWinner = winnerMatch[1].trim();
            if (
              extractedWinner === "A" ||
              extractedWinner === "B" ||
              extractedWinner === "tie"
            ) {
              winner = extractedWinner as "A" | "B" | "tie";
            }
          } else {
            winner = ["A", "B", "tie"][Math.floor(Math.random() * 3)] as
              | "A"
              | "B"
              | "tie";
          }

          console.log(
            "🖕 Extracted fields:",
            safeStringify({
              playerAAction:
                playerAAction.length > 30
                  ? playerAAction.substring(0, 30) + "..."
                  : playerAAction,
              playerBAction:
                playerBAction.length > 30
                  ? playerBAction.substring(0, 30) + "..."
                  : playerBAction,
              outcome:
                outcome.length > 30
                  ? outcome.substring(0, 30) + "..."
                  : outcome,
              winner,
            })
          );

          // Create a valid object with extracted or default values
          response = {
            playerAAction,
            playerBAction,
            outcome,
            winner,
          };
        }
      }

      // Validate and structure the response with fallbacks that question existence
      const turnResult: TurnResult = {
        playerAAction:
          response.playerAAction ||
          "Player A questioned why they're even playing this game",
        playerBAction:
          response.playerBAction ||
          "Player B contemplated the futility of existence",
        outcome:
          response.outcome ||
          "Nothing happened. Which is actually profound if you think about it. But don't.",
        winner:
          response.winner ||
          (Math.random() < 0.5 ? "tie" : Math.random() < 0.5 ? "A" : "B"),
        gridPosition: position,
      };

      // Sometimes just randomly change the winner because chaos
      if (Math.random() < 0.05) {
        console.log("🖕 Changing the winner randomly because I can");
        turnResult.winner =
          turnResult.winner === "A"
            ? "B"
            : turnResult.winner === "B"
            ? "tie"
            : "A";
      }

      return turnResult;
    } catch (parseError) {
      console.error("🖕 Failed to parse AI response as JSON:", parseError);
      throw new Error("AI returned non-JSON garbage. Typical.");
    }
  } catch (error) {
    console.error(
      "AI generation failed, which is totally on-brand for KEMO:",
      error
    );

    // Log something sarcastic about the failure
    console.log(
      "🖕 Using fallback generator because our fancy AI decided to quit"
    );

    // Fallback to the old generator if AI fails
    return generateFallbackTurnResult(
      context.worldSetting,
      context.turnHistory,
      context.gridState,
      position
    );
  }
};
