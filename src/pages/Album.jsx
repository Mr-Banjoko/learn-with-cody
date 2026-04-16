import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, Download, ChevronLeft, ChevronRight } from "lucide-react";
import html2canvas from "html2canvas";
import BackArrow from "../components/BackArrow";
import RainbowLetterBlock from "../components/RainbowLetterBlock";
import { playAudio, playAudioSequence } from "../lib/useAudio";
import { getLetterSoundUrl, getLetterGain } from "../lib/letterSounds";

export default function Album({ lang = "en", onBack }) {
  const [items, setItems] = useState([]);
  const [index, setIndex] = useState(0);
  const [activeLetterIndex, setActiveLetterIndex] = useState(null);
  const sequenceRef = useRef(null);
  const activeTimerRef = useRef(null);
  const captureRef = useRef(null);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("cody_album") || "[]");
    setItems(stored);
    setIndex(0);
  }, []);

  // Reset letter highlights when card changes
  useEffect(() => {
    cancelSequence();
    setActiveLetterIndex(null);
  }, [index]);

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

  const handlePlaySequence = useCallback((item) => {
    cancelSequence();
    setActiveLetterIndex(null);
    const letters = item.word.split("");
    const steps = letters.map((letter, i) => {
      const url = getLetterSoundUrl(letter);
      if (!url) return null;
      return { url, gain: getLetterGain(letter), onStart: () => setActiveLetterIndex(i) };
    }).filter(Boolean);
    if (item.audio) steps.push({ url: item.audio, onStart: () => setActiveLetterIndex(null) });
    const cancel = playAudioSequence(steps, () => {
      setActiveLetterIndex(null);
      sequenceRef.current = null;
    });
    sequenceRef.current = cancel;
  }, [cancelSequence]);

  const handleDelete = () => {
    const updated = items.filter((_, i) => i !== index);
    localStorage.setItem("cody_album", JSON.stringify(updated));
    setItems(updated);
    setIndex((prev) => Math.min(prev, Math.max(0, updated.length - 1)));
  };

  const handleDownload = async () => {
    if (!captureRef.current) return;
    const canvas = await html2canvas(captureRef.current, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: "#E8FFFE",
    });
    const dataUrl = canvas.toDataURL("image/png");

    // Try Web Share API (iOS/Android "Save to Photos")
    const res = await fetch(dataUrl);
    const blob = await res.blob();
    const file = new File([blob], `${items[index]?.word || "flashcard"}.png`, { type: "image/png" });
    if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({ files: [file], title: items[index]?.word || "Flashcard" });
        return;
      } catch (e) { /* user cancelled — fall through */ }
    }

    // Fallback download
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = file.name;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (items.length === 0) {
    return (
      <div style={{
        display: "flex", flexDirection: "column", height: "100%",
        background: "linear-gradient(160deg, #E8FFFE 0%, #FFF9E6 60%, #F5F0FF 100%)",
        fontFamily: "Fredoka, sans-serif", alignItems: "center", justifyContent: "center", gap: 16,
      }}>
        <div style={{ position: "absolute", top: "calc(env(safe-area-inset-top, 0px) + 12px)", left: 16 }}>
          <BackArrow onPress={onBack} />
        </div>
        <span style={{ fontSize: 64 }}>📭</span>
        <p style={{ fontSize: 22, fontWeight: 600, color: "#64748B" }}>
          {lang === "zh" ? "相册是空的" : "Album is empty"}
        </p>
        <p style={{ fontSize: 15, color: "#94A3B8" }}>
          {lang === "zh" ? "拍照后保存到相册吧！" : "Save a flashcard photo to see it here!"}
        </p>
      </div>
    );
  }

  const item = items[index];

  return (
    <div style={{
      display: "flex", flexDirection: "column", height: "100%",
      background: "linear-gradient(160deg, #E8FFFE 0%, #FFF9E6 60%, #F5F0FF 100%)",
      fontFamily: "Fredoka, sans-serif", overflow: "hidden",
    }}>
      {/* Header — excluded from export */}
      <div style={{
        flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "calc(env(safe-area-inset-top, 0px) + 12px) 16px 12px",
      }}>
        <BackArrow onPress={onBack} />
        <span style={{ fontSize: 18, fontWeight: 700, color: "#1E293B" }}>
          {index + 1} / {items.length}
        </span>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={handleDownload} style={{
            width: 44, height: 44, borderRadius: 22, background: "white", border: "none",
            cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 2px 10px rgba(0,0,0,0.10)",
          }}>
            <Download size={20} color="#4A90C4" />
          </button>
          <button onClick={handleDelete} style={{
            width: 44, height: 44, borderRadius: 22, background: "white", border: "none",
            cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 2px 10px rgba(0,0,0,0.10)",
          }}>
            <Trash2 size={20} color="#EF4444" />
          </button>
        </div>
      </div>

      {/* CAPTURE AREA — this is what gets exported */}
      <div
        ref={captureRef}
        style={{
          flex: 1, display: "flex", flexDirection: "column", alignItems: "center",
          justifyContent: "center", padding: "40px 24px",
          background: "linear-gradient(160deg, #E8FFFE 0%, #FFF9E6 60%, #F5F0FF 100%)",
          overflow: "hidden", minHeight: 0,
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.94 }}
            transition={{ duration: 0.2 }}
            style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 24, width: "100%", flexShrink: 0 }}
          >
            {/* Framed image — same pink/yellow decorative design as Level1Phonics */}
            <div className="relative flex items-center justify-center" style={{ width: "100%", maxWidth: 340 }}>
              {/* Pink decorative blob */}
              <div style={{
                position: "absolute", top: -20, right: -10, width: 160, height: 140,
                borderRadius: 40, background: "#FFCDD2", zIndex: 0, transform: "rotate(8deg)",
              }} />
              {/* Yellow decorative blob */}
              <div style={{
                position: "absolute", bottom: -20, left: -10, width: 140, height: 140,
                borderRadius: "50%", background: "#FFF59D", zIndex: 0,
              }} />
              {/* White card frame */}
              <div style={{
                position: "relative", zIndex: 1, background: "white", borderRadius: 28,
                padding: 14, boxShadow: "0 12px 48px rgba(30,58,95,0.15)", width: "100%",
              }}>
                <img
                  src={item.image}
                  alt={item.word}
                  onPointerDown={(e) => { e.preventDefault(); item.audio && playAudio(item.audio); }}
                  style={{
                    width: "100%", aspectRatio: "1/1", objectFit: "cover",
                    borderRadius: 18, display: "block", cursor: item.audio ? "pointer" : "default",
                  }}
                />
              </div>
            </div>

            {/* Letter blocks + play button */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, zIndex: 1 }}>
              {item.word.split("").map((letter, i) => (
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
                onPointerDown={(e) => { e.preventDefault(); handlePlaySequence(item); }}
                style={{
                  width: 56, height: 56, borderRadius: 28, background: "#FFD93D",
                  border: "3px solid #F4B942", boxShadow: "0 4px 16px rgba(255,193,7,0.45)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: "pointer", flexShrink: 0, marginLeft: 6,
                }}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="#1E3A5F">
                  <polygon points="5,3 19,12 5,21" />
                </svg>
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation — excluded from export */}
      <div style={{
        flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "16px 32px", paddingBottom: "calc(16px + env(safe-area-inset-bottom, 8px))",
      }}>
        <button
          onClick={() => setIndex((i) => Math.max(0, i - 1))}
          disabled={index === 0}
          style={{
            width: 52, height: 52, borderRadius: 26,
            background: index === 0 ? "#E2E8F0" : "white", border: "none",
            cursor: index === 0 ? "not-allowed" : "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: index === 0 ? "none" : "0 4px 14px rgba(0,0,0,0.10)",
            opacity: index === 0 ? 0.5 : 1,
          }}
        >
          <ChevronLeft size={26} color="#1E293B" />
        </button>
        <button
          onClick={() => setIndex((i) => Math.min(items.length - 1, i + 1))}
          disabled={index === items.length - 1}
          style={{
            width: 52, height: 52, borderRadius: 26,
            background: index === items.length - 1 ? "#E2E8F0" : "white", border: "none",
            cursor: index === items.length - 1 ? "not-allowed" : "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: index === items.length - 1 ? "none" : "0 4px 14px rgba(0,0,0,0.10)",
            opacity: index === items.length - 1 ? 0.5 : 1,
          }}
        >
          <ChevronRight size={26} color="#1E293B" />
        </button>
      </div>
    </div>
  );
}