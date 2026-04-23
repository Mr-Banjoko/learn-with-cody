/**
 * Shared IdentifyingRound component — used by:
 *   WordToPicture, Level4, Level5, Level9, Level10
 *
 * BUG FIX: Previously each file rendered <img> tags directly, letting the
 * browser paint images as they arrived. Because the target word is placed
 * first in buildRound() before the shuffle, it enters the browser's HTTP
 * queue first and loads/paints first — revealing the correct answer by
 * timing. Fix: Promise.all-preload all 3 URLs simultaneously, then reveal
 * the entire choice set only when every image is decoded and ready.
 */
import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { playAudio } from "../../lib/useAudio";

const CHOICE_COLORS = [
  { border: "#4ECDC4", shadow: "rgba(78,205,196,0.35)", ring: "rgba(78,205,196,0.28)" },
  { border: "#FF6B6B", shadow: "rgba(255,107,107,0.35)", ring: "rgba(255,107,107,0.28)" },
  { border: "#FFD93D", shadow: "rgba(255,217,61,0.35)", ring: "rgba(255,217,61,0.28)" },
];

function SpeakerIcon({ color = "#4ECDC4", size = 26 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 52 52" fill="none">
      <path d="M18 21h-4a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h4l8 6V15l-8 6z" fill={color} />
      <path d="M30 20.5a8 8 0 0 1 0 11" stroke={color} strokeWidth="2.5" strokeLinecap="round" fill="none" />
      <path d="M33.5 17a13 13 0 0 1 0 18" stroke={color} strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.6" />
    </svg>
  );
}

/**
 * Preload AND FULLY DECODE all images in parallel via Promise.all.
 * Uses img.decode() which guarantees the image is pixel-ready to paint —
 * not just downloaded. This eliminates the per-image decode stagger that
 * causes images to appear sequentially even from cache.
 * Returns a map of url → objectURL so we render from blob: (local) URLs,
 * which are guaranteed to be synchronously available and never re-fetch.
 */
async function preloadAll(urls) {
  const entries = await Promise.all(
    urls.map(async (url) => {
      if (!url) return [url, url];
      try {
        // Fetch into a blob so we own the bytes locally
        const resp = await fetch(url);
        const blob = await resp.blob();
        const objectUrl = URL.createObjectURL(blob);
        // Decode into a bitmap to ensure GPU-upload is complete
        const img = new Image();
        img.src = objectUrl;
        await img.decode().catch(() => {});
        return [url, objectUrl];
      } catch {
        return [url, url]; // fallback to original on any error
      }
    })
  );
  return Object.fromEntries(entries);
}

/**
 * Props:
 *   round      { target: WordObj, choices: WordObj[] }
 *   onComplete () => void
 *   lang       "en" | "zh"
 */
