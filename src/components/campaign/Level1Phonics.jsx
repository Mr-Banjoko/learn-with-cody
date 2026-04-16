/**
 * Level1Phonics — wraps the existing FlashcardScreen for a single word.
 * Shows only that one word; "Next" calls onNext(); no back/navigation noise.
 */
import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, Check, BookImage } from "lucide-react";
import RainbowLetterBlock from "../RainbowLetterBlock";
import { getLetterSoundUrl, getLetterGain } from "../../lib/letterSounds";
import { playAudio, preloadAudio, playAudioSequence, warmupAudio } from "../../lib/useAudio";

const LETTER_COLORS = ["#FFAFC5", "#A8D8EA", "#FFE57A", "#B5EAD7", "#FFDAC1"];

export default function Level1Phonics({ card, onNext, lang = "en" }) {
  const [customImage, setCustomImage] = useState(null);
  const [justSaved, setJustSaved] = useState(false);
  const [activeLetterIndex, setActiveLetterIndex] = useState(null);
  const sequenceRef = useRef(null);
  const activeTimerRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    cancelSequence();
    setActiveLetterIndex(null);
    setCustomImage(null);
    setJustSaved(false);
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
    reader.onload = (ev) => setCustomImage(ev.target.result);
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleSave = async () => {
    // Store structured data — not a screenshot — so Album can render clean interactive card
    const imageToSave = customImage || card.image;
    const album = JSON.parse(localStorage.getItem("cody_album") || "[]");
    album.push({
      id: Date.now(),
      word: card.word,
      image: imageToSave,
      audio: card.audio || null,
      date: new Date().toLocaleDateString(),
    });
    localStorage.setItem("cody_album", JSON.stringify(album));
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 2000);
  };

  const currentImage = customImage || card.image;

  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden", fontFamily: "Fredoka, sans-serif" }}>
      {/* Card area */}
      <div
        style={{ flex: 1, padding: "20px 24px 16px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 20, position: "relative" }}
      >
        <div className="relative flex items-center justify-center" style={{ width: "100%", maxWidth: 340 }}>
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
              <img
                src={currentImage}
                alt={card.word}
                onPointerDown={(e) => { e.preventDefault(); card.audio && playAudio(card.audio); }}
                style={{ width: "100%", aspectRatio: "1/1", objectFit: "cover", borderRadius: 18, display: "block", cursor: card.audio ? "pointer" : "default" }}
              />
              {/* Camera + Save buttons container */}
              <div style={{ position: "absolute", bottom: 18, right: 18, display: "flex", gap: 10, alignItems: "center", zIndex: 2 }}>
                <AnimatePresence>
                  {customImage && (
                    <motion.button
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      onClick={handleSave}
                      style={{ width: 44, height: 44, borderRadius: 22, background: "white", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 10px rgba(0,0,0,0.10)", transition: "background 0.3s", touchAction: "manipulation" }}
                    >
                      {justSaved ? <Check size={20} color="#4ECDC4" /> : <BookImage size={20} color="#4A90C4" />}
                    </motion.button>
                  )}
                </AnimatePresence>
                <button onClick={handleCamera} style={{ width: 44, height: 44, borderRadius: 22, background: "white", boxShadow: "0 2px 10px rgba(0,0,0,0.10)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Camera size={20} color="#A8D0E6" strokeWidth={2.2} />
                </button>
              </div>
              </motion.div>
              </AnimatePresence>
              </div>

        {/* Letter blocks + play button */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, zIndex: 1 }}>
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

      {/* Next button */}
      <div style={{ flexShrink: 0, display: "flex", justifyContent: "flex-end", padding: "12px 28px", paddingBottom: "calc(12px + env(safe-area-inset-bottom, 8px))" }}>
        <button
          onClick={onNext}
          style={{ padding: "14px 36px", borderRadius: 999, background: "#4A90C4", color: "white", border: "none", cursor: "pointer", fontSize: 18, fontWeight: 600, fontFamily: "Fredoka, sans-serif", touchAction: "manipulation", boxShadow: "0 4px 0 #2f6a9a" }}
        >
          {lang === "zh" ? "下一步 →" : "Next →"}
        </button>
      </div>

      <input ref={fileInputRef} type="file" accept="image/*" capture="environment" style={{ display: "none" }} onChange={handleFileChange} />
    </div>
  );
}