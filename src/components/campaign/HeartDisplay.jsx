/**
 * HeartDisplay — animated 3-heart life system.
 *
 * State machine per heart slot:
 *   "full"     → bouncing Lottie (looping)
 *   "half"     → bouncing Lottie clipped to left half + faded outline right
 *   "breaking" → broken-heart Lottie plays once, then resolves to "empty"
 *   "empty"    → static grey SVG (no animation, no bouncing)
 *
 * Mistake → heart-state mapping:
 *   0 mistakes → [full,  full,  full ]
 *   1 mistake  → [half,  full,  full ]
 *   2 mistakes → [empty, full,  full ]  ← breaking plays on slot 0
 *   3 mistakes → [empty, half,  full ]
 *   4 mistakes → [empty, empty, full ]  ← breaking plays on slot 1
 *   5 mistakes → [empty, empty, half ]
 *   6 mistakes → [empty, empty, empty] ← breaking plays on slot 2
 */
import { useEffect, useRef, useState, useCallback } from "react";
import Lottie from "lottie-react";

// Broken-heart anim: 50 frames @ ~30fps ≈ 1670ms. Add small buffer.
const BREAK_DURATION_MS = 1750;

// Stagger start frame so 3 bouncing hearts feel lively, not robotic
const BOUNCE_STAGGER_FRAMES = [0, 26, 52]; // out of 80 total frames

function computeHeartStates(mistakes) {
  const halfUnitsRemaining = Math.max(0, 6 - mistakes);
  return [0, 1, 2].map((i) => {
    const units = Math.min(2, Math.max(0, halfUnitsRemaining - i * 2));
    if (units === 2) return "full";
    if (units === 1) return "half";
    return "empty";
  });
}

// ── Static grey empty heart ───────────────────────────────────────────────────

function EmptyHeart({ size }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path
        d="M12 21C12 21 3 14.5 3 8.5C3 5.42 5.42 3 8.5 3C10.24 3 11.82 3.82 12 5C12.18 3.82 13.76 3 15.5 3C18.58 3 21 5.42 21 8.5C21 14.5 12 21 12 21Z"
        fill="rgba(180,180,180,0.25)"
        stroke="rgba(180,180,180,0.55)"
        strokeWidth="1.5"
      />
    </svg>
  );
}

// ── Single heart slot ─────────────────────────────────────────────────────────

function HeartSlot({ displayState, size, staggerFrame, onBreakComplete }) {
  const breakTimerRef = useRef(null);

  useEffect(() => {
    if (displayState === "breaking") {
      clearTimeout(breakTimerRef.current);
      breakTimerRef.current = setTimeout(onBreakComplete, BREAK_DURATION_MS);
    }
    return () => clearTimeout(breakTimerRef.current);
  }, [displayState]); // eslint-disable-line react-hooks/exhaustive-deps

  const base = { width: size, height: size, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" };

  if (displayState === "empty") {
    return (
      <div style={base}>
        <EmptyHeart size={size} />
      </div>
    );
  }

  if (displayState === "breaking") {
    return (
      <div style={base}>
        <Lottie
          path="/broken-heart.json"
          loop={false}
          autoplay={true}
          style={{ width: size * 1.2, height: size * 1.2 }}
          rendererSettings={{ preserveAspectRatio: "xMidYMid meet" }}
        />
      </div>
    );
  }

  if (displayState === "full") {
    return (
      <div style={base}>
        <Lottie
          path="/bouncing-heart.json"
          loop={true}
          autoplay={true}
          style={{ width: size * 1.1, height: size * 1.5 }}
          rendererSettings={{ preserveAspectRatio: "xMidYMid meet" }}
        />
      </div>
    );
  }

  if (displayState === "half") {
    return (
      <div style={{ ...base, position: "relative" }}>
        {/* Faded right-side outline */}
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          style={{ position: "absolute", top: 0, left: 0, pointerEvents: "none" }}
        >
          <path
            d="M12 21C12 21 3 14.5 3 8.5C3 5.42 5.42 3 8.5 3C10.24 3 11.82 3.82 12 5C12.18 3.82 13.76 3 15.5 3C18.58 3 21 5.42 21 8.5C21 14.5 12 21 12 21Z"
            fill="rgba(255,107,107,0.1)"
            stroke="rgba(255,107,107,0.3)"
            strokeWidth="1.5"
          />
        </svg>
        {/* Left-half bouncing heart via clip */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: size,
            height: size,
            overflow: "hidden",
            clipPath: "inset(0 50% 0 0)",
            WebkitClipPath: "inset(0 50% 0 0)",
          }}
        >
          <Lottie
            path="/bouncing-heart.json"
            loop={true}
            autoplay={true}
            style={{
              width: size * 1.1,
              height: size * 1.5,
              marginLeft: -(size * 1.1 - size) / 2,
              marginTop: -(size * 1.5 - size) / 2,
            }}
            rendererSettings={{ preserveAspectRatio: "xMidYMid meet" }}
          />
        </div>
      </div>
    );
  }

  return null;
}

// ── HeartDisplay ──────────────────────────────────────────────────────────────

export default function HeartDisplay({ mistakes = 0, size = 28 }) {
  const [displayStates, setDisplayStates] = useState(() => ["full", "full", "full"]);
  const prevComputedRef = useRef(["full", "full", "full"]);
  // Track previous mistakes so we can detect a reset (mistakes going back to 0)
  const prevMistakesRef = useRef(0);

  useEffect(() => {
    const next = computeHeartStates(mistakes);
    const prev = prevComputedRef.current;
    const wasReset = mistakes < prevMistakesRef.current;

    if (wasReset) {
      // Level restarted — immediately reset all slots to full
      setDisplayStates(["full", "full", "full"]);
      prevComputedRef.current = ["full", "full", "full"];
      prevMistakesRef.current = mistakes;
      return;
    }

    prevMistakesRef.current = mistakes;

    setDisplayStates((current) =>
      current.map((cur, i) => {
        // Don't interrupt an ongoing break animation
        if (cur === "breaking") return cur;
        // Already settled empty and still empty — leave it
        if (cur === "empty" && next[i] === "empty") return "empty";
        // Whole heart lost: trigger the break animation
        if (next[i] === "empty" && (prev[i] === "full" || prev[i] === "half")) {
          return "breaking";
        }
        return next[i];
      })
    );

    prevComputedRef.current = next;
  }, [mistakes]);

  const handleBreakComplete = useCallback((index) => {
    setDisplayStates((prev) => {
      const next = [...prev];
      next[index] = "empty";
      return next;
    });
  }, []);

  return (
    <div style={{ display: "flex", gap: 2, alignItems: "center", flexShrink: 0 }}>
      {displayStates.map((displayState, i) => (
        <HeartSlot
          key={`heart-slot-${i}`}
          displayState={displayState}
          size={size}
          staggerFrame={BOUNCE_STAGGER_FRAMES[i]}
          onBreakComplete={() => handleBreakComplete(i)}
        />
      ))}
    </div>
  );
}