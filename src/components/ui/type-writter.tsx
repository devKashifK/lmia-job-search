"use client";

import { Typewriter } from "react-simple-typewriter";

export function TypewriterEffect({
  title,
  words = [],
}: {
  title: string;
  words: string[];
}) {
  return (
    <div
      className="search-container"
      style={{ textAlign: "center", marginTop: "50px" }}
    >
      <h2 className="text-4xl text-brand-600 font-bold">
        {title} -{" "}
        <span
          className="text-4xl font-bold gradient-text"
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
