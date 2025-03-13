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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSummary("");
    setChannelData(null);

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
            </div>
          )}

          {channelData && (
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
              <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
                Channel Data
              </h2>
              <pre className="overflow-x-auto p-4 bg-gray-50 dark:bg-gray-700 rounded-lg text-sm text-gray-900 dark:text-gray-100">
                {JSON.stringify(channelData, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
