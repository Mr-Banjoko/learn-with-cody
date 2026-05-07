/**
 * WriteHub — entry point for the Write folder in the Games tab.
 * Shows 5 vowel sub-folders. Short A is active; others are locked.
 */
import { useState } from "react";
import { motion } from "framer-motion";
import { Lock } from "lucide-react";
import BackArrow from "../BackArrow";
import WriteGame from "./WriteGame";

const VOWEL_GROUPS = [
  { id: "short-a", label: "Short A", emoji: "🍎", color: "#FF6B6B", bg: "#FFF0F0", available: true },
  { id: "short-e", label: "Short E", emoji: "🥚", color: "#FFD93D", bg: "#FFFDE7", available: false },
  { id: "short-i", label: "Short I", emoji: "🐛", color: "#6BCB77", bg: "#F0FFF4", available: false },
  { id: "short-o", label: "Short O", emoji: "🐙", color: "#4D96FF", bg: "#EFF6FF", available: false },
  { id: "short-u", label: "Short U", emoji: "☂️", color: "#C77DFF", bg: "#FAF0FF", available: false },
];

export default function WriteHub({ onBack, lang = "en" }) {
  const [activeGroup, setActiveGroup] = useState(null);

  if (activeGroup === "short-a") {
    return <WriteGame onBack={() => setActiveGroup(null)} lang={lang} />;
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        fontFamily: "Fredoka, sans-serif",
        background: "linear-gradient(160deg, #FAF0FF 0%, #FFF9E6 100%)",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        style={{
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "calc(env(safe-area-inset-top, 0px) + 8px) 16px 12px",
          borderBottom: "1.5px solid rgba(0,0,0,0.06)",
          background: "rgba(255,255,255,0.8)",
          backdropFilter: "blur(10px)",
        }}
      >
        <BackArrow onPress={onBack} />
        <div>
          <p style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "#1E293B" }}>✏️ Write</p>
          <p style={{ margin: 0, fontSize: 13, color: "#94A3B8" }}>
            {lang === "zh" ? "选择字母组" : "Choose a vowel group"}
          </p>
        </div>
      </div>

      {/* List */}
      <div style={{ flex: 1, overflowY: "auto", padding: "16px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {VOWEL_GROUPS.map((group, i) => (
            <motion.div
              key={group.id}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.07 }}
              onClick={() => group.available && setActiveGroup(group.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                padding: "16px 18px",
                borderRadius: 20,
                background: group.available ? "white" : "rgba(255,255,255,0.55)",
                border: `2px solid ${group.available ? group.color + "55" : "rgba(168,208,230,0.25)"}`,
                boxShadow: group.available ? `0 6px 24px ${group.color}20` : "none",
                cursor: group.available ? "pointer" : "default",
                opacity: group.available ? 1 : 0.55,
              }}
            >
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 16,
                  background: group.bg,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 26,
                  flexShrink: 0,
                }}
              >
                {group.emoji}
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "#1E293B" }}>{group.label}</p>
                <p style={{ margin: 0, fontSize: 13, color: "#94A3B8" }}>
                  {group.available
                    ? lang === "zh" ? "点击开始！" : "Tap to play!"
                    : lang === "zh" ? "即将推出" : "Coming soon"}
                </p>
              </div>
              {group.available ? (
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 16,
                    background: group.color,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    fontSize: 18,
                  }}
                >
                  ›
                </div>
              ) : (
                <Lock size={18} color="#CBD5E1" />
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}