import { motion } from "framer-motion";

const TOTAL_LEVELS = 50;

// Duolingo-style winding path offsets (no dotted lines)
// Horizontal positions in % from center, cycling every 6
const PATH = [0, 28, 44, 28, 0, -28, -44, -28];

function getLeftPct(idx) {
  return 50 + PATH[idx % PATH.length];
}

const NODE_COLORS = [
  "#FF6B6B",
  "#FF9F43",
  "#FFD93D",
  "#6BCB77",
  "#4ECDC4",
  "#4D96FF",
  "#C77DFF",
];

function nodeColor(n) {
  return NODE_COLORS[(n - 1) % NODE_COLORS.length];
}

function LevelNode({ num, color, onTap, isMilestone }) {
  const size = isMilestone ? 70 : 62;
  return (
    <motion.div
      whileTap={{ scale: 0.84, y: 4 }}
      onClick={() => onTap(num)}
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: `linear-gradient(145deg, ${color}, ${color}AA)`,
        border: "3.5px solid rgba(255,255,255,0.30)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        boxShadow: `0 7px 0 ${color}88, 0 12px 28px ${color}44`,
        WebkitTapHighlightColor: "transparent",
        position: "relative",
        flexShrink: 0,
      }}
    >
      {isMilestone && (
        <motion.span
          animate={{ rotate: [0, 15, -15, 0] }}
          transition={{ repeat: Infinity, duration: 2.5, repeatDelay: 1 }}
          style={{
            position: "absolute",
            top: -16,
            fontSize: 16,
            filter: "drop-shadow(0 1px 3px rgba(0,0,0,0.2))",
            pointerEvents: "none",
          }}
        >
          ⭐
        </motion.span>
      )}
      <span
        style={{
          fontSize: num >= 10 ? 19 : 22,
          fontWeight: 700,
          color: "white",
          textShadow: "0 1px 5px rgba(0,0,0,0.25)",
          userSelect: "none",
          lineHeight: 1,
          pointerEvents: "none",
        }}
      >
        {num}
      </span>
      {isMilestone && (
        <span style={{ fontSize: 10, color: "rgba(255,255,255,0.85)", pointerEvents: "none", lineHeight: 1, marginTop: 2 }}>
          BOSS
        </span>
      )}
    </motion.div>
  );
}

export default function ShortALevels({ onBack, onSelectLevel, lang = "en" }) {
  const levels = Array.from({ length: TOTAL_LEVELS }, (_, i) => i + 1);
  const NODE_SPACING = 90;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        fontFamily: "Fredoka, sans-serif",
        background: "linear-gradient(180deg, #1CB0F6 0%, #0A7FC7 60%, #0f3460 100%)",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        style={{
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "calc(env(safe-area-inset-top, 0px) + 14px) 18px 14px",
          background: "rgba(0,0,0,0.18)",
          backdropFilter: "blur(8px)",
          borderBottom: "1px solid rgba(255,255,255,0.10)",
        }}
      >
        <motion.div
          whileTap={{ scale: 0.88 }}
          onClick={onBack}
          style={{
            width: 44,
            height: 44,
            borderRadius: 22,
            background: "rgba(255,255,255,0.15)",
            border: "1.5px solid rgba(255,255,255,0.22)",
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
          <p style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "white" }}>
            🍎 {lang === "zh" ? "短元音 A" : "Short a"}
          </p>
          <p style={{ margin: 0, fontSize: 12, color: "rgba(255,255,255,0.65)" }}>
            {lang === "zh" ? "50 关卡冒险" : "50-level adventure"}
          </p>
        </div>

        {/* XP pill */}
        <div
          style={{
            background: "rgba(255,215,0,0.22)",
            border: "1.5px solid rgba(255,215,0,0.45)",
            borderRadius: 99,
            padding: "5px 14px",
            display: "flex",
            alignItems: "center",
            gap: 5,
          }}
        >
          <span style={{ fontSize: 14 }}>⚡</span>
          <span style={{ color: "#FFD700", fontWeight: 700, fontSize: 14 }}>0 XP</span>
        </div>
      </div>

      {/* Scrollable level map */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          overflowX: "hidden",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "relative",
            width: "100%",
            height: TOTAL_LEVELS * NODE_SPACING + 180,
          }}
        >
          {levels.map((lvl, idx) => {
            const leftPct = getLeftPct(idx);
            const topPx = 40 + idx * NODE_SPACING;
            const color = nodeColor(lvl);
            const isMilestone = lvl % 10 === 0;

            return (
              <motion.div
                key={lvl}
                initial={{ opacity: 0, scale: 0.4 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  delay: Math.min(idx * 0.018, 0.7),
                  type: "spring",
                  stiffness: 300,
                  damping: 22,
                }}
                style={{
                  position: "absolute",
                  top: topPx,
                  left: `${leftPct}%`,
                  transform: "translateX(-50%)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <LevelNode
                  num={lvl}
                  color={color}
                  isMilestone={isMilestone}
                  onTap={onSelectLevel || (() => {})}
                />
              </motion.div>
            );
          })}

          {/* Trophy at the end */}
          <motion.div
            initial={{ opacity: 0, scale: 0.4 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6, type: "spring", stiffness: 240, damping: 18 }}
            style={{
              position: "absolute",
              top: 40 + TOTAL_LEVELS * NODE_SPACING + 10,
              left: `${getLeftPct(TOTAL_LEVELS)}%`,
              transform: "translateX(-50%)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 6,
            }}
          >
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
              style={{
                width: 80,
                height: 80,
                borderRadius: "50%",
                background: "linear-gradient(145deg, #FFD700, #FFA500)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 38,
                boxShadow: "0 8px 0 #cc8800, 0 14px 32px rgba(255,165,0,0.55)",
              }}
            >
              🏆
            </motion.div>
            <span style={{ color: "rgba(255,255,255,0.8)", fontSize: 13, fontWeight: 600 }}>
              {lang === "zh" ? "完成！" : "Complete!"}
            </span>
          </motion.div>
        </div>
      </div>
    </div>
  );
}