import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { tx } from "../lib/i18n";
import { BookImage, Trash2 } from "lucide-react";

function ScreenshotCard({ card }) {
  return (
    <div style={{
      width: "100%",
      borderRadius: 24,
      overflow: "hidden",
      boxShadow: "0 12px 48px rgba(30,58,95,0.15)",
    }}>
      <img
        src={card.screenshotDataUrl}
        alt={card.word}
        style={{ width: "100%", height: "auto", display: "block" }}
      />
    </div>
  );
}

export default function Album({ lang = "en" }) {
  const [cards, setCards] = useState([]);
  const [index, setIndex] = useState(0);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const loadCards = useCallback(() => {
    const stored = JSON.parse(localStorage.getItem("cody_album") || "[]");
    setCards(stored);
  }, []);

  useEffect(() => {
    loadCards();
    const onVisibility = () => { if (document.visibilityState === "visible") loadCards(); };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [loadCards]);

  const total = cards.length;
  const card = cards[index];

  const handleDelete = () => {
    const updated = cards.filter((_, i) => i !== index);
    setCards(updated);
    localStorage.setItem("cody_album", JSON.stringify(updated));
    setIndex((prev) => Math.max(0, Math.min(prev, updated.length - 1)));
    setConfirmDelete(false);
  };

  const isScreenshot = card && card.type === "screenshot";

  return (
    <div className="min-h-full flex flex-col" style={{ background: "#D6EEFF", fontFamily: "Fredoka, sans-serif", paddingBottom: "env(safe-area-inset-bottom, 16px)" }}>
      <div style={{ background: "#A8D0E6", borderBottomLeftRadius: 28, borderBottomRightRadius: 28, padding: "16px 20px 20px", textAlign: "center" }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: "#1E3A5F" }}>{tx("My Album 📸", "my_album", lang)}</h1>
        <p style={{ fontSize: 14, color: "#3A6080", marginTop: 2 }}>{tx("Your saved flashcards", "saved_flashcards", lang)}</p>
      </div>

      <div className="flex-1 flex flex-col items-center px-4 pt-6 pb-4">
        {total === 0 ? (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center justify-center gap-4 mt-16">
            <BookImage size={72} color="#A8D0E6" strokeWidth={1.5} />
            <p style={{ fontSize: 20, fontWeight: 600, color: "#4A90C4", textAlign: "center" }}>{tx("No flashcards saved yet!", "no_flashcards", lang)}</p>
            <p style={{ fontSize: 15, color: "#7BACC8", textAlign: "center", maxWidth: 260 }}>{tx("Go to Learn Phonics, take a photo, and save your first flashcard here.", "no_flashcards_hint", lang)}</p>
          </motion.div>
        ) : (
          <div className="flex flex-col items-center gap-5 w-full" style={{ maxWidth: 420 }}>
            <p style={{ fontSize: 16, fontWeight: 600, color: "#4A90C4" }}>{index + 1} {tx("of", "of_label", lang)} {total}</p>

            <AnimatePresence mode="wait">
              <motion.div
                key={card.id}
                initial={{ opacity: 0, scale: 0.94 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.94 }}
                transition={{ duration: 0.2 }}
                style={{ width: "100%" }}
              >
                {isScreenshot ? (
                  <ScreenshotCard card={card} />
                ) : (
                  <div style={{ width: "100%", borderRadius: 24, overflow: "hidden", background: "white", boxShadow: "0 12px 48px rgba(30,58,95,0.15)", padding: 14 }}>
                    <img src={card.image} alt={card.word} style={{ width: "100%", aspectRatio: "1/1", objectFit: "cover", borderRadius: 18, display: "block" }} />
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            <div style={{ marginTop: 4 }}>
              {!confirmDelete ? (
                <button onClick={() => setConfirmDelete(true)} style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 24px", borderRadius: 999, background: "rgba(239,68,68,0.1)", color: "#EF4444", border: "2px solid rgba(239,68,68,0.25)", fontSize: 16, fontWeight: 600, cursor: "pointer", fontFamily: "Fredoka, sans-serif" }}>
                  <Trash2 size={18} /> {tx("Delete", "delete_btn", lang)}
                </button>
              ) : (
                <div style={{ display: "flex", gap: 12 }}>
                  <button onClick={() => setConfirmDelete(false)} style={{ padding: "10px 24px", borderRadius: 999, background: "#C5DCF0", color: "#1E3A5F", border: "none", fontSize: 16, fontWeight: 600, cursor: "pointer", fontFamily: "Fredoka, sans-serif" }}>{tx("Cancel", "cancel_btn", lang)}</button>
                  <button onClick={handleDelete} style={{ padding: "10px 24px", borderRadius: 999, background: "#EF4444", color: "white", border: "none", fontSize: 16, fontWeight: 600, cursor: "pointer", fontFamily: "Fredoka, sans-serif" }}>{tx("Yes, Delete", "yes_delete", lang)}</button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {total > 1 && (
        <div style={{ marginTop: "auto", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 28px 8px", maxWidth: 480, width: "100%", alignSelf: "center", boxSizing: "border-box" }}>
          <button onClick={() => { if (index > 0) { setIndex(index - 1); setConfirmDelete(false); } }} disabled={index === 0} style={{ padding: "14px 28px", borderRadius: 999, background: index === 0 ? "#C5DCF0" : "#A8C8E0", color: index === 0 ? "#9CB8CC" : "#1E3A5F", border: "none", cursor: index === 0 ? "not-allowed" : "pointer", fontSize: 18, fontWeight: 600, fontFamily: "Fredoka, sans-serif", opacity: index === 0 ? 0.6 : 1, minWidth: 110, touchAction: "manipulation" }}>{tx("Previous", "previous", lang)}</button>
          <button onClick={() => { if (index < total - 1) { setIndex(index + 1); setConfirmDelete(false); } }} disabled={index === total - 1} style={{ padding: "14px 28px", borderRadius: 999, background: index === total - 1 ? "#C5DCF0" : "#4A90C4", color: index === total - 1 ? "#9CB8CC" : "white", border: "none", cursor: index === total - 1 ? "not-allowed" : "pointer", fontSize: 18, fontWeight: 600, fontFamily: "Fredoka, sans-serif", opacity: index === total - 1 ? 0.6 : 1, minWidth: 110, touchAction: "manipulation" }}>{tx("Next", "next", lang)}</button>
        </div>
      )}
    </div>
  );
}