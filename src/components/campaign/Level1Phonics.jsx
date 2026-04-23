/**
 * Level1Phonics — phonics card for a single word inside the campaign.
 * Camera photo persists per-word via localStorage.
 * Reload icon appears only after user has replaced the image.
 * Hand-tap animation tutorial runs once on the very first card.
 */
import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Lottie from "lottie-react";
import { Camera, RotateCcw } from "lucide-react";
import RainbowLetterBlock from "../RainbowLetterBlock";
import { getLetterSoundUrl, getLetterGain } from "../../lib/letterSounds";
import { playAudio, preloadAudio, playAudioSequence, warmupAudio } from "../../lib/useAudio";
import handTapData from "../../lib/handTap.json";

// ── Storage helpers ────────────────────────────────────────────────────────────
const STORAGE_PREFIX = "cody_photo_";
const storageKey = (word) => `${STORAGE_PREFIX}${word}`;
const loadPhoto = (word) => { try { return localStorage.getItem(storageKey(word)) || null; } catch { return null; } };
const savePhoto = (word, dataUrl) => { try { localStorage.setItem(storageKey(word), dataUrl); } catch {} };
const clearPhoto = (word) => { try { localStorage.removeItem(storageKey(word)); } catch {} };

// ── Tutorial helpers ───────────────────────────────────────────────────────────
function isTutorialDone() {
  try {
    const data = JSON.parse(localStorage.getItem("campaign_progress") || "{}");
    return data?.["short-a"]?.[1]?.completed === true;
  } catch { return false; }
}

const PHASE_TEXTS = {
  1: "tap on the picture to listen to the word.",
  2: "tap on the letter to hear the letter sound.",
  3: "tap on the play icon to blend the letter sounds.",
  4: "tap on the camera icon to take your own picture and make your learning special.",
  5: "tap next when you have finished learning",
};

// How long the hand animation shows before hiding (ms)
const HAND_SHOW_MS = 6000;

