"use client";

import React, { useState } from "react";

export default function YouTubeSummarizer() {
  const [channelUrl, setChannelUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [summary, setSummary] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSummary("");

    try {
      const response = await fetch("/api/summarize-channel", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ channelUrl }),
      });

      if (!response.ok) {
        throw new Error("Failed to summarize channel");
      }

      const data = await response.json();
      setSummary(data.summary);
    } catch (err) {
      setError(
        "Oops! Something broke (as intended). Try again or don't, I don't care."
      );
      console.error("Error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8 text-center">
          YouTube Channel Summarizer
        </h1>
        <p className="text-gray-400 text-center mb-8">
          Because who has time to actually watch videos? Let AI tell you what
          you missed while you were touching grass.
        </p>

        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto mb-8">
          <div className="flex flex-col gap-4">
            <input
              type="text"
              value={channelUrl}
              onChange={(e) => setChannelUrl(e.target.value)}
              placeholder="Paste your YouTube channel URL here (or don't, I don't care)"
              className="p-4 bg-gray-900 rounded-lg border border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
              required
            />
            <button
              type="submit"
              disabled={isLoading}
              className="p-4 bg-blue-600 hover:bg-blue-700 rounded-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Pretending to work..." : "Summarize This Mess"}
            </button>
          </div>
        </form>

        {error && (
          <div className="max-w-2xl mx-auto p-4 bg-red-900/20 border border-red-500 rounded-lg mb-8">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {summary && (
          <div className="max-w-2xl mx-auto p-6 bg-gray-900 rounded-lg border border-gray-700">
            <h2 className="text-2xl font-bold mb-4">
              Your TL;DR (Too Lazy; Didn't Read)
            </h2>
            <div className="prose prose-invert">
              {summary.split("\n").map((paragraph, index) => (
                <p key={index} className="mb-4">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        )}

        <div className="mt-12 text-center text-gray-400">
          <p>
            ⚠️ Warning: This tool may cause severe FOMO and existential dread
          </p>
          <p className="mt-2">
            Built with questionable decisions and zero practical purpose
          </p>
        </div>
      </main>
    </div>
  );
}
