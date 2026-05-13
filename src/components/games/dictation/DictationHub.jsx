/**
 * DictationHub
 * Subfolder selector for the Dictation game.
 * Shows Short a (playable) + Short e/i/o/u (coming soon placeholders).
 */
import { motion } from "framer-motion";
import BackArrow from "../../BackArrow";
import DictationShortAGame from "./DictationShortAGame";
import { useState } from "react";

const SUBFOLDERS = [
  { id: "short-a", label: "Short a", labelZh: "短元音 a", emoji: "🍎", color: "#FF6B6B", available: true },
  { id: "short-e", label: "Short e", labelZh: "短元音 e", emoji: "🥚", color: "#4ECDC4", available: false },
  { id: "short-i", label: "Short i", labelZh: "短元音 i", emoji: "🐛", color: "#4D96FF", available: false },
  { id: "short-o", label: "Short o", labelZh: "短元音 o", emoji: "🐙", color: "#FF9F43", available: false },
  { id: "short-u", label: "Short u", labelZh: "短元音 u", emoji: "☂️", color: "#C77DFF", available: false },
];

export default function DictationHub({ onBack, lang = "en" }) {
  const [active, setActive] = useState(null);

  if (active === "short-a") {
    return <DictationShortAGame onBack={() => setActive(null)} lang={lang} />;
  }

  return (
    <div
      style={{
        display: "flex", flexDirection: "column", height: "100%",
        fontFamily: "Fredoka, sans-serif",
        background: "linear-gradient(160deg, #E8FFFE 0%, #FFF9E6 60%, #F5F0FF 100%)",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div style={{ flexShrink: 0, display: "flex", alignItems: "center", gap: 4, padding: "calc(env(safe-area-inset-top,0px) + 8px) 16px 8px", borderBottom: "1.5px solid rgba(0,0,0,0.06)", background: "rgba(255,255,255,0.75)", backdropFilter: "blur(10px)" }}>
        <BackArrow onPress={onBack} />
        <div style={{ flex: 1 }}>
          <p style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "#1E293B" }}>
            {lang === "zh" ? "🎙️ 听写" : "🎙️ Dictation"}
          </p>
          <p style={{ margin: 0, fontSize: 12, color: "#64748B" }}>
            {lang === "zh" ? "选择你的元音组" : "Choose your vowel group"}
          </p>
        </div>
      </div>

      {/* Subfolder list */}
      <div style={{ flex: 1, overflowY: "auto", padding: "12px 16px calc(24px + env(safe-area-inset-bottom,0px))", display: "flex", flexDirection: "column", gap: 12 }}>
        {SUBFOLDERS.map((sub, i) => (
          <motion.div
            key={sub.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.07, type: "spring", stiffness: 260, damping: 22 }}
            whileTap={{ scale: sub.available ? 0.97 : 1 }}
            onClick={() => sub.available && setActive(sub.id)}
            style={{
              display: "flex", alignItems: "center", gap: 14, padding: "14px 16px",
              borderRadius: 22, background: "white",
              border: `2px solid ${sub.color}${sub.available ? "55" : "22"}`,
              boxShadow: sub.available ? `0 4px 18px ${sub.color}25` : "0 2px 8px rgba(0,0,0,0.05)",
              cursor: sub.available ? "pointer" : "default",
              opacity: sub.available ? 1 : 0.55,
              WebkitTapHighlightColor: "transparent",
            }}
          >
            <div style={{ width: 56, height: 56, borderRadius: 16, background: sub.available ? `linear-gradient(145deg, ${sub.color}, ${sub.color}BB)` : `${sub.color}22`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, flexShrink: 0, boxShadow: sub.available ? `0 4px 0 ${sub.color}55` : "none" }}>
              {sub.emoji}
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "#1E293B" }}>
                {lang === "zh" ? sub.labelZh : sub.label}
              </p>
              <p style={{ margin: "2px 0 0", fontSize: 12, color: "#94A3B8" }}>
                {sub.available ? (lang === "zh" ? "41 个单词 · 点击开始！" : "41 words · Tap to begin!") : (lang === "zh" ? "即将推出..." : "Coming soon...")}
              </p>
            </div>
            {sub.available ? (
              <div style={{ width: 32, height: 32, borderRadius: 16, background: sub.color, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: `0 4px 0 ${sub.color}66` }}>
                <span style={{ color: "white", fontSize: 18, lineHeight: 1 }}>›</span>
              </div>
            ) : (
              <span style={{ fontSize: 18, flexShrink: 0, opacity: 0.35 }}>🔒</span>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}