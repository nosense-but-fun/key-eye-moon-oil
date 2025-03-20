"use client";

import { useState } from "react";

export default function EyroFooter({ dictionary }: { dictionary: any }) {
  const [clickCount, setClickCount] = useState(0);
  const [message, setMessage] = useState(
    dictionary.footer.copyright.replace(
      "{{year}}",
      new Date().getFullYear().toString()
    )
  );

  const handleClick = () => {
    setClickCount((prevCount) => prevCount + 1);

    if (clickCount === 0) {
      setMessage(dictionary.footer.messages[0]);
    } else if (clickCount === 1) {
      setMessage(dictionary.footer.messages[1]);
    } else if (clickCount === 2) {
      setMessage(dictionary.footer.messages[2]);
    } else if (clickCount === 3) {
      setMessage(dictionary.footer.messages[3]);
    } else if (clickCount === 4) {
      setMessage(dictionary.footer.messages[4]);
    } else if (clickCount >= 5 && clickCount < 10) {
      setMessage(
        dictionary.footer.messages[5].replace(
          "{{count}}",
          (10 - clickCount).toString()
        )
      );
    } else if (clickCount === 10) {
      setMessage(dictionary.footer.messages[6]);
      // Reset after the joke is done
      setTimeout(() => {
        setClickCount(0);
        setMessage(
          dictionary.footer.copyright.replace(
            "{{year}}",
            new Date().getFullYear().toString()
          )
        );
      }, 3000);
    }
  };

  return (
    <footer className="w-full bg-black text-white p-4 text-center text-sm">
      <p
        onClick={handleClick}
        className="cursor-pointer transition-opacity hover:opacity-70"
      >
        {message}
      </p>
      <p className="mt-2 text-xs text-gray-500">
        {dictionary.footer.built_with}
      </p>
    </footer>
  );
}
