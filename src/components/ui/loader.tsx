import React, { useState, useEffect, useCallback } from "react";

// --- Configuration ---
const TARGET_TEXT = "jobmaze";

// Durations for animation stages (in milliseconds)
const LETTER_REVEAL_DURATION_MS = 800; // Total time for all letters to cascade in
const SETTLE_PAUSE_MS = 300; // Pause after letters settle, before water fill
const WATER_FILL_DURATION_MS = 2000; // Time for water to fill
const WATER_HOLD_DURATION_MS = 700; // Time to hold when full
const WATER_EMPTY_DURATION_MS = 1500; // Time for water to empty
const EMPTY_PAUSE_MS = 300; // Pause after water empties, before fade out
const FADE_OUT_DURATION_MS = 800; // Time for letters to fade out
const LOOP_DELAY_MS = 500; // Pause before restarting the entire loop

// --- SVG Water Animation Logic ---
const calculateWavePath = (progress: number /* 0-100 */) => {
  const normalizedProgress = progress / 100;
  const waterLevelY = 1 - normalizedProgress; // 0 is top, 1 is bottom

  if (progress <= 0.1) return "M0,1 L1,1 L1,1 L0,1 Z"; // Fully empty
  if (progress >= 99.9) return "M0,0 L1,0 L1,1 L0,1 Z"; // Fully full

  const waveAmplitude = 0.03; // Wave height relative to text box
  const waveFrequency = 2; // Number of full waves across text
  const horizontalShift = normalizedProgress * Math.PI * 1.5; // Flowing effect

  let path = `M0,${waterLevelY.toFixed(3)} `;
  const segments = 30; // Smoothness of the wave
  for (let i = 0; i <= segments; i++) {
    const x = i / segments;
    const yOffset =
      waveAmplitude *
      Math.sin(x * waveFrequency * 2 * Math.PI + horizontalShift);
    path += `L${x.toFixed(3)},${(waterLevelY + yOffset).toFixed(3)} `;
  }
  path += `L1,1 L0,1 Z`; // Close path to cover area below wave
  return path;
};

