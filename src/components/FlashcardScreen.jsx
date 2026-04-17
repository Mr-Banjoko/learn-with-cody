import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera } from "lucide-react";
import BackArrow from "./BackArrow";
import { shortAWords } from "../lib/shortAWords";
import { getLetterSoundUrl, getLetterGain } from "../lib/letterSounds";
import RainbowLetterBlock from "./RainbowLetterBlock";
import { playAudio, preloadAudio, playAudioSequence, warmupAudio } from "../lib/useAudio";
import { captureFlashcard } from "../lib/captureFlashcard";

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

  // Per-card captured photo dataURL: { [cardIndex]: string }
  const [photos, setPhotos] = useState({});
  // Per-card save state: "idle" | "saving" | "saved"
  const [saveState, setSaveState] = useState({});

  const sequenceRef = useRef(null);
  const activeTimerRef = useRef(null);
  const fileInputRef = useRef(null);
  const fileInputCardRef = useRef(0);

  const card = wordList[index];
  const total = wordList.length;
  const capturedPhoto = photos[index] || null;
  const hasPhoto = capturedPhoto !== null;
  const displayImage = capturedPhoto || card.image;
  const currentSaveState = saveState[index] || "idle";

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
    // iOS Safari: .click() must be synchronous inside a user gesture — no setTimeout.
    fileInputCardRef.current = index;
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const targetIdx = fileInputCardRef.current;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setPhotos((prev) => ({ ...prev, [targetIdx]: ev.target.result }));
      setSaveState((prev) => ({ ...prev, [targetIdx]: "idle" }));
    };
    reader.readAsDataURL(file);
    // Do NOT reset e.target.value — breaks subsequent picks on iOS Safari.
  };

  // ── NEW screenshot-based save ─────────────────────────────────────────────
  // Uses captureFlashcard() to composite a clean canvas image of the card
  // content (image + letter blocks). No DOM scraping, no html2canvas.
  // Works reliably on every card, every save, on mobile and desktop.
  const handleSave = useCallback(async () => {
    if (currentSaveState === "saving") return;

    const currentIndex = index;
    const currentCard = wordList[currentIndex];
    const currentPhoto = photos[currentIndex] || null;

    setSaveState((prev) => ({ ...prev, [currentIndex]: "saving" }));

    const screenshotDataUrl = await captureFlashcard({
      word: currentCard.word,
      photoDataUrl: currentPhoto,
      cardImageUrl: currentCard.image,
    });

    const entry = {
      id: Date.now(),
      word: currentCard.word,
      audio: currentCard.audio || null,
      // type = "screenshot" tells Album to render it as a full-screen image
      type: "screenshot",
      screenshotDataUrl,
      date: new Date().toLocaleDateString(),
    };

    try {
      const album = JSON.parse(localStorage.getItem("cody_album") || "[]");
      album.push(entry);
      localStorage.setItem("cody_album", JSON.stringify(album));
    } catch (err) {
      console.error("[Save] localStorage write failed:", err);
      setSaveState((prev) => ({ ...prev, [currentIndex]: "idle" }));
      return;
    }

    setSaveState((prev) => ({ ...prev, [currentIndex]: "saved" }));
    setTimeout(() => {
      setSaveState((prev) => ({ ...prev, [currentIndex]: "idle" }));
    }, 2000);
  }, [index, photos, wordList, currentSaveState]);

  const isSaving = currentSaveState === "saving";
  const isSaved = currentSaveState === "saved";

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", flex: 1, background: "linear-gradient(160deg, #E8FFFE 0%, #FFF9E6 60%, #F5F0FF 100%)", fontFamily: "Fredoka, sans-serif", overflow: "hidden" }}>
      {/* Header */}
      <div style={{ background: "rgba(255,255,255,0.75)", backdropFilter: "blur(10px)", borderBottom: "1.5px solid rgba(0,0,0,0.06)", padding: "10px 20px 14px", display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
        <BackArrow onPress={onBack} />
        <h1 style={{ flex: 1, textAlign: "center", fontSize: 24, fontWeight: 700, color: "#1E293B", marginRight: 40 }}>{screenTitle}</h1>
      </div>

      {/* Card area */}
      <div style={{ flex: 1, padding: "20px 24px 16px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 20, position: "relative" }}>

        <div style={{ position: "relative", width: "100%", maxWidth: 340 }}>
          {/* Decorative blobs */}
          <div style={{ position: "absolute", top: -20, right: -10, width: 160, height: 140, borderRadius: 40, background: "#FFCDD2", zIndex: 0, transform: "rotate(8deg)" }} />
          <div style={{ position: "absolute", bottom: -20, left: -10, width: 140, height: 140, borderRadius: "50%", background: "#FFF59D", zIndex: 0 }} />

          {/* Animated card image — NO buttons inside */}
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

          {/* Save button — shown always when enableSave; no photo required (saves card as-is) */}
          {enableSave && (
            <motion.button
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={handleSave}
              disabled={isSaving}
              style={{
                position: "absolute", bottom: 32, right: 88,
                width: 48, height: 48, borderRadius: 24,
                background: isSaved ? "#E8FFF8" : "white",
                boxShadow: "0 4px 16px rgba(0,0,0,0.18)",
                border: "none", cursor: isSaving ? "wait" : "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                zIndex: 10, touchAction: "manipulation",
                transition: "background 0.3s",
                opacity: isSaving ? 0.6 : 1,
              }}
              aria-label="Save to Album"
            >
              {isSaving ? (
                <div style={{ width: 20, height: 20, borderRadius: "50%", border: "2.5px solid #A8D0E6", borderTopColor: "transparent", animation: "spin 0.7s linear infinite" }} />
              ) : (
                <SaveIcon color={isSaved ? "#4ECDC4" : "#A8D0E6"} size={24} />
              )}
            </motion.button>
          )}

          {/* Camera button */}
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

      {/* Spin keyframe for saving spinner */}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {/* Single persistent input — no key remounting, no value reset. */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={handleFileChange}
      />
    </div>
  );
}