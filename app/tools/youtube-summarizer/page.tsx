"use client";

import { useState } from "react";

interface ChannelData {
  basicInfo: {
    name: string;
    description: string;
    subscribers: number;
    totalVideos: number;
    totalViews: number;
    createdAt: string;
  };
  recentVideos: Array<{
    title: string;
    publishedAt: string;
  }>;
  topVideos: Array<{
    title: string;
    publishedAt: string;
  }>;
  recentShorts: Array<{
    title: string;
    publishedAt: string;
  }>;
  topShorts: Array<{
    title: string;
    publishedAt: string;
  }>;
}

export default function YouTubeSummarizer() {
  const [channelUrl, setChannelUrl] = useState("");
  const [summary, setSummary] = useState("");
  const [channelData, setChannelData] = useState<ChannelData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showDetails, setShowDetails] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSummary("");
    setChannelData(null);
    setShowDetails(false);

    try {
      const response = await fetch("/api/summarize-channel", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ channelUrl }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to summarize channel");
      }

      setSummary(data.summary);
      setChannelData(data.channelData);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-8 text-center text-gray-900 dark:text-white">
            YouTube Channel Summarizer
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mb-8 text-center">
            Get a sarcastic summary of any YouTube channel. Because who has time
            to actually watch videos?
          </p>

          <form onSubmit={handleSubmit} className="mb-8">
            <div className="flex gap-4">
              <input
                type="text"
                value={channelUrl}
                onChange={(e) => setChannelUrl(e.target.value)}
                placeholder="Enter YouTube channel URL"
                className="flex-1 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                required
              />
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {loading ? "Analyzing..." : "Analyze Channel"}
              </button>
            </div>
          </form>

          {error && (
            <div className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-200 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {summary && (
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg mb-8">
              <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
                Channel Summary
              </h2>
              <div className="whitespace-pre-wrap text-gray-700 dark:text-gray-300">
                {summary}
              </div>
              {channelData && (
                <button
                  onClick={() => setShowDetails(!showDetails)}
                  className="mt-4 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  {showDetails ? "Hide Details" : "Show Channel Details"}
                </button>
              )}
            </div>
          )}

          {showDetails && channelData && (
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
              <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
                Channel Details
              </h2>

              {/* Basic Info */}
              <div className="mb-8">
                <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                  Basic Information
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">
                      Channel Name
                    </p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {channelData.basicInfo.name}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">
                      Subscribers
                    </p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {channelData.basicInfo.subscribers.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">
                      Total Videos
                    </p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {channelData.basicInfo.totalVideos.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">
                      Total Views
                    </p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {channelData.basicInfo.totalViews.toLocaleString()}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-gray-600 dark:text-gray-400">
                      Description
                    </p>
                    <p className="font-medium whitespace-pre-wrap text-gray-900 dark:text-white">
                      {channelData.basicInfo.description}
                    </p>
                  </div>
                </div>
              </div>

              {/* Recent Videos */}
              <div className="mb-8">
                <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                  Recent Videos
                </h3>
                <div className="space-y-2">
                  {channelData.recentVideos.map((video, index) => (
                    <div
                      key={index}
                      className="p-3 bg-gray-50 dark:bg-gray-700 rounded"
                    >
                      <p className="font-medium text-gray-900 dark:text-white">
                        {video.title}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {new Date(video.publishedAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Videos */}
              <div className="mb-8">
                <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                  Top Videos
                </h3>
                <div className="space-y-2">
                  {channelData.topVideos.map((video, index) => (
                    <div
                      key={index}
                      className="p-3 bg-gray-50 dark:bg-gray-700 rounded"
                    >
                      <p className="font-medium text-gray-900 dark:text-white">
                        {video.title}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {new Date(video.publishedAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Shorts */}
              <div className="mb-8">
                <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                  Recent Shorts
                </h3>
                <div className="space-y-2">
                  {channelData.recentShorts.map((video, index) => (
                    <div
                      key={index}
                      className="p-3 bg-gray-50 dark:bg-gray-700 rounded"
                    >
                      <p className="font-medium text-gray-900 dark:text-white">
                        {video.title}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {new Date(video.publishedAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Shorts */}
              <div>
                <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                  Top Shorts
                </h3>
                <div className="space-y-2">
                  {channelData.topShorts.map((video, index) => (
                    <div
                      key={index}
                      className="p-3 bg-gray-50 dark:bg-gray-700 rounded"
                    >
                      <p className="font-medium text-gray-900 dark:text-white">
                        {video.title}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {new Date(video.publishedAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
