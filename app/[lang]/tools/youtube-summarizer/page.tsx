"use client";

import { useState } from "react";
import {
  ChannelData,
  AIResponse,
} from "@/app/tools/youtube-summarizer/lib/types";
import SummaryDisplay from "@/app/tools/youtube-summarizer/components/SummaryDisplay";
import { useLanguage } from "@/app/contexts/LanguageContext";

export default function YouTubeSummarizer() {
  const { dictionary } = useLanguage();
  const dict = dictionary.youtube_summarizer_tool;

  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [error, setError] = useState("");
  const [summary, setSummary] = useState("");
  const [analysis, setAnalysis] = useState<AIResponse["analysis"] | null>(null);
  const [channelData, setChannelData] = useState<ChannelData | null>(null);

  const updateLoadingMessage = () => {
    const randomIndex = Math.floor(
      Math.random() * dict.loading_messages.length
    );
    setLoadingMessage(dict.loading_messages[randomIndex]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSummary("");
    setAnalysis(null);
    setChannelData(null);
    updateLoadingMessage();

    const messageInterval = setInterval(updateLoadingMessage, 3000);

    try {
      console.log("Fetching channel data...");
      const response = await fetch("/api/youtube", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ channelUrl: url }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch channel data");
      }

      const data = await response.json();
      console.log("Channel data received:", data);
      setChannelData(data);

      // Generate AI summary
      console.log("Generating AI summary...");
      const summaryResponse = await fetch("/api/summarize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          channelData: data,
          options: {
            recentVideos: 10,
            topVideos: 10,
            shorts: 10,
          },
        }),
      });

      if (!summaryResponse.ok) {
        const errorData = await summaryResponse.json();
        throw new Error(errorData.error || "Failed to generate summary");
      }

      const summaryData = await summaryResponse.json();
      console.log("Summary received:", summaryData);
      setSummary(summaryData.summary);
      setAnalysis({
        channelName: data.basicInfo.name,
        subscriberCount: data.basicInfo.subscribers,
        totalVideos: data.basicInfo.totalVideos,
        totalViews: data.basicInfo.totalViews,
        recentVideos: data.recentVideos.length,
        topVideos: data.topVideos.length,
      });
    } catch (err) {
      console.error("Error:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      clearInterval(messageInterval);
      setLoading(false);
      setLoadingMessage("");
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8 text-center text-gray-900 dark:text-white">
        {dict.title}
      </h1>
      <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 text-center">
        {dict.description}
      </p>

      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto mb-8">
        <div className="flex gap-4">
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder={dict.input.placeholder}
            className="flex-1 p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? dict.input.button.loading : dict.input.button.default}
          </button>
        </div>
      </form>

      {loading && (
        <div className="max-w-2xl mx-auto mb-8 p-4 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-100 rounded-lg animate-pulse">
          {loadingMessage}
        </div>
      )}

      {error && (
        <div className="max-w-2xl mx-auto mb-8 p-4 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-100 rounded-lg">
          {error}
        </div>
      )}

      {summary && analysis && channelData && (
        <SummaryDisplay
          summary={summary}
          analysis={analysis}
          channelData={channelData}
          dictionary={dict}
        />
      )}
    </div>
  );
}
