import { SimilarChannelsResponse, SimilarChannel } from "../lib/types";
import { useState } from "react";

interface SimilarChannelsDisplayProps {
  data: SimilarChannelsResponse;
}

export default function SimilarChannelsDisplay({
  data,
}: SimilarChannelsDisplayProps) {
  const [selectedChannel, setSelectedChannel] = useState<SimilarChannel | null>(
    null
  );

  // Debug log the channels data received
  console.log(
    "SimilarChannelsDisplay received data:",
    data.similarChannels.map((ch) => ({
      name: ch.name,
      url: ch.url,
      isRealChannel: ch.isRealChannel,
    }))
  );

  const getRandomRotation = () => {
    const max = 2;
    const min = -2;
    return Math.random() * (max - min) + min;
  };

  const getRandomColor = () => {
    const colors = [
      "bg-red-500",
      "bg-blue-500",
      "bg-green-500",
      "bg-yellow-500",
      "bg-purple-500",
      "bg-pink-500",
      "bg-indigo-500",
      "bg-teal-500",
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-red-500";
    if (score >= 60) return "text-orange-500";
    if (score >= 40) return "text-yellow-600";
    return "text-green-500";
  };

  const toggleChannelDetails = (channel: SimilarChannel) => {
    if (selectedChannel && selectedChannel.name === channel.name) {
      setSelectedChannel(null);
    } else {
      setSelectedChannel(channel);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg mb-6">
      <h3 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
        Content Ripoff Analysis
      </h3>

      <div className="mb-6 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
        <div className="flex flex-wrap justify-between items-center mb-4">
          <div>
            <h4 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
              Totally Scientific Metrics
            </h4>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              (We definitely didn't make these up)
            </p>
          </div>
          <div className="bg-gray-200 dark:bg-gray-600 px-3 py-1 rounded-lg text-sm">
            {(data.totalChannelsAnalyzed || 0).toLocaleString()} channels
            analyzed (allegedly)
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="bg-gray-200 dark:bg-gray-600 p-3 rounded-lg">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Content Overlap
            </div>
            <div className="flex items-center">
              <div className="text-xl font-bold mr-2">
                {data.contentOverlapPercentage || 0}%
              </div>
              <div className="text-sm">
                {(data.contentOverlapPercentage || 0) > 50
                  ? "Suspiciously similar"
                  : "Barely original"}
              </div>
            </div>
          </div>
          <div className="bg-gray-200 dark:bg-gray-600 p-3 rounded-lg">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Audience Stealing Index™
            </div>
            <div className="flex items-center">
              <div className="text-xl font-bold mr-2">
                {data.audienceStealingIndex || 0}/100
              </div>
              <div className="text-sm">
                {(data.audienceStealingIndex || 0) > 50
                  ? "Everyone's stealing your viewers"
                  : "Nobody wants your audience"}
              </div>
            </div>
          </div>
        </div>

        <div className="italic text-gray-600 dark:text-gray-300 text-sm">
          "{data.analysisComment}"
        </div>
      </div>

      <h4 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
        Suspiciously Similar Channels
      </h4>

      <div className="space-y-4">
        {data.similarChannels.map((channel, index) => (
          <div
            key={index}
            className={`border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden shadow-md transition-all duration-300 ${
              selectedChannel?.name === channel.name
                ? "ring-2 ring-purple-500"
                : ""
            }`}
            style={{
              transform: `rotate(${getRandomRotation()}deg)`,
            }}
          >
            <div
              className="cursor-pointer p-4 flex justify-between items-center"
              onClick={() => toggleChannelDetails(channel)}
            >
              <div className="flex-1">
                <h5 className="text-lg font-medium text-gray-900 dark:text-white">
                  {channel.name}
                </h5>
                <div className="flex items-center mt-1">
                  <div
                    className={`font-bold mr-2 ${getScoreColor(
                      channel.similarityScore
                    )}`}
                  >
                    {channel.similarityScore}% similar
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {channel.reasonForSimilarity}
                  </div>
                </div>
              </div>
              <div
                className={`rounded-full w-10 h-10 flex items-center justify-center text-white ${getRandomColor()}`}
              >
                {channel.name.charAt(0)}
              </div>
            </div>

            {selectedChannel?.name === channel.name && (
              <div className="px-4 pb-4 pt-2 border-t border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-750">
                <div className="mb-3">
                  <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Comparison Points:
                  </div>
                  <ul className="list-disc pl-5 text-gray-700 dark:text-gray-300">
                    {channel.comparisonPoints.map((point, i) => (
                      <li key={i}>{point}</li>
                    ))}
                  </ul>
                </div>

                <div className="bg-yellow-100 dark:bg-yellow-900 p-3 rounded italic text-yellow-800 dark:text-yellow-200 text-sm">
                  "{channel.sassyComment}"
                </div>

                {channel.url && (
                  <div className="mt-3 text-center">
                    <a
                      href={channel.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 rounded text-sm hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        // Log the actual URL being used
                        console.log(
                          `Channel link clicked for: ${channel.name}`,
                          {
                            url: channel.url,
                            isRealChannel: channel.isRealChannel,
                          }
                        );

                        // Check if it's a real YouTube URL or a fake one
                        const url = channel.url || "";
                        // More specific check for valid YouTube channel URLs
                        const isRealYouTubeUrl =
                          (url.includes("youtube.com/channel/UC") ||
                            url.includes("youtube.com/c/")) &&
                          channel.isRealChannel === true;

                        const isFakeUrl =
                          !isRealYouTubeUrl ||
                          url.includes("thecopycat") ||
                          url.includes("sellout4life") ||
                          url.includes("bootlegcontent");

                        if (isFakeUrl) {
                          alert(
                            "This is a fake URL! If we actually sent you there, you'd probably get a virus."
                          );
                          e.preventDefault();
                        }
                      }}
                    >
                      {/* Ensure we accurately label real vs fake channels */}
                      {channel.isRealChannel === true
                        ? "Visit Real Channel"
                        : "Visit Channel (JK it's Fake)"}
                    </a>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
