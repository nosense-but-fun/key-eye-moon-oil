"use client";

import { useState } from "react";
import { ChannelData, AIResponse } from "./lib/types";
import { fetchChannelData, fetchExampleData } from "./lib/youtube";
import { generateSummary } from "./lib/ai";
import ChannelInput from "./components/ChannelInput";
import SummaryDisplay from "./components/SummaryDisplay";
import JsonDisplay from "./components/JsonDisplay";

export default function YouTubeSummarizer() {
  const [channelData, setChannelData] = useState<ChannelData | null>(null);
  const [aiResponse, setAiResponse] = useState<AIResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [useExampleData, setUseExampleData] = useState(false);

  const handleSubmit = async (url: string) => {
    setLoading(true);
    setError("");
    setChannelData(null);
    setAiResponse(null);

    try {
      console.log("Starting channel data fetch");
      // Fetch channel data
      const data = useExampleData
        ? await fetchExampleData()
        : await fetchChannelData(url);
      console.log("Channel data fetched successfully");
      setChannelData(data);

      console.log("Starting AI summary generation");
      // Generate AI summary
      const response = await generateSummary(data, {
        includeRecentVideos: true,
        includeTopVideos: true,
        includeShorts: true,
        maxVideos: 5,
      });
      console.log("AI summary generated successfully");
      setAiResponse(response);
    } catch (err: any) {
      console.error("Error in handleSubmit:", {
        error: err.message,
        stack: err.stack,
      });
      setError(err.message || "An unexpected error occurred");
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
            Get a concise summary of any YouTube channel's content and
            performance.
          </p>

          <div className="flex justify-center mb-4">
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                className="form-checkbox h-4 w-4 text-blue-600"
                checked={useExampleData}
                onChange={(e) => setUseExampleData(e.target.checked)}
              />
              <span className="ml-2 text-gray-700 dark:text-gray-300">
                Use Example Data
              </span>
            </label>
          </div>

          <ChannelInput
            onSubmit={handleSubmit}
            loading={loading}
            error={error}
          />

          {aiResponse && (
            <SummaryDisplay
              summary={aiResponse.summary}
              analysis={aiResponse.analysis}
            />
          )}

          {channelData && <JsonDisplay data={channelData} />}
        </div>
      </main>
    </div>
  );
}
