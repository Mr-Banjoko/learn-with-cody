import { motion } from "framer-motion";

const VOWEL_FOLDERS = [
  {
    id: "short-a",
    vowel: "a",
    label: "Short a",
    labelZh: "短元音 a",
    color: "#FF6B6B",
    bg: "#FFF0EF",
    emoji: "🍎",
    available: true,
    levels: 50,
  },
  {
    id: "short-e",
    vowel: "e",
    label: "Short e",
    labelZh: "短元音 e",
    color: "#4ECDC4",
    bg: "#E8FAF9",
    emoji: "🥚",
    available: false,
    levels: 50,
  },
  {
    id: "short-i",
    vowel: "i",
    label: "Short i",
    labelZh: "短元音 i",
    color: "#4D96FF",
    bg: "#EFF6FF",
    emoji: "🐛",
    available: false,
    levels: 50,
  },
  {
    id: "short-o",
    vowel: "o",
    label: "Short o",
    labelZh: "短元音 o",
    color: "#FF9F43",
    bg: "#FFF5E6",
    emoji: "🐙",
    available: false,
    levels: 50,
  },
  {
    id: "short-u",
    vowel: "u",
    label: "Short u",
    labelZh: "短元音 u",
    color: "#C77DFF",
    bg: "#F5F0FF",
    emoji: "☂️",
    available: false,
    levels: 50,
  },
];

export default function CampaignHome({ onBack, onSelectVowel, lang = "en" }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        fontFamily: "Fredoka, sans-serif",
        background: "linear-gradient(170deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        style={{
          flexShrink: 0,
          padding: "calc(env(safe-area-inset-top, 0px) + 16px) 20px 20px",
          display: "flex",
          alignItems: "center",
          gap: 14,
        }}
      >
        {/* Back */}
        <motion.div
          whileTap={{ scale: 0.88 }}
          onClick={onBack}
          style={{
            width: 44,
            height: 44,
            borderRadius: 22,
            background: "rgba(255,255,255,0.12)",
            border: "1.5px solid rgba(255,255,255,0.18)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            flexShrink: 0,
            WebkitTapHighlightColor: "transparent",
          }}
        >
          <span style={{ color: "white", fontSize: 20, lineHeight: 1, marginRight: 2 }}>‹</span>
        </motion.div>

        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: "white", margin: 0, lineHeight: 1.1 }}>
            {lang === "zh" ? "🗺️ 学习征程" : "🗺️ Campaign"}
          </h1>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", margin: "3px 0 0" }}>
            {lang === "zh" ? "选择你的元音冒险！" : "Choose your vowel adventure!"}
          </p>
        </div>

        {/* Trophy wobble */}
        <motion.div
          animate={{ rotate: [0, 8, -8, 0] }}
          transition={{ repeat: Infinity, duration: 3, repeatDelay: 2 }}
          style={{ fontSize: 32, flexShrink: 0 }}
        >
          🏆
        </motion.div>
      </div>

      {/* Stars decoration row */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        style={{
          flexShrink: 0,
          display: "flex",
          justifyContent: "center",
          gap: 8,
          marginBottom: 4,
        }}
      >
        {["⭐", "🌟", "✨", "🌟", "⭐"].map((s, i) => (
          <motion.span
            key={i}
            animate={{ y: [0, -4, 0] }}
            transition={{ repeat: Infinity, duration: 1.8, delay: i * 0.2 }}
            style={{ fontSize: 16, opacity: 0.7 }}
          >
            {s}
          </motion.span>
        ))}
      </motion.div>

      {/* Vowel folder list */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "12px 16px calc(24px + env(safe-area-inset-bottom, 0px))",
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        {VOWEL_FOLDERS.map((folder, i) => (
          <motion.div
            key={folder.id}
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 + i * 0.07, type: "spring", stiffness: 260, damping: 22 }}
            whileTap={{ scale: folder.available ? 0.97 : 1 }}
            onClick={() => folder.available && onSelectVowel(folder.id)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              padding: "14px 16px",
              borderRadius: 22,
              background: folder.available
                ? "rgba(255,255,255,0.10)"
                : "rgba(255,255,255,0.04)",
              border: `2px solid ${folder.color}${folder.available ? "55" : "20"}`,
              boxShadow: folder.available
                ? `0 4px 20px ${folder.color}30, inset 0 1px 0 rgba(255,255,255,0.08)`
                : "none",
              cursor: folder.available ? "pointer" : "default",
              opacity: folder.available ? 1 : 0.5,
              WebkitTapHighlightColor: "transparent",
              backdropFilter: "blur(8px)",
            }}
          >
            {/* Vowel badge */}
            <div
              style={{
                width: 62,
                height: 62,
                borderRadius: 18,
                background: folder.available
                  ? `linear-gradient(145deg, ${folder.color}, ${folder.color}BB)`
                  : `${folder.color}22`,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                boxShadow: folder.available ? `0 4px 0 ${folder.color}66` : "none",
              }}
            >
              <span style={{ fontSize: 24, pointerEvents: "none" }}>{folder.emoji}</span>
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: folder.available ? "white" : folder.color,
                  lineHeight: 1,
                  pointerEvents: "none",
                }}
              >
                /{folder.vowel}/
              </span>
            </div>

            {/* Text */}
            <div style={{ flex: 1, pointerEvents: "none" }}>
              <p style={{ fontSize: 20, fontWeight: 700, color: "white", margin: 0 }}>
                {lang === "zh" ? folder.labelZh : folder.label}
              </p>
              <p style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", margin: "3px 0 0" }}>
                {folder.available
                  ? (lang === "zh" ? `${folder.levels} 关卡 · 点击开始！` : `${folder.levels} Levels · Tap to begin!`)
                  : (lang === "zh" ? "即将推出..." : "Coming soon...")}
              </p>
              {folder.available && (
                <div style={{ display: "flex", gap: 4, marginTop: 6 }}>
                  {[...Array(5)].map((_, s) => (
                    <div
                      key={s}
                      style={{
                        width: 18,
                        height: 5,
                        borderRadius: 4,
                        background: s === 0 ? folder.color : `${folder.color}30`,
                      }}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Arrow or lock */}
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
                  boxShadow: `0 4px 0 ${folder.color}66`,
                  pointerEvents: "none",
                }}
              >
                <span style={{ color: "white", fontSize: 20, lineHeight: 1 }}>›</span>
              </div>
            ) : (
              <span style={{ fontSize: 20, flexShrink: 0, opacity: 0.4 }}>🔒</span>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}