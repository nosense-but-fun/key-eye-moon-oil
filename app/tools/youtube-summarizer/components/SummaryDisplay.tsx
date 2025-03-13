import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

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

type MarkdownComponentProps = {
  node?: any;
  inline?: boolean;
  children?: React.ReactNode;
  className?: string;
};

export default function SummaryDisplay({
  summary,
  analysis,
}: SummaryDisplayProps) {
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg mb-8">
      <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
        Channel Summary
      </h2>
      <div className="prose dark:prose-invert max-w-none">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            h1: ({ node, ...props }: MarkdownComponentProps) => (
              <h1 className="text-3xl font-bold mb-4" {...props} />
            ),
            h2: ({ node, ...props }: MarkdownComponentProps) => (
              <h2 className="text-2xl font-bold mb-3" {...props} />
            ),
            h3: ({ node, ...props }: MarkdownComponentProps) => (
              <h3 className="text-xl font-bold mb-2" {...props} />
            ),
            p: ({ node, ...props }: MarkdownComponentProps) => (
              <p className="mb-4" {...props} />
            ),
            ul: ({ node, ...props }: MarkdownComponentProps) => (
              <ul className="list-disc pl-6 mb-4" {...props} />
            ),
            ol: ({ node, ...props }: MarkdownComponentProps) => (
              <ol className="list-decimal pl-6 mb-4" {...props} />
            ),
            li: ({ node, ...props }: MarkdownComponentProps) => (
              <li className="mb-2" {...props} />
            ),
            strong: ({ node, ...props }: MarkdownComponentProps) => (
              <strong className="font-bold" {...props} />
            ),
            em: ({ node, ...props }: MarkdownComponentProps) => (
              <em className="italic" {...props} />
            ),
            hr: ({ node, ...props }: MarkdownComponentProps) => (
              <hr
                className="my-6 border-gray-300 dark:border-gray-600"
                {...props}
              />
            ),
            blockquote: ({ node, ...props }: MarkdownComponentProps) => (
              <blockquote
                className="border-l-4 border-gray-300 dark:border-gray-600 pl-4 italic my-4"
                {...props}
              />
            ),
            code: ({ node, inline, ...props }: MarkdownComponentProps) =>
              inline ? (
                <code
                  className="bg-gray-100 dark:bg-gray-700 rounded px-1"
                  {...props}
                />
              ) : (
                <code
                  className="block bg-gray-100 dark:bg-gray-700 rounded p-4 my-4"
                  {...props}
                />
              ),
          }}
        >
          {summary}
        </ReactMarkdown>
      </div>

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
