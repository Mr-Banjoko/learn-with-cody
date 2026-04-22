/**
 * MissingSound01 — category selector for Missing Sound 0.1
 * Includes: Short a, Short e
 */
import { useState } from "react";
import { motion } from "framer-motion";
import BackArrow from "../BackArrow";
import MissingSoundGame01 from "./MissingSoundGame01";
import { shortAWords } from "../../lib/shortAWords";
import { shortEWords } from "../../lib/shortEWords";
import { shortIWords } from "../../lib/shortIWords";
import { shortOWords } from "../../lib/shortOWords";
import { shortUWords } from "../../lib/shortUWords";

const VOWEL_GROUPS = [
  { id: "short-a", label: "Short a", emoji: "🍎", color: "#FF6B6B", bg: "#FFF0F0", words: shortAWords },
  { id: "short-e", label: "Short e", emoji: "🥚", color: "#FFD93D", bg: "#FFFDE7", words: shortEWords },
  { id: "short-i", label: "Short i", emoji: "🐟", color: "#6BCB77", bg: "#F0FFF4", words: shortIWords },
  { id: "short-o", label: "Short o", emoji: "🐙", color: "#4D96FF", bg: "#EFF6FF", words: shortOWords },
  { id: "short-u", label: "Short u", emoji: "☂️", color: "#C77DFF", bg: "#FAF0FF", words: shortUWords },
];

export default function MissingSound01({ onBack, lang = "en" }) {
  const [selected, setSelected] = useState(null);

  if (selected) {
    const group = VOWEL_GROUPS.find((g) => g.id === selected);
    return (
      <MissingSoundGame01
        words={group.words}
        title={group.label}
        color={group.color}
        onBack={() => setSelected(null)}
        lang={lang}
      />
    );
  }

  return (
    <div
      className="min-h-full pb-32"
      style={{ background: "linear-gradient(160deg, #E8FFFE 0%, #FFF9E6 60%, #F5F0FF 100%)", fontFamily: "Fredoka, sans-serif" }}
    >
      <div style={{
        background: "#A8D0E6", borderBottomLeftRadius: 28, borderBottomRightRadius: 28,
        padding: "10px 20px 16px", display: "flex", alignItems: "center", gap: 8,
      }}>
        <BackArrow onPress={onBack} />
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: "#1E3A5F" }}>
            {lang === "zh" ? "缺失的音 0.1 ❓" : "Missing Sound 0.1 ❓"}
          </h1>
          <p style={{ fontSize: 13, color: "#3A6080" }}>
            {lang === "zh" ? "点击字母听音，拖动字母填空" : "Tap a letter to hear it · Drag to fill the gap"}
          </p>
        </div>
      </div>

      <div className="px-4 pt-6 flex flex-col gap-3">
        {VOWEL_GROUPS.map((group, i) => (
          <motion.button
            key={group.id}
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.07 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setSelected(group.id)}
            style={{
              display: "flex", alignItems: "center", gap: 14, padding: "16px 18px", borderRadius: 20,
              background: "white",
              border: `2px solid ${group.color}55`,
              boxShadow: `0 6px 24px ${group.color}20`,
              cursor: "pointer", width: "100%", textAlign: "left",
            }}
          >
            <div style={{
              width: 52, height: 52, borderRadius: 16, background: group.bg,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 26, flexShrink: 0,
            }}>
              {group.emoji}
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 20, fontWeight: 700, color: "#1E3A5F" }}>{group.label}</p>
              <p style={{ fontSize: 13, color: "#7BACC8" }}>
                {lang === "zh" ? "点击游玩！" : "Tap to play!"}
              </p>
            </div>
            <div style={{
              width: 32, height: 32, borderRadius: 16, background: group.color,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <span style={{ color: "white", fontSize: 18, lineHeight: 1 }}>›</span>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}