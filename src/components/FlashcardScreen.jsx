import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera } from "lucide-react";
import BackArrow from "./BackArrow";
import { shortAWords } from "../lib/shortAWords";
import { getLetterSoundUrl, getLetterGain } from "../lib/letterSounds";
import RainbowLetterBlock from "./RainbowLetterBlock";
import { playAudio, preloadAudio, playAudioSequence, warmupAudio } from "../lib/useAudio";

function SaveIcon({ color = "#A8D0E6", size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="3" x2="12" y2="15" />
      <polyline points="7,10 12,15 17,10" />
      <path d="M5 19 Q5 21 7 21 L17 21 Q19 21 19 19" />
    </svg>
  );
}

const LETTER_COLORS = ["#FFAFC5", "#A8D8EA", "#FFE57A", "#B5EAD7", "#FFDAC1"];

function LetterBlock({ letter, index }) {
  return (
    <div style={{ width: 72, height: 72, borderRadius: 18, background: LETTER_COLORS[index % LETTER_COLORS.length], display: "flex", alignItems: "center", justifyContent: "center", fontSize: 42, fontWeight: 700, color: "#1E3A5F", fontFamily: "Fredoka, sans-serif", boxShadow: "0 4px 12px rgba(0,0,0,0.10)" }}>
      {letter}
    </div>
  );
}

