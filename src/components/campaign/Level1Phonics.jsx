/**
 * Level1Phonics — phonics card for a single word inside the campaign.
 * Camera photo persists per-word via localStorage.
 * Reload icon appears only after user has replaced the image.
 * Spotlight onboarding runs once on the very first card.
 */
import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, RotateCcw } from "lucide-react";
import RainbowLetterBlock from "../RainbowLetterBlock";
import { getLetterSoundUrl, getLetterGain } from "../../lib/letterSounds";
import { playAudio, preloadAudio, playAudioSequence, warmupAudio } from "../../lib/useAudio";
import SpotlightOverlay from "./SpotlightOverlay";

// Shared storage helpers — same key scheme as FlashcardScreen
const STORAGE_PREFIX = "cody_photo_";
const storageKey = (word) => `${STORAGE_PREFIX}${word}`;
const loadPhoto = (word) => { try { return localStorage.getItem(storageKey(word)) || null; } catch { return null; } };
const savePhoto = (word, dataUrl) => { try { localStorage.setItem(storageKey(word), dataUrl); } catch {} };
const clearPhoto = (word) => { try { localStorage.removeItem(storageKey(word)); } catch {} };

// Track if onboarding has run this session
let onboardingDone = false;

export default function Level1Phonics({ card, onNext, lang = "en", isFirstCard = false }) {
  // Load persisted photo for this word on mount / card change
  const [customImage, setCustomImage] = useState(() => loadPhoto(card.word));
  const [activeLetterIndex, setActiveLetterIndex] = useState(null);
  const [showOnboarding, setShowOnboarding] = useState(isFirstCard && !onboardingDone);

  const sequenceRef = useRef(null);
  const activeTimerRef = useRef(null);
  const fileInputRef = useRef(null);

  // Spotlight target refs — order matches the 5 tour steps
  const refImage    = useRef(null); // Step 1: the card image
  const refLetterC  = useRef(null); // Step 2: letter "c"
  const refPlay     = useRef(null); // Step 3: play button
  const refCamera   = useRef(null); // Step 4: camera button
  const refNext     = useRef(null); // Step 5: next button

  const spotlightTargets = [
    { ref: refImage },
    { ref: refLetterC },
    { ref: refPlay },
    { ref: refCamera },
    { ref: refNext },
  ];

  const handleOnboardingDone = () => {
    onboardingDone = true;
    setShowOnboarding(false);
  };

  // When card changes, load that word's persisted photo (or null)
  useEffect(() => {
    cancelSequence();
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

  const handleLetterTap = useCallback((letter, i) => {
    if (showOnboarding) return; // don't fire audio during tour
    cancelSequence();
    const url = getLetterSoundUrl(letter);
    if (!url) return;
    setActiveLetterIndex(i);
    playAudio(url, getLetterGain(letter));
    activeTimerRef.current = setTimeout(() => setActiveLetterIndex(null), 900);
  }, [cancelSequence, showOnboarding]);

  const handlePlaySequence = useCallback(() => {
    if (showOnboarding) return;
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
    });
    sequenceRef.current = cancel;
  }, [card, cancelSequence, showOnboarding]);

  const handleCamera = () => {
    if (showOnboarding) return;
    fileInputRef.current.click();
  };

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
    if (showOnboarding) return;
    clearPhoto(card.word);
    setCustomImage(null);
  };

  const currentImage = customImage || card.image;
  const hasCustomPhoto = customImage !== null;
  const letters = card.word.split("");

  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden", fontFamily: "Fredoka, sans-serif" }}>
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
              {/* Step 1 target: image */}
              <img
                ref={refImage}
                src={currentImage}
                alt={card.word}
                onPointerDown={(e) => { e.preventDefault(); if (!showOnboarding) card.audio && playAudio(card.audio); }}
                style={{ width: "100%", aspectRatio: "1/1", objectFit: "cover", borderRadius: 18, display: "block", cursor: card.audio ? "pointer" : "default" }}
              />
            </motion.div>
          </AnimatePresence>

          {/* Reload button */}
          <AnimatePresence>
            {hasCustomPhoto && (
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

          {/* Step 4 target: camera button */}
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
              ref={i === 0 ? refLetterC : undefined}  // Step 2 target: first letter ("c")
              letter={letter}
              index={i}
              isActive={activeLetterIndex === i}
              onClick={() => handleLetterTap(letter, i)}
            />
          ))}

          {/* Step 3 target: play button */}
          <button
            ref={refPlay}
            onClick={handlePlaySequence}
            style={{ width: 56, height: 56, borderRadius: 28, background: "#FFD93D", border: "3px solid #F4B942", boxShadow: "0 4px 16px rgba(255,193,7,0.45)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0, marginLeft: 6, transition: "transform 0.12s" }}
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
        {/* Step 5 target: next button */}
        <button
          ref={refNext}
          onClick={showOnboarding ? undefined : onNext}
          style={{ padding: "14px 36px", borderRadius: 999, background: "#4A90C4", color: "white", border: "none", cursor: "pointer", fontSize: 18, fontWeight: 600, fontFamily: "Fredoka, sans-serif", touchAction: "manipulation", boxShadow: "0 4px 0 #2f6a9a" }}
        >
          {lang === "zh" ? "下一步 →" : "Next →"}
        </button>
      </div>

      {/* Camera-only file input */}
      <input ref={fileInputRef} type="file" accept="image/*" capture="environment" style={{ display: "none" }} onChange={handleFileChange} />

      {/* Onboarding spotlight overlay */}
      {showOnboarding && (
        <SpotlightOverlay targets={spotlightTargets} onDone={handleOnboardingDone} />
      )}
    </div>
  );
}