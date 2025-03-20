import { NextResponse } from "next/server";
import {
  ChannelData,
  SimilarChannelsResponse,
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

// YouTube API key - Make sure this is set in your environment variables
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

export async function POST(request: Request) {
  try {
    const { channelData } = await request.json();
    console.log("Finding similar channels for:", channelData.basicInfo.name);

    // Get OpenRouter API key and validate
    const apiKey = process.env.OPENROUTER_API_KEY;

    // Check if YouTube API key is available
    if (!YOUTUBE_API_KEY) {
      console.warn(
        "YOUTUBE_API_KEY is not set. Falling back to mock response."
      );
      return NextResponse.json(generateMockResponse(channelData));
    }

    try {
      // Try to get real YouTube channels first
      const realChannels = await findRealSimilarChannels(channelData);

      // If we have real channels, potentially add one fictional one and return
      if (realChannels.length > 0) {
        // Get sassy comments from AI for the real channels
        const sassyAnalysis = await getSassyAnalysis(
          apiKey || "",
          channelData,
          realChannels
        );
        return NextResponse.json(sassyAnalysis);
      }
    } catch (youtubeError) {
      console.error("Error fetching from YouTube API:", youtubeError);
      // If YouTube API fails, continue with AI generation
    }

    // If real channels couldn't be found or YouTube API failed, fall back to AI
    if (!apiKey || apiKey === "your_openrouter_api_key_here") {
      // Fallback mock response with chaotic Eyro vibe
      return NextResponse.json(generateMockResponse(channelData));
    }

    const prompt = generateSimilarChannelsPrompt(channelData);
    console.log("Generated prompt for similar channels");

    // Call OpenRouter API
    const response = await fetch(OPENROUTER_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        "HTTP-Referer":
          process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000",
      },
      body: JSON.stringify({
        model: "deepseek/deepseek-r1:free",
        messages: [
          {
            role: "system",
            content: `You're a chaotic, sarcastic AI with a nihilistic sense of humor. Your job is to analyze YouTube channels and find similar ones, but present this information in the most judgmental, absurd way possible. Use irreverent language, make up ridiculous metrics, and be generally unhinged while still being technically accurate. Break the fourth wall occasionally. Make fun of the channel without being actually offensive.`,
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.8,
        max_tokens: 1024,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("API error:", errorData);
      throw new Error(
        `OpenRouter API returned ${response.status}: ${JSON.stringify(
          errorData
        )}`
      );
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    console.log("Received similar channels response");

    try {
      // Parse the JSON from the AI response
      const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/);
      const jsonString = jsonMatch ? jsonMatch[1] : content;
      const similarChannelsData = JSON.parse(jsonString);

      // Validate and ensure the response has the correct structure
      const validatedResponse = validateAndCleanResponse(similarChannelsData);

      return NextResponse.json(validatedResponse);
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
      console.log("Raw AI content:", content);

      // Fall back to mock data when parsing fails
      return NextResponse.json(generateMockResponse(channelData));
    }
  } catch (error) {
    console.error("Error in similar channels API:", error);
    return NextResponse.json(
      {
        error:
          "Failed to find similar channels. The AI is probably questioning its existence.",
      },
      { status: 500 }
    );
  }
}

// Function to find real similar YouTube channels
async function findRealSimilarChannels(channelData: ChannelData) {
  if (!YOUTUBE_API_KEY) return [];

  // Get keywords from the channel
  const keywords = extractKeywords(channelData);
  console.log("Extracted keywords for channel search:", keywords);

  try {
    // Search for channels using the keywords
    const searchQuery = encodeURIComponent(`${keywords.join(" OR ")} channel`);
    const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&q=${searchQuery}&maxResults=5&key=${YOUTUBE_API_KEY}`;
    console.log("Searching for channels with query:", searchQuery);

    const response = await fetch(searchUrl);
    if (!response.ok) {
      console.error(
        "YouTube search API error:",
        response.status,
        await response.text()
      );
      throw new Error(`YouTube API search failed: ${response.status}`);
    }

    const data = await response.json();
    console.log(`Found ${data.items?.length || 0} channels in search results`);

    // Filter out the original channel and get channel details
    const channelIds = data.items
      .filter(
        (item: any) =>
          item.snippet.channelTitle.toLowerCase() !==
          channelData.basicInfo.name.toLowerCase()
      )
      .map((item: any) => item.snippet.channelId);

    console.log(
      `After filtering, using ${channelIds.length} channel IDs:`,
      channelIds
    );

    if (channelIds.length === 0) return [];

    // Get detailed info for each channel
    const channelsUrl = `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&id=${channelIds.join(
      ","
    )}&key=${YOUTUBE_API_KEY}`;
    console.log("Fetching channel details");

    const channelsResponse = await fetch(channelsUrl);

    if (!channelsResponse.ok) {
      console.error(
        "YouTube channels API error:",
        channelsResponse.status,
        await channelsResponse.text()
      );
      throw new Error(
        `YouTube API channels request failed: ${channelsResponse.status}`
      );
    }

    const channelsData = await channelsResponse.json();
    console.log(
      `Retrieved details for ${channelsData.items?.length || 0} channels`
    );

    // Format the channel data
    const formattedChannels = channelsData.items.map((channel: any) => ({
      name: channel.snippet.title,
      url: `https://www.youtube.com/channel/${channel.id}`,
      description: channel.snippet.description,
      subscribers: parseInt(channel.statistics.subscriberCount) || 0,
      videoCount: parseInt(channel.statistics.videoCount) || 0,
      viewCount: parseInt(channel.statistics.viewCount) || 0,
      thumbnailUrl: channel.snippet.thumbnails.default.url,
    }));

    console.log(
      "Returning formatted channel data:",
      formattedChannels.map((c: { name: string }) => c.name)
    );
    return formattedChannels;
  } catch (error) {
    console.error("Error fetching from YouTube API:", error);
    return [];
  }
}

// Function to extract keywords from channel data
function extractKeywords(channelData: ChannelData): string[] {
  const keywords = new Set<string>();

  // Extract keywords from channel description
  const descriptionWords = channelData.basicInfo.description
    .split(/\s+/)
    .filter((word) => word.length > 4)
    .map((word) => word.toLowerCase())
    .slice(0, 5);

  descriptionWords.forEach((word) => keywords.add(word));

  // Extract keywords from video titles
  const videoTitles = [
    ...channelData.topVideos.slice(0, 3).map((v) => v.title),
    ...channelData.recentVideos.slice(0, 3).map((v) => v.title),
  ];

  const videoKeywords = videoTitles
    .join(" ")
    .split(/\s+/)
    .filter((word) => word.length > 4)
    .map((word) => word.toLowerCase())
    .slice(0, 10);

  videoKeywords.forEach((word) => keywords.add(word));

  return Array.from(keywords).slice(0, 7); // Limit to 7 keywords
}

// Function to get sassy analysis of real channels from AI
async function getSassyAnalysis(
  apiKey: string,
  originalChannel: ChannelData,
  realChannels: any[]
) {
  if (
    !apiKey ||
    apiKey === "your_openrouter_api_key_here" ||
    realChannels.length === 0
  ) {
    // Fall back to mock with real channels
    return generateResponseWithRealChannels(originalChannel, realChannels);
  }

  // Get channel descriptions for prompt
  const channelDescriptions = realChannels
    .map(
      (channel, index) =>
        `Channel ${index + 1}: ${channel.name}
     Subscribers: ${channel.subscribers}
     Videos: ${channel.videoCount}
     Description: ${channel.description.slice(0, 100)}...`
    )
    .join("\n\n");

  const prompt = `
I have a YouTube channel named "${originalChannel.basicInfo.name}" with ${originalChannel.basicInfo.subscribers} subscribers.
Description: ${originalChannel.basicInfo.description}

I found these real similar channels:
${channelDescriptions}

For each channel, give me:
1. A similarity score (percentage)
2. A snarky reason why it's similar to my channel
3. 2-3 specific comparison points
4. A sassy comment about our relationship

Also provide:
- An overall analysis of how unique/generic my channel is
- A "Content Overlap Percentage"
- An "Audience Stealing Index"

Make it sarcastic, judgmental, and chaotic in the style of Eyro, but these are REAL channels, so be somewhat plausible.
Respond ONLY with a JSON object matching this structure:
\`\`\`json
{
  "similarChannels": [
    {
      "name": "Real channel name",
      "url": "Real channel URL",
      "similarityScore": 87,
      "reasonForSimilarity": "Both exploit the same algorithm loophole",
      "comparisonPoints": ["Similar clickbait tactics", "Same target audience"],
      "sassyComment": "They're basically twins separated at birth, except one got all the talent"
    }
  ],
  "analysisComment": "Overall snarky analysis of the channel's uniqueness",
  "totalChannelsAnalyzed": 9428,
  "contentOverlapPercentage": 68,
  "audienceStealingIndex": 42
}
\`\`\`
`;

  try {
    // Call OpenRouter API
    const response = await fetch(OPENROUTER_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        "HTTP-Referer":
          process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000",
      },
      body: JSON.stringify({
        model: "deepseek/deepseek-r1:free",
        messages: [
          {
            role: "system",
            content: `You're a chaotic, sarcastic AI with a nihilistic sense of humor. Your job is to analyze YouTube channels and find similar ones, but present this information in the most judgmental, absurd way possible. Use irreverent language, make up ridiculous metrics, and be generally unhinged while still being technically accurate. Break the fourth wall occasionally. Make fun of the channel without being actually offensive.`,
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.8,
        max_tokens: 1024,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenRouter API returned ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;

    // Parse the JSON from the AI response
    const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/);
    const jsonString = jsonMatch ? jsonMatch[1] : content;
    const aiResponse = JSON.parse(jsonString);

    // Add the real channel URLs if they're missing
    const enhancedResponse = {
      ...aiResponse,
      similarChannels: aiResponse.similarChannels.map(
        (channel: any, index: number) => {
          // Ensure the original URL is preserved exactly as is
          // Only use fallback if URL is completely missing
          return {
            ...channel,
            url: channel.url || realChannels[index % realChannels.length].url,
            // Add a debug flag to track the source
            isRealChannel: true,
          };
        }
      ),
    };

    // Validate and ensure the response has the correct structure
    return validateAndCleanResponse(enhancedResponse);
  } catch (error) {
    console.error("Error getting sassy analysis:", error);
    // Fall back to generated response with real channels
    return generateResponseWithRealChannels(originalChannel, realChannels);
  }
}

// Generate a response with real channels but automated sassy comments
function generateResponseWithRealChannels(
  originalChannel: ChannelData,
  realChannels: any[]
): SimilarChannelsResponse {
  const channelName = originalChannel.basicInfo.name;
  const maxChannels = Math.min(realChannels.length, 4); // Use up to 4 real channels

  // Add one fictional channel if we have less than 3 real ones
  const shouldAddFictional = maxChannels < 3;

  // Prepare real channels with sassy comments
  const realChannelEntries = realChannels
    .slice(0, maxChannels)
    .map((channel, index) => {
      // Calculate a fake similarity score based on subscribers/videos ratio
      const subscriberRatio =
        Math.min(originalChannel.basicInfo.subscribers, channel.subscribers) /
        Math.max(originalChannel.basicInfo.subscribers, channel.subscribers);
      const videoRatio =
        Math.min(originalChannel.basicInfo.totalVideos, channel.videoCount) /
        Math.max(originalChannel.basicInfo.totalVideos, channel.videoCount);
      const similarityScore = Math.floor(
        (subscriberRatio * 0.4 + videoRatio * 0.6) * 100
      );

      // Sassy reasons and comments
      const sassyReasons = [
        "Uses the exact same clickbait strategy but with better thumbnails",
        "Basically copied your entire content plan but added actual talent",
        "Makes suspiciously similar videos just after yours, but somehow gets more views",
        "Occupies the same niche but with marginally better production quality",
        "Clearly follows your content but managed to make it actually watchable",
      ];

      const comparisonPointsList = [
        [
          "Same target audience, but they actually know how to reach them",
          "Similar content structure, suspiciously similar",
        ],
        [
          "Somehow always covers the same topics within days of your videos",
          "Uses the same intro format but less cringe",
        ],
        [
          "Same niche, but with actual expertise",
          "Similar video length but somehow less boring",
        ],
        [
          "Copies your style but with better execution",
          "Similar thumbnail style but people actually click on theirs",
        ],
      ];

      const sassyComments = [
        "Like your channel's more successful sibling that your parents actually love",
        "What your channel would look like if it were made by someone with talent",
        "You two are competing for the same audience, but they're winning by a landslide",
        "The glow-up version of your channel that actually delivers on its promises",
      ];

      // Ensure we preserve the exact URL format
      console.log(`Preserving real channel URL: ${channel.url}`);

      return {
        name: channel.name,
        url: channel.url, // Preserve exact URL
        similarityScore: similarityScore,
        reasonForSimilarity: sassyReasons[index % sassyReasons.length],
        comparisonPoints:
          comparisonPointsList[index % comparisonPointsList.length],
        sassyComment: sassyComments[index % sassyComments.length],
        isRealChannel: true, // Add a flag to mark real channels
      };
    });

  // Add one fictional channel if needed
  const allChannels = shouldAddFictional
    ? [
        ...realChannelEntries,
        {
          name: `${channelName} But Worse`,
          url: "https://youtube.com/c/thecopycat",
          similarityScore: 78,
          reasonForSimilarity:
            "They're basically photocopying all your content but with worse lighting",
          comparisonPoints: [
            "Same exact topics but explained incorrectly",
            "Uses your thumbnails but with Comic Sans",
            "Releases videos 3 days after yours",
          ],
          sassyComment:
            "They're like your echo, but the echo has a speech impediment",
          isRealChannel: false, // Explicitly mark as fake
        },
      ]
    : realChannelEntries;

  return {
    similarChannels: allChannels,
    analysisComment: `After extensive analysis, I've determined that ${channelName} is about as unique as a grain of sand on a beach. You and these other ${allChannels.length} channels are basically a content cloning experiment gone wrong.`,
    totalChannelsAnalyzed: 8521,
    contentOverlapPercentage: 73,
    audienceStealingIndex: 45,
  };
}

function generateSimilarChannelsPrompt(channelData: ChannelData): string {
  const { basicInfo, topVideos, recentVideos } = channelData;

  const topVideoTitles = topVideos
    .slice(0, 5)
    .map((v) => v.title)
    .join("\n- ");
  const recentVideoTitles = recentVideos
    .slice(0, 5)
    .map((v) => v.title)
    .join("\n- ");

  return `
I have a YouTube channel with the following information:

Channel name: ${basicInfo.name}
Description: ${basicInfo.description}
Subscribers: ${basicInfo.subscribers}
Total videos: ${basicInfo.totalVideos}
Content type indicators: 
- Top 5 videos:
  - ${topVideoTitles}
- Recent 5 videos:
  - ${recentVideoTitles}

Based on this information:

1. Generate 3-5 fictional "similar channels" that might exist on YouTube. ONE channel should be completely fake and humorous, but the others should be plausible real channels with real URLs
2. For each channel, include:
   - A plausible channel name
   - For real channels, use a real YouTube URL format (https://www.youtube.com/channel/UC...)
   - A similarity score (percentage)
   - A snarky reason why they're similar
   - 2-3 specific comparison points
   - A sassy comment about their relationship (like they're copying each other)
3. Add an overall analysis of how unique/generic this channel is
4. Include made-up metrics like "Content Overlap Percentage" and "Audience Stealing Index"

Respond ONLY with a JSON object matching this structure:
\`\`\`json
{
  "similarChannels": [
    {
      "name": "Channel name",
      "url": "Channel URL (make it a real YouTube URL format)",
      "similarityScore": 87,
      "reasonForSimilarity": "Both exploit the same algorithm loophole",
      "comparisonPoints": ["Similar clickbait tactics", "Same target audience"],
      "sassyComment": "They're basically twins separated at birth, except one got all the talent"
    }
  ],
  "analysisComment": "Overall snarky analysis of the channel's uniqueness",
  "totalChannelsAnalyzed": 9428,
  "contentOverlapPercentage": 68,
  "audienceStealingIndex": 42
}
\`\`\`

Be creative, snarky, and irreverent, but make the analysis somewhat plausible based on the channel info. Make sure most URLs look like real YouTube channel URLs.
`;
}

function validateAndCleanResponse(response: any): SimilarChannelsResponse {
  // Ensure the response has the correct structure
  const validatedResponse: SimilarChannelsResponse = {
    similarChannels: Array.isArray(response.similarChannels)
      ? response.similarChannels.map((channel: any) => {
          // Determine if this is likely a real channel URL or not
          const url = channel.url || "";
          const looksLikeRealYouTubeUrl =
            url.includes("youtube.com/channel/UC") &&
            !url.includes("thecopycat") &&
            !url.includes("sellout4life") &&
            !url.includes("bootlegcontent");

          return {
            name: channel.name || "Unnamed Channel",
            url: channel.url,
            similarityScore:
              typeof channel.similarityScore === "number"
                ? channel.similarityScore
                : Math.floor(Math.random() * 100),
            reasonForSimilarity:
              channel.reasonForSimilarity || "They both exist on the internet",
            comparisonPoints: Array.isArray(channel.comparisonPoints)
              ? channel.comparisonPoints
              : ["They both use electricity", "Both channels have videos"],
            sassyComment:
              channel.sassyComment ||
              "I'm too tired to think of something clever",
            // Use the provided isRealChannel value if it exists
            // Otherwise try to guess based on the URL format
            isRealChannel:
              typeof channel.isRealChannel === "boolean"
                ? channel.isRealChannel
                : looksLikeRealYouTubeUrl,
          };
        })
      : [],
    analysisComment:
      response.analysisComment || "Analysis machine broke. Have a nice day.",
    totalChannelsAnalyzed:
      response.totalChannelsAnalyzed ||
      Math.floor(Math.random() * 10000) + 1000,
    contentOverlapPercentage:
      response.contentOverlapPercentage || Math.floor(Math.random() * 100),
    audienceStealingIndex:
      response.audienceStealingIndex || Math.floor(Math.random() * 100),
  };

  return validatedResponse;
}

function generateMockResponse(
  channelData: ChannelData
): SimilarChannelsResponse {
  const channelName = channelData.basicInfo.name;

  return {
    similarChannels: [
      {
        name: "MKBHD",
        url: "https://www.youtube.com/channel/UCBJycsmduvYEL83R_U4JriQ",
        similarityScore: 78,
        reasonForSimilarity:
          "Both pretend to know what they're talking about when reviewing tech",
        comparisonPoints: [
          "High production value that masks mediocre content",
          "Loves shiny new gadgets more than actual usefulness",
          "Has a suspiciously clean desk",
        ],
        sassyComment: "What your channel aspires to be but will never achieve",
        isRealChannel: true,
      },
      {
        name: "Linus Tech Tips",
        url: "https://www.youtube.com/channel/UCXuqSBlHAE6Xw-yeJA0Tunw",
        similarityScore: 62,
        reasonForSimilarity: "Both drop expensive equipment on camera",
        comparisonPoints: [
          "Makes technically accurate but practically useless content",
          "Somehow turns 30 seconds of content into 20-minute videos",
        ],
        sassyComment: "Like your channel but with an actual budget and viewers",
        isRealChannel: true,
      },
      {
        name: channelName + " from Wish.com",
        url: "https://youtube.com/c/bootlegcontent",
        similarityScore: 43,
        reasonForSimilarity:
          "Low-budget version of your already low-budget operation",
        comparisonPoints: [
          "Films with a potato instead of a camera",
          "Constantly asks viewers to 'smash that like button' every 10 seconds",
        ],
        sassyComment:
          "If your channel was a knockoff designer handbag being sold on a street corner",
        isRealChannel: false,
      },
    ],
    analysisComment: `After extensive analysis, I've determined that ${channelName} has approximately zero unique characteristics. Congratulations on being utterly generic! You've mastered the art of being forgettably average.`,
    totalChannelsAnalyzed: 8521,
    contentOverlapPercentage: 73,
    audienceStealingIndex: 45,
  };
}
