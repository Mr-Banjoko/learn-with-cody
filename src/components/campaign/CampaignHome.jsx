import { motion } from "framer-motion";
import BackArrow from "../BackArrow";

const VOWEL_FOLDERS = [
  { id: "short-a", vowel: "a", label: "Short a", labelZh: "短元音 a", color: "#FF6B6B", emoji: "🍎", available: true,  levels: 50 },
  { id: "short-e", vowel: "e", label: "Short e", labelZh: "短元音 e", color: "#4ECDC4", emoji: "🥚", available: false, levels: 50 },
  { id: "short-i", vowel: "i", label: "Short i", labelZh: "短元音 i", color: "#4D96FF", emoji: "🐛", available: false, levels: 50 },
  { id: "short-o", vowel: "o", label: "Short o", labelZh: "短元音 o", color: "#FF9F43", emoji: "🐙", available: false, levels: 50 },
  { id: "short-u", vowel: "u", label: "Short u", labelZh: "短元音 u", color: "#C77DFF", emoji: "☂️", available: false, levels: 50 },
];

export default function CampaignHome({ onBack, onSelectVowel, lang = "en" }) {
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
          gap: 4,
          padding: "calc(env(safe-area-inset-top, 0px) + 8px) 16px 8px",
        }}
      >
        <BackArrow onPress={onBack} />

        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: "#1E293B", margin: 0, lineHeight: 1.1 }}>
            {lang === "zh" ? "🗺️ 学习征程" : "🗺️ Campaign"}
          </h1>
          <p style={{ fontSize: 13, color: "#64748B", margin: "2px 0 0" }}>
            {lang === "zh" ? "选择你的元音冒险！" : "Choose your vowel adventure!"}
          </p>
        </div>

        <motion.span
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ repeat: Infinity, duration: 3, repeatDelay: 2 }}
          style={{ fontSize: 30, flexShrink: 0 }}
        >
          🏆
        </motion.span>
      </div>

      {/* Folder list */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "8px 16px calc(24px + env(safe-area-inset-bottom, 0px))",
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        {VOWEL_FOLDERS.map((folder, i) => (
          <motion.div
            key={folder.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.07, type: "spring", stiffness: 260, damping: 22 }}
            whileTap={{ scale: folder.available ? 0.97 : 1 }}
            onClick={() => folder.available && onSelectVowel(folder.id)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              padding: "14px 16px",
              borderRadius: 22,
              background: "white",
              border: `2px solid ${folder.color}${folder.available ? "55" : "22"}`,
              boxShadow: folder.available ? `0 4px 18px ${folder.color}25` : "0 2px 8px rgba(0,0,0,0.05)",
              cursor: folder.available ? "pointer" : "default",
              opacity: folder.available ? 1 : 0.55,
              WebkitTapHighlightColor: "transparent",
            }}
          >
            {/* Badge */}
            <div
              style={{
                width: 60,
                height: 60,
                borderRadius: 18,
                background: folder.available
                  ? `linear-gradient(145deg, ${folder.color}, ${folder.color}BB)`
                  : `${folder.color}22`,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                boxShadow: folder.available ? `0 4px 0 ${folder.color}55` : "none",
              }}
            >
              <span style={{ fontSize: 24 }}>{folder.emoji}</span>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: folder.available ? "white" : folder.color,
                  lineHeight: 1,
                }}
              >
                /{folder.vowel}/
              </span>
            </div>

            {/* Text */}
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 20, fontWeight: 700, color: "#1E293B", margin: 0 }}>
                {lang === "zh" ? folder.labelZh : folder.label}
              </p>
              <p style={{ fontSize: 12, color: "#94A3B8", margin: "3px 0 0" }}>
                {folder.available
                  ? (lang === "zh" ? `${folder.levels} 关卡 · 点击开始！` : `${folder.levels} Levels · Tap to begin!`)
                  : (lang === "zh" ? "即将推出..." : "Coming soon...")}
              </p>
            </div>

            {/* Arrow / lock */}
            {folder.available ? (
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 17,
                  background: folder.color,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  boxShadow: `0 4px 0 ${folder.color}66`,
                }}
              >
                <span style={{ color: "white", fontSize: 20, lineHeight: 1 }}>›</span>
              </div>
            ) : (
              <span style={{ fontSize: 20, flexShrink: 0, opacity: 0.35 }}>🔒</span>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}