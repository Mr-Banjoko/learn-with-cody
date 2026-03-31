import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Camera, Save, Check } from "lucide-react";
import html2canvas from "html2canvas";
import { shortAWords } from "../lib/shortAWords";
import { getLetterSoundUrl } from "../lib/letterSounds";
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

export default function FlashcardScreen({ onBack, words, title, enableLetterSounds }) {
  const wordList = words || shortAWords;
  const screenTitle = title || "Short a Words";
  const [index, setIndex] = useState(0);
  const [customImages, setCustomImages] = useState({});
  const [justSaved, setJustSaved] = useState(false);
  const [activeLetterIndex, setActiveLetterIndex] = useState(null);
  const sequenceRef = useRef(null);
  const activeTimerRef = useRef(null);
  const captureRef = useRef(null);
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
    // Preload word audio
    const audioUrls = wordList.map((c) => c.audio).filter(Boolean);
    if (audioUrls.length > 0) preloadAudio(audioUrls);
    // Preload and warm up all letter sounds if enabled
    if (enableLetterSounds) {
      const letters = [...new Set(wordList.flatMap((c) => c.word.split("")))];      const letterUrls = letters.map(getLetterSoundUrl).filter(Boolean);
      // warmupAudio: resolves blob URLs + warms browser audio engine so first tap is instant
      if (letterUrls.length > 0) warmupAudio(letterUrls);
    }
  }, []);

  const card = wordList[index];
  const total = wordList.length;
  const currentImage = customImages[index] || card.image;
  const hasCustom = !!customImages[index];

  const cancelSequence = useCallback(() => {
    if (sequenceRef.current) {
      sequenceRef.current(); // call the cancel function returned by playAudioSequence
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
    playAudio(url);
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
          onStart: () => setActiveLetterIndex(i),
        };
      })
      .filter(Boolean);

    // Append full word audio at the end of the letter sequence
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

  const handleSave = async () => {
    if (!captureRef.current) return;
    const canvas = await html2canvas(captureRef.current, {
      scale: 2, useCORS: true, allowTaint: true, backgroundColor: "#D6EEFF",
    });
    const dataUrl = canvas.toDataURL("image/png");
    const album = JSON.parse(localStorage.getItem("cody_album") || "[]");
    album.push({ id: Date.now(), word: card.word, snapshot: dataUrl, date: new Date().toLocaleDateString() });
    localStorage.setItem("cody_album", JSON.stringify(album));
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 2000);
  };

  return (
    <div className="min-h-full flex flex-col pb-32" style={{ background: "#D6EEFF", fontFamily: "Fredoka, sans-serif" }}>
      <div style={{ background: "#A8D0E6", borderBottomLeftRadius: 28, borderBottomRightRadius: 28, padding: "16px 20px 20px", display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
        <button onClick={onBack} style={{ width: 40, height: 40, borderRadius: 20, background: "rgba(255,255,255,0.7)", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
          <ArrowLeft size={22} color="#1E3A5F" />
        </button>
        <h1 style={{ flex: 1, textAlign: "center", fontSize: 24, fontWeight: 700, color: "#1E3A5F", marginRight: 40 }}>{screenTitle}</h1>
      </div>

      <div ref={captureRef} style={{ background: "#D6EEFF", padding: "28px 24px 28px", display: "flex", flexDirection: "column", alignItems: "center", gap: 22 }}>
        <div className="relative flex items-center justify-center" style={{ width: "100%", maxWidth: 340 }}>
          <div style={{ position: "absolute", top: -20, right: -10, width: 160, height: 140, borderRadius: 40, background: "#FFCDD2", zIndex: 0, transform: "rotate(8deg)" }} />
          <div style={{ position: "absolute", bottom: -20, left: -10, width: 140, height: 140, borderRadius: "50%", background: "#FFF59D", zIndex: 0 }} />
          <AnimatePresence mode="wait">
            <motion.div key={index} initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.94 }} transition={{ duration: 0.22 }} style={{ position: "relative", zIndex: 1, background: "white", borderRadius: 28, padding: 14, boxShadow: "0 12px 48px rgba(30,58,95,0.15)", width: "100%" }}>
              <img
                src={currentImage}
                alt={card.word}
                onClick={() => card.audio && playAudio(card.audio)}
                style={{ width: "100%", aspectRatio: "1/1", objectFit: "cover", borderRadius: 18, display: "block", cursor: card.audio ? "pointer" : "default" }}
              />
              <button onClick={handleCamera} style={{ position: "absolute", bottom: 18, right: 18, width: 48, height: 48, borderRadius: 24, background: "white", boxShadow: "0 4px 16px rgba(0,0,0,0.18)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2 }}>
                <Camera size={24} color="#A8D0E6" strokeWidth={2.2} />
              </button>
            </motion.div>
          </AnimatePresence>
        </div>

        <AnimatePresence>
          {hasCustom && (
            <motion.button initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} onClick={handleSave} style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 28px", borderRadius: 999, background: justSaved ? "#4ECDC4" : "#5B8DEF", color: "white", border: "none", cursor: "pointer", fontSize: 18, fontWeight: 600, fontFamily: "Fredoka, sans-serif", boxShadow: "0 6px 20px rgba(91,141,239,0.35)", transition: "background 0.3s", zIndex: 1 }}>
              {justSaved ? <Check size={20} /> : <Save size={20} />}
              {justSaved ? "Saved to Album!" : "Save to Album"}
            </motion.button>
          )}
        </AnimatePresence>

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
              {/* Yellow play button */}
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

      <div style={{ position: "fixed", bottom: 80, left: 0, right: 0, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 28px", maxWidth: 480, margin: "0 auto" }}>
        <button onClick={() => { if (index > 0) setIndex(index - 1); }} disabled={index === 0} style={{ padding: "14px 28px", borderRadius: 999, background: index === 0 ? "#C5DCF0" : "#A8C8E0", color: index === 0 ? "#9CB8CC" : "#1E3A5F", border: "none", cursor: index === 0 ? "not-allowed" : "pointer", fontSize: 18, fontWeight: 600, fontFamily: "Fredoka, sans-serif", opacity: index === 0 ? 0.6 : 1, minWidth: 110 }}>Previous</button>
        <span style={{ fontSize: 20, fontWeight: 700, color: "#1E3A5F" }}>{index + 1}/{total}</span>
        <button onClick={() => { if (index < total - 1) setIndex(index + 1); }} disabled={index === total - 1} style={{ padding: "14px 28px", borderRadius: 999, background: index === total - 1 ? "#C5DCF0" : "#4A90C4", color: index === total - 1 ? "#9CB8CC" : "white", border: "none", cursor: index === total - 1 ? "not-allowed" : "pointer", fontSize: 18, fontWeight: 600, fontFamily: "Fredoka, sans-serif", opacity: index === total - 1 ? 0.6 : 1, minWidth: 110 }}>Next</button>
      </div>

      <input ref={fileInputRef} type="file" accept="image/*" capture="environment" style={{ display: "none" }} onChange={handleFileChange} />
    </div>
  );
}