export interface ChannelData {
  basicInfo: {
    name: string;
    description: string;
    subscribers: number;
    totalVideos: number;
    totalViews: number;
    createdAt: string;
  };
  recentVideos: Video[];
  topVideos: Video[];
  recentShorts: Video[];
  topShorts: Video[];
}

export interface Video {
  title: string;
  publishedAt: string;
  views?: number;
  url?: string;
}

export interface SummaryOptions {
  includeRecentVideos?: boolean;
  includeTopVideos?: boolean;
  includeShorts?: boolean;
  maxVideos?: number;
}

export interface AIResponse {
  summary: string;
  analysis: {
    channelName: string;
    subscriberCount: number;
    totalVideos: number;
    totalViews: number;
    recentVideos: number;
    topVideos: number;
    topVideoTitles?: string[];
    recentShortTitles?: string[];
  };
}

// New types for similar channels feature
export interface SimilarChannel {
  name: string;
  url?: string;
  similarityScore: number; // Percentage of similarity
  reasonForSimilarity: string; // Explanation of why it's similar
  comparisonPoints: string[]; // List of specific comparison points
  sassyComment: string; // Snarky comment about the relationship
  isRealChannel?: boolean; // Flag to indicate if this is a real YouTube channel
}

export interface SimilarChannelsResponse {
  similarChannels: SimilarChannel[];
  analysisComment: string; // Overall analysis of the channel's uniqueness
  totalChannelsAnalyzed?: number; // Made-up number for effect
  contentOverlapPercentage?: number; // Another made-up metric
  audienceStealingIndex?: number; // Completely fictional metric
}
