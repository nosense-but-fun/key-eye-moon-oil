import { NextRequest, NextResponse } from "next/server";

// Define the structure of the expected request body
interface RequestBody {
  complexity: number;
  bullshitLevel: number;
}

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

  for (let i = 0; i < complexity; i++) {
    const sentences = Math.max(2, Math.floor(bullshitLevel * 1.2));
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
  try {
    // Parse the request body
    const body: RequestBody = await request.json();
    const { complexity, bullshitLevel } = body;

    // Validate inputs
    if (complexity === undefined || bullshitLevel === undefined) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Prepare the prompt based on complexity and bullshit level
    const prompt = `Generate ${complexity} paragraphs of corporate nonsense text. 
    Make it sound professional but ultimately meaningless. 
    Use plenty of buzzwords and jargon. 
    The bullshit level is ${bullshitLevel} out of 10, where 10 is completely absurd.
    Format it as paragraphs with line breaks between them.
    Don't include any additional explanations or commentary - just output the nonsensical corporate text.`;

    // Get the API key from server environment (not exposed to client)
    const apiKey = process.env.OPENROUTER_API_KEY;

    if (!apiKey || apiKey === "your_openrouter_api_key_here") {
      console.warn(
        "Missing or invalid OpenRouter API key - using development mode fallback"
      );

      // For development, generate a fake response if no valid API key
      const fakeResponse = generateFakeResponse(complexity, bullshitLevel);
      return NextResponse.json({
        text: fakeResponse,
        note: "This is a development fallback response. Set a valid API key in .env.local",
      });
    }

    // Call the OpenRouter API
    const response = await fetch(
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
        }),
      }
    );

    // Handle API errors
    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenRouter API error:", errorText);

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
      }

      return NextResponse.json(
        { error: `AI service error: ${response.status}` },
        { status: 502 }
      );
    }

    // Parse the response and send it back to the client
    const data = await response.json();
    const generatedText =
      data.choices[0]?.message?.content || "Failed to generate text.";

    return NextResponse.json({ text: generatedText });
  } catch (error) {
    console.error("Error in generate-cryptic API:", error);
    return NextResponse.json(
      { error: "Something went wrong processing your request" },
      { status: 500 }
    );
  }
}