export default function IdentifyingRound({ round, onComplete, lang = "en" }) {
  const [selected, setSelected]     = useState(null);
  const [showNext, setShowNext]      = useState(false);
  const [wrongShake, setWrongShake]  = useState(false);
  // Gate: choices are hidden until ALL 3 images are decoded and blob-ready
  const [imagesReady, setImagesReady] = useState(false);
  // Map of original url → local blob: url (guaranteed sync paint)
  const [blobUrls, setBlobUrls] = useState({});

  const shakeTimeout = useRef(null);
  // Stale-closure guard: only the current round's preload may flip imagesReady
  const roundKeyRef  = useRef(null);
  // Track blob URLs for cleanup
  const prevBlobsRef = useRef([]);

  useEffect(() => {
    // Reset visible state immediately when round changes
    setImagesReady(false);
    setSelected(null);
    setShowNext(false);
    setWrongShake(false);

    const key = round.target.word;
    roundKeyRef.current = key;

    const urls = round.choices.map((c) => c.image);
    preloadAll(urls).then((urlMap) => {
      if (roundKeyRef.current !== key) {
        // Round changed while loading — revoke blobs we just created
        Object.values(urlMap).forEach((u) => { if (u?.startsWith("blob:")) URL.revokeObjectURL(u); });
        return;
      }
      // Revoke previous round's blobs
      prevBlobsRef.current.forEach((u) => { if (u?.startsWith("blob:")) URL.revokeObjectURL(u); });
      prevBlobsRef.current = Object.values(urlMap).filter((u) => u?.startsWith("blob:"));
      setBlobUrls(urlMap);
      setImagesReady(true);
    });

    return () => { clearTimeout(shakeTimeout.current); };
  }, [round]);

  // Play audio only after images are ready (avoids audio before visuals)
  useEffect(() => {
    if (imagesReady && round.target.audio) {
      playAudio(round.target.audio);
    }
  }, [imagesReady, round]);

  const handleSpeakerTap = useCallback(() => {
    if (round.target.audio) playAudio(round.target.audio);
  }, [round]);

  const handleSelect = useCallback((choice) => {
    if (showNext) return;
    setSelected(choice);
    if (wrongShake) setWrongShake(false);
  }, [showNext, wrongShake]);

  const handleSubmit = useCallback(() => {
    if (!selected || showNext) return;
    if (selected.word === round.target.word) {
      if (round.target.audio) playAudio(round.target.audio);
      setShowNext(true);
    } else {
      clearTimeout(shakeTimeout.current);
      setWrongShake(true);
      shakeTimeout.current = setTimeout(() => setWrongShake(false), 600);
    }
  }, [selected, round, showNext]);

  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1, fontFamily: "Fredoka, sans-serif", overflow: "hidden" }}>

      {/* Word + speaker */}
      <div style={{ flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", gap: 14, padding: "20px 24px 10px" }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={round.target.word}
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.05, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 22 }}
            style={{ background: "white", borderRadius: 20, padding: "14px 40px", boxShadow: "0 8px 32px rgba(78,205,196,0.20), 0 2px 10px rgba(30,58,95,0.08)", border: "3px solid rgba(78,205,196,0.22)", display: "flex", alignItems: "center", justifyContent: "center" }}
          >
            <span style={{ fontSize: 52, fontWeight: 700, color: "#1E3A5F", fontFamily: "Fredoka, sans-serif" }}>
              {round.target.word}
            </span>
          </motion.div>
        </AnimatePresence>

        <motion.button
          onClick={handleSpeakerTap}
          whileTap={{ scale: 0.88 }}
          style={{ width: 52, height: 52, borderRadius: 16, background: "white", border: "2.5px solid rgba(78,205,196,0.35)", boxShadow: "0 4px 16px rgba(78,205,196,0.18)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0, WebkitTapHighlightColor: "transparent" }}
        >
          <SpeakerIcon color="#4ECDC4" size={26} />
        </motion.button>
      </div>

      {/* ── Choice area — skeleton until ALL 3 images are ready ── */}
      <motion.div
        animate={wrongShake ? { x: [0, -10, 10, -8, 8, 0] } : { x: 0 }}
        transition={{ duration: 0.45 }}
        style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", gap: 12, padding: "4px 24px", minHeight: 0 }}
      >
        <AnimatePresence mode="wait">
          {!imagesReady ? (
            /* Skeleton: three grey placeholder blocks, same size as real buttons */
            <motion.div
              key="skeleton"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.12 }}
              style={{ width: "100%", display: "flex", flexDirection: "column", gap: 12 }}
            >
              {[0, 1, 2].map((i) => (
                <div key={i} style={{ width: "100%", height: 130, borderRadius: 22, background: "rgba(0,0,0,0.07)", flexShrink: 0 }} />
              ))}
            </motion.div>
          ) : (
            /* All 3 images revealed simultaneously — already in browser cache */
            <motion.div
              key={`choices-${round.target.word}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.16 }}
              style={{ width: "100%", display: "flex", flexDirection: "column", gap: 12 }}
            >
              {round.choices.map((choice, idx) => {
                const isSelected = selected?.word === choice.word;
                const colorSet = CHOICE_COLORS[idx % CHOICE_COLORS.length];
                return (
                  <motion.button
                    key={`${round.target.word}-${choice.word}-${idx}`}
                    onClick={() => handleSelect(choice)}
                    whileTap={{ scale: 0.97 }}
                    style={{ background: "white", borderRadius: 22, border: isSelected ? `3.5px solid ${colorSet.border}` : "3px solid rgba(168,208,230,0.25)", boxShadow: isSelected ? `0 8px 28px ${colorSet.shadow}, 0 0 0 5px ${colorSet.ring}` : "0 4px 18px rgba(30,58,95,0.09)", overflow: "hidden", cursor: "pointer", padding: 0, display: "flex", alignItems: "center", justifyContent: "center", transition: "border 0.16s, box-shadow 0.16s", WebkitTapHighlightColor: "transparent", width: "100%", height: 130, flexShrink: 0 }}
                  >
                    {/* Render as CSS background from blob: URL — synchronous, no decode lag */}
                    <div style={{ width: "100%", height: "100%", backgroundImage: `url(${blobUrls[choice.image] || choice.image})`, backgroundSize: "cover", backgroundPosition: "center", pointerEvents: "none" }} />
                  </motion.button>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Submit */}
      <div style={{ flexShrink: 0, display: "flex", justifyContent: "center", padding: "10px 24px 0" }}>
        <motion.button
          onClick={handleSubmit}
          whileTap={selected && !showNext ? { scale: 0.95 } : {}}
          style={{ background: selected && !showNext ? "linear-gradient(135deg, #4ECDC4, #44A08D)" : "#D1D5DB", color: selected && !showNext ? "white" : "#9CA3AF", border: "none", borderRadius: 999, padding: "16px 56px", fontSize: 22, fontWeight: 700, cursor: selected && !showNext ? "pointer" : "not-allowed", fontFamily: "Fredoka, sans-serif", boxShadow: selected && !showNext ? "0 8px 28px rgba(78,205,196,0.4)" : "none", transition: "background 0.2s, color 0.2s, box-shadow 0.2s", WebkitTapHighlightColor: "transparent", width: "100%", maxWidth: 320 }}
        >
          {lang === "zh" ? "确认 ✓" : "Submit ✓"}
        </motion.button>
      </div>

      {/* Next */}
      <div style={{ flexShrink: 0, display: "flex", justifyContent: "flex-end", paddingRight: 28, paddingBottom: "calc(16px + env(safe-area-inset-bottom, 0px))", minHeight: 68, alignItems: "flex-end" }}>
        <AnimatePresence>
          {showNext && (
            <motion.button
              initial={{ opacity: 0, scale: 0.7, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.7 }}
              transition={{ type: "spring", stiffness: 350, damping: 22 }}
              onClick={onComplete}
              whileTap={{ scale: 0.93 }}
              style={{ background: "linear-gradient(135deg, #6BCB77, #44A08D)", color: "white", border: "none", borderRadius: 999, padding: "16px 32px", fontSize: 22, fontWeight: 700, cursor: "pointer", fontFamily: "Fredoka, sans-serif", boxShadow: "0 8px 28px rgba(107,203,119,0.45)", WebkitTapHighlightColor: "transparent" }}
            >
              {lang === "zh" ? "继续 →" : "Next →"}
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}