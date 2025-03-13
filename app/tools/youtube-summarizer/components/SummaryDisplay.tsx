interface SummaryDisplayProps {
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

export default function SummaryDisplay({
  summary,
  analysis,
}: SummaryDisplayProps) {
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg mb-8">
      <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
        Channel Summary
      </h2>
      <div
        className="prose dark:prose-invert max-w-none"
        dangerouslySetInnerHTML={{ __html: summary.replace(/\n/g, "<br />") }}
      />

      <div className="mt-6">
        <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
          Channel Statistics
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 dark:text-white mb-1">
              Channel Name
            </h4>
            <p className="text-gray-700 dark:text-gray-300">
              {analysis.channelName}
            </p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 dark:text-white mb-1">
              Subscribers
            </h4>
            <p className="text-gray-700 dark:text-gray-300">
              {analysis.subscriberCount.toLocaleString()}
            </p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 dark:text-white mb-1">
              Total Videos
            </h4>
            <p className="text-gray-700 dark:text-gray-300">
              {analysis.totalVideos.toLocaleString()}
            </p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 dark:text-white mb-1">
              Total Views
            </h4>
            <p className="text-gray-700 dark:text-gray-300">
              {analysis.totalViews.toLocaleString()}
            </p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 dark:text-white mb-1">
              Recent Videos
            </h4>
            <p className="text-gray-700 dark:text-gray-300">
              {analysis.recentVideos.toLocaleString()}
            </p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 dark:text-white mb-1">
              Top Videos
            </h4>
            <p className="text-gray-700 dark:text-gray-300">
              {analysis.topVideos.toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
