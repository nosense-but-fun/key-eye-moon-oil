import { NextRequest, NextResponse } from "next/server";

// Define the structure of the expected request body
interface RequestBody {
  complexity: number;
  bullshitLevel: number;
}

// Extend the Vercel API timeout to 30 seconds
export const maxDuration = 30; // Vercel Edge Runtime allows up to 30s timeout on paid plans

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body: RequestBody = await request.json();
    const { complexity, bullshitLevel } = body;

    // Basic validation
    if (!complexity || !bullshitLevel) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Get API key
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey || apiKey === "your_openrouter_api_key_here") {
      return NextResponse.json({
        text: "Our synergy framework will optimize stakeholder value through disruptive innovation.",
        note: "Development mode - Set your OpenRouter API key in .env.local",
      });
    }

    // Call OpenRouter API
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
              role: "system",
              content:
                "You are a corporate text generator. Output ONLY paragraphs of corporate nonsense.",
            },
            {
              role: "user",
              content: `Generate ${complexity} paragraphs of corporate nonsense. Each paragraph should be 2-3 sentences. Use buzzwords: synergy, leverage, optimize, paradigm, stakeholder, solutions, framework, innovation, disrupt. BS level ${bullshitLevel}/10.`,
            },
          ],
          temperature: 0.7,
          max_tokens: 600,
        }),
      }
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to generate text" },
        { status: 502 }
      );
    }

    const data = await response.json();

    console.log(data);

    const generatedText = data.choices?.[0]?.message?.content || "";

    return NextResponse.json({ text: generatedText });
  } catch (error) {
    console.error("Error generating text:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
