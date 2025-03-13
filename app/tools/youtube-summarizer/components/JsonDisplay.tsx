import { ChannelData } from "../lib/types";

interface JsonDisplayProps {
  data: ChannelData;
}

export default function JsonDisplay({ data }: JsonDisplayProps) {
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
        Channel Data
      </h2>
      <pre className="overflow-x-auto p-4 bg-gray-50 dark:bg-gray-700 rounded-lg text-sm text-gray-900 dark:text-gray-100">
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
}
