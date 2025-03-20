import { useState } from "react";
import { ChannelData, SimilarChannelsResponse } from "../lib/types";
import SimilarChannelsDisplay from "./SimilarChannelsDisplay";

interface SimilarChannelsButtonProps {
  channelData: ChannelData;
  dictionary: any; // TODO: Type this properly
}

export default function SimilarChannelsButton({
  channelData,
  dictionary: dict,
}: SimilarChannelsButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [similarChannels, setSimilarChannels] =
    useState<SimilarChannelsResponse | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");

  const updateLoadingMessage = () => {
    const randomIndex = Math.floor(
      Math.random() * dict.loading_messages.length
    );
    setLoadingMessage(dict.loading_messages[randomIndex]);
  };

  const findSimilarChannels = async () => {
    setShowResults(true);
    setLoading(true);
    setError("");
    setSimilarChannels(null);
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
      setError(err instanceof Error ? err.message : "An error occurred");
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
            {dict.button}
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
                {dict.start_over}
              </button>
            </div>
          )}

          {similarChannels && (
            <SimilarChannelsDisplay data={similarChannels} dictionary={dict} />
          )}

          {(similarChannels || error) && (
            <div className="mt-4 text-center">
              <button
                onClick={() => setShowResults(false)}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                {similarChannels ? dict.hide_button : dict.start_over}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