// --- Main App Component ---
const Loader = () => {
  const [animationState, setAnimationState] = useState("idle");
  // Letter states: 0 = hidden, 1 = revealed/visible, 2 = fading_out
  const [letterStates, setLetterStates] = useState(
    Array(TARGET_TEXT.length).fill(0)
  );
  const [clipPathD, setClipPathD] = useState(calculateWavePath(0)); // SVG path for water

  const memoizedCalcWavePath = useCallback(calculateWavePath, []);

  // Letter Animation Effect (Cascade In / Fade Out)
  useEffect(() => {
    let letterTimers: NodeJS.Timeout[] = [];

    const animateLetters = (
      targetLetterState: number,
      durationPerLetter: number,
      onComplete?: () => void
    ) => {
      // Clear any existing letter timers
      letterTimers.forEach(clearTimeout);
      letterTimers = [];

      let completedCount = 0;
      TARGET_TEXT.split("").forEach((_, index) => {
        const timer = setTimeout(() => {
          setLetterStates((prev) => {
            const newState = [...prev];
            newState[index] = targetLetterState;
            return newState;
          });
          completedCount++;
          if (completedCount === TARGET_TEXT.length && onComplete) {
            onComplete();
          }
        }, index * (durationPerLetter / TARGET_TEXT.length));
        letterTimers.push(timer);
      });
    };

    if (animationState === "cascading_in") {
      // Reset letters to hidden before cascading
      setLetterStates(Array(TARGET_TEXT.length).fill(0));
      animateLetters(1, LETTER_REVEAL_DURATION_MS, () => {
        setAnimationState("settled");
      });
    } else if (animationState === "fading_out") {
      animateLetters(2, FADE_OUT_DURATION_MS, () => {
        setAnimationState("idle"); // Loop back
      });
    }
    return () => letterTimers.forEach(clearTimeout);
  }, [animationState]);

  // Water Animation and Main State Machine Effect
  useEffect(() => {
    let mainTimerId: NodeJS.Timeout;
    let frameId: number; // For requestAnimationFrame

    const animateWater = (targetProgress: number, duration: number, onComplete?: () => void) => {
      let startTime: number | null = null;
      const currentProgress = targetProgress === 100 ? 0 : 100; // Start from 0 if filling, 100 if emptying

      const step = (timestamp: number) => {
        if (!startTime) startTime = timestamp;
        const elapsed = timestamp - startTime;
        let progress = (elapsed / duration) * 100;

        if (targetProgress === 100) {
          // Filling
          progress = Math.min(100, currentProgress + progress);
        } else {
          // Emptying
          progress = Math.max(0, currentProgress - progress);
        }

        setClipPathD(memoizedCalcWavePath(progress));

        if (
          (targetProgress === 100 && progress < 100) ||
          (targetProgress === 0 && progress > 0)
        ) {
          frameId = requestAnimationFrame(step);
        } else {
          setClipPathD(memoizedCalcWavePath(targetProgress)); // Ensure final state
          if (onComplete) onComplete();
        }
      };
      frameId = requestAnimationFrame(step);
    };

    switch (animationState) {
      case "idle":
        mainTimerId = setTimeout(
          () => setAnimationState("cascading_in"),
          LOOP_DELAY_MS
        );
        break;
      case "settled":
        mainTimerId = setTimeout(
          () => setAnimationState("water_filling"),
          SETTLE_PAUSE_MS
        );
        break;
      case "water_filling":
        animateWater(100, WATER_FILL_DURATION_MS, () =>
          setAnimationState("water_full")
        );
        break;
      case "water_full":
        mainTimerId = setTimeout(
          () => setAnimationState("water_emptying"),
          WATER_HOLD_DURATION_MS
        );
        break;
      case "water_emptying":
        animateWater(0, WATER_EMPTY_DURATION_MS, () =>
          setAnimationState("text_empty")
        );
        break;
      case "text_empty":
        mainTimerId = setTimeout(
          () => setAnimationState("fading_out"),
          EMPTY_PAUSE_MS
        );
        break;
      default:
        break;
    }

    return () => {
      clearTimeout(mainTimerId);
      if (frameId) cancelAnimationFrame(frameId);
    };
  }, [animationState, memoizedCalcWavePath]);

  const showWaterEffect =
    animationState === "water_filling" ||
    animationState === "water_full" ||
    animationState === "water_emptying";

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white font-sans antialiased overflow-hidden">
      {/* SVG definitions for the clip path (not rendered directly) */}
      <svg style={{ width: 0, height: 0, position: "absolute" }}>
        <defs>
          <clipPath id="jobmazeWaterClipPath" clipPathUnits="objectBoundingBox">
            <path d={clipPathD} />
          </clipPath>
        </defs>
      </svg>

      {/* Text Container */}
      <div className="relative text-7xl sm:text-8xl md:text-9xl font-black tracking-tighter select-none">
        {/* Base text structure for letter animations */}
        {TARGET_TEXT.split("").map((char, index) => (
          <span
            key={index}
            className="inline-block text-brand-300" // Base color when not water-filled
            style={{
              transition: `opacity ${FADE_OUT_DURATION_MS / TARGET_TEXT.length / 2
                }ms ease-out, transform ${LETTER_REVEAL_DURATION_MS / TARGET_TEXT.length / 1.5
                }ms ease-out`,
              opacity: letterStates[index] === 1 ? 1 : 0,
              transform:
                letterStates[index] === 1
                  ? "translateY(0px)"
                  : "translateY(-30px)",
              // letterStates[2] (fading_out) is handled by opacity above
              // letterStates[0] (hidden) also handled by opacity & transform
            }}
          >
            {char}
          </span>
        ))}

        {/* Foreground Water-Filled Text (conditionally visible and clipped) */}
        {/* This overlay is active when letters are visible and water effect is ongoing */}
        {(letterStates.every((s) => s === 1) ||
          animationState.includes("water") ||
          animationState === "text_empty" ||
          animationState === "settled") && (
            <span
              className="absolute left-0 top-0 h-full w-full bg-gradient-to-r from-brand-400 via-brand-500 to-brand-600 bg-clip-text text-transparent"
              style={{
                clipPath: showWaterEffect
                  ? "url(#jobmazeWaterClipPath)"
                  : animationState === "water_full"
                    ? "url(#jobmazeWaterClipPath)"
                    : "inset(0 0 100% 0)", // Hide if not filling/full by clipping all
                WebkitClipPath: showWaterEffect
                  ? "url(#jobmazeWaterClipPath)"
                  : animationState === "water_full"
                    ? "url(#jobmazeWaterClipPath)"
                    : "inset(0 0 100% 0)",
                opacity:
                  letterStates.every((s) => s === 1) ||
                    animationState.includes("water") ||
                    animationState === "text_empty" ||
                    animationState === "settled"
                    ? 1
                    : 0, // Ensure visibility during relevant states
              }}
            >
              {TARGET_TEXT}
            </span>
          )}
      </div>
    </div>
  );
};

export default Loader;
