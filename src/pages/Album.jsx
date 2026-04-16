import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, Download, ChevronLeft, ChevronRight } from "lucide-react";
import BackArrow from "../components/BackArrow";

export default function Album({ lang = "en", onBack }) {
  const [items, setItems] = useState([]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("cody_album") || "[]");
    setItems(stored);
    setIndex(0);
  }, []);

  const handleDelete = () => {
    const updated = items.filter((_, i) => i !== index);
    localStorage.setItem("cody_album", JSON.stringify(updated));
    setItems(updated);
    setIndex((prev) => Math.min(prev, updated.length - 1));
  };

  const handleDownload = () => {
    const item = items[index];
    if (!item) return;
    const a = document.createElement("a");
    a.href = item.snapshot;
    a.download = `${item.word || "flashcard"}.png`;
    a.click();
  };

  if (items.length === 0) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
          background: "linear-gradient(160deg, #E8FFFE 0%, #FFF9E6 60%, #F5F0FF 100%)",
          fontFamily: "Fredoka, sans-serif",
          alignItems: "center",
          justifyContent: "center",
          gap: 16,
        }}
      >
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
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        background: "linear-gradient(160deg, #E8FFFE 0%, #FFF9E6 60%, #F5F0FF 100%)",
        fontFamily: "Fredoka, sans-serif",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        style={{
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "calc(env(safe-area-inset-top, 0px) + 12px) 16px 12px",
        }}
      >
        <BackArrow onPress={onBack} />

        <span style={{ fontSize: 18, fontWeight: 700, color: "#1E293B" }}>
          {index + 1} / {items.length}
        </span>

        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={handleDownload}
            style={{
              width: 44, height: 44, borderRadius: 22,
              background: "white", border: "none", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 2px 10px rgba(0,0,0,0.10)",
            }}
          >
            <Download size={20} color="#4A90C4" />
          </button>
          <button
            onClick={handleDelete}
            style={{
              width: 44, height: 44, borderRadius: 22,
              background: "white", border: "none", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 2px 10px rgba(0,0,0,0.10)",
            }}
          >
            <Trash2 size={20} color="#EF4444" />
          </button>
        </div>
      </div>

      {/* Flashcard */}
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "0 24px",
          overflow: "hidden",
        }}
      >
        <AnimatePresence mode="wait">
          <motion.img
            key={index}
            src={item.snapshot}
            alt={item.word}
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.94 }}
            transition={{ duration: 0.2 }}
            style={{
              width: "100%",
              maxWidth: 380,
              borderRadius: 28,
              boxShadow: "0 12px 48px rgba(30,58,95,0.15)",
              objectFit: "contain",
            }}
          />
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div
        style={{
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px 32px",
          paddingBottom: "calc(16px + env(safe-area-inset-bottom, 8px))",
        }}
      >
        <button
          onClick={() => setIndex((i) => Math.max(0, i - 1))}
          disabled={index === 0}
          style={{
            width: 52, height: 52, borderRadius: 26,
            background: index === 0 ? "#E2E8F0" : "white",
            border: "none", cursor: index === 0 ? "not-allowed" : "pointer",
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
            background: index === items.length - 1 ? "#E2E8F0" : "white",
            border: "none", cursor: index === items.length - 1 ? "not-allowed" : "pointer",
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