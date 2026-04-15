import { motion } from "framer-motion";
import BackArrow from "../BackArrow";

const VOWEL_FOLDERS = [
  { id: "short-a", vowel: "a", label: "Short a", labelZh: "短元音 a", color: "#FF6B6B", bg: "#FFF0EF", emoji: "🍎", available: true },
  { id: "short-e", vowel: "e", label: "Short e", labelZh: "短元音 e", color: "#4ECDC4", bg: "#E8FAF9", emoji: "🥚", available: false },
  { id: "short-i", vowel: "i", label: "Short i", labelZh: "短元音 i", color: "#4D96FF", bg: "#EFF6FF", emoji: "🐛", available: false },
  { id: "short-o", vowel: "o", label: "Short o", labelZh: "短元音 o", color: "#FF9F43", bg: "#FFF5E6", emoji: "🐙", available: false },
  { id: "short-u", vowel: "u", label: "Short u", labelZh: "短元音 u", color: "#C77DFF", bg: "#F5F0FF", emoji: "☂️", available: false },
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
          background: "linear-gradient(135deg, #6BCB77, #4ECDC4)",
          borderBottomLeftRadius: 28,
          borderBottomRightRadius: 28,
          padding: "12px 20px 20px",
          display: "flex",
          alignItems: "center",
          gap: 12,
          boxShadow: "0 6px 24px rgba(107,203,119,0.3)",
        }}
      >
        <BackArrow onPress={onBack} />
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: "white", margin: 0, lineHeight: 1.1 }}>
            {lang === "zh" ? "🗺️ 学习征程" : "🗺️ Campaign Mode"}
          </h1>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.85)", margin: "3px 0 0" }}>
            {lang === "zh" ? "选择你的元音冒险！" : "Pick your vowel adventure!"}
          </p>
        </div>
        <motion.div
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ repeat: Infinity, duration: 3, repeatDelay: 2 }}
          style={{ fontSize: 36 }}
        >
          🏆
        </motion.div>
      </div>

      {/* Vowel folder list */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "20px 16px calc(16px + env(safe-area-inset-bottom, 0px))",
          display: "flex",
          flexDirection: "column",
          gap: 14,
        }}
      >
        {VOWEL_FOLDERS.map((folder, i) => (
          <motion.button
            key={folder.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08, type: "spring", stiffness: 260, damping: 22 }}
            whileTap={folder.available ? { scale: 0.97 } : {}}
            onClick={() => folder.available && onSelectVowel(folder.id)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              padding: "16px 18px",
              borderRadius: 24,
              background: folder.available ? "white" : "rgba(255,255,255,0.6)",
              border: `2.5px solid ${folder.color}${folder.available ? "55" : "22"}`,
              boxShadow: folder.available ? `0 6px 24px ${folder.color}22` : "none",
              cursor: folder.available ? "pointer" : "not-allowed",
              opacity: folder.available ? 1 : 0.65,
              textAlign: "left",
              width: "100%",
              fontFamily: "Fredoka, sans-serif",
              WebkitTapHighlightColor: "transparent",
            }}
          >
            {/* Vowel badge */}
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: 20,
                background: folder.available
                  ? `linear-gradient(135deg, ${folder.color}, ${folder.color}CC)`
                  : folder.bg,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                boxShadow: folder.available ? `0 4px 16px ${folder.color}44` : "none",
              }}
            >
              <span style={{ fontSize: 26 }}>{folder.emoji}</span>
              <span
                style={{
                  fontSize: 13,
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
              <p style={{ fontSize: 21, fontWeight: 700, color: "#1E3A5F", margin: 0 }}>
                {lang === "zh" ? folder.labelZh : folder.label}
              </p>
              <p style={{ fontSize: 13, color: "#7BACC8", margin: "3px 0 0" }}>
                {folder.available
                  ? (lang === "zh" ? "50 关卡 · 点击开始！" : "50 Levels · Tap to begin!")
                  : (lang === "zh" ? "即将推出..." : "Coming soon...")}
              </p>
              {folder.available && (
                <div style={{ display: "flex", gap: 4, marginTop: 6 }}>
                  {[...Array(5)].map((_, s) => (
                    <div
                      key={s}
                      style={{
                        width: 18,
                        height: 6,
                        borderRadius: 4,
                        background: s === 0 ? folder.color : `${folder.color}28`,
                      }}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Arrow / lock */}
            {folder.available ? (
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 18,
                  background: folder.color,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  boxShadow: `0 4px 12px ${folder.color}55`,
                }}
              >
                <span style={{ color: "white", fontSize: 20, lineHeight: 1 }}>›</span>
              </div>
            ) : (
              <span style={{ fontSize: 22, flexShrink: 0 }}>🔒</span>
            )}
          </motion.button>
        ))}
      </div>
    </div>
  );
}