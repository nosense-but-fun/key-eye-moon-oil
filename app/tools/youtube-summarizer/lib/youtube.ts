import { ChannelData } from "./types";

export async function fetchChannelData(
  channelUrl: string
): Promise<ChannelData> {
  try {
    const response = await fetch("/api/youtube", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ channelUrl }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to fetch channel data");
    }

    return await response.json();
  } catch (error: any) {
    console.error("Error fetching channel data:", error);
    throw new Error(error.message || "Failed to fetch channel data");
  }
}

export async function fetchExampleData(): Promise<ChannelData> {
  try {
    const response = await fetch("/api/youtube", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ useExampleData: true }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to fetch example data");
    }

    return await response.json();
  } catch (error: any) {
    console.error("Error fetching example data:", error);
    throw new Error("Failed to fetch example data");
  }
}

function extractChannelId(url: string): string | null {
  try {
    const urlObj = new URL(url);

    if (
      urlObj.hostname === "www.youtube.com" ||
      urlObj.hostname === "youtube.com"
    ) {
      // Handle /channel/UC... format
      if (urlObj.pathname.startsWith("/channel/")) {
        return urlObj.pathname.split("/")[2];
      }
      // Handle /c/ or /user/ format
      if (
        urlObj.pathname.startsWith("/c/") ||
        urlObj.pathname.startsWith("/user/")
      ) {
        return urlObj.pathname.split("/")[2];
      }
      // Handle /@username format
      if (urlObj.pathname.startsWith("/@")) {
        return urlObj.pathname.slice(1);
      }
      // Handle root channel URL
      if (urlObj.pathname === "/") {
        return urlObj.searchParams.get("channel");
      }
    }
    return null;
  } catch (error) {
    console.error("Error parsing URL:", error);
    return null;
  }
}
