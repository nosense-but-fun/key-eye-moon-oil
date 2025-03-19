import Link from "next/link";
import Image from "next/image";

const tools = [
  {
    title: "Random Picker",
    description:
      "Can't decide between terrible options? Let us decide for you! (Spoiler: All options are terrible.)",
    href: "/tools/random-picker",
    code: "randomChoice(badOptions) → evenWorse",
  },
  {
    title: "Cryptic Generator",
    description:
      "Generate mysterious texts that even you won't understand. Perfect for pretending you're smarter than you are.",
    href: "/tools/cryptic-generator",
    code: "generateNonsense(level) → confusion",
  },
  {
    title: "YouTube Summarizer",
    description:
      "Because who has time to actually watch videos? Let AI tell you what you missed while you were touching grass.",
    href: "/tools/youtube-summarizer",
    code: "summarizeChannel(url) → existentialDread",
  },
  {
    title: "AI Narrative Battle",
    description:
      "Watch two AIs fight to the death in a pointless grid war. It's like chess, if chess made no sense and was narrated by a drunk poet.",
    href: "/game",
    code: "wasteTime(brain) → questionLife",
  },
];

export default function Home() {
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
        Welcome to the Dumpster Fire
      </h1>

      <p className="max-w-2xl text-lg mb-12 text-center dark:text-gray-300">
        This is a carefully curated collection of completely useless tools that
        somehow managed to escape the recycle bin. Browse at your own risk. Side
        effects may include confusion, laughter, and questioning why you're
        wasting your time here.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
        {/* Random Picker Tool Card */}
        <div className="border border-gray-300 dark:border-gray-700 rounded-lg p-6 transition-all hover:shadow-md hover:-translate-y-1 dark:bg-gray-800">
          <h2 className="text-xl font-bold mb-2">Random Picker</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Can't decide between terrible options? Let us decide for you!
            (Spoiler: All options are terrible.)
          </p>
          <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded mb-4">
            <code className="text-sm">
              randomChoice(badOptions) → evenWorse
            </code>
          </div>
          <Link
            href="/tools/random-picker"
            className="inline-block bg-black text-white dark:bg-gray-600 px-4 py-2 rounded hover:bg-gray-800 dark:hover:bg-gray-700 transition-colors"
          >
            Make Bad Decisions →
          </Link>
        </div>

        {/* Cryptic Generator Card */}
        <div className="border border-gray-300 dark:border-gray-700 rounded-lg p-6 transition-all hover:shadow-md hover:-translate-y-1 dark:bg-gray-800">
          <h2 className="text-xl font-bold mb-2">Cryptic Generator</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Generate mysterious texts that even you won't understand. Perfect
            for pretending you're smarter than you are.
          </p>
          <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded mb-4">
            <code className="text-sm">generateNonsense(level) → confusion</code>
          </div>
          <Link
            href="/tools/cryptic-generator"
            className="inline-block bg-black text-white dark:bg-gray-600 px-4 py-2 rounded hover:bg-gray-800 dark:hover:bg-gray-700 transition-colors"
          >
            Confuse Yourself →
          </Link>
        </div>

        {/* YouTube Summarizer Card */}
        <div className="border border-gray-300 dark:border-gray-700 rounded-lg p-6 transition-all hover:shadow-md hover:-translate-y-1 dark:bg-gray-800">
          <h2 className="text-xl font-bold mb-2">YouTube Summarizer</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Because who has time to actually watch videos? Let AI tell you what
            you missed while you were touching grass.
          </p>
          <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded mb-4">
            <code className="text-sm">
              summarizeChannel(url) → existentialDread
            </code>
          </div>
          <Link
            href="/tools/youtube-summarizer"
            className="inline-block bg-black text-white dark:bg-gray-600 px-4 py-2 rounded hover:bg-gray-800 dark:hover:bg-gray-700 transition-colors"
          >
            Skip the Videos →
          </Link>
        </div>

        {/* AI Narrative Battle Game Card */}
        <div className="border border-gray-300 dark:border-gray-700 rounded-lg p-6 transition-all hover:shadow-md hover:-translate-y-1 dark:bg-gray-800 relative overflow-hidden">
          <div className="absolute -top-2 -right-2 w-12 h-12 bg-red-500 rounded-full flex items-center justify-center transform rotate-12 text-white font-bold text-xs">
            NEW!
          </div>
          <h2 className="text-xl font-bold mb-2">AI Narrative Battle</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Watch two AIs fight to the death in a pointless grid war. It's like
            chess, if chess made no sense and was narrated by a drunk poet.
          </p>
          <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded mb-4">
            <code className="text-sm">wasteTime(brain) → questionLife</code>
          </div>
          <Link
            href="/game"
            className="inline-block bg-gradient-to-r from-purple-500 to-blue-600 text-white px-4 py-2 rounded hover:from-purple-600 hover:to-blue-700 transition-colors"
          >
            Start Pointless Battle →
          </Link>
        </div>
      </div>

      <div className="mt-16 p-4 bg-yellow-100 dark:bg-yellow-900 max-w-2xl rounded">
        <h3 className="font-bold mb-2">⚠️ Disclaimer</h3>
        <p className="text-sm dark:text-gray-300">
          None of these tools were tested or built with any purpose in mind. If
          you find any actual utility in them, please contact a doctor
          immediately as you may be experiencing delusions.
        </p>
      </div>
    </div>
  );
}
