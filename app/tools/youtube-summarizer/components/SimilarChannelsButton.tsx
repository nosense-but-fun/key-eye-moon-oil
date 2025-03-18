import { useState } from "react";
import { ChannelData, SimilarChannelsResponse } from "../lib/types";
import SimilarChannelsDisplay from "./SimilarChannelsDisplay";

interface SimilarChannelsButtonProps {
  channelData: ChannelData;
}

export default function SimilarChannelsButton({
  channelData,
}: SimilarChannelsButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [similarChannels, setSimilarChannels] =
    useState<SimilarChannelsResponse | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");

  const loadingMessages = [
    "Stalking similar creators... 👀",
    "Measuring content overlap with questionable methods... 📏",
    "Running DNA tests on video metadata... 🧬",
    "Investigating who stole whose ideas first... 🕵️",
    "Calculating algorithm manipulation scores... 🤖",
    "Testing audience loyalty with fictional metrics... 🔍",
    "Determining who's the original and who's the cheap knockoff... 🏷️",
    "Running plagiarism detection on video titles... 📋",
    "Checking who has the most annoying intro music... 🎵",
    "Measuring clickbait intensity across the platform... 🎯",
  ];

  const updateLoadingMessage = () => {
    const randomIndex = Math.floor(Math.random() * loadingMessages.length);
    setLoadingMessage(loadingMessages[randomIndex]);
  };

  const findSimilarChannels = async () => {
    setLoading(true);
    setError("");
    setSimilarChannels(null);
    setShowResults(true);
    updateLoadingMessage();

    const messageInterval = setInterval(updateLoadingMessage, 3000);

    try {
      const response = await fetch("/api/find-similar-channels", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ channelData }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to find similar channels");
      }

      const data = await response.json();
      setSimilarChannels(data);
    } catch (err) {
      console.error("Error:", err);
      setError(
        err instanceof Error ? err.message : "An existential error occurred"
      );
    } finally {
      clearInterval(messageInterval);
      setLoading(false);
      setLoadingMessage("");
    }
  };

  return (
    <div className="mt-6">
      {!showResults ? (
        <div className="flex justify-center">
          <button
            onClick={findSimilarChannels}
            className="px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors transform hover:scale-105 shadow-lg"
          >
            Find Content Thieves & Copycats
          </button>
        </div>
      ) : (
        <div className="mt-4">
          {loading && (
            <div className="mb-6 p-4 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-100 rounded-lg animate-pulse">
              {loadingMessage}
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-100 rounded-lg">
              <p>Error: {error}</p>
              <p className="text-sm mt-2">
                But honestly, who cares? It's probably for the best.
              </p>
              <button
                onClick={() => setShowResults(false)}
                className="mt-3 px-4 py-2 bg-red-200 dark:bg-red-800 rounded-lg hover:bg-red-300 dark:hover:bg-red-700 transition-colors"
              >
                Try Again (Why Though?)
              </button>
            </div>
          )}

          {similarChannels && <SimilarChannelsDisplay data={similarChannels} />}

          {(similarChannels || error) && (
            <div className="mt-4 text-center">
              <button
                onClick={() => setShowResults(false)}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                {similarChannels ? "Hide This Mess" : "Start Over"}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
