import { google } from "googleapis";
import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

// Validate environment variables
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
if (!YOUTUBE_API_KEY) {
  console.error("YOUTUBE_API_KEY is not set in environment variables");
  throw new Error("YouTube API key is not configured");
}

// Initialize YouTube API client
const youtube = google.youtube({
  version: "v3",
  auth: YOUTUBE_API_KEY,
});

export async function POST(request: Request) {
  console.log("Received YouTube API request");

  try {
    const body = await request.json();
    console.log("Request body:", body);

    const { channelUrl, useExampleData } = body;

    if (useExampleData) {
      console.log("Using example data");
      try {
        // Read the example data file directly from the filesystem
        const exampleDataPath = path.join(
          process.cwd(),
          "app/tools/youtube-summarizer/example-data/emiru-channel.json"
        );
        console.log("Reading example data from:", exampleDataPath);

        const fileContents = await fs.readFile(exampleDataPath, "utf-8");
        const data = JSON.parse(fileContents);
        console.log("Example data fetched successfully");
        return NextResponse.json(data);
      } catch (error: any) {
        console.error("Error reading example data:", error);
        throw new Error("Failed to read example data file");
      }
    }

    if (!channelUrl) {
      console.error("No channel URL provided");
      return NextResponse.json(
        { error: "Channel URL is required" },
        { status: 400 }
      );
    }

    console.log("Processing channel URL:", channelUrl);
    const channelId = extractChannelId(channelUrl);

    if (!channelId) {
      console.error("Invalid channel URL format");
      return NextResponse.json(
        { error: "Invalid YouTube channel URL" },
        { status: 400 }
      );
    }

    console.log("Extracted channel ID:", channelId);
    let finalChannelId = channelId;

    // If it's a username (starts with @), search for the channel first
    if (channelId.startsWith("@")) {
      console.log("Searching for channel by username");
      try {
        const searchResponse = await youtube.search.list({
          part: ["snippet"],
          q: channelId,
          type: ["channel"],
          maxResults: 1,
        });

        if (
          !searchResponse.data.items?.length ||
          !searchResponse.data.items[0].snippet?.channelId
        ) {
          console.error("Channel not found for username:", channelId);
          return NextResponse.json(
            { error: "Channel not found" },
            { status: 404 }
          );
        }

        finalChannelId = searchResponse.data.items[0].snippet.channelId;
        console.log("Found channel ID for username:", finalChannelId);
      } catch (error: any) {
        console.error("YouTube API error:", error);
        if (error.code === 400) {
          return NextResponse.json(
            { error: "Invalid YouTube API key or API error" },
            { status: 500 }
          );
        }
        throw error;
      }
    }

    // Get channel details
    console.log("Fetching channel details");
    const channelResponse = await youtube.channels.list({
      part: ["snippet", "statistics"],
      id: [finalChannelId],
    });

    if (!channelResponse.data.items?.length) {
      console.error("Channel not found for ID:", finalChannelId);
      return NextResponse.json({ error: "Channel not found" }, { status: 404 });
    }

    const channel = channelResponse.data.items[0];
    if (!channel.snippet || !channel.statistics) {
      console.error("Incomplete channel data received");
      return NextResponse.json(
        { error: "Channel data is incomplete" },
        { status: 400 }
      );
    }

    console.log("Channel details fetched successfully");

    // Get recent videos
    console.log("Fetching recent videos");
    const recentVideosResponse = await youtube.search.list({
      part: ["snippet"],
      channelId: finalChannelId,
      order: "date",
      maxResults: 20,
      type: ["video"],
    });

    // Get top videos
    console.log("Fetching top videos");
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

    console.log(
      `Found ${recentVideoIds.length} recent videos and ${topVideoIds.length} top videos`
    );

    // Get video details for both sets
    console.log("Fetching video details");
    const recentVideosDetails =
      recentVideoIds.length > 0
        ? await youtube.videos.list({
            part: ["snippet", "contentDetails"],
            id: recentVideoIds,
          })
        : { data: { items: [] } };

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
        (duration && duration <= "PT1M") ||
        title.includes("#shorts") ||
        title.includes("short")
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

    console.log("Video filtering complete:", {
      recentRegular: recentRegularVideos.length,
      recentShorts: recentShorts.length,
      topRegular: topRegularVideos.length,
      topShorts: topShorts.length,
    });

    const channelData = {
      basicInfo: {
        name: channel.snippet.title || "",
        description: channel.snippet.description || "",
        subscribers: parseInt(channel.statistics.subscriberCount || "0"),
        totalVideos: parseInt(channel.statistics.videoCount || "0"),
        totalViews: parseInt(channel.statistics.viewCount || "0"),
        createdAt: channel.snippet.publishedAt || "",
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

    console.log("Channel data prepared successfully");
    return NextResponse.json(channelData);
  } catch (error: any) {
    console.error("Error in YouTube API route:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch channel data" },
      { status: 500 }
    );
  }
}

function extractChannelId(url: string): string | null {
  try {
    console.log("Extracting channel ID from URL:", url);
    const urlObj = new URL(url);

    if (
      urlObj.hostname === "www.youtube.com" ||
      urlObj.hostname === "youtube.com"
    ) {
      // Handle /channel/UC... format
      if (urlObj.pathname.startsWith("/channel/")) {
        const id = urlObj.pathname.split("/")[2];
        console.log("Found channel ID from /channel/ format:", id);
        return id;
      }
      // Handle /c/ or /user/ format
      if (
        urlObj.pathname.startsWith("/c/") ||
        urlObj.pathname.startsWith("/user/")
      ) {
        const id = urlObj.pathname.split("/")[2];
        console.log("Found channel ID from /c/ or /user/ format:", id);
        return id;
      }
      // Handle /@username format
      if (urlObj.pathname.startsWith("/@")) {
        const id = urlObj.pathname.slice(1);
        console.log("Found channel ID from /@ format:", id);
        return id;
      }
      // Handle root channel URL
      if (urlObj.pathname === "/") {
        const id = urlObj.searchParams.get("channel");
        console.log("Found channel ID from root URL:", id);
        return id;
      }
    }
    console.log("No valid channel ID found in URL");
    return null;
  } catch (error) {
    console.error("Error parsing URL:", error);
    return null;
  }
}
