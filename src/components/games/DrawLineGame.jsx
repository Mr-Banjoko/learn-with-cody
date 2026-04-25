/**
 * DrawLineGame — top-level entry for the Draw a Line activity.
 * Shows vowel group selection menu → mounts DrawLineVowelGame for chosen group.
 */
import { useState } from "react";
import { motion } from "framer-motion";
import BackArrow from "../BackArrow";
import DrawLineVowelGame from "./drawline/DrawLineVowelGame";
import { VOWEL_GROUPS } from "./drawline/drawLineData";
import { Lock } from "lucide-react";

export default function DrawLineGame({ onBack, lang = "en" }) {
  const [activeGroup, setActiveGroup] = useState(null);

  if (activeGroup) {
    return (
      <DrawLineVowelGame
        group={activeGroup}
        onBack={() => setActiveGroup(null)}
        lang={lang}
      />
    );
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        fontFamily: "Fredoka, sans-serif",
        background: "linear-gradient(160deg, #E8FFFE 0%, #FFF9E6 60%, #F5F0FF 100%)",
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
          padding: "calc(env(safe-area-inset-top, 0px) + 8px) 16px 8px",
          borderBottom: "1.5px solid rgba(0,0,0,0.06)",
          background: "rgba(255,255,255,0.8)",
          backdropFilter: "blur(10px)",
        }}
      >
        <BackArrow onPress={onBack} />
        <span style={{ fontSize: 24 }}>〰️</span>
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "#1E3A5F" }}>
          {lang === "zh" ? "连线游戏" : "Draw a Line"}
        </h2>
      </div>

      {/* Vowel group list */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "20px 16px",
          display: "flex",
          flexDirection: "column",
          gap: 14,
        }}
      >
        {VOWEL_GROUPS.map((group, i) => (
          <motion.div
            key={group.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            onClick={() => group.available && setActiveGroup(group)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              padding: "18px 20px",
              borderRadius: 20,
              background: group.available ? "white" : "rgba(255,255,255,0.6)",
              border: `2.5px solid ${group.color}${group.available ? "55" : "22"}`,
              boxShadow: group.available ? `0 6px 24px ${group.color}18` : "none",
              cursor: group.available ? "pointer" : "default",
              opacity: group.available ? 1 : 0.6,
              userSelect: "none",
              WebkitTapHighlightColor: "transparent",
            }}
          >
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: 16,
                background: `${group.color}18`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 30,
                flexShrink: 0,
              }}
            >
              {group.emoji}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 20, fontWeight: 700, color: "#1E3A5F" }}>
                {group.label}
              </div>
              <div style={{ fontSize: 14, color: "#64748B", marginTop: 2 }}>
                {group.available
                  ? lang === "zh" ? "点击开始" : "Tap to play"
                  : lang === "zh" ? "即将推出" : "Coming soon"}
              </div>
            </div>
            {!group.available && (
              <Lock size={20} style={{ color: "#CBD5E1", flexShrink: 0 }} />
            )}
            {group.available && (
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: group.color,
                  background: `${group.color}18`,
                  padding: "4px 12px",
                  borderRadius: 999,
                  flexShrink: 0,
                }}
              >
                {lang === "zh" ? "开始！" : "Play!"}
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}