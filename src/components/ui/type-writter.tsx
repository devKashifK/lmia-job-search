"use client";

import { Typewriter } from "react-simple-typewriter";

export function TypewriterEffect({
  title,
  words = [],
  className,
}: {
  title: string;
  words: string[];
  className?: string;
}) {
  return (
    <div
      className="search-container"
      style={{ textAlign: "center", marginTop: "10px" }}
    >
      <h2 className={className || "text-2xl text-brand-600 font-bold"}>
        {title} -{" "}
        <span
          className="text-2xl font-bold gradient-text"
          style={{
            background: "linear-gradient(90deg, #4ade80, #22c55e)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          <Typewriter
            words={words}
            loop={0}
            cursor
            cursorStyle="_"
            typeSpeed={80}
            deleteSpeed={50}
            delaySpeed={1500}
          />
        </span>
      </h2>
    </div>
  );
}
