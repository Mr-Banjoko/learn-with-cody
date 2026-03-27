import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookImage, Trash2 } from "lucide-react";

export default function Album() {
  const [cards, setCards] = useState([]);
  const [index, setIndex] = useState(0);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("cody_album") || "[]");
    setCards(stored);
  }, []);

  const total = cards.length;
  const card = cards[index];

  const handleDelete = () => {
    const updated = cards.filter((_, i) => i !== index);
    setCards(updated);
    localStorage.setItem("cody_album", JSON.stringify(updated));
    setIndex((prev) => Math.min(prev, updated.length - 1));
    setConfirmDelete(false);
  };

  return (
    <div
      className="min-h-full flex flex-col pb-32"
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

      <div className="flex-1 flex flex-col items-center justify-center px-6 pt-6">
        {total === 0 ? (
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
          <div className="flex flex-col items-center gap-6 w-full" style={{ maxWidth: 360 }}>
            {/* Card counter */}
            <p style={{ fontSize: 16, fontWeight: 600, color: "#4A90C4" }}>
              {index + 1} of {total}
            </p>

            {/* Flashcard snapshot */}
            <AnimatePresence mode="wait">
              <motion.div
                key={card.id}
                initial={{ opacity: 0, scale: 0.94 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.94 }}
                transition={{ duration: 0.2 }}
                style={{
                  width: "100%",
                  borderRadius: 24,
                  overflow: "hidden",
                  boxShadow: "0 12px 40px rgba(30,58,95,0.15)",
                }}
              >
                <img
                  src={card.snapshot}
                  alt={card.word}
                  style={{ width: "100%", display: "block" }}
                />
              </motion.div>
            </AnimatePresence>

            {/* Word label */}
            <p style={{ fontSize: 22, fontWeight: 700, color: "#1E3A5F" }}>{card.word}</p>

            {/* Delete button */}
            {!confirmDelete ? (
              <button
                onClick={() => setConfirmDelete(true)}
                style={{
                  display: "flex", alignItems: "center", gap: 8,
                  padding: "10px 24px", borderRadius: 999,
                  background: "rgba(239,68,68,0.1)",
                  color: "#EF4444", border: "2px solid rgba(239,68,68,0.25)",
                  fontSize: 16, fontWeight: 600, cursor: "pointer",
                  fontFamily: "Fredoka, sans-serif",
                }}
              >
                <Trash2 size={18} />
                Delete
              </button>
            ) : (
              <div style={{ display: "flex", gap: 12 }}>
                <button
                  onClick={() => setConfirmDelete(false)}
                  style={{
                    padding: "10px 24px", borderRadius: 999,
                    background: "#C5DCF0", color: "#1E3A5F",
                    border: "none", fontSize: 16, fontWeight: 600,
                    cursor: "pointer", fontFamily: "Fredoka, sans-serif",
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  style={{
                    padding: "10px 24px", borderRadius: 999,
                    background: "#EF4444", color: "white",
                    border: "none", fontSize: 16, fontWeight: 600,
                    cursor: "pointer", fontFamily: "Fredoka, sans-serif",
                  }}
                >
                  Yes, Delete
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom nav (only when cards exist) */}
      {total > 0 && (
        <div
          style={{
            position: "fixed", bottom: 80, left: 0, right: 0,
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "0 28px",
            maxWidth: 480, margin: "0 auto",
          }}
        >
          <button
            onClick={() => { if (index > 0) setIndex(index - 1); }}
            disabled={index === 0}
            style={{
              padding: "14px 28px", borderRadius: 999,
              background: index === 0 ? "#C5DCF0" : "#A8C8E0",
              color: index === 0 ? "#9CB8CC" : "#1E3A5F",
              border: "none", cursor: index === 0 ? "not-allowed" : "pointer",
              fontSize: 18, fontWeight: 600,
              fontFamily: "Fredoka, sans-serif",
              opacity: index === 0 ? 0.6 : 1,
              minWidth: 110,
            }}
          >
            Previous
          </button>

          <button
            onClick={() => { if (index < total - 1) setIndex(index + 1); }}
            disabled={index === total - 1}
            style={{
              padding: "14px 28px", borderRadius: 999,
              background: index === total - 1 ? "#C5DCF0" : "#4A90C4",
              color: index === total - 1 ? "#9CB8CC" : "white",
              border: "none", cursor: index === total - 1 ? "not-allowed" : "pointer",
              fontSize: 18, fontWeight: 600,
              fontFamily: "Fredoka, sans-serif",
              opacity: index === total - 1 ? 0.6 : 1,
              minWidth: 110,
            }}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}