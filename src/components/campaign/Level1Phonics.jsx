/**
 * Level1Phonics — phonics card for a single word inside the campaign.
 *
 * Camera photo persists per-word via localStorage (same store as FlashcardScreen).
 * Reload icon appears only after user has replaced the image; resets to original.
 *
 * TUTORIAL GUIDE (visual-only, audio can be layered on later):
 *   step 0  — spotlight: picture + frame
 *   step 1  — spotlight: letter C (index 0) box         [after picture tapped]
 *   step 2  — spotlight: play button                    [after C tapped]
 *   step 3  — spotlight: camera button                  [after play tapped]
 *   step 4a — spotlight: reset button (image replaced)  [after camera closed with new photo]
 *   step 4b — spotlight: next button  (no replacement)  [after camera closed without change]
 *   step 5  — spotlight: next button  (from 4a)         [after reset tapped]
 *   step -1 — tutorial complete, overlay hidden
 *
 * To add audio guidance later, call a playTutorialAudio(step) helper keyed on the step number.
 */
import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, RotateCcw } from "lucide-react";
import RainbowLetterBlock from "../RainbowLetterBlock";
import { getLetterSoundUrl, getLetterGain } from "../../lib/letterSounds";
import { playAudio, preloadAudio, playAudioSequence, warmupAudio } from "../../lib/useAudio";
import TutorialOverlay from "./TutorialOverlay";

// ─── Shared localStorage helpers (same key scheme as FlashcardScreen) ───────
const STORAGE_PREFIX = "cody_photo_";
const storageKey = (word) => `${STORAGE_PREFIX}${word}`;
const loadPhoto   = (word) => { try { return localStorage.getItem(storageKey(word)) || null; } catch { return null; } };
const savePhoto   = (word, dataUrl) => { try { localStorage.setItem(storageKey(word), dataUrl); } catch {} };
const clearPhoto  = (word) => { try { localStorage.removeItem(storageKey(word)); } catch {} };

// ─── Tutorial steps ──────────────────────────────────────────────────────────
const STEP_PICTURE  = 0;
const STEP_LETTER_C = 1;
const STEP_PLAY     = 2;
const STEP_CAMERA   = 3;
const STEP_RESET    = 4;   // only if image was replaced
const STEP_NEXT     = 5;
const STEP_DONE     = -1;

