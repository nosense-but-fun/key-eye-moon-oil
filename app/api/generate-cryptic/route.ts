import { NextRequest, NextResponse } from "next/server";

// Define the structure of the expected request body
interface RequestBody {
  complexity: number;
  bullshitLevel: number;
}

// Extend the Vercel API timeout to 30 seconds
export const maxDuration = 30; // Vercel Edge Runtime allows up to 30s timeout on paid plans

// Logger function to standardize log format for Vercel logs
const logger = {
  info: (message: string, data?: any) => {
    console.log(
      `[CRYPTIC-GEN][INFO] ${message}`,
      data ? JSON.stringify(data) : ""
    );
  },
  error: (message: string, error: any) => {
    console.error(
      `[CRYPTIC-GEN][ERROR] ${message}`,
      error instanceof Error
        ? { message: error.message, stack: error.stack }
        : JSON.stringify(error)
    );
  },
  warn: (message: string, data?: any) => {
    console.warn(
      `[CRYPTIC-GEN][WARN] ${message}`,
      data ? JSON.stringify(data) : ""
    );
  },
};

// Generate a fake response for development without using the API
function generateFakeResponse(
  complexity: number,
  bullshitLevel: number
): string {
  const buzzwords = [
    "synergy",
    "blockchain",
    "AI-driven",
    "cloud-native",
    "paradigm shift",
  ];
  const nouns = [
    "framework",
    "solution",
    "ecosystem",
    "architecture",
    "platform",
  ];
  const verbs = [
    "leverage",
    "optimize",
    "transform",
    "revolutionize",
    "disrupt",
  ];

  let result = "";

  // Limit complexity to reduce generation time
  const limitedComplexity = Math.min(complexity, 3);

  for (let i = 0; i < limitedComplexity; i++) {
    const sentences = Math.max(2, Math.min(Math.floor(bullshitLevel * 1.2), 6));
    let paragraph = "";

    for (let j = 0; j < sentences; j++) {
      const randomBuzzword =
        buzzwords[Math.floor(Math.random() * buzzwords.length)];
      const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
      const randomVerb = verbs[Math.floor(Math.random() * verbs.length)];

      paragraph += `Our ${randomBuzzword} ${randomNoun} will ${randomVerb} the industry landscape. `;
    }

    result += paragraph + "\n\n";
  }

  return result;
}

export async function POST(request: NextRequest) {
  const requestId = Math.random().toString(36).substring(2, 10);
  const startTime = Date.now();

  logger.info(`Request ${requestId} started`);

  try {
    // Parse the request body
    const body: RequestBody = await request.json();
    const { complexity, bullshitLevel } = body;

    logger.info(`Request ${requestId} parameters`, {
      complexity,
      bullshitLevel,
    });

    // Validate inputs
    if (complexity === undefined || bullshitLevel === undefined) {
      logger.warn(`Request ${requestId} validation failed - missing fields`);
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Limit complexity to prevent timeouts
    const limitedComplexity = Math.min(complexity, 3);
    if (limitedComplexity < complexity) {
      logger.info(
        `Request ${requestId} complexity reduced from ${complexity} to ${limitedComplexity}`
      );
    }

    // Create a shorter, more concise prompt to reduce response time
    const prompt = `Generate ${limitedComplexity} short paragraphs of corporate nonsense text. Use buzzwords. BS level ${bullshitLevel}/10. Keep it brief and concise with short sentences. No additional commentary.`;

    // Get the API key from server environment (not exposed to client)
    const apiKey = process.env.OPENROUTER_API_KEY;
    const apiKeyStatus = !apiKey
      ? "missing"
      : apiKey === "your_openrouter_api_key_here"
      ? "placeholder"
      : "valid";

    logger.info(`Request ${requestId} API key status: ${apiKeyStatus}`);

    if (!apiKey || apiKey === "your_openrouter_api_key_here") {
      logger.warn(
        `Request ${requestId} using development fallback - API key is ${apiKeyStatus}`
      );

      // For development, generate a fake response if no valid API key
      const fakeResponse = generateFakeResponse(
        limitedComplexity,
        bullshitLevel
      );
      return NextResponse.json({
        text: fakeResponse,
        note: "This is a development fallback response. Set a valid API key in .env.local",
      });
    }

    logger.info(`Request ${requestId} preparing to call OpenRouter API`);

    // Set a timeout promise for the fetch operation
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => {
        logger.error(`Request ${requestId} timed out after 25000ms`, {});
        reject(new Error("API request timed out"));
      }, 25000);
    });

    // Call the OpenRouter API with a timeout
    const fetchPromise = fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer":
            request.headers.get("referer") || "https://kemo-collection.com",
          "X-Title": "KEMO Collection",
        },
        body: JSON.stringify({
          model: "deepseek/deepseek-r1:free",
          messages: [
            {
              role: "user",
              content: prompt,
            },
          ],
          // Add timeout and temperature parameters to optimize response time
          timeout: 25,
          temperature: 0.7, // Lower temperature for more deterministic (faster) responses
          max_tokens: 300, // Limit the token count for faster responses
        }),
      }
    );

    logger.info(`Request ${requestId} API call initiated`);

    // Race between the fetch and timeout
    let response: Response;
    try {
      response = (await Promise.race([
        fetchPromise,
        timeoutPromise,
      ])) as Response;

      logger.info(
        `Request ${requestId} received response with status ${response.status}`
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error during fetch";
      logger.error(`Request ${requestId} fetch operation failed`, {
        error: errorMessage,
      });
      throw error;
    }

    // Handle API errors
    if (!response.ok) {
      const errorText = await response.text();
      logger.error(`Request ${requestId} OpenRouter API error`, {
        status: response.status,
        statusText: response.statusText,
        errorText,
      });

      // Provide more specific error messages based on status code
      if (response.status === 401) {
        return NextResponse.json(
          {
            error:
              "Authentication failed. Please check your OpenRouter API key in .env.local",
          },
          { status: 502 }
        );
      } else if (response.status === 429) {
        return NextResponse.json(
          { error: "Rate limit exceeded. Please try again later." },
          { status: 502 }
        );
      } else if (response.status === 504 || response.status === 408) {
        return NextResponse.json(
          {
            error:
              "AI service timed out. Trying reducing complexity or try again later.",
          },
          { status: 504 }
        );
      }

      return NextResponse.json(
        { error: `AI service error: ${response.status}` },
        { status: 502 }
      );
    }

    // Parse the response and send it back to the client
    const data = await response.json();
    logger.info(`Request ${requestId} successfully parsed response data`, {
      hasChoices: !!data.choices,
      choicesLength: data.choices?.length,
    });

    const generatedText =
      data.choices[0]?.message?.content || "Failed to generate text.";

    const processingTime = Date.now() - startTime;
    logger.info(
      `Request ${requestId} completed successfully in ${processingTime}ms`
    );

    return NextResponse.json({ text: generatedText });
  } catch (error) {
    const processingTime = Date.now() - startTime;
    logger.error(
      `Request ${requestId} failed after ${processingTime}ms`,
      error
    );

    // Check if it's a timeout error
    const errorMessage =
      error instanceof Error ? error.message : "Something went wrong";
    if (errorMessage.includes("timed out")) {
      return NextResponse.json(
        { error: "Request timed out. Try using a lower complexity setting." },
        { status: 504 }
      );
    }

    return NextResponse.json(
      { error: "Something went wrong processing your request" },
      { status: 500 }
    );
  }
}
