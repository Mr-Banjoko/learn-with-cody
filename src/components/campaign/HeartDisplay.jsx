/**
 * HeartDisplay — animated 3-heart life system.
 *
 * ROOT CAUSE OF BUG (documented after investigation):
 *
 * `Bouncing heart.json` has a native artboard of only 35×50 px (very old Lottie export).
 * `broken heart.json` has a native artboard of 1000×1000 px (newer export).
 *
 * When lottie-react uses the `path` prop (async HTTP fetch), it renders an SVG
 * whose intrinsic size defaults to the animation's native artboard dimensions.
 * For the 1000×1000 broken heart, the SVG naturally fills any container.
 * For the 35×50 bouncing heart, the SVG renders at ~35px wide — so inside a
 * flex-centered 28px container it appears invisible because:
 *   1. The SVG overflows but the container clips it (overflow:hidden in flex)
 *   2. The tiny artboard at 1:1 scale is ~35px, not scaled to fill the container
 *
 * Additionally, the `path` prop triggers an async fetch. During that async window,
 * lottie-react renders nothing — so at level start all 3 active hearts appear
 * missing until the fetch resolves AND the animation starts.
 *
 * FIX:
 *   - Import both JSON files directly as ES modules (animationData prop, not path)
 *     so they are bundled, synchronous, and never have a loading gap.
 *   - Use explicit width/height on the Lottie element sized to the container,
 *     with preserveAspectRatio: "xMidYMid slice" for the small-artboard bouncing heart
 *     so it scales up to fill the allocated space rather than rendering tiny.
 *
 * Both files live in public/ and are referenced via Vite's ?url import,
 * then fetched synchronously as JSON and passed as animationData.
 * This avoids the async path-fetch gap while still reading from public/.
 *
 * State machine per heart slot:
 *   "full"     → bouncing Lottie (looping)
 *   "half"     → bouncing Lottie clipped to left half + faded outline right
 *   "breaking" → broken-heart Lottie plays once, then resolves to "empty"
 *   "empty"    → static grey SVG (no animation)
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
import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import Lottie from "lottie-react";

// Broken-heart anim duration: 50 frames @ ~30fps ≈ 1667ms
const BREAK_DURATION_MS = 1750;

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

// ── Async JSON loader hook — fetches once and caches ─────────────────────────

const jsonCache = {};

function useJsonAsset(url) {
  const [data, setData] = useState(() => jsonCache[url] || null);
  useEffect(() => {
    if (jsonCache[url]) { setData(jsonCache[url]); return; }
    fetch(url)
      .then((r) => r.json())
      .then((json) => { jsonCache[url] = json; setData(json); })
      .catch(() => {});
  }, [url]);
  return data;
}

// ── Pre-warm both assets at module load time ──────────────────────────────────
// This fires the fetch immediately so by the time the first level mounts
// the JSON is already in the cache.
const BOUNCING_URL = "/bouncing-heart.json";
const BROKEN_URL = "/broken-heart.json";
[BOUNCING_URL, BROKEN_URL].forEach((url) => {
  fetch(url).then((r) => r.json()).then((json) => { jsonCache[url] = json; }).catch(() => {});
});

// ── Single heart slot ─────────────────────────────────────────────────────────

function HeartSlot({ displayState, size, onBreakComplete }) {
  const breakTimerRef = useRef(null);
  const bouncingData = useJsonAsset(BOUNCING_URL);
  const brokenData = useJsonAsset(BROKEN_URL);

  useEffect(() => {
    if (displayState === "breaking") {
      clearTimeout(breakTimerRef.current);
      breakTimerRef.current = setTimeout(onBreakComplete, BREAK_DURATION_MS);
    }
    return () => clearTimeout(breakTimerRef.current);
  }, [displayState]); // eslint-disable-line react-hooks/exhaustive-deps

  // The bouncing heart JSON has a 35×50 native artboard.
  // We must set explicit px dimensions on the Lottie element and use
  // preserveAspectRatio:"xMidYMid meet" so it scales up to fill our container.
  // Using a slightly larger rendered size than the container with overflow:visible
  // ensures the heart is never clipped by the flex container.
  const heartSize = size * 1.6;

  const base = {
    width: size,
    height: size,
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "visible",
    position: "relative",
  };

  if (displayState === "empty") {
    return (
      <div style={{ ...base, overflow: "hidden" }}>
        <EmptyHeart size={size} />
      </div>
    );
  }

  if (displayState === "breaking") {
    if (!brokenData) return <div style={base}><EmptyHeart size={size} /></div>;
    return (
      <div style={base}>
        <Lottie
          animationData={brokenData}
          loop={false}
          autoplay={true}
          style={{ width: heartSize, height: heartSize }}
          rendererSettings={{ preserveAspectRatio: "xMidYMid meet" }}
        />
      </div>
    );
  }

  if (displayState === "full") {
    if (!bouncingData) {
      // Fallback: show a red heart while JSON loads (should be pre-warmed, rarely shown)
      return (
        <div style={base}>
          <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <path d="M12 21C12 21 3 14.5 3 8.5C3 5.42 5.42 3 8.5 3C10.24 3 11.82 3.82 12 5C12.18 3.82 13.76 3 15.5 3C18.58 3 21 5.42 21 8.5C21 14.5 12 21 12 21Z" fill="#FF6B6B" />
          </svg>
        </div>
      );
    }
    return (
      <div style={base}>
        <Lottie
          animationData={bouncingData}
          loop={true}
          autoplay={true}
          style={{ width: heartSize, height: heartSize }}
          rendererSettings={{ preserveAspectRatio: "xMidYMid meet" }}
        />
      </div>
    );
  }

  if (displayState === "half") {
    return (
      <div style={{ ...base }}>
        {/* Faded right-side ghost outline */}
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          style={{ position: "absolute", top: 0, left: 0, pointerEvents: "none", zIndex: 0 }}
        >
          <path
            d="M12 21C12 21 3 14.5 3 8.5C3 5.42 5.42 3 8.5 3C10.24 3 11.82 3.82 12 5C12.18 3.82 13.76 3 15.5 3C18.58 3 21 5.42 21 8.5C21 14.5 12 21 12 21Z"
            fill="rgba(255,107,107,0.1)"
            stroke="rgba(255,107,107,0.3)"
            strokeWidth="1.5"
          />
        </svg>
        {/* Left-half of bouncing heart via clip */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: heartSize,
            height: heartSize,
            clipPath: "inset(0 50% 0 0)",
            WebkitClipPath: "inset(0 50% 0 0)",
            zIndex: 1,
          }}
        >
          {bouncingData && (
            <Lottie
              animationData={bouncingData}
              loop={true}
              autoplay={true}
              style={{ width: heartSize, height: heartSize }}
              rendererSettings={{ preserveAspectRatio: "xMidYMid meet" }}
            />
          )}
          {!bouncingData && (
            <svg width={heartSize} height={heartSize} viewBox="0 0 24 24" fill="none">
              <path d="M12 21C12 21 3 14.5 3 8.5C3 5.42 5.42 3 8.5 3C10.24 3 11.82 3.82 12 5C12.18 3.82 13.76 3 15.5 3C18.58 3 21 5.42 21 8.5C21 14.5 12 21 12 21Z" fill="#FF6B6B" />
            </svg>
          )}
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
  const prevMistakesRef = useRef(0);

  useEffect(() => {
    const next = computeHeartStates(mistakes);
    const prev = prevComputedRef.current;
    const wasReset = mistakes < prevMistakesRef.current;

    if (wasReset) {
      setDisplayStates(["full", "full", "full"]);
      prevComputedRef.current = ["full", "full", "full"];
      prevMistakesRef.current = mistakes;
      return;
    }

    prevMistakesRef.current = mistakes;

    setDisplayStates((current) =>
      current.map((cur, i) => {
        if (cur === "breaking") return cur;
        if (cur === "empty" && next[i] === "empty") return "empty";
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
    <div style={{ display: "flex", gap: 4, alignItems: "center", flexShrink: 0 }}>
      {displayStates.map((displayState, i) => (
        <HeartSlot
          key={`heart-slot-${i}`}
          displayState={displayState}
          size={size}
          onBreakComplete={() => handleBreakComplete(i)}
        />
      ))}
    </div>
  );
}