import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera } from "lucide-react";
import BackArrow from "./BackArrow";
import { shortAWords } from "../lib/shortAWords";
import { getLetterSoundUrl, getLetterGain } from "../lib/letterSounds";
import RainbowLetterBlock from "./RainbowLetterBlock";
import { playAudio, preloadAudio, playAudioSequence, warmupAudio } from "../lib/useAudio";

const LETTER_COLORS = ["#FFAFC5", "#A8D8EA", "#FFE57A", "#B5EAD7", "#FFDAC1"];

function LetterBlock({ letter, index }) {
  return (
    <div
      style={{
        width: 72, height: 72, borderRadius: 18,
        background: LETTER_COLORS[index % LETTER_COLORS.length],
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 42, fontWeight: 700, color: "#1E3A5F",
        fontFamily: "Fredoka, sans-serif",
        boxShadow: "0 4px 12px rgba(0,0,0,0.10)",
      }}
    >
      {letter}
    </div>
  );
}

export default function FlashcardScreen({ onBack, words, title, enableLetterSounds, lang = "en" }) {
  const wordList = words || shortAWords;
  const screenTitle = title || "Short a Words";
  const [index, setIndex] = useState(0);
  const [customImages, setCustomImages] = useState({});
  const [activeLetterIndex, setActiveLetterIndex] = useState(null);
  const sequenceRef = useRef(null);
  const activeTimerRef = useRef(null);
  const fileInputRef = useRef(null);
  // Cancel any running sequence when card changes
  useEffect(() => {
    cancelSequence();
    setActiveLetterIndex(null);
  }, [index]);

  useEffect(() => {
    wordList.forEach((card) => {
      const img = new Image();
      img.src = card.image;
    });
    const audioUrls = wordList.map((c) => c.audio).filter(Boolean);
    if (audioUrls.length > 0) preloadAudio(audioUrls);
    if (enableLetterSounds) {
      const letters = [...new Set(wordList.flatMap((c) => c.word.split("")))];
      const letterUrls = letters.map(getLetterSoundUrl).filter(Boolean);
      if (letterUrls.length > 0) warmupAudio(letterUrls);
    }
  }, []);

  const card = wordList[index];
  const total = wordList.length;
  const currentImage = customImages[index] || card.image;

  const cancelSequence = useCallback(() => {
    if (sequenceRef.current) {
      sequenceRef.current();
      sequenceRef.current = null;
    }
    if (activeTimerRef.current) {
      clearTimeout(activeTimerRef.current);
      activeTimerRef.current = null;
    }
  }, []);

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
    const steps = letters
      .map((letter, i) => {
        const url = getLetterSoundUrl(letter);
        if (!url) return null;
        return {
          url,
          gain: getLetterGain(letter),
          onStart: () => setActiveLetterIndex(i),
        };
      })
      .filter(Boolean);

    if (card.audio) {
      steps.push({
        url: card.audio,
        onStart: () => setActiveLetterIndex(null),
      });
    }

    const cancel = playAudioSequence(steps, () => {
      setActiveLetterIndex(null);
      sequenceRef.current = null;
    });
    sequenceRef.current = cancel;
  }, [card, cancelSequence]);

  const handleCamera = () => fileInputRef.current.click();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setCustomImages((prev) => ({ ...prev, [index]: ev.target.result }));
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", flex: 1, background: "linear-gradient(160deg, #E8FFFE 0%, #FFF9E6 60%, #F5F0FF 100%)", fontFamily: "Fredoka, sans-serif", overflow: "hidden" }}>
      <div style={{ background: "rgba(255,255,255,0.75)", backdropFilter: "blur(10px)", borderBottom: "1.5px solid rgba(0,0,0,0.06)", padding: "10px 20px 14px", display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
        <BackArrow onPress={onBack} />
        <h1 style={{ flex: 1, textAlign: "center", fontSize: 24, fontWeight: 700, color: "#1E293B", marginRight: 40 }}>{screenTitle}</h1>
      </div>

      <div style={{ flex: 1, background: "transparent", padding: "20px 24px 16px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 20, position: "relative" }}>
        <div className="relative flex items-center justify-center" style={{ width: "100%", maxWidth: 340 }}>
          <div style={{ position: "absolute", top: -20, right: -10, width: 160, height: 140, borderRadius: 40, background: "#FFCDD2", zIndex: 0, transform: "rotate(8deg)" }} />
          <div style={{ position: "absolute", bottom: -20, left: -10, width: 140, height: 140, borderRadius: "50%", background: "#FFF59D", zIndex: 0 }} />
          <AnimatePresence mode="wait">
            <motion.div key={index} initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.94 }} transition={{ duration: 0.22 }} style={{ position: "relative", zIndex: 1, background: "white", borderRadius: 28, padding: 14, boxShadow: "0 12px 48px rgba(30,58,95,0.15)", width: "100%" }}>
              <img
                src={currentImage}
                alt={card.word}
                onPointerDown={(e) => { e.preventDefault(); card.audio && playAudio(card.audio); }}
                style={{ width: "100%", aspectRatio: "1/1", objectFit: "cover", borderRadius: 18, display: "block", cursor: card.audio ? "pointer" : "default" }}
              />
              <button onClick={handleCamera} style={{ position: "absolute", bottom: 18, right: 18, width: 48, height: 48, borderRadius: 24, background: "white", boxShadow: "0 4px 16px rgba(0,0,0,0.18)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2 }}>
                <Camera size={24} color="#A8D0E6" strokeWidth={2.2} />
              </button>
            </motion.div>
          </AnimatePresence>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, zIndex: 1 }}>
          {enableLetterSounds ? (
            <>
              {card.word.split("").map((letter, i) => (
                <RainbowLetterBlock
                  key={i}
                  letter={letter}
                  index={i}
                  isActive={activeLetterIndex === i}
                  onClick={() => handleLetterTap(letter, i)}
                />
              ))}
              <button
                onClick={handlePlaySequence}
                style={{
                  width: 56, height: 56, borderRadius: 28,
                  background: "#FFD93D",
                  border: "3px solid #F4B942",
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
            </>
          ) : (
            card.word.split("").map((letter, i) => (
              <LetterBlock key={i} letter={letter} index={i} />
            ))
          )}
        </div>
      </div>

      <div style={{ flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 28px", paddingBottom: "calc(12px + env(safe-area-inset-bottom, 8px))", maxWidth: 480, width: "100%", alignSelf: "center", boxSizing: "border-box" }}>
        <button onClick={() => { if (index > 0) setIndex(index - 1); }} disabled={index === 0} style={{ padding: "14px 28px", borderRadius: 999, background: index === 0 ? "#C5DCF0" : "#A8C8E0", color: index === 0 ? "#9CB8CC" : "#1E3A5F", border: "none", cursor: index === 0 ? "not-allowed" : "pointer", fontSize: 18, fontWeight: 600, fontFamily: "Fredoka, sans-serif", opacity: index === 0 ? 0.6 : 1, minWidth: 110, touchAction: "manipulation" }}>{lang === "zh" ? "上一张" : "Previous"}</button>
        <span style={{ fontSize: 20, fontWeight: 700, color: "#1E3A5F" }}>{index + 1}/{total}</span>
        <button onClick={() => { if (index < total - 1) setIndex(index + 1); }} disabled={index === total - 1} style={{ padding: "14px 28px", borderRadius: 999, background: index === total - 1 ? "#C5DCF0" : "#4A90C4", color: index === total - 1 ? "#9CB8CC" : "white", border: "none", cursor: index === total - 1 ? "not-allowed" : "pointer", fontSize: 18, fontWeight: 600, fontFamily: "Fredoka, sans-serif", opacity: index === total - 1 ? 0.6 : 1, minWidth: 110, touchAction: "manipulation" }}>{lang === "zh" ? "下一张" : "Next"}</button>
      </div>

      <input ref={fileInputRef} type="file" accept="image/*" capture="environment" style={{ display: "none" }} onChange={handleFileChange} />
    </div>
  );
}