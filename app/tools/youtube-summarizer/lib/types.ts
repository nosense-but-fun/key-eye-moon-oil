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
  };
}
