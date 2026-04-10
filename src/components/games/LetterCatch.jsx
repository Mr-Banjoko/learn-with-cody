import { useState } from "react";
import { motion } from "framer-motion";
import BackArrow from "../BackArrow";
import { tx } from "../../lib/i18n";
import ShortADifficulty from "./ShortADifficulty";
import ShortEDifficulty from "./ShortEDifficulty";
import ShortIDifficulty from "./ShortIDifficulty";
import ShortODifficulty from "./ShortODifficulty";
import ShortUDifficulty from "./ShortUDifficulty";

const VOWEL_GROUPS = [
  { id: "short-a", label: "Short a", emoji: "🍎", color: "#FF6B6B", bg: "#FFF0F0", available: true },
  { id: "short-e", label: "Short e", emoji: "🥚", color: "#FFD93D", bg: "#FFFDE7", available: true },
  { id: "short-i", label: "Short i", emoji: "🐟", color: "#6BCB77", bg: "#F0FFF4", available: true },
  { id: "short-o", label: "Short o", emoji: "🐙", color: "#4D96FF", bg: "#EFF6FF", available: true },
  { id: "short-u", label: "Short u", emoji: "☂️", color: "#C77DFF", bg: "#FAF0FF", available: true },
];

export default function LetterCatch({ onBack, lang = "en" }) {
  const [selected, setSelected] = useState(null);

  if (selected === "short-a") return <ShortADifficulty onBack={() => setSelected(null)} lang={lang} />;
  if (selected === "short-e") return <ShortEDifficulty onBack={() => setSelected(null)} lang={lang} />;
  if (selected === "short-i") return <ShortIDifficulty onBack={() => setSelected(null)} lang={lang} />;
  if (selected === "short-o") return <ShortODifficulty onBack={() => setSelected(null)} lang={lang} />;
  if (selected === "short-u") return <ShortUDifficulty onBack={() => setSelected(null)} lang={lang} />;

  return (
    <div className="min-h-full pb-32" style={{ background: "#D6EEFF", fontFamily: "Fredoka, sans-serif" }}>
      <div style={{ background: "#A8D0E6", borderBottomLeftRadius: 28, borderBottomRightRadius: 28, padding: "10px 20px 16px", display: "flex", alignItems: "center", gap: 8 }}>
        <BackArrow onPress={onBack} />
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: "#1E3A5F" }}>{tx("Letter Catch 🧩", "letter_catch", lang)}</h1>
          <p style={{ fontSize: 13, color: "#3A6080" }}>{tx("Pick a word group!", "pick_word_group_play", lang)}</p>
        </div>
      </div>

      <div className="px-4 pt-6 flex flex-col gap-3">
        {VOWEL_GROUPS.map((group, i) => (
          <motion.button
            key={group.id}
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.07 }}
            whileTap={group.available ? { scale: 0.97 } : {}}
            onClick={() => group.available && setSelected(group.id)}
            style={{
              display: "flex", alignItems: "center", gap: 14, padding: "16px 18px", borderRadius: 20,
              background: group.available ? "white" : "rgba(255,255,255,0.55)",
              border: `2px solid ${group.available ? group.color + "55" : "rgba(168,208,230,0.3)"}`,
              boxShadow: group.available ? `0 6px 24px ${group.color}20` : "none",
              cursor: group.available ? "pointer" : "not-allowed",
              opacity: group.available ? 1 : 0.6, width: "100%", textAlign: "left",
            }}
          >
            <div style={{ width: 52, height: 52, borderRadius: 16, background: group.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, flexShrink: 0 }}>
              {group.emoji}
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 20, fontWeight: 700, color: "#1E3A5F" }}>{group.label}</p>
              <p style={{ fontSize: 13, color: "#7BACC8" }}>{group.available ? tx("Tap to play!", "tap_to_play", lang) : tx("Coming soon", "coming_soon", lang)}</p>
            </div>
            {group.available ? (
              <div style={{ width: 32, height: 32, borderRadius: 16, background: group.color, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ color: "white", fontSize: 18, lineHeight: 1 }}>›</span>
              </div>
            ) : (
              <span style={{ fontSize: 11, fontWeight: 600, color: "#7BACC8", background: "#EEF6FF", padding: "3px 10px", borderRadius: 99 }}>{tx("Soon", "soon_badge", lang)}</span>
            )}
          </motion.button>
        ))}
      </div>
    </div>
  );
}