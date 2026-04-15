import { useState } from "react";
import { motion } from "framer-motion";
import BackArrow from "../BackArrow";

const TOTAL_LEVELS = 50;
const COLOR = "#FF6B6B";
const LEVELS_PER_ROW = 5;

// One colour per level, cycling through a warm palette
const LEVEL_COLORS = [
  "#FF6B6B", "#FF8E53", "#FFB347", "#FFD93D", "#C8E63D",
  "#6BCB77", "#4ECDC4", "#45B7D1", "#4D96FF", "#7B68EE",
];

function getLevelColor(n) {
  return LEVEL_COLORS[(n - 1) % LEVEL_COLORS.length];
}

// Connector dot between two level circles
function ConnectorDots({ color }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 3, flex: 1, justifyContent: "center" }}>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          style={{
            width: 6,
            height: 6,
            borderRadius: 3,
            background: color,
            opacity: 0.35 + i * 0.15,
          }}
        />
      ))}
    </div>
  );
}

// Vertical connector between rows
function VerticalConnector({ color, side }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 3,
        paddingTop: 4,
        paddingBottom: 4,
        // Position on the correct side
        alignSelf: side === "right" ? "flex-end" : "flex-start",
        marginRight: side === "right" ? 20 : 0,
        marginLeft: side === "left" ? 20 : 0,
      }}
    >
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          style={{
            width: 6,
            height: 6,
            borderRadius: 3,
            background: color,
            opacity: 0.3 + i * 0.15,
          }}
        />
      ))}
    </div>
  );
}

function LevelNode({ levelNum, onTap }) {
  const [tapped, setTapped] = useState(false);
  const color = getLevelColor(levelNum);
  const isFirst = levelNum === 1;

  const handleTap = () => {
    setTapped(true);
    setTimeout(() => {
      setTapped(false);
      onTap(levelNum);
    }, 180);
  };

  return (
    <motion.button
      whileTap={{ scale: 0.85 }}
      animate={isFirst ? { scale: [1, 1.08, 1] } : {}}
      transition={isFirst ? { repeat: Infinity, duration: 1.8, repeatDelay: 1 } : {}}
      onClick={handleTap}
      style={{
        width: 54,
        height: 54,
        borderRadius: 27,
        background: tapped
          ? `linear-gradient(135deg, ${color}, ${color}AA)`
          : "white",
        border: `3px solid ${color}`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        boxShadow: isFirst
          ? `0 0 0 4px ${color}33, 0 6px 20px ${color}44`
          : `0 4px 14px ${color}33`,
        fontFamily: "Fredoka, sans-serif",
        WebkitTapHighlightColor: "transparent",
        flexShrink: 0,
        transition: "background 0.15s",
        padding: 0,
        position: "relative",
      }}
    >
      {isFirst && (
        <span style={{ fontSize: 9, fontWeight: 700, color: color, lineHeight: 1, marginBottom: 1 }}>
          START
        </span>
      )}
      <span
        style={{
          fontSize: isFirst ? 15 : 18,
          fontWeight: 700,
          color: tapped ? "white" : color,
          lineHeight: 1,
          transition: "color 0.15s",
        }}
      >
        {levelNum}
      </span>
    </motion.button>
  );
}

export default function ShortALevels({ onBack, onSelectLevel, lang = "en" }) {
  // Build rows of LEVELS_PER_ROW, alternating direction (snake pattern)
  const rows = [];
  for (let r = 0; r < Math.ceil(TOTAL_LEVELS / LEVELS_PER_ROW); r++) {
    const start = r * LEVELS_PER_ROW + 1;
    const end = Math.min(start + LEVELS_PER_ROW - 1, TOTAL_LEVELS);
    const levels = Array.from({ length: end - start + 1 }, (_, i) => start + i);
    // Even rows go left→right, odd rows go right→left
    rows.push(r % 2 === 0 ? levels : [...levels].reverse());
  }

  const vertConnectorColor = (rowIdx) => {
    const lastLevelInRow = (rowIdx + 1) * LEVELS_PER_ROW;
    return getLevelColor(Math.min(lastLevelInRow, TOTAL_LEVELS));
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        fontFamily: "Fredoka, sans-serif",
        background: "linear-gradient(180deg, #FFF0EF 0%, #FFF9E6 40%, #E8FFFE 100%)",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        style={{
          flexShrink: 0,
          background: `linear-gradient(135deg, ${COLOR}, #FF8C69)`,
          borderBottomLeftRadius: 28,
          borderBottomRightRadius: 28,
          padding: "12px 20px 20px",
          display: "flex",
          alignItems: "center",
          gap: 12,
          boxShadow: `0 6px 24px ${COLOR}44`,
        }}
      >
        <BackArrow onPress={onBack} />
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: "white", margin: 0, lineHeight: 1.1 }}>
            🍎 {lang === "zh" ? "短元音 a" : "Short a"}
          </h1>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.85)", margin: "3px 0 0" }}>
            {lang === "zh" ? "50 个关卡 · 开始冒险！" : "50 Levels · Start your adventure!"}
          </p>
        </div>
        <div
          style={{
            background: "rgba(255,255,255,0.25)",
            borderRadius: 14,
            padding: "6px 12px",
            textAlign: "center",
          }}
        >
          <p style={{ fontSize: 11, color: "rgba(255,255,255,0.8)", margin: 0 }}>Progress</p>
          <p style={{ fontSize: 18, fontWeight: 700, color: "white", margin: 0 }}>0/50</p>
        </div>
      </div>

      {/* Snake path scroll area */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "24px 16px calc(24px + env(safe-area-inset-bottom, 0px))",
          display: "flex",
          flexDirection: "column",
          alignItems: "stretch",
        }}
      >
        {rows.map((row, ri) => {
          // Which side does the vertical connector drop on?
          // If this row went left→right (even row), the last level is on the right → drop from right
          // If this row went right→left (odd row), the last level is on the left → drop from left
          const dropSide = ri % 2 === 0 ? "right" : "left";
          const isLastRow = ri === rows.length - 1;

          return (
            <motion.div
              key={ri}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: ri * 0.05, type: "spring", stiffness: 260, damping: 26 }}
            >
              {/* Horizontal row of levels with connector dots */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 0,
                  padding: "0 4px",
                }}
              >
                {row.map((levelNum, idx) => (
                  <div key={levelNum} style={{ display: "flex", alignItems: "center", flex: idx < row.length - 1 ? "none" : "none" }}>
                    <LevelNode levelNum={levelNum} onTap={onSelectLevel || (() => {})} />
                    {idx < row.length - 1 && (
                      <ConnectorDots color={getLevelColor(levelNum)} />
                    )}
                  </div>
                ))}
              </div>

              {/* Vertical connector to next row */}
              {!isLastRow && (
                <VerticalConnector color={vertConnectorColor(ri)} side={dropSide} />
              )}
            </motion.div>
          );
        })}

        {/* Trophy at the end */}
        <motion.div
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.7, type: "spring", stiffness: 260, damping: 20 }}
          style={{
            alignSelf: "center",
            marginTop: 8,
            background: "linear-gradient(135deg, #FFD93D, #FF9F43)",
            borderRadius: 24,
            padding: "14px 28px",
            textAlign: "center",
            boxShadow: "0 6px 24px rgba(255,159,67,0.4)",
          }}
        >
          <p style={{ fontSize: 30, margin: 0 }}>🏆</p>
          <p style={{ fontSize: 15, fontWeight: 700, color: "white", margin: "4px 0 0" }}>
            {lang === "zh" ? "终点！" : "Finish!"}
          </p>
        </motion.div>
      </div>
    </div>
  );
}