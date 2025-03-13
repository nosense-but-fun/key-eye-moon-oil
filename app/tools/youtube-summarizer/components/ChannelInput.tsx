interface ChannelInputProps {
  onSubmit: (url: string) => void;
  loading: boolean;
  error: string;
}

export default function ChannelInput({
  onSubmit,
  loading,
  error,
}: ChannelInputProps) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const url = formData.get("channelUrl") as string;
    onSubmit(url);
  };

  return (
    <div className="mb-8">
      <form onSubmit={handleSubmit}>
        <div className="flex gap-4">
          <input
            type="text"
            name="channelUrl"
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
        <div className="mt-4 bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-200 px-4 py-3 rounded">
          {error}
        </div>
      )}
    </div>
  );
}
