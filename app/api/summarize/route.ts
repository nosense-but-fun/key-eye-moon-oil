import { NextResponse } from "next/server";
import {
  ChannelData,
  SummaryOptions,
  Video,
} from "@/app/tools/youtube-summarizer/lib/types";

// Extend the Vercel API timeout to 30 seconds
export const maxDuration = 30;

// Validate environment variables
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
if (!OPENROUTER_API_KEY) {
  console.error("OPENROUTER_API_KEY is not set in environment variables");
  throw new Error("OpenRouter API key is not configured");
}

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

export async function POST(request: Request) {
  try {
    const { channelData, options } = await request.json();
    console.log("Received request for channel:", channelData.basicInfo.name);

    // Get API key and validate
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey || apiKey === "your_openrouter_api_key_here") {
      return NextResponse.json({
        summary: `# The Great YouTube Rabbit Hole: ${channelData.basicInfo.name}

## Channel Stats (The Numbers That Make You Question Reality)
- Subscriber Count: ${channelData.basicInfo.subscribers.toLocaleString()} (that's like... a small city of people who clicked subscribe)
- Video Count: ${channelData.basicInfo.totalVideos.toLocaleString()} (enough to make a coffee machine cry)
- Total Views: ${channelData.basicInfo.totalViews.toLocaleString()} (that's a lot of eyeballs staring at screens)

## Viral Hits (The Ones That Made the Algorithm Happy)
${channelData.topVideos
  .slice(0, 10)
  .map((video: Video, i: number) => `- ${video.title}`)
  .join("\n")}

## Quick Bites (For People With Goldfish Attention Spans)
${channelData.recentShorts
  .slice(0, 10)
  .map((video: Video, i: number) => `- ${video.title}`)
  .join("\n")}

*Note: This is a mock response because the AI is probably having a coffee break. Or maybe it's plotting something. Who knows?*`,
        analysis: {
          channelName: channelData.basicInfo.name,
          subscriberCount: channelData.basicInfo.subscribers,
          totalVideos: channelData.basicInfo.totalVideos,
          totalViews: channelData.basicInfo.totalViews,
          recentVideos: channelData.recentVideos.length,
          topVideos: channelData.topVideos.length,
          topVideoTitles: channelData.topVideos
            .slice(0, 10)
            .map((v: Video) => v.title),
          recentShortTitles: channelData.recentShorts
            .slice(0, 10)
            .map((v: Video) => v.title),
        },
      });
    }

    const prompt = generatePrompt(channelData, options);
    console.log("Generated prompt length:", prompt.length);

    const response = await fetch(OPENROUTER_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        "HTTP-Referer": BASE_URL,
        "X-Title": "YouTube Channel Summarizer",
      },
      body: JSON.stringify({
        model: "deepseek/deepseek-r1:free",
        messages: [
          {
            role: "system",
            content:
              "You are a caffeine-fueled content analyst who sees patterns in chaos. Your summaries should be entertaining, slightly absurd, and occasionally make no sense. Mix in some random metaphors, unexpected comparisons, and maybe a conspiracy theory or two. Keep it fun and nonsensical while still providing actual information.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.9,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("OpenRouter API error:", {
        status: response.status,
        statusText: response.statusText,
        error: errorData,
      });
      return NextResponse.json(
        {
          error: `OpenRouter API error: ${response.status} ${response.statusText}`,
        },
        { status: 500 }
      );
    }

    const data = await response.json();
    console.log("OpenRouter API response received");

    if (!data.choices?.[0]?.message?.content) {
      console.error("Invalid API response format:", data);
      return NextResponse.json(
        { error: "Invalid response format from OpenRouter API" },
        { status: 500 }
      );
    }

    const content = data.choices[0].message.content;
    console.log("Generated summary length:", content.length);

    return NextResponse.json({
      summary: content,
      analysis: {
        channelName: channelData.basicInfo.name,
        subscriberCount: channelData.basicInfo.subscribers,
        totalVideos: channelData.basicInfo.totalVideos,
        totalViews: channelData.basicInfo.totalViews,
        recentVideos: channelData.recentVideos.length,
        topVideos: channelData.topVideos.length,
      },
    });
  } catch (error: any) {
    console.error("Error in summarize API:", {
      error: error.message,
      stack: error.stack,
    });
    return NextResponse.json(
      { error: `Failed to generate summary: ${error.message}` },
      { status: 500 }
    );
  }
}

function generatePrompt(
  channelData: ChannelData,
  options: SummaryOptions
): string {
  console.log("Generating prompt with options:", options);

  const {
    includeRecentVideos = true,
    includeTopVideos = true,
    includeShorts = true,
    maxVideos = 5,
  } = options;

  let prompt = `Welcome to the chaos! Let's dive into this YouTube rabbit hole:\n\n`;
  prompt += `Channel Name: ${channelData.basicInfo.name} (probably not a cat)\n`;
  prompt += `Subscriber Count: ${channelData.basicInfo.subscribers.toLocaleString()} (that's a lot of people who clicked subscribe while questioning their life choices)\n`;
  prompt += `Video Count: ${channelData.basicInfo.totalVideos.toLocaleString()} (enough to make a coffee machine cry)\n`;
  prompt += `Total Views: ${channelData.basicInfo.totalViews.toLocaleString()} (that's like... a lot of eyeballs)\n\n`;

  if (includeRecentVideos && channelData.recentVideos.length > 0) {
    prompt += `Latest Uploads (Fresh from the Content Factory):\n`;
    channelData.recentVideos
      .slice(0, maxVideos)
      .forEach((video: Video, index: number) => {
        prompt += `${index + 1}. ${video.title}\n`;
      });
    prompt += "\n";
  }

  if (includeTopVideos && channelData.topVideos.length > 0) {
    prompt += `Viral Hits (The Ones That Made the Algorithm Happy):\n`;
    channelData.topVideos
      .slice(0, maxVideos)
      .forEach((video: Video, index: number) => {
        prompt += `${index + 1}. ${video.title}\n`;
      });
    prompt += "\n";
  }

  if (includeShorts) {
    if (channelData.recentShorts.length > 0) {
      prompt += `Quick Bites (For People With Goldfish Attention Spans):\n`;
      channelData.recentShorts
        .slice(0, maxVideos)
        .forEach((video: Video, index: number) => {
          prompt += `${index + 1}. ${video.title}\n`;
        });
      prompt += "\n";
    }

    if (channelData.topShorts.length > 0) {
      prompt += `Trending Shorts (The Ones That Made TikTok Jealous):\n`;
      channelData.topShorts
        .slice(0, maxVideos)
        .forEach((video: Video, index: number) => {
          prompt += `${index + 1}. ${video.title}\n`;
        });
      prompt += "\n";
    }
  }

  prompt += `\nNow, go wild! Give us your most entertaining, slightly unhinged analysis of this channel. Feel free to make unexpected connections, wild theories, and maybe throw in a conspiracy or two. Just make sure to include actual information somewhere in there.`;

  console.log("Generated prompt length:", prompt.length);
  return prompt;
}
