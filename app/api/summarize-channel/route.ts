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
    if (!channel.snippet || !channel.statistics) {
      console.log("Channel data is missing required fields");
      return NextResponse.json(
        { error: "Channel data is incomplete. The AI is confused." },
        { status: 500 }
      );
    }

    console.log("Found channel:", channel.snippet.title);

    // Get recent videos
    console.log("Fetching recent videos for channel:", finalChannelId);
    const recentVideosResponse = await youtube.search.list({
      part: ["snippet"],
      channelId: finalChannelId,
      order: "date",
      maxResults: 20,
      type: ["video"],
    });

    // Get top videos
    console.log("Fetching top videos for channel:", finalChannelId);
    const topVideosResponse = await youtube.search.list({
      part: ["snippet"],
      channelId: finalChannelId,
      order: "viewCount",
      maxResults: 20,
      type: ["video"],
    });

    // Get video IDs for both recent and top videos
    const recentVideoIds =
      recentVideosResponse.data.items
        ?.map((item) => item.id?.videoId)
        .filter((id): id is string => id !== undefined && id !== null) || [];
    const topVideoIds =
      topVideosResponse.data.items
        ?.map((item) => item.id?.videoId)
        .filter((id): id is string => id !== undefined && id !== null) || [];

    // Get video details for both sets
    console.log("Fetching video details for recent videos");
    const recentVideosDetails =
      recentVideoIds.length > 0
        ? await youtube.videos.list({
            part: ["snippet", "contentDetails"],
            id: recentVideoIds,
          })
        : { data: { items: [] } };

    console.log("Fetching video details for top videos");
    const topVideosDetails =
      topVideoIds.length > 0
        ? await youtube.videos.list({
            part: ["snippet", "contentDetails"],
            id: topVideoIds,
          })
        : { data: { items: [] } };

    // Filter videos into regular videos and shorts
    const isShort = (video: any) => {
      const duration = video.contentDetails?.duration;
      const title = video.snippet?.title?.toLowerCase() || "";
      return (
        (duration && duration <= "PT1M") || // Duration less than 1 minute
        title.includes("#shorts") || // Has #shorts in title
        title.includes("short") // Has "short" in title
      );
    };

    const recentVideos = recentVideosDetails.data?.items || [];
    const topVideos = topVideosDetails.data?.items || [];

    const recentRegularVideos = recentVideos
      .filter((video: any) => !isShort(video))
      .slice(0, 10);
    const recentShorts = recentVideos
      .filter((video: any) => isShort(video))
      .slice(0, 10);
    const topRegularVideos = topVideos
      .filter((video: any) => !isShort(video))
      .slice(0, 10);
    const topShorts = topVideos
      .filter((video: any) => isShort(video))
      .slice(0, 10);

    // Generate summary using the channel info and recent videos
    const summary = generateSummary(channel, recentRegularVideos);

    // Prepare detailed channel data
    const channelData = {
      basicInfo: {
        name: channel.snippet.title,
        description: channel.snippet.description,
        subscribers: parseInt(channel.statistics.subscriberCount || "0"),
        totalVideos: parseInt(channel.statistics.videoCount || "0"),
        totalViews: parseInt(channel.statistics.viewCount || "0"),
        createdAt: channel.snippet.publishedAt,
      },
      recentVideos: recentRegularVideos.map((video) => ({
        title: video.snippet?.title || "Untitled",
        publishedAt: video.snippet?.publishedAt || new Date().toISOString(),
      })),
      topVideos: topRegularVideos.map((video) => ({
        title: video.snippet?.title || "Untitled",
        publishedAt: video.snippet?.publishedAt || new Date().toISOString(),
      })),
      recentShorts: recentShorts.map((video) => ({
        title: video.snippet?.title || "Untitled",
        publishedAt: video.snippet?.publishedAt || new Date().toISOString(),
      })),
      topShorts: topShorts.map((video) => ({
        title: video.snippet?.title || "Untitled",
        publishedAt: video.snippet?.publishedAt || new Date().toISOString(),
      })),
    };

    return NextResponse.json({ summary, channelData });
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