export default function Level1Phonics({ card, onNext, lang = "en", isFirstCard = false }) {
  const [customImage, setCustomImage] = useState(() => loadPhoto(card.word));
  const [activeLetterIndex, setActiveLetterIndex] = useState(null);

  // Tutorial state: 0 = no tutorial; 1-5 = active phase; 6 = done
  const [tutPhase, setTutPhase] = useState(() =>
    isFirstCard && !isTutorialDone() ? 1 : 0
  );
  const [handVisible, setHandVisible] = useState(false);
  const [handPos, setHandPos] = useState({ left: 0, top: 0 });

  const isTutorial = tutPhase >= 1 && tutPhase <= 5;

  const sequenceRef = useRef(null);
  const activeTimerRef = useRef(null);
  const handTimerRef = useRef(null);
  const fileInputRef = useRef(null);
  const containerRef = useRef(null);

  // Target refs for each phase
  const refImage   = useRef(null); // Phase 1
  const refLetterC = useRef(null); // Phase 2
  const refPlay    = useRef(null); // Phase 3
  const refCamera  = useRef(null); // Phase 4
  const refNext    = useRef(null); // Phase 5

  const phaseRefs = { 1: refImage, 2: refLetterC, 3: refPlay, 4: refCamera, 5: refNext };

  // Show hand animation over the current phase target
  useEffect(() => {
    if (!isTutorial) return;
    const targetRef = phaseRefs[tutPhase];
    if (!targetRef?.current || !containerRef?.current) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const targetRect = targetRef.current.getBoundingClientRect();
    // Place so the index finger tip (at ~49px from left, ~58px from top of the 180px icon)
    // lands exactly at the center of the target element
    const fingerTipX = 49;
    const fingerTipY = 58;
    const left = targetRect.left - containerRect.left + targetRect.width / 2 - fingerTipX;
    const top  = targetRect.top  - containerRect.top  + targetRect.height / 2 - fingerTipY;

    setHandPos({ left, top });
    setHandVisible(true);

    clearTimeout(handTimerRef.current);
    handTimerRef.current = setTimeout(() => setHandVisible(false), HAND_SHOW_MS);

    return () => clearTimeout(handTimerRef.current);
  }, [tutPhase]); // eslint-disable-line react-hooks/exhaustive-deps

  const advancePhase = useCallback(() => {
    setHandVisible(false);
    setTutPhase((p) => {
      if (p >= 5) return 0; // tutorial done
      return p + 1;
    });
  }, []);

  // Card change: reset audio/state (tutorial stays if active)
  useEffect(() => {
    if (sequenceRef.current) { sequenceRef.current(); sequenceRef.current = null; }
    if (activeTimerRef.current) { clearTimeout(activeTimerRef.current); }
    setActiveLetterIndex(null);
    setCustomImage(loadPhoto(card.word));
  }, [card.word]);

  useEffect(() => {
    const img = new Image();
    img.src = card.image;
    if (card.audio) preloadAudio([card.audio]);
    const letters = [...new Set(card.word.split(""))];
    const letterUrls = letters.map(getLetterSoundUrl).filter(Boolean);
    if (letterUrls.length > 0) warmupAudio(letterUrls);
  }, [card]);

  const cancelSequence = useCallback(() => {
    if (sequenceRef.current) { sequenceRef.current(); sequenceRef.current = null; }
    if (activeTimerRef.current) { clearTimeout(activeTimerRef.current); activeTimerRef.current = null; }
  }, []);

  // ── Phase 1: tap picture ───────────────────────────────────────────────────
  const handleImageTap = useCallback(() => {
    if (isTutorial && tutPhase !== 1) return; // locked
    if (!card.audio) return;
    playAudio(card.audio);
    if (tutPhase === 1) {
      // Advance after audio would finish (~1s buffer)
      setTimeout(() => advancePhase(), 1200);
    }
  }, [card.audio, tutPhase, isTutorial, advancePhase]);

  // ── Phase 2: tap letter ────────────────────────────────────────────────────
  const handleLetterTap = useCallback((letter, i) => {
    if (isTutorial && tutPhase !== 2) return; // locked
    if (isTutorial && tutPhase === 2 && i !== 0) return; // only first letter ("c")
    cancelSequence();
    const url = getLetterSoundUrl(letter);
    if (!url) return;
    setActiveLetterIndex(i);
    playAudio(url, getLetterGain(letter));
    activeTimerRef.current = setTimeout(() => setActiveLetterIndex(null), 900);
    if (tutPhase === 2) setTimeout(() => advancePhase(), 1000);
  }, [cancelSequence, tutPhase, isTutorial, advancePhase]);

  // ── Phase 3: play sequence ─────────────────────────────────────────────────
  const handlePlaySequence = useCallback(() => {
    if (isTutorial && tutPhase !== 3) return; // locked
    cancelSequence();
    setActiveLetterIndex(null);
    const letters = card.word.split("");
    const steps = letters.map((letter, i) => {
      const url = getLetterSoundUrl(letter);
      if (!url) return null;
      return { url, gain: getLetterGain(letter), onStart: () => setActiveLetterIndex(i) };
    }).filter(Boolean);
    if (card.audio) steps.push({ url: card.audio, onStart: () => setActiveLetterIndex(null) });
    const cancel = playAudioSequence(steps, () => {
      setActiveLetterIndex(null);
      sequenceRef.current = null;
      if (tutPhase === 3) advancePhase();
    });
    sequenceRef.current = cancel;
  }, [card, cancelSequence, tutPhase, isTutorial, advancePhase]);

  // ── Phase 4: camera ────────────────────────────────────────────────────────
  const handleCamera = useCallback(() => {
    if (isTutorial && tutPhase !== 4) return; // locked
    fileInputRef.current.click();
    if (tutPhase === 4) setTimeout(() => advancePhase(), 400);
  }, [tutPhase, isTutorial, advancePhase]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const word = card.word;
    const reader = new FileReader();
    reader.onload = (ev) => {
      savePhoto(word, ev.target.result);
      setCustomImage(ev.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleReset = () => {
    if (isTutorial) return; // locked during tutorial
    clearPhoto(card.word);
    setCustomImage(null);
  };

  // ── Phase 5: next ──────────────────────────────────────────────────────────
  const handleNext = useCallback(() => {
    if (isTutorial && tutPhase !== 5) return; // locked
    if (tutPhase === 5) {
      setTutPhase(0);
      setHandVisible(false);
    }
    onNext();
  }, [tutPhase, isTutorial, onNext]);

  const currentImage = customImage || card.image;
  const hasCustomPhoto = customImage !== null;
  const letters = card.word.split("");

  return (
    <div
      ref={containerRef}
      style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden", fontFamily: "Fredoka, sans-serif", position: "relative" }}
    >
      {/* Card area */}
      <div style={{ flex: 1, padding: "20px 24px 16px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 20, position: "relative" }}>
        <div className="relative flex items-center justify-center" style={{ width: "100%", maxWidth: 340 }}>
          {/* Decorative blobs */}
          <div style={{ position: "absolute", top: -20, right: -10, width: 160, height: 140, borderRadius: 40, background: "#FFCDD2", zIndex: 0, transform: "rotate(8deg)" }} />
          <div style={{ position: "absolute", bottom: -20, left: -10, width: 140, height: 140, borderRadius: "50%", background: "#FFF59D", zIndex: 0 }} />

          <AnimatePresence mode="wait">
            <motion.div
              key={card.word}
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.94 }}
              transition={{ duration: 0.22 }}
              style={{ position: "relative", zIndex: 1, background: "white", borderRadius: 28, padding: 14, boxShadow: "0 12px 48px rgba(30,58,95,0.15)", width: "100%" }}
            >
              {/* Phase 1 target: image */}
              <img
                ref={refImage}
                src={currentImage}
                alt={card.word}
                onPointerDown={(e) => { e.preventDefault(); handleImageTap(); }}
                style={{
                  width: "100%", aspectRatio: "1/1", objectFit: "cover", borderRadius: 18, display: "block",
                  cursor: "pointer",
                  pointerEvents: (isTutorial && tutPhase !== 1) ? "none" : "auto",
                }}
              />
            </motion.div>
          </AnimatePresence>

          {/* Reload button — hidden during tutorial */}
          <AnimatePresence>
            {hasCustomPhoto && !isTutorial && (
              <motion.button
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.7 }}
                transition={{ duration: 0.18 }}
                onClick={handleReset}
                style={{
                  position: "absolute", bottom: 32, right: 88,
                  width: 48, height: 48, borderRadius: 24,
                  background: "white", boxShadow: "0 4px 16px rgba(0,0,0,0.18)",
                  border: "none", cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  zIndex: 10, touchAction: "manipulation",
                }}
                aria-label="Reset to original image"
              >
                <RotateCcw size={22} color="#A8D0E6" strokeWidth={2.2} />
              </motion.button>
            )}
          </AnimatePresence>

          {/* Phase 4 target: camera button */}
          <button
            ref={refCamera}
            onClick={handleCamera}
            style={{
              position: "absolute", bottom: 32, right: 32,
              width: 48, height: 48, borderRadius: 24,
              background: "white", boxShadow: "0 4px 16px rgba(0,0,0,0.18)",
              border: "none", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              zIndex: 10, touchAction: "manipulation",
              pointerEvents: (isTutorial && tutPhase !== 4) ? "none" : "auto",
              opacity: (isTutorial && tutPhase !== 4) ? 0.4 : 1,
            }}
          >
            <Camera size={24} color="#A8D0E6" strokeWidth={2.2} />
          </button>
        </div>

        {/* Letter blocks + play button */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, zIndex: 1 }}>
          {letters.map((letter, i) => (
            <RainbowLetterBlock
              key={i}
              ref={i === 0 ? refLetterC : undefined}
              letter={letter}
              index={i}
              isActive={activeLetterIndex === i}
              onClick={() => handleLetterTap(letter, i)}
              style={{
                pointerEvents: (isTutorial && (tutPhase !== 2 || i !== 0)) ? "none" : "auto",
                opacity: (isTutorial && tutPhase === 2 && i !== 0) ? 0.4 : (isTutorial && tutPhase !== 2) ? 0.4 : 1,
              }}
            />
          ))}

          {/* Phase 3 target: play button */}
          <button
            ref={refPlay}
            onClick={handlePlaySequence}
            style={{
              width: 56, height: 56, borderRadius: 28,
              background: "#FFD93D", border: "3px solid #F4B942",
              boxShadow: "0 4px 16px rgba(255,193,7,0.45)",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", flexShrink: 0, marginLeft: 6, transition: "transform 0.12s",
              pointerEvents: (isTutorial && tutPhase !== 3) ? "none" : "auto",
              opacity: (isTutorial && tutPhase !== 3) ? 0.4 : 1,
            }}
            onMouseDown={e => e.currentTarget.style.transform = "scale(0.92)"}
            onMouseUp={e => e.currentTarget.style.transform = "scale(1)"}
            onTouchStart={e => e.currentTarget.style.transform = "scale(0.92)"}
            onTouchEnd={e => e.currentTarget.style.transform = "scale(1)"}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="#1E3A5F">
              <polygon points="5,3 19,12 5,21" />
            </svg>
          </button>
        </div>
      </div>

      {/* Next button row */}
      <div style={{ flexShrink: 0, display: "flex", justifyContent: "flex-end", padding: "12px 28px", paddingBottom: "calc(12px + env(safe-area-inset-bottom, 8px))" }}>
        <button
          ref={refNext}
          onClick={handleNext}
          style={{
            padding: "14px 36px", borderRadius: 999,
            background: "#4A90C4", color: "white", border: "none",
            cursor: "pointer", fontSize: 18, fontWeight: 600,
            fontFamily: "Fredoka, sans-serif", touchAction: "manipulation",
            boxShadow: "0 4px 0 #2f6a9a",
            pointerEvents: (isTutorial && tutPhase !== 5) ? "none" : "auto",
            opacity: (isTutorial && tutPhase !== 5) ? 0.4 : 1,
          }}
        >
          {lang === "zh" ? "下一步 →" : "Next →"}
        </button>
      </div>

      {/* Camera file input */}
      <input ref={fileInputRef} type="file" accept="image/*" capture="environment" style={{ display: "none" }} onChange={handleFileChange} />

      {/* ── Tutorial overlay ──────────────────────────────────────────────── */}
      {isTutorial && (
        <>
          {/* Instruction text */}
          <div
            style={{
              position: "absolute", bottom: 90, left: 0, right: 0,
              display: "flex", justifyContent: "center",
              zIndex: 200, pointerEvents: "none", padding: "0 24px",
            }}
          >
            <motion.div
              key={tutPhase}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              style={{
                background: "rgba(255,255,255,0.97)",
                borderRadius: 20, padding: "12px 20px",
                fontSize: 18, fontWeight: 600, color: "#1E293B",
                fontFamily: "Fredoka, sans-serif",
                boxShadow: "0 4px 20px rgba(0,0,0,0.12)",
                textAlign: "center", maxWidth: 340, lineHeight: 1.4,
              }}
            >
              {PHASE_TEXTS[tutPhase]}
            </motion.div>
          </div>

          {/* Hand tap animation */}
          <AnimatePresence>
            {handVisible && (
              <motion.div
                key={`hand-${tutPhase}`}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
                style={{
                  position: "absolute",
                  left: handPos.left,
                  top: handPos.top,
                  width: 180, height: 180,
                  zIndex: 300,
                  pointerEvents: "none",
                  filter: "invert(68%) sepia(60%) saturate(400%) hue-rotate(180deg) brightness(110%)",
                }}
              >
                <Lottie animationData={handTapData} loop={false} autoplay={true} />
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </div>
  );
}