/**
 * Shared IdentifyingRound component — used by:
 *   WordToPicture, Level4, Level5, Level9, Level10
 */
import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RotateCcw } from "lucide-react";
import { playAudio } from "../../lib/useAudio";
import { useCorrectSound } from "../../lib/useCorrectSound";
import { useTryAgainSound } from "../../lib/useTryAgainSound";

const CHOICE_COLORS = [
  { border: "#4ECDC4", shadow: "rgba(78,205,196,0.35)", ring: "rgba(78,205,196,0.28)" },
  { border: "#FF6B9D", shadow: "rgba(255,107,157,0.35)", ring: "rgba(255,107,157,0.28)" },
  { border: "#FFD93D", shadow: "rgba(255,217,61,0.35)", ring: "rgba(255,217,61,0.28)" },
];

const RAINBOW_GRADIENT = "linear-gradient(white, white) padding-box, linear-gradient(135deg, #FF6B6B, #FFD93D, #4ECDC4, #9B59B6) border-box";

function SpeakerIcon({ color = "#4ECDC4", size = 26 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 52 52" fill="none">
      <path d="M18 21h-4a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h4l8 6V15l-8 6z" fill={color} />
      <path d="M30 20.5a8 8 0 0 1 0 11" stroke={color} strokeWidth="2.5" strokeLinecap="round" fill="none" />
      <path d="M33.5 17a13 13 0 0 1 0 18" stroke={color} strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.6" />
    </svg>
  );
}

async function preloadAll(urls) {
  const entries = await Promise.all(
    urls.map(async (url) => {
      if (!url) return [url, url];
      try {
        const resp = await fetch(url);
        const blob = await resp.blob();
        const objectUrl = URL.createObjectURL(blob);
        const img = new Image();
        img.src = objectUrl;
        await img.decode().catch(() => {});
        return [url, objectUrl];
      } catch {
        return [url, url];
      }
    })
  );
  return Object.fromEntries(entries);
}

