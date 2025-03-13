"use client";

import { useState } from "react";

export default function KemoFooter() {
  const [clickCount, setClickCount] = useState(0);
  const [message, setMessage] = useState(
    `© ${new Date().getFullYear()} KEMO Collection. All wrongs reserved.`
  );

  const handleClick = () => {
    setClickCount((prevCount) => prevCount + 1);

    if (clickCount === 0) {
      setMessage("Why are you clicking on a footer? Seriously?");
    } else if (clickCount === 1) {
      setMessage("Stop it. This does nothing.");
    } else if (clickCount === 2) {
      setMessage("Fine. Keep clicking. See if I care.");
    } else if (clickCount === 3) {
      setMessage("🖕");
    } else if (clickCount === 4) {
      setMessage("I bet you're the type who reads EULAs for fun.");
    } else if (clickCount >= 5 && clickCount < 10) {
      setMessage(`${10 - clickCount} more clicks until something happens...`);
    } else if (clickCount === 10) {
      setMessage("Just kidding. Nothing happens. Ever.");
      // Reset after the joke is done
      setTimeout(() => {
        setClickCount(0);
        setMessage("© 2023 KEMO Collection. All wrongs reserved.");
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
        Built with questionable decisions and zero practical purpose.
      </p>
    </footer>
  );
}
