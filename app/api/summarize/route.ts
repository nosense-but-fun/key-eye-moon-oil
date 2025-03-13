import { NextResponse } from "next/server";
import {
  ChannelData,
  SummaryOptions,
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
        summary: "API key not configured - using mock response",
        analysis: {
          channelName: channelData.basicInfo.name,
          subscriberCount: channelData.basicInfo.subscribers,
          totalVideos: channelData.basicInfo.totalVideos,
          totalViews: channelData.basicInfo.totalViews,
          recentVideos: channelData.recentVideos.length,
          topVideos: channelData.topVideos.length,
        },
      });
    }

    const prompt = generatePrompt(channelData, options);
    console.log("Generated prompt length:", prompt.length);

    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
          "HTTP-Referer":
            process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000",
          "X-Title": "YouTube Channel Summarizer",
        },
        body: JSON.stringify({
          model: "deepseek/deepseek-r1:free",
          messages: [
            {
              role: "system",
              content:
                "You are a YouTube channel analyst. Provide concise, engaging summaries of channel content and performance.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
          temperature: 0.7,
          max_tokens: 1000,
        }),
      }
    );

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

  let prompt = `Analyze this YouTube channel and provide a concise summary:\n\n`;
  prompt += `Channel: ${channelData.basicInfo.name}\n`;
  prompt += `Subscribers: ${channelData.basicInfo.subscribers.toLocaleString()}\n`;
  prompt += `Total Videos: ${channelData.basicInfo.totalVideos.toLocaleString()}\n`;
  prompt += `Total Views: ${channelData.basicInfo.totalViews.toLocaleString()}\n\n`;

  if (includeRecentVideos && channelData.recentVideos.length > 0) {
    prompt += `Recent Videos:\n`;
    channelData.recentVideos.slice(0, maxVideos).forEach((video, index) => {
      prompt += `${index + 1}. ${video.title}\n`;
    });
    prompt += "\n";
  }

  if (includeTopVideos && channelData.topVideos.length > 0) {
    prompt += `Top Videos:\n`;
    channelData.topVideos.slice(0, maxVideos).forEach((video, index) => {
      prompt += `${index + 1}. ${video.title}\n`;
    });
    prompt += "\n";
  }

  if (includeShorts) {
    if (channelData.recentShorts.length > 0) {
      prompt += `Recent Shorts:\n`;
      channelData.recentShorts.slice(0, maxVideos).forEach((video, index) => {
        prompt += `${index + 1}. ${video.title}\n`;
      });
      prompt += "\n";
    }

    if (channelData.topShorts.length > 0) {
      prompt += `Top Shorts:\n`;
      channelData.topShorts.slice(0, maxVideos).forEach((video, index) => {
        prompt += `${index + 1}. ${video.title}\n`;
      });
      prompt += "\n";
    }
  }

  prompt += `\nPlease provide a concise summary of this channel's content and performance.`;

  console.log("Generated prompt length:", prompt.length);
  return prompt;
}