export default function IdentifyingRound({ round, onComplete, lang = "en", onMistake, suppressAutoPlay = false, userPhotoUrl, onClearPhoto }) {
  const [selected, setSelected]     = useState(null);
  const [wrongShake, setWrongShake]  = useState(false);
  const [imagesReady, setImagesReady] = useState(false);
  const [blobUrls, setBlobUrls] = useState({});

  const shakeTimeout = useRef(null);
  // Single-play guard: prevents double-triggering correct flow on repeated taps
  const correctFiredRef = useRef(false);
  const roundKeyRef  = useRef(null);
  const prevBlobsRef = useRef([]);

  useEffect(() => {
    setImagesReady(false);
    setSelected(null);
    correctFiredRef.current = false;
    setWrongShake(false);

    const key = round.target.word;
    roundKeyRef.current = key;

    const urls = round.choices.map((c) => c.image);
    preloadAll(urls).then((urlMap) => {
      if (roundKeyRef.current !== key) {
        Object.values(urlMap).forEach((u) => { if (u?.startsWith("blob:")) URL.revokeObjectURL(u); });
        return;
      }
      prevBlobsRef.current.forEach((u) => { if (u?.startsWith("blob:")) URL.revokeObjectURL(u); });
      prevBlobsRef.current = Object.values(urlMap).filter((u) => u?.startsWith("blob:"));
      setBlobUrls(urlMap);
      setImagesReady(true);
    });

    return () => { clearTimeout(shakeTimeout.current); };
  }, [round]);

  useEffect(() => {
    if (imagesReady && round.target.audio && !suppressAutoPlay) {
      playAudio(round.target.audio);
    }
  }, [imagesReady, round]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSpeakerTap = useCallback(() => {
    if (round.target.audio) playAudio(round.target.audio);
  }, [round]);

  const handleSelect = useCallback((choice) => {
    if (correctFiredRef.current) return;
    setSelected(choice);
    if (wrongShake) setWrongShake(false);
  }, [wrongShake]);

  const { play: playCorrect } = useCorrectSound();
  const { play: playTryAgain } = useTryAgainSound();
  // Track which choice word is wrong-shaking
  const [wrongWord, setWrongWord] = useState(null);

  const [completing, setCompleting] = useState(false);

  const handleSubmit = useCallback(() => {
    if (!selected || correctFiredRef.current) return;
    if (selected.word === round.target.word) {
      correctFiredRef.current = true;
      setCompleting(true);
      playCorrect(() => {
        onComplete();
      });
    } else {
      playTryAgain();
      clearTimeout(shakeTimeout.current);
      setWrongWord(selected.word);
      shakeTimeout.current = setTimeout(() => { setWrongWord(null); }, 600);
      onMistake && onMistake();
    }
  }, [selected, round, playCorrect, playTryAgain, onComplete, onMistake]);

  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1, fontFamily: "Fredoka, sans-serif", overflow: "hidden", position: "relative" }}>
      {completing && <div style={{ position: "absolute", inset: 0, zIndex: 100, pointerEvents: "all" }} />}

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

      {/* Choice area */}
      <div
        style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", gap: 12, padding: "4px 24px", minHeight: 0 }}
      >
        <AnimatePresence mode="wait">
          {!imagesReady ? (
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
                const isWrong = wrongWord === choice.word;
                const colorSet = CHOICE_COLORS[idx % CHOICE_COLORS.length];
                return (
                  <motion.button
                    key={`${round.target.word}-${choice.word}-${idx}`}
                    onClick={() => handleSelect(choice)}
                    whileTap={{ scale: 0.97 }}
                    animate={isWrong ? { x: [0, -10, 10, -7, 7, 0] } : {}}
                    transition={{ duration: 0.38 }}
                    style={{ background: isSelected ? RAINBOW_GRADIENT : "white", borderRadius: 22, border: isSelected ? "4px solid transparent" : "3px solid rgba(168,208,230,0.25)", boxShadow: isSelected ? "0 8px 32px rgba(155,89,182,0.25), 0 4px 18px rgba(78,205,196,0.3)" : "0 4px 18px rgba(30,58,95,0.09)", overflow: "hidden", cursor: "pointer", padding: 0, display: "flex", alignItems: "center", justifyContent: "center", transition: "border 0.16s, box-shadow 0.16s", WebkitTapHighlightColor: "transparent", width: "100%", height: 130, flexShrink: 0 }}
                  >
                    <div style={{ position: "relative", width: "100%", height: "100%" }}>
                      <div style={{ width: "100%", height: "100%", backgroundImage: `url(${choice.word === round.target.word && userPhotoUrl ? userPhotoUrl : (blobUrls[choice.image] || choice.image)})`, backgroundSize: "cover", backgroundPosition: "center" }} />
                      {choice.word === round.target.word && userPhotoUrl && onClearPhoto && (
                        <button
                          onPointerDown={(e) => { e.preventDefault(); e.stopPropagation(); onClearPhoto(); }}
                          style={{ position: "absolute", top: 6, right: 6, width: 32, height: 32, borderRadius: 16, background: "white", boxShadow: "0 2px 10px rgba(0,0,0,0.2)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10, touchAction: "manipulation" }}
                          aria-label="Reset to original image"
                        >
                          <RotateCcw size={16} color="#A8D0E6" strokeWidth={2.2} />
                        </button>
                      )}
                    </div>
                  </motion.button>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Submit — no Next button */}
      <div style={{ flexShrink: 0, display: "flex", justifyContent: "center", padding: "10px 24px 16px" }}>
        <motion.button
          onClick={handleSubmit}
          whileTap={selected ? { scale: 0.95 } : {}}
          style={{ background: selected ? "linear-gradient(135deg, #4ECDC4, #44A08D)" : "#D1D5DB", color: selected ? "white" : "#9CA3AF", border: "none", borderRadius: 999, padding: "16px 56px", fontSize: 22, fontWeight: 700, cursor: selected ? "pointer" : "not-allowed", fontFamily: "Fredoka, sans-serif", boxShadow: selected ? "0 8px 28px rgba(78,205,196,0.4)" : "none", transition: "background 0.2s, color 0.2s, box-shadow 0.2s", WebkitTapHighlightColor: "transparent", width: "100%", maxWidth: 320 }}
        >
          {lang === "zh" ? "确认 ✓" : "Submit ✓"}
        </motion.button>
      </div>
    </div>
  );
}