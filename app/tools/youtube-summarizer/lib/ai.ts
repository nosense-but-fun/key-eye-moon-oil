import { ChannelData, SummaryOptions, AIResponse } from "./types";

export async function generateSummary(
  channelData: ChannelData,
  options: SummaryOptions = {}
): Promise<AIResponse> {
  console.log("Starting AI summary generation");
  console.log("Channel data:", {
    name: channelData.basicInfo.name,
    subscriberCount: channelData.basicInfo.subscribers,
    videoCount: channelData.basicInfo.totalVideos,
    recentVideosCount: channelData.recentVideos.length,
    topVideosCount: channelData.topVideos.length,
  });

  try {
    const response = await fetch("/api/summarize", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        channelData,
        options,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Summarize API error:", {
        status: response.status,
        statusText: response.statusText,
        error: errorData,
      });
      throw new Error(
        errorData.error ||
          `API error: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();
    console.log("Summary generated successfully");
    return data;
  } catch (error: any) {
    console.error("Error generating summary:", {
      error: error.message,
      stack: error.stack,
      channelName: channelData.basicInfo.name,
    });
    throw new Error(`Failed to generate summary: ${error.message}`);
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
