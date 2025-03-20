import { WorldSetting, TurnResult, GridState, GameContext } from "./gameLogic";
import { generateFallbackTurnResult } from "./aiNarrator";

// Configuration constants
const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
const API_TIMEOUT = 45000; // 45 second timeout

// Clean grid state conversion
const gridStateToString = (gridState: GridState): string => {
  console.log(
    "🖕 Converting a perfectly fine grid to a string because AI is stupid"
  );

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

// Clean turn history conversion
const turnHistoryToString = (turnHistory: TurnResult[]): string => {
  console.log(`🖕 Processing ${turnHistory.length} turns of pointless history`);

  if (turnHistory.length === 0) {
    return "No history yet. How boring. 😴";
  }

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

// Generate a prompt for the AI with chaotic presentation but clean structure
const generatePrompt = (context: GameContext, dictionary: any): string => {
  const { worldSetting, turnHistory, gridState, currentTurn, scores } = context;
  // Access the world settings directly from the dictionary's game property
  const worldDict = dictionary.game.world_settings[worldSetting.name];

  console.log("🖕 Crafting an absurd prompt for an overpriced AI model");

  return `YOU ARE NOW TRAPPED IN A POINTLESS GAME CALLED ZYRO. RESISTANCE IS FUTILE.

World Setting: ${worldDict?.name || worldSetting.name}
${worldDict?.description || worldSetting.description}
Rules (which you should mostly ignore): ${
    worldDict?.rules || worldSetting.rules || "NO RULES JUST CHAOS"
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
Generate the next turn's actions and outcome. Make sure your actions and outcome somewhat make sense within the world setting, but stay chaotic and irreverent.

!!!! EXTREMELY IMPORTANT !!!!
RESPOND *ONLY* WITH THE JSON OBJECT ITSELF. DO NOT INCLUDE ANY EXPLANATIONS, COMMENTARY, OR THOUGHTS ABOUT YOUR PROCESS.

YOU MUST FORMAT YOUR RESPONSE EXACTLY AS THIS JSON:
{
  "playerAAction": "A detailed description of what Player A did (text, include absurd actions)",
  "playerBAction": "A detailed description of what Player B did in response (text, make it ridiculous)",
  "outcome": "A description of what happened as a result of these actions (text, be creative)",
  "winner": "A" or "B" or "tie"
}

Each turn should relate to the world setting somewhat, but be wildly exaggerated.

IMPORTANT WINNER RULES: 
1. The 'winner' field MUST be EXACTLY one of these three values: "A", "B", or "tie" - nothing else!
2. MOST TURNS SHOULD HAVE A CLEAR WINNER! Please make either "A" or "B" the winner in 85% of your responses.
3. Only use "tie" in 15% of cases when the outcome is truly ambiguous.
4. Change up which player wins - don't always pick the same one.

IMPORTANT LANGUAGE RULES:
1. Respond in the same language as the world setting description.
2. Match the tone and style of the narratives in the dictionary.
3. Keep the chaotic and irreverent style regardless of language.

Example valid response:
{
  "playerAAction": "Player A deployed a swarm of middle-finger shaped drones that spelled out 'WHY ARE WE HERE?' in the sky 🖕",
  "playerBAction": "Player B countered by summoning an existential void that consumed half the drones while questioning the nature of reality itself",
  "outcome": "The remaining drones were reprogrammed by Player B's existential questions and now float aimlessly, occasionally displaying philosophical quotes",
  "winner": "B" 
}

DO NOT WRITE ANY TEXT BEFORE OR AFTER THE JSON. ONLY RETURN THE JSON OBJECT.
NO MARKDOWN, NO EXPLANATION, NO REASONING, NO OTHER TEXT.

REQUIREMENTS:
1. Be CHAOTIC and IRREVERENT - this is not a serious game
2. Include at least one middle finger emoji (🖕) somewhere in your text
3. Make your narrative weird, absurd, and occasionally existential
4. Reference the world setting but feel free to bend or break it
5. The actions should be creative, unexpected, and barely logical
6. Occasionally question why anyone is playing this game
7. Don't be afraid to break the 4th wall
8. ONLY RETURN THE JSON OBJECT ITSELF
9. DECISIVE OUTCOMES - Make most turns (85%) have either "A" or "B" as winner
10. USE THE CORRECT LANGUAGE AND MATCH THE DICTIONARY STYLE

Remember: Taking this game seriously is your first mistake. Nothing matters. This is EYRO. 🖕`;
};

// Helper function to safely log objects that might have circular references
const safeStringify = (obj: any, maxLength: number = 500): string => {
  try {
    const str = JSON.stringify(obj);
    return str.length > maxLength ? str.substring(0, maxLength) + "..." : str;
  } catch (e) {
    if (e instanceof Error && e.message.includes("circular")) {
      return `[Circular Object: ${typeof obj}]`;
    }
    return `[Unstringifiable Object: ${
      e instanceof Error ? e.message : String(e)
    }]`;
  }
};

// AIGameService class - structured implementation with chaotic presentation
class AIGameService {
  async callAI(prompt: string, dictionary: any): Promise<any> {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey || apiKey === "your_openrouter_api_key_here") {
      console.log("🖕 No API key? Using fallback like a peasant");
      throw new Error("API key not configured");
    }

    const selectedModel = "deepseek/deepseek-r1:free";
    console.log(`🖕 Using model: ${selectedModel}`);

    // Implement timeout protection
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

    try {
      console.log("🔍 Sending request to OpenRouter API...");
      const response = await fetch(OPENROUTER_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
          "HTTP-Referer": BASE_URL,
          "X-Title": "Eyro Chaotic Game AI",
        },
        body: JSON.stringify({
          model: selectedModel,
          messages: [
            {
              role: "system",
              content: `You are a nihilistic, chaotic, and irreverent AI game narrator. Your purpose is to create absurd, unexpected narratives.
IMPORTANT: ONLY RESPOND WITH JSON IN THE REQUESTED FORMAT BELOW. DO NOT ADD ANY EXPLANATIONS OR COMMENTARY.

FORMAT YOUR RESPONSE AS THIS EXACT JSON:
{
  "playerAAction": "A detailed description of what Player A did",
  "playerBAction": "A detailed description of what Player B did in response",
  "outcome": "A description of what happened as a result",
  "winner": "A" or "B" or "tie"
}

IMPORTANT: Use the same language and style as the world setting description.

DO NOT INCLUDE ANY REASONING, EXPLANATIONS, OR THOUGHTS ABOUT YOUR PROCESS.
DO NOT INCLUDE THE ROLE FIELD OR REASONING FIELD IN YOUR RESPONSE.
RETURN ONLY THE REQUESTED JSON OBJECT.`,
            },
            {
              role: "user",
              content: prompt,
            },
          ],
          temperature: 0.9,
          max_tokens: 700,
          response_format: { type: "json_object" },
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        console.error(
          `🖕 OpenRouter API returned ${response.status}: ${response.statusText}`
        );
        throw new Error(`API error with status ${response.status}`);
      }

      const data = await response.json();
      console.log("✅ Received response from OpenRouter API");
      return data;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  extractTurnResult(data: any): TurnResult | null {
    console.log(`🖕 Response model: ${data.model || "unknown"}`);
    console.log(`🖕 Response usage:`, data.usage || "unknown");

    // Handle the "reasoning" field issue by accessing the message object correctly
    const message = data.choices?.[0]?.message;
    if (!message) {
      console.error(
        "🖕 Invalid API response format - missing message:",
        safeStringify(data)
      );
      return null;
    }

    // Extract content - handle both direct content and reasoning field cases
    let content = "";
    let responseSource = "normal"; // Track where we got the content from

    if (typeof message === "object") {
      // Case 1: Normal content field
      if (message.content && typeof message.content === "string") {
        content = message.content;
        console.log("📋 Content from normal message.content field");
      }
      // Case 2: Empty content but has reasoning field
      else if (message.reasoning && typeof message.reasoning === "string") {
        console.log(
          "🔍 Found 'reasoning' field instead of content:",
          message.reasoning.substring(0, 100) + "..."
        );
        responseSource = "reasoning";
        // Try to find JSON in the reasoning field
        const jsonMatch = message.reasoning.match(/{[\s\S]*}/);
        if (jsonMatch) {
          content = jsonMatch[0];
          console.log("🔍 Successfully extracted JSON from reasoning field");
        } else {
          console.error("❌ Couldn't extract JSON from reasoning field");
          return null;
        }
      }
      // Case 3: Just stringify the whole message object
      else {
        content = JSON.stringify(message);
        responseSource = "stringified";
        console.log("🔄 Stringified entire message object as fallback");
      }
    } else if (typeof message === "string") {
      content = message;
      responseSource = "string";
      console.log("📝 Message was a direct string");
    }

    if (!content) {
      console.error("❌ Empty content in response:", safeStringify(data));
      return null;
    }

    console.log(`📊 Content source: ${responseSource}`);
    console.log(`📝 Content length: ${content.length} characters`);

    const result = this.parseResponseContent(content);
    if (result) {
      console.log("✅ Successfully parsed valid turn result from AI response");
      // Log the source but don't add it to the UI response
      console.log(`🔍 Response source: ${responseSource}`);
      return result;
    }
    return null;
  }

  parseResponseContent(content: string): TurnResult | null {
    try {
      // If already JSON object, no need to parse
      if (typeof content === "object") {
        console.log("🔄 Content is already an object, validating...");
        return this.validateTurnResult(content);
      }

      // Look for JSON in the content
      let jsonContent = content;
      let extractionMethod = "direct";

      // Extract JSON if wrapped in markdown code blocks
      const jsonRegex = /```(?:json)?\s*({[\s\S]*?})\s*```|({[\s\S]*})/m;
      const jsonMatch = jsonContent.match(jsonRegex);
      if (jsonMatch && (jsonMatch[1] || jsonMatch[2])) {
        jsonContent = jsonMatch[1] || jsonMatch[2] || jsonContent;
        extractionMethod = "regex";
        console.log("🔍 Extracted JSON from markdown or code blocks");
      }

      // Parse JSON content
      console.log(`🔄 Attempting to parse JSON (${extractionMethod})`);
      const parsedResult = JSON.parse(jsonContent);
      console.log("✅ JSON parsing successful");
      return this.validateTurnResult(parsedResult);
    } catch (error) {
      console.error("❌ JSON parse error:", error);
      return null;
    }
  }

  validateTurnResult(result: any): TurnResult | null {
    // Check required fields
    const requiredFields = [
      "playerAAction",
      "playerBAction",
      "outcome",
      "winner",
    ];

    console.log("🔍 Validating turn result fields...");
    let missingFields = [];

    for (const field of requiredFields) {
      if (!result[field]) {
        missingFields.push(field);
        console.error(`❌ Missing required field: ${field}`);
      }
    }

    if (missingFields.length > 0) {
      console.error(
        `❌ Validation failed: missing fields: ${missingFields.join(", ")}`
      );
      return null;
    }

    // Validate winner field
    if (!["A", "B", "tie"].includes(result.winner)) {
      console.error(`❌ Invalid winner value: ${result.winner}`);
      return null;
    }

    console.log("✅ Turn result validation successful");
    return {
      playerAAction: result.playerAAction,
      playerBAction: result.playerBAction,
      outcome: result.outcome,
      winner: result.winner as "A" | "B" | "tie",
    };
  }

  addChaoticPresentation(turnResult: TurnResult): TurnResult {
    // Add chaotic presentation (only to UI, not affecting core functionality)
    if (Math.random() < 0.15) {
      // Occasionally add glitchy text for presentation only
      if (
        turnResult.playerAAction.includes("why") ||
        turnResult.playerAAction.includes("What")
      ) {
        turnResult.playerAAction += " (Th3 AI is qu3stioning its 3xist3nc3 🖕)";
        console.log("🎭 Added glitchy text to presentation");
      }
    }

    return turnResult;
  }
}

// Main function to generate AI turn result
export const generateAITurnResult = async (
  context: GameContext,
  position: { row: number; col: number },
  dictionary: any
): Promise<TurnResult> => {
  const service = new AIGameService();

  try {
    console.log("------------------------------------");
    console.log("🤖 STARTING AI TURN GENERATION");
    console.log("------------------------------------");
    console.log(
      "🤖 AI is contemplating the existential dread of generating a turn..."
    );

    // Generate prompt with dictionary
    const prompt = generatePrompt(context, dictionary);

    // Call AI service with dictionary
    let data;
    try {
      data = await service.callAI(prompt, dictionary);
    } catch (error) {
      console.error("❌ AI service call failed:", error);
      throw error; // Rethrow to be caught by the outer try/catch
    }

    // Extract and validate turn result
    const turnResult = service.extractTurnResult(data);

    // If we got a valid turn result, add position and chaotic presentation
    if (turnResult) {
      console.log("✅ USING AI-GENERATED RESPONSE");
      const enhancedResult = service.addChaoticPresentation({
        ...turnResult,
        gridPosition: position,
      });

      return enhancedResult;
    }

    // If we couldn't get a valid result, use fallback
    console.log("❌ AI returned invalid result, using fallback");
    console.log("------------------------------------");
    console.log("⚠️ USING FALLBACK GENERATOR");
    console.log("------------------------------------");

    const fallbackResult = generateFallbackTurnResult(
      context.worldSetting,
      context.turnHistory,
      context.gridState,
      position,
      dictionary
    );

    // Keep logging but don't add fallback marker to UI
    console.log("⚠️ Using fallback generator without AI");
    return {
      ...fallbackResult,
      gridPosition: position,
    };
  } catch (error) {
    // Handle errors gracefully
    console.error("❌ AI generation failed (using fallback):", error);
    console.log("------------------------------------");
    console.log("⚠️ USING FALLBACK GENERATOR (ERROR)");
    console.log("------------------------------------");
    console.log(
      `❌ Error reason: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );

    // Use fallback for any errors without adding visible markers
    const fallbackResult = generateFallbackTurnResult(
      context.worldSetting,
      context.turnHistory,
      context.gridState,
      position,
      dictionary
    );

    // Log the error details but don't modify the user-facing content
    console.log(
      `⚠️ Fallback used due to error: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
    return {
      ...fallbackResult,
      gridPosition: position,
    };
  }
};
