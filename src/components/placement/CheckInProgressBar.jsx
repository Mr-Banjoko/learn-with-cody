import { motion } from "framer-motion";

const GAME_ICONS = ["🅰️", "🔊", "🔤", "🧠"];
const GAME_COLORS = ["#C77DFF", "#4ECDC4", "#4D96FF", "#FFD93D"];

export default function CheckInProgressBar({ gameIdx, roundsDone, totalRounds, onQuit }) {
  return (
    <div
      style={{
        background: "rgba(255,255,255,0.80)",
        backdropFilter: "blur(10px)",
        padding: "10px 18px 10px",
        display: "flex",
        flexDirection: "column",
        gap: 8,
        flexShrink: 0,
        borderBottom: "1.5px solid rgba(78,205,196,0.12)",
      }}
    >
      {/* Quit + 4 game paw prints */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <button
          onClick={onQuit}
          style={{
            background: "none", border: "none", cursor: "pointer",
            fontSize: 22, padding: "2px 4px",
            WebkitTapHighlightColor: "transparent",
            opacity: 0.55,
          }}
          aria-label="Quit"
        >
          ✕
        </button>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          {[0, 1, 2, 3].map((i) => (
            <motion.div
              key={i}
              animate={{ scale: i === gameIdx ? [1, 1.18, 1] : 1 }}
              transition={{ duration: 0.4 }}
              style={{
                width: i === gameIdx ? 36 : 28,
                height: i === gameIdx ? 36 : 28,
                borderRadius: 12,
                background: i < gameIdx
                  ? GAME_COLORS[i]
                  : i === gameIdx
                  ? GAME_COLORS[i]
                  : "rgba(200,210,220,0.4)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: i === gameIdx ? 18 : 14,
                opacity: i > gameIdx ? 0.35 : 1,
                boxShadow: i === gameIdx ? `0 4px 14px ${GAME_COLORS[i]}55` : "none",
                transition: "all 0.3s",
              }}
            >
              {i < gameIdx ? (
                <span style={{ color: "white", fontSize: 14, fontWeight: 700 }}>✓</span>
              ) : (
                <span>{GAME_ICONS[i]}</span>
              )}
            </motion.div>
          ))}
        </div>
        <div style={{ width: 30 }} />
      </div>

      {/* Round dots */}
      <div style={{ display: "flex", justifyContent: "center", gap: 7 }}>
        {Array.from({ length: totalRounds }).map((_, i) => (
          <motion.div
            key={i}
            initial={false}
            animate={{
              background: i < roundsDone ? GAME_COLORS[gameIdx] : "rgba(78,205,196,0.2)",
              scale: i === roundsDone ? [1, 1.35, 1] : 1,
            }}
            transition={{ duration: 0.3 }}
            style={{ width: 9, height: 9, borderRadius: 5 }}
          />
        ))}
      </div>
    </div>
  );
}