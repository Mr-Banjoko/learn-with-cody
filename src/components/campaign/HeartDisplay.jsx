/**
 * HeartDisplay — shows 3 hearts with full / half / empty states.
 *
 * Each heart represents 2 "half-heart units".
 * mistakes → half-hearts lost:
 *   0 mistakes → 6/6 units → 3 full
 *   1 mistake  → 5/6 units → 2.5 (2 full + 1 half)
 *   2 mistakes → 4/6 units → 2 full
 *   ...
 *   6+ mistakes → 0/6 units → 3 empty
 */
import { motion, AnimatePresence } from "framer-motion";

function HeartIcon({ state, size = 22 }) {
  // state: "full" | "half" | "empty"
  if (state === "full") {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <path
          d="M12 21C12 21 3 14.5 3 8.5C3 5.42 5.42 3 8.5 3C10.24 3 11.82 3.82 12 5C12.18 3.82 13.76 3 15.5 3C18.58 3 21 5.42 21 8.5C21 14.5 12 21 12 21Z"
          fill="#FF6B6B"
          stroke="#FF6B6B"
          strokeWidth="1"
        />
      </svg>
    );
  }
  if (state === "half") {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        {/* Empty outline */}
        <path
          d="M12 21C12 21 3 14.5 3 8.5C3 5.42 5.42 3 8.5 3C10.24 3 11.82 3.82 12 5C12.18 3.82 13.76 3 15.5 3C18.58 3 21 5.42 21 8.5C21 14.5 12 21 12 21Z"
          fill="rgba(255,107,107,0.18)"
          stroke="rgba(255,107,107,0.5)"
          strokeWidth="1.5"
        />
        {/* Left half filled */}
        <clipPath id="left-half">
          <rect x="0" y="0" width="12" height="24" />
        </clipPath>
        <path
          d="M12 21C12 21 3 14.5 3 8.5C3 5.42 5.42 3 8.5 3C10.24 3 11.82 3.82 12 5C12.18 3.82 13.76 3 15.5 3C18.58 3 21 5.42 21 8.5C21 14.5 12 21 12 21Z"
          fill="#FF6B6B"
          clipPath="url(#left-half)"
        />
      </svg>
    );
  }
  // empty
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path
        d="M12 21C12 21 3 14.5 3 8.5C3 5.42 5.42 3 8.5 3C10.24 3 11.82 3.82 12 5C12.18 3.82 13.76 3 15.5 3C18.58 3 21 5.42 21 8.5C21 14.5 12 21 12 21Z"
        fill="rgba(255,107,107,0.14)"
        stroke="rgba(255,107,107,0.4)"
        strokeWidth="1.5"
      />
    </svg>
  );
}

/**
 * Compute per-heart state from mistake count.
 * Returns array of 3 states: "full" | "half" | "empty"
 */
function computeHeartStates(mistakes) {
  const halfUnitsRemaining = Math.max(0, 6 - mistakes);
  return [0, 1, 2].map((i) => {
    const unitsForThisHeart = Math.min(2, Math.max(0, halfUnitsRemaining - i * 2));
    if (unitsForThisHeart === 2) return "full";
    if (unitsForThisHeart === 1) return "half";
    return "empty";
  });
}

export default function HeartDisplay({ mistakes = 0, size = 22 }) {
  const states = computeHeartStates(mistakes);
  const prevMistakes = mistakes; // for animation key

  return (
    <div style={{ display: "flex", gap: 2, alignItems: "center", flexShrink: 0 }}>
      {states.map((state, i) => (
        <motion.div
          key={`heart-${i}`}
          animate={
            // Pulse when this specific heart just lost half/full
            state !== "full"
              ? { scale: [1, 1.35, 0.9, 1] }
              : { scale: 1 }
          }
          transition={{ duration: 0.35 }}
        >
          <HeartIcon state={state} size={size} />
        </motion.div>
      ))}
    </div>
  );
}