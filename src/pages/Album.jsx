import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, BookImage } from "lucide-react";

export default function Album() {
  const [cards, setCards] = useState([]);
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("cody_album") || "[]");
    setCards(stored);
  }, []);

  const handleDelete = (id) => {
    const updated = cards.filter((c) => c.id !== id);
    setCards(updated);
    localStorage.setItem("cody_album", JSON.stringify(updated));
  };

  return (
    <div
      className="min-h-full pb-32"
      style={{ background: "#D6EEFF", fontFamily: "Fredoka, sans-serif" }}
    >
      {/* Header */}
      <div
        style={{
          background: "#A8D0E6",
          borderBottomLeftRadius: 28,
          borderBottomRightRadius: 28,
          padding: "16px 20px 20px",
          textAlign: "center",
        }}
      >
        <h1 style={{ fontSize: 26, fontWeight: 700, color: "#1E3A5F" }}>My Album 📸</h1>
        <p style={{ fontSize: 14, color: "#3A6080", marginTop: 2 }}>Your saved flashcards</p>
      </div>

      <div className="px-4 pt-6">
        {cards.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center gap-4 mt-16"
          >
            <BookImage size={72} color="#A8D0E6" strokeWidth={1.5} />
            <p style={{ fontSize: 20, fontWeight: 600, color: "#4A90C4", textAlign: "center" }}>
              No flashcards saved yet!
            </p>
            <p style={{ fontSize: 15, color: "#7BACC8", textAlign: "center", maxWidth: 260 }}>
              Go to Learn Phonics, take a photo, and save your first flashcard here.
            </p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {cards.map((card, i) => (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                style={{
                  background: "white",
                  borderRadius: 20,
                  overflow: "hidden",
                  boxShadow: "0 6px 20px rgba(30,58,95,0.12)",
                  cursor: "pointer",
                  position: "relative",
                }}
                onClick={() => setPreview(card)}
              >
                <img
                  src={card.snapshot}
                  alt={card.word}
                  style={{ width: "100%", display: "block", objectFit: "cover" }}
                />
                <div style={{ padding: "8px 12px", background: "white" }}>
                  <p style={{ fontSize: 18, fontWeight: 700, color: "#1E3A5F" }}>{card.word}</p>
                  <p style={{ fontSize: 11, color: "#94A3B8" }}>{card.date}</p>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); handleDelete(card.id); }}
                  style={{
                    position: "absolute", top: 8, right: 8,
                    width: 30, height: 30, borderRadius: 15,
                    background: "rgba(255,255,255,0.9)",
                    border: "none", cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}
                >
                  <Trash2 size={14} color="#EF4444" />
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Preview Modal */}
      <AnimatePresence>
        {preview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setPreview(null)}
            style={{
              position: "fixed", inset: 0, zIndex: 100,
              background: "rgba(0,0,0,0.7)",
              display: "flex", alignItems: "center", justifyContent: "center",
              padding: 24,
            }}
          >
            <motion.div
              initial={{ scale: 0.85 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.85 }}
              onClick={(e) => e.stopPropagation()}
              style={{ borderRadius: 24, overflow: "hidden", maxWidth: 340, width: "100%" }}
            >
              <img src={preview.snapshot} alt={preview.word} style={{ width: "100%", display: "block" }} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}