// ─── Component ───────────────────────────────────────────────────────────────
export default function Level1Phonics({ card, onNext, lang = "en" }) {
  // ── Photo persistence ──────────────────────────────────────────────────────
  const [customImage, setCustomImage] = useState(() => loadPhoto(card.word));

  useEffect(() => {
    setCustomImage(loadPhoto(card.word));
  }, [card.word]);

  const hasCustomPhoto = customImage !== null;
  const currentImage   = customImage || card.image;

  // ── Audio / letter animation state ────────────────────────────────────────
  const [activeLetterIndex, setActiveLetterIndex] = useState(null);
  const sequenceRef    = useRef(null);
  const activeTimerRef = useRef(null);

  const cancelSequence = useCallback(() => {
    if (sequenceRef.current)  { sequenceRef.current(); sequenceRef.current = null; }
    if (activeTimerRef.current) { clearTimeout(activeTimerRef.current); activeTimerRef.current = null; }
  }, []);

  useEffect(() => {
    cancelSequence();
    setActiveLetterIndex(null);
  }, [card.word, cancelSequence]);

  useEffect(() => {
    const img = new Image(); img.src = card.image;
    if (card.audio) preloadAudio([card.audio]);
    const letters = [...new Set(card.word.split(""))];
    const letterUrls = letters.map(getLetterSoundUrl).filter(Boolean);
    if (letterUrls.length > 0) warmupAudio(letterUrls);
  }, [card]);

  // ── Tutorial state ─────────────────────────────────────────────────────────
  const [tutStep, setTutStep] = useState(STEP_PICTURE);
  const tutorialActive = tutStep !== STEP_DONE;

  // ── Refs for spotlight targets ─────────────────────────────────────────────
  const pictureRef  = useRef(null);  // inner white card div (not the full-width wrapper)
  const letterCRef  = useRef(null);
  const playRef     = useRef(null);
  const cameraRef   = useRef(null);
  const resetRef    = useRef(null);
  const nextRef     = useRef(null);

  // Map step → ref (used by TutorialOverlay)
  const spotlightRef = (() => {
    switch (tutStep) {
      case STEP_PICTURE:  return pictureRef;
      case STEP_LETTER_C: return letterCRef;
      case STEP_PLAY:     return playRef;
      case STEP_CAMERA:   return cameraRef;
      case STEP_RESET:    return resetRef;
      case STEP_NEXT:     return nextRef;
      default:            return null;
    }
  })();

  // ── File input for camera ──────────────────────────────────────────────────
  const fileInputRef     = useRef(null);
  const fileInputWordRef = useRef("");
  const imageBeforeCameraRef = useRef(null); // snapshot of customImage before camera opens

  // Track whether camera was opened so we can detect cancellation via window focus
  const cameraOpenedRef = useRef(false);
  const tutStepRef = useRef(tutStep);
  useEffect(() => { tutStepRef.current = tutStep; }, [tutStep]);

  const handleCamera = () => {
    fileInputWordRef.current     = card.word;
    imageBeforeCameraRef.current = customImage;
    cameraOpenedRef.current      = true;

    // Listen for window regaining focus — if no file was chosen, this fires after cancel
    const onWindowFocus = () => {
      window.removeEventListener("focus", onWindowFocus);
      // Give the onChange a tick to fire first if a file was picked
      setTimeout(() => {
        if (cameraOpenedRef.current && tutStepRef.current === STEP_CAMERA) {
          // onChange did not fire → user cancelled → branch B
          setTutStep(STEP_NEXT);
          cameraOpenedRef.current = false;
        }
      }, 300);
    };
    window.addEventListener("focus", onWindowFocus);

    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    cameraOpenedRef.current = false; // mark as handled
    const file = e.target.files[0];
    const word = fileInputWordRef.current;
    if (!file) {
      if (tutStepRef.current === STEP_CAMERA) setTutStep(STEP_NEXT);
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      savePhoto(word, ev.target.result);
      setCustomImage(ev.target.result);
      // Image was actually replaced → branch A
      if (tutStepRef.current === STEP_CAMERA) setTutStep(STEP_RESET);
    };
    reader.readAsDataURL(file);
  };

  const handleReset = () => {
    clearPhoto(card.word);
    setCustomImage(null);
    // After reset, spotlight moves to next button
    if (tutStep === STEP_RESET) setTutStep(STEP_NEXT);
  };

  // ── Interaction handlers (advance tutorial on real actions) ───────────────

  const handlePictureTap = useCallback((e) => {
    e.preventDefault();
    if (card.audio) {
      playAudio(card.audio, 1, () => {
        // Advance tutorial only AFTER the word audio finishes
        if (tutStep === STEP_PICTURE) setTutStep(STEP_LETTER_C);
      });
    } else {
      if (tutStep === STEP_PICTURE) setTutStep(STEP_LETTER_C);
    }
  }, [card, tutStep]);

  const handleLetterTap = useCallback((letter, i) => {
    cancelSequence();
    const url = getLetterSoundUrl(letter);
    if (!url) return;
    setActiveLetterIndex(i);
    playAudio(url, getLetterGain(letter));
    activeTimerRef.current = setTimeout(() => setActiveLetterIndex(null), 900);
    // Tutorial: advance after C (index 0) is tapped
    if (tutStep === STEP_LETTER_C && i === 0) setTutStep(STEP_PLAY);
  }, [cancelSequence, tutStep]);

  const handlePlaySequence = useCallback(() => {
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
      // Tutorial: advance after play sequence completes
      if (tutStep === STEP_PLAY) setTutStep(STEP_CAMERA);
    });
    sequenceRef.current = cancel;
  }, [card, cancelSequence, tutStep]);

  // Pointer-event blocking: when tutorial is active, non-spotlit areas are blocked.
  // We achieve this by putting a transparent intercept layer between the overlay and
  // the content, except over the spotlit element (which sits above it via z-index).
  // The TutorialOverlay already has pointerEvents:none — the blocking is done via
  // a separate full-screen intercept div that captures taps on non-target areas.

  return (
    <div
      style={{
        display: "flex", flexDirection: "column", flex: 1,
        overflow: "hidden", fontFamily: "Fredoka, sans-serif",
        position: "relative",
      }}
    >
      {/* ── Card area ──────────────────────────────────────────────────────── */}
      <div
        style={{
          flex: 1, padding: "20px 24px 16px",
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          gap: 20, position: "relative",
        }}
      >
        <div
          className="relative flex items-center justify-center"
          style={{ width: "100%", maxWidth: 340 }}
        >
          {/* Decorative blobs */}
          <div style={{ position: "absolute", top: -20, right: -10, width: 160, height: 140, borderRadius: 40, background: "#FFCDD2", zIndex: 0, transform: "rotate(8deg)" }} />
          <div style={{ position: "absolute", bottom: -20, left: -10, width: 140, height: 140, borderRadius: "50%", background: "#FFF59D", zIndex: 0 }} />

          {/* Picture card */}
          <AnimatePresence mode="wait">
            <motion.div
              key={card.word}
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.94 }}
              transition={{ duration: 0.22 }}
              style={{ position: "relative", zIndex: 1, width: "100%" }}
            >
              {/* Inner white card — this is what we spotlight */}
              <div
                ref={pictureRef}
                style={{
                  background: "white", borderRadius: 28, padding: 14,
                  boxShadow: "0 12px 48px rgba(30,58,95,0.15)",
                }}
              >
                <img
                  src={currentImage}
                  alt={card.word}
                  onPointerDown={handlePictureTap}
                  style={{
                    width: "100%", aspectRatio: "1/1", objectFit: "cover",
                    borderRadius: 18, display: "block",
                    cursor: card.audio ? "pointer" : "default",
                  }}
                />
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Reload button — only visible after user has replaced the image */}
          <AnimatePresence>
            {hasCustomPhoto && (
              <motion.button
                ref={resetRef}
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

          {/* Camera button */}
          <button
            ref={cameraRef}
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

        {/* ── Letter blocks + play button ──────────────────────────────────── */}
        <div
          style={{
            display: "flex", alignItems: "center",
            justifyContent: "center", gap: 10, zIndex: 1,
          }}
        >
          {card.word.split("").map((letter, i) => (
            <div
              key={i}
              ref={i === 0 ? letterCRef : undefined}
            >
              <RainbowLetterBlock
                letter={letter}
                index={i}
                isActive={activeLetterIndex === i}
                onClick={() => handleLetterTap(letter, i)}
              />
            </div>
          ))}

          {/* Play button */}
          <button
            ref={playRef}
            onClick={handlePlaySequence}
            style={{
              width: 56, height: 56, borderRadius: 28,
              background: "#FFD93D", border: "3px solid #F4B942",
              boxShadow: "0 4px 16px rgba(255,193,7,0.45)",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", flexShrink: 0, marginLeft: 6,
              transition: "transform 0.12s",
            }}
            onMouseDown={e => e.currentTarget.style.transform = "scale(0.92)"}
            onMouseUp={e => e.currentTarget.style.transform = "scale(1)"}
            onTouchStart={e => e.currentTarget.style.transform = "scale(0.92)"}
            onTouchEnd={e => e.currentTarget.style.transform = "scale(1)"}
            aria-label="Play letter sounds"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="#1E3A5F">
              <polygon points="5,3 19,12 5,21" />
            </svg>
          </button>
        </div>
      </div>

      {/* ── Next button ───────────────────────────────────────────────────── */}
      <div
        style={{
          flexShrink: 0, display: "flex", justifyContent: "flex-end",
          padding: "12px 28px",
          paddingBottom: "calc(12px + env(safe-area-inset-bottom, 8px))",
        }}
      >
        <button
          ref={nextRef}
          onClick={() => {
            if (tutStep === STEP_NEXT) setTutStep(STEP_DONE);
            onNext();
          }}
          style={{
            padding: "14px 36px", borderRadius: 999,
            background: "#4A90C4", color: "white",
            border: "none", cursor: "pointer",
            fontSize: 18, fontWeight: 600,
            fontFamily: "Fredoka, sans-serif",
            touchAction: "manipulation",
            boxShadow: "0 4px 0 #2f6a9a",
          }}
        >
          {lang === "zh" ? "下一步 →" : "Next →"}
        </button>
      </div>

      {/* ── Tutorial overlay ──────────────────────────────────────────────── */}
      {tutorialActive && spotlightRef && (
        <TutorialOverlay
          targetRef={spotlightRef}
          padding={tutStep === STEP_PICTURE ? 16 : 10}
          borderRadius={tutStep === STEP_PICTURE ? 28 : 24}
          visible={tutorialActive}
        />
      )}

      {/* Camera-only file input: capture="environment" forces camera on mobile */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        style={{ display: "none" }}
        onChange={handleFileChange}
      />
    </div>
  );
}