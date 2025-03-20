import Link from "next/link";
import {
  getDictionary,
  defaultTones,
  validLanguages,
  defaultLanguage,
} from "../dictionaries";

// Define the dictionary type
interface Dictionary {
  home: {
    welcome: string;
    intro: string;
    disclaimer_title: string;
    disclaimer: string;
    tools: {
      random_picker: {
        title: string;
        description: string;
        code: string;
        link: string;
      };
      cryptic_generator: {
        title: string;
        description: string;
        code: string;
        link: string;
      };
      youtube_summarizer: {
        title: string;
        description: string;
        code: string;
        link: string;
      };
      ai_narrative_battle: {
        title: string;
        description: string;
        code: string;
        link: string;
        new: string;
      };
    };
  };
  [key: string]: any;
}

// Helper function to validate language
function validateLang(langParam: string | undefined): string {
  return langParam === "en" || langParam === "zh" ? langParam : defaultLanguage;
}

export default async function Home({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ tone?: string }>;
}) {
  // Await the dynamic params before accessing properties
  const { lang: langParam } = await params;
  const { tone: toneParam } = await searchParams;

  // Validate language - only accept 'en' or 'zh'
  const lang = validateLang(langParam);

  // Get tone from search params or use default
  const defaultTone = lang === "en" ? defaultTones.en : defaultTones.zh;
  const tone = toneParam || defaultTone;

  // Get dictionary
  const dictionary = (await getDictionary(lang, tone as string)) as Dictionary;

  const tools = {
    random_picker: dictionary.home.tools.random_picker,
    cryptic_generator: dictionary.home.tools.cryptic_generator,
    youtube_summarizer: dictionary.home.tools.youtube_summarizer,
    ai_narrative_battle: dictionary.home.tools.ai_narrative_battle,
  };

  return (
    <div className="flex flex-col items-center p-8">
      {/* ASCII Art Header - because we're too lazy for a real logo */}
      <div className="font-mono text-xs whitespace-pre my-8 hidden md:block">
        <pre>{`
  _  __  _____ __  __  ___
 | |/ / | ____| \\/ | / _ \\ 
 | ' /  |  _| | |\\/| | | | |
 | . \\  | |___| |  | | |_| |
 |_|\\_\\ |_____|_|  |_|\\___/  
        `}</pre>
      </div>

      <h1 className="text-3xl font-bold mb-8 text-center">
        {dictionary.home.welcome}
      </h1>

      <p className="max-w-2xl text-lg mb-12 text-center dark:text-gray-300">
        {dictionary.home.intro}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
        {/* Random Picker Tool Card */}
        <div className="border border-gray-300 dark:border-gray-700 rounded-lg p-6 transition-all hover:shadow-md hover:-translate-y-1 dark:bg-gray-800">
          <h2 className="text-xl font-bold mb-2">
            {tools.random_picker.title}
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            {tools.random_picker.description}
          </p>
          <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded mb-4">
            <code className="text-sm">{tools.random_picker.code}</code>
          </div>
          <Link
            href={`/${lang}/tools/random-picker`}
            className="inline-block bg-black text-white dark:bg-gray-600 px-4 py-2 rounded hover:bg-gray-800 dark:hover:bg-gray-700 transition-colors"
          >
            {tools.random_picker.link}
          </Link>
        </div>

        {/* Cryptic Generator Card */}
        <div className="border border-gray-300 dark:border-gray-700 rounded-lg p-6 transition-all hover:shadow-md hover:-translate-y-1 dark:bg-gray-800">
          <h2 className="text-xl font-bold mb-2">
            {tools.cryptic_generator.title}
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            {tools.cryptic_generator.description}
          </p>
          <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded mb-4">
            <code className="text-sm">{tools.cryptic_generator.code}</code>
          </div>
          <Link
            href={`/${lang}/tools/cryptic-generator`}
            className="inline-block bg-black text-white dark:bg-gray-600 px-4 py-2 rounded hover:bg-gray-800 dark:hover:bg-gray-700 transition-colors"
          >
            {tools.cryptic_generator.link}
          </Link>
        </div>

        {/* YouTube Summarizer Card */}
        <div className="border border-gray-300 dark:border-gray-700 rounded-lg p-6 transition-all hover:shadow-md hover:-translate-y-1 dark:bg-gray-800">
          <h2 className="text-xl font-bold mb-2">
            {tools.youtube_summarizer.title}
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            {tools.youtube_summarizer.description}
          </p>
          <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded mb-4">
            <code className="text-sm">{tools.youtube_summarizer.code}</code>
          </div>
          <Link
            href={`/${lang}/tools/youtube-summarizer`}
            className="inline-block bg-black text-white dark:bg-gray-600 px-4 py-2 rounded hover:bg-gray-800 dark:hover:bg-gray-700 transition-colors"
          >
            {tools.youtube_summarizer.link}
          </Link>
        </div>

        {/* AI Narrative Battle Game Card */}
        <div className="border border-gray-300 dark:border-gray-700 rounded-lg p-6 transition-all hover:shadow-md hover:-translate-y-1 dark:bg-gray-800 relative overflow-hidden">
          <div className="absolute -top-2 -right-2 w-12 h-12 bg-red-500 rounded-full flex items-center justify-center transform rotate-12 text-white font-bold text-xs">
            {tools.ai_narrative_battle.new}
          </div>
          <h2 className="text-xl font-bold mb-2">
            {tools.ai_narrative_battle.title}
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            {tools.ai_narrative_battle.description}
          </p>
          <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded mb-4">
            <code className="text-sm">{tools.ai_narrative_battle.code}</code>
          </div>
          <Link
            href={`/${lang}/game`}
            className="inline-block bg-gradient-to-r from-purple-500 to-blue-600 text-white px-4 py-2 rounded hover:from-purple-600 hover:to-blue-700 transition-colors"
          >
            {tools.ai_narrative_battle.link}
          </Link>
        </div>
      </div>

      <div className="mt-16 p-4 bg-yellow-100 dark:bg-yellow-900 max-w-2xl rounded">
        <h3 className="font-bold mb-2">{dictionary.home.disclaimer_title}</h3>
        <p className="text-sm dark:text-gray-300">
          {dictionary.home.disclaimer}
        </p>
      </div>
    </div>
  );
}