export default function FlashcardScreen({ onBack, words, title, enableLetterSounds, enableSave = false, lang = "en" }) {
  const wordList = words || shortAWords;
  const screenTitle = title || "Short a Words";

  const [index, setIndex] = useState(0);
  const [activeLetterIndex, setActiveLetterIndex] = useState(null);

  // Per-card captured photo: { [cardIndex]: string (dataURL) }
  const [photos, setPhotos] = useState({});
  // Per-card justSaved flag: { [cardIndex]: bool }
  const [savedFlags, setSavedFlags] = useState({});

  const sequenceRef = useRef(null);
  const activeTimerRef = useRef(null);

  // iOS Safari fix: we track a counter to force-remount the file input on every use.
  // Safari suppresses onChange on a reused <input type="file"> — the only reliable fix
  // is to unmount and remount the element entirely before each use.
  const [fileInputKey, setFileInputKey] = useState(0);
  const fileInputRef = useRef(null);

  const fileInputCardRef = useRef(0);
  const saveRef = useRef(null);

  const card = wordList[index];
  const total = wordList.length;
  const capturedPhoto = photos[index] || null;
  const hasPhoto = capturedPhoto !== null;
  const displayImage = capturedPhoto || card.image;
  const justSaved = savedFlags[index] || false;

  // THE REAL FIX: saveRef is updated on every single render.
  // The button's onClick calls saveRef.current() which always runs
  // the latest closure — never a stale one from a previous card.
  saveRef.current = () => {
    const currentIndex = index;
    const currentCard = wordList[currentIndex];
    const currentPhoto = photos[currentIndex];

    if (!currentPhoto) return;

    const entry = {
      id: Date.now(),
      word: currentCard.word,
      audio: currentCard.audio || null,
      image: currentPhoto,
      date: new Date().toLocaleDateString(),
    };

    try {
      const album = JSON.parse(localStorage.getItem("cody_album") || "[]");
      album.push(entry);
      localStorage.setItem("cody_album", JSON.stringify(album));
    } catch (err) {
      console.error("[Save] localStorage write failed:", err);
      return;
    }

    setSavedFlags((prev) => ({ ...prev, [currentIndex]: true }));

    const capturedIdx = currentIndex;
    setTimeout(() => {
      setSavedFlags((prev) => ({ ...prev, [capturedIdx]: false }));
    }, 2000);
  };

  // Preload assets once
  useEffect(() => {
    wordList.forEach((c) => { const img = new Image(); img.src = c.image; });
    const audioUrls = wordList.map((c) => c.audio).filter(Boolean);
    if (audioUrls.length > 0) preloadAudio(audioUrls);
    if (enableLetterSounds) {
      const letters = [...new Set(wordList.flatMap((c) => c.word.split("")))];
      const letterUrls = letters.map(getLetterSoundUrl).filter(Boolean);
      if (letterUrls.length > 0) warmupAudio(letterUrls);
    }
  }, []);

  const cancelSequence = useCallback(() => {
    if (sequenceRef.current) { sequenceRef.current(); sequenceRef.current = null; }
    if (activeTimerRef.current) { clearTimeout(activeTimerRef.current); activeTimerRef.current = null; }
  }, []);

  useEffect(() => {
    cancelSequence();
    setActiveLetterIndex(null);
  }, [index]);

  const handleLetterTap = useCallback((letter, i) => {
    cancelSequence();
    const url = getLetterSoundUrl(letter);
    if (!url) return;
    setActiveLetterIndex(i);
    playAudio(url, getLetterGain(letter));
    activeTimerRef.current = setTimeout(() => setActiveLetterIndex(null), 900);
  }, [cancelSequence]);

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
    const cancel = playAudioSequence(steps, () => { setActiveLetterIndex(null); sequenceRef.current = null; });
    sequenceRef.current = cancel;
  }, [card, cancelSequence]);

  const handleCamera = () => {
    fileInputCardRef.current = index;
    // iOS Safari fix: bump key to remount the input element fresh before clicking.
    // Without this, Safari silently ignores onChange after the first pick.
    setFileInputKey((k) => k + 1);
    // Click must happen after the remount — use a tiny timeout so React flushes the
    // new input into the DOM before we programmatically click it.
    setTimeout(() => {
      if (fileInputRef.current) fileInputRef.current.click();
    }, 0);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const targetIdx = fileInputCardRef.current;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setPhotos((prev) => ({ ...prev, [targetIdx]: ev.target.result }));
      setSavedFlags((prev) => ({ ...prev, [targetIdx]: false }));
    };
    reader.readAsDataURL(file);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", flex: 1, background: "linear-gradient(160deg, #E8FFFE 0%, #FFF9E6 60%, #F5F0FF 100%)", fontFamily: "Fredoka, sans-serif", overflow: "hidden" }}>
      {/* Header */}
      <div style={{ background: "rgba(255,255,255,0.75)", backdropFilter: "blur(10px)", borderBottom: "1.5px solid rgba(0,0,0,0.06)", padding: "10px 20px 14px", display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
        <BackArrow onPress={onBack} />
        <h1 style={{ flex: 1, textAlign: "center", fontSize: 24, fontWeight: 700, color: "#1E293B", marginRight: 40 }}>{screenTitle}</h1>
      </div>

      {/* Card area */}
      <div style={{ flex: 1, padding: "20px 24px 16px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 20, position: "relative" }}>

        {/*
          STRUCTURAL FIX:
          The save and camera buttons are OUTSIDE the AnimatePresence/motion.div card frame.
          They are positioned absolutely relative to a wrapper div that encompasses the card.
          This means framer-motion exit animations on the card NEVER capture a stale onClick
          on the save button — the button lives in normal React render flow, not inside
          an exiting motion node.
        */}
        <div style={{ position: "relative", width: "100%", maxWidth: 340 }}>
          {/* Decorative blobs */}
          <div style={{ position: "absolute", top: -20, right: -10, width: 160, height: 140, borderRadius: 40, background: "#FFCDD2", zIndex: 0, transform: "rotate(8deg)" }} />
          <div style={{ position: "absolute", bottom: -20, left: -10, width: 140, height: 140, borderRadius: "50%", background: "#FFF59D", zIndex: 0 }} />

          {/* Animated card image only — NO buttons inside */}
          <AnimatePresence mode="wait">
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.94 }}
              transition={{ duration: 0.22 }}
              style={{ position: "relative", zIndex: 1, background: "white", borderRadius: 28, padding: 14, boxShadow: "0 12px 48px rgba(30,58,95,0.15)", width: "100%" }}
            >
              <img
                src={displayImage}
                alt={card.word}
                onPointerDown={(e) => { e.preventDefault(); card.audio && playAudio(card.audio); }}
                style={{ width: "100%", aspectRatio: "1/1", objectFit: "cover", borderRadius: 18, display: "block", cursor: card.audio ? "pointer" : "default" }}
              />
            </motion.div>
          </AnimatePresence>

          {/*
            Buttons live OUTSIDE the animated card — they are always in the live
            React tree with fresh closures. saveRef.current() is called so the
            handler is ALWAYS the latest one regardless of animation state.
          */}

          {/* Save button — shown only when this card has a captured photo */}
          {enableSave && hasPhoto && (
            <motion.button
              key={`save-btn-${index}`}
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.7 }}
              onClick={() => saveRef.current()}
              style={{
                position: "absolute", bottom: 32, right: 88,
                width: 48, height: 48, borderRadius: 24,
                background: justSaved ? "#E8FFF8" : "white",
                boxShadow: "0 4px 16px rgba(0,0,0,0.18)",
                border: "none", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                zIndex: 10, touchAction: "manipulation",
                transition: "background 0.3s",
              }}
              aria-label="Save to Album"
            >
              <SaveIcon color={justSaved ? "#4ECDC4" : "#A8D0E6"} size={24} />
            </motion.button>
          )}

          {/* Camera button — always shown */}
          <button
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

        {/* Letter blocks */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, zIndex: 1 }}>
          {enableLetterSounds ? (
            <>
              {card.word.split("").map((letter, i) => (
                <RainbowLetterBlock key={i} letter={letter} index={i} isActive={activeLetterIndex === i} onClick={() => handleLetterTap(letter, i)} />
              ))}
              <button
                onClick={handlePlaySequence}
                style={{ width: 56, height: 56, borderRadius: 28, background: "#FFD93D", border: "3px solid #F4B942", boxShadow: "0 4px 16px rgba(255,193,7,0.45)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0, marginLeft: 6, transition: "transform 0.12s" }}
                onMouseDown={e => e.currentTarget.style.transform = "scale(0.92)"}
                onMouseUp={e => e.currentTarget.style.transform = "scale(1)"}
                onTouchStart={e => e.currentTarget.style.transform = "scale(0.92)"}
                onTouchEnd={e => e.currentTarget.style.transform = "scale(1)"}
                aria-label="Play letter sounds"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="#1E3A5F"><polygon points="5,3 19,12 5,21" /></svg>
              </button>
            </>
          ) : (
            card.word.split("").map((letter, i) => <LetterBlock key={i} letter={letter} index={i} />)
          )}
        </div>
      </div>

      {/* Previous / Next */}
      <div style={{ flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 28px", paddingBottom: "calc(12px + env(safe-area-inset-bottom, 8px))", maxWidth: 480, width: "100%", alignSelf: "center", boxSizing: "border-box" }}>
        <button onClick={() => { if (index > 0) setIndex(index - 1); }} disabled={index === 0} style={{ padding: "14px 28px", borderRadius: 999, background: index === 0 ? "#C5DCF0" : "#A8C8E0", color: index === 0 ? "#9CB8CC" : "#1E3A5F", border: "none", cursor: index === 0 ? "not-allowed" : "pointer", fontSize: 18, fontWeight: 600, fontFamily: "Fredoka, sans-serif", opacity: index === 0 ? 0.6 : 1, minWidth: 110, touchAction: "manipulation" }}>
          {lang === "zh" ? "上一张" : "Previous"}
        </button>
        <span style={{ fontSize: 20, fontWeight: 700, color: "#1E3A5F" }}>{index + 1}/{total}</span>
        <button onClick={() => { if (index < total - 1) setIndex(index + 1); }} disabled={index === total - 1} style={{ padding: "14px 28px", borderRadius: 999, background: index === total - 1 ? "#C5DCF0" : "#4A90C4", color: index === total - 1 ? "#9CB8CC" : "white", border: "none", cursor: index === total - 1 ? "not-allowed" : "pointer", fontSize: 18, fontWeight: 600, fontFamily: "Fredoka, sans-serif", opacity: index === total - 1 ? 0.6 : 1, minWidth: 110, touchAction: "manipulation" }}>
          {lang === "zh" ? "下一张" : "Next"}
        </button>
      </div>

      {/* key={fileInputKey} forces a full remount on every camera open — the ONLY
          reliable way to get Safari/iOS to fire onChange more than once.
          capture attribute removed: "environment" locks to camera-only on iOS and
          is less reliable than letting the user choose camera or photo library. */}
      <input
        key={fileInputKey}
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={handleFileChange}
      />
    </div>
  );
}