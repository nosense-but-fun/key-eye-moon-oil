import { getDictionary } from "../../dictionaries";
import YouTubeSummarizerClient from "./components/YouTubeSummarizerClient";

interface Dictionary {
  youtube_summarizer_tool: {
    title: string;
    description: string;
    input: {
      placeholder: string;
      button: {
        default: string;
        loading: string;
      };
    };
    loading_messages: string[];
    stats: {
      title: string;
      channel_name: string;
      subscribers: string;
      total_videos: string;
      total_views: string;
      recent_videos: string;
      top_videos: string;
    };
    similar_channels: {
      button: string;
      title: string;
      metrics_title: string;
      metrics_subtitle: string;
      channels_analyzed: string;
      content_overlap: string;
      audience_stealing: string;
      high_overlap: string;
      low_overlap: string;
      high_stealing: string;
      low_stealing: string;
      hide_button: string;
      start_over: string;
      loading_messages: string[];
    };
  };
}

export default async function YouTubeSummarizer({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  // Await params before accessing properties
  const { lang } = await params;

  // Get dictionary for the language with normal tone
  const dictionary = (await getDictionary(lang, "normal")) as Dictionary;

  return <YouTubeSummarizerClient dictionary={dictionary} />;
}
