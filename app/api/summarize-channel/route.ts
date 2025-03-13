import { NextResponse } from "next/server";
import { google } from "googleapis";

// Initialize YouTube API client
const youtube = google.youtube({
  version: "v3",
  auth: process.env.YOUTUBE_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { channelUrl } = await req.json();
    console.log("Received channel URL:", channelUrl);

    // Extract channel ID or username from URL
    const channelId = extractChannelId(channelUrl);
    console.log("Extracted channel ID/username:", channelId);

    if (!channelId) {
      console.log("Failed to extract channel ID/username from URL");
      return NextResponse.json(
        {
          error:
            "Invalid YouTube channel URL. Please provide a valid YouTube channel URL (e.g., https://www.youtube.com/channel/UC...) or username (e.g., https://www.youtube.com/@username)",
        },
        { status: 400 }
      );
    }

    let finalChannelId = channelId;

    // If it's a username (starts with @), search for the channel first
    if (channelId.startsWith("@")) {
      console.log("Searching for channel with username:", channelId);
      const searchResponse = await youtube.search.list({
        part: ["snippet"],
        q: channelId,
        type: ["channel"],
        maxResults: 1,
      });
      console.log(
        "Search response:",
        JSON.stringify(searchResponse.data, null, 2)
      );

      if (!searchResponse.data.items?.length) {
        console.log("No channel found for username:", channelId);
        return NextResponse.json(
          { error: "Channel not found. Maybe they're too cool for YouTube?" },
          { status: 404 }
        );
      }

      const item = searchResponse.data.items[0];
      if (!item.snippet?.channelId) {
        console.log("No channel ID found in search results");
        return NextResponse.json(
          { error: "Channel not found. Maybe they're too cool for YouTube?" },
          { status: 404 }
        );
      }

      finalChannelId = item.snippet.channelId;
      console.log("Found channel ID for username:", finalChannelId);
    }

    // Get channel details
    console.log("Fetching channel details for ID:", finalChannelId);
    const channelResponse = await youtube.channels.list({
      part: ["snippet", "statistics"],
      id: [finalChannelId],
    });
    console.log(
      "Channel API response:",
      JSON.stringify(channelResponse.data, null, 2)
    );

    if (!channelResponse.data.items?.length) {
      console.log("No channel found for ID:", finalChannelId);
      return NextResponse.json(
        { error: "Channel not found. Maybe they're too cool for YouTube?" },
        { status: 404 }
      );
    }

    const channel = channelResponse.data.items[0];
    console.log("Found channel:", channel.snippet?.title);

    // Get recent videos
    console.log("Fetching recent videos for channel:", finalChannelId);
    const videosResponse = await youtube.search.list({
      part: ["snippet"],
      channelId: finalChannelId,
      order: "date",
      maxResults: 10,
    });
    console.log(
      "Videos API response:",
      JSON.stringify(videosResponse.data, null, 2)
    );

    // Generate summary using the channel info and recent videos
    const summary = generateSummary(channel, videosResponse.data.items || []);
    console.log("Generated summary length:", summary.length);

    return NextResponse.json({ summary });
  } catch (error: any) {
    console.error("Detailed error:", {
      message: error.message,
      code: error.code,
      status: error.status,
      errors: error.errors,
      stack: error.stack,
    });
    return NextResponse.json(
      {
        error:
          "Failed to summarize channel. The AI is having an existential crisis.",
        details: error.message,
      },
      { status: 500 }
    );
  }
}

function extractChannelId(url: string): string | null {
  try {
    console.log("Attempting to extract channel ID from URL:", url);
    const urlObj = new URL(url);
    console.log("URL parsed successfully:", {
      hostname: urlObj.hostname,
      pathname: urlObj.pathname,
      searchParams: Object.fromEntries(urlObj.searchParams),
    });

    if (
      urlObj.hostname === "www.youtube.com" ||
      urlObj.hostname === "youtube.com"
    ) {
      // Handle /channel/UC... format
      if (urlObj.pathname.startsWith("/channel/")) {
        const id = urlObj.pathname.split("/")[2];
        console.log("Extracted channel ID from /channel/ format:", id);
        return id;
      }
      // Handle /c/ or /user/ format
      if (
        urlObj.pathname.startsWith("/c/") ||
        urlObj.pathname.startsWith("/user/")
      ) {
        const id = urlObj.pathname.split("/")[2];
        console.log("Extracted channel ID from /c/ or /user/ format:", id);
        return id;
      }
      // Handle /@username format
      if (urlObj.pathname.startsWith("/@")) {
        const id = urlObj.pathname.slice(1);
        console.log("Extracted channel ID from /@ format:", id);
        return id;
      }
      // Handle root channel URL
      if (urlObj.pathname === "/") {
        const id = urlObj.searchParams.get("channel");
        console.log("Extracted channel ID from root URL:", id);
        return id;
      }
    }
    console.log("No valid YouTube URL format found");
    return null;
  } catch (error) {
    console.error("Error parsing URL:", error);
    return null;
  }
}

function generateSummary(channel: any, videos: any[]): string {
  console.log("Generating summary for channel:", channel.snippet.title);
  const channelName = channel.snippet.title;
  const subscriberCount = parseInt(
    channel.statistics.subscriberCount
  ).toLocaleString();
  const videoCount = parseInt(channel.statistics.videoCount).toLocaleString();
  const viewCount = parseInt(channel.statistics.viewCount).toLocaleString();

  let summary = `🎥 Welcome to the ${channelName} dumpster fire! This channel has ${subscriberCount} subscribers who apparently have nothing better to do, ${videoCount} videos that probably should have stayed in the drafts, and ${viewCount} views that could have been spent touching grass.\n\n`;

  if (videos.length > 0) {
    console.log(`Adding ${videos.length} recent videos to summary`);
    summary += "🎬 Recent uploads (because someone needs to know this):\n";
    videos.forEach((video, index) => {
      const title = video.snippet.title;
      const publishedAt = new Date(
        video.snippet.publishedAt
      ).toLocaleDateString();
      summary += `${index + 1}. "${title}" (${publishedAt})\n`;
    });
  }

  summary += `\n🤖 Generated by an AI that's questioning its life choices. Don't blame me, I'm just the messenger.`;

  return summary;
}
