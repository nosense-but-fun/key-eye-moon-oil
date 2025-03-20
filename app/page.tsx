import { redirect } from "next/navigation";
import { defaultLanguage, defaultTones } from "./dictionaries";
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
    href: `/${defaultLanguage}/game`,
    code: "wasteTime(brain) → questionLife",
  },
];

export default function Home() {
  // Use the default language and tone
  const tone = defaultLanguage === "en" ? defaultTones.en : defaultTones.zh;
  redirect(`/${defaultLanguage}?tone=${tone}`);

  // This is just to satisfy TypeScript, the redirect will happen before this
  return null;
}
