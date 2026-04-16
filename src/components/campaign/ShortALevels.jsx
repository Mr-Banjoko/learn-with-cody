import { motion } from "framer-motion";
import BackArrow from "../BackArrow";

const TOTAL_LEVELS = 50;

// Node colors cycling — warm, friendly palette
const NODE_COLORS = [
  "#FF6B6B", // coral
  "#FF9F43", // orange
  "#FFD93D", // yellow
  "#6BCB77", // green
  "#4ECDC4", // teal
  "#4D96FF", // blue
  "#C77DFF", // purple
];

function nodeColor(n) {
  return NODE_COLORS[(n - 1) % NODE_COLORS.length];
}

// Duolingo-style zigzag: each row has 3 nodes offset horizontally
// Pattern: center, right, center, left, center, right, center, left...
// We'll do a single-column winding path with alternating offsets
const OFFSETS = [0, 1, 2, 1, 0, -1, -2, -1]; // repeating zigzag pattern

function getOffset(index) {
  return OFFSETS[index % OFFSETS.length];
}

// Convert offset (-2 to 2) to a left% position
// Center = 50%, each step = 16%
function offsetToLeft(offset) {
  return 50 + offset * 16;
}

export default function ShortALevels({ onBack, onSelectLevel, lang = "en", onStartLevel }) {
  const levels = Array.from({ length: TOTAL_LEVELS }, (_, i) => i + 1);

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      height: "100%",
      fontFamily: "Fredoka, sans-serif",
      background: "linear-gradient(180deg, #1CB0F6 0%, #0F87CC 100%)",
      overflow: "hidden",
    }}>
      {/* Header */}
      <div style={{
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "14px 16px 10px",
        background: "rgba(0,0,0,0.12)",
        backdropFilter: "blur(4px)",
      }}>
        <BackArrow onPress={onBack} />
        <span style={{
          fontSize: 22,
          fontWeight: 700,
          color: "white",
          textShadow: "0 1px 4px rgba(0,0,0,0.2)",
        }}>
          🍎 {lang === "zh" ? "短元音 A" : "Short A"}
        </span>
      </div>

      {/* Scrollable path */}
      <div style={{
        flex: 1,
        overflowY: "auto",
        position: "relative",
        padding: "20px 0 40px",
      }}>
        {/* The path is drawn as a series of absolutely-positioned nodes */}
        <div style={{ position: "relative", width: "100%" }}>
          {levels.map((lvl, idx) => {
            const offset = getOffset(idx);
            const leftPct = offsetToLeft(offset);
            const color = nodeColor(lvl);
            const isMilestone = lvl % 5 === 0;
            const isFirst = lvl === 1;

            // Vertical spacing between nodes
            const topPx = idx * 88;

            return (
              <motion.div
                key={lvl}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  delay: Math.min(idx * 0.02, 0.8),
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
                }}
              >
                <LevelNode
                  levelNum={lvl}
                  color={color}
                  isMilestone={isMilestone}
                  isFirst={isFirst}
                  onTap={(n) => {
                    if (n === 1 && onStartLevel) onStartLevel(1);
                    else if (onSelectLevel) onSelectLevel(n);
                  }}
                />
              </motion.div>
            );
          })}

          {/* Trophy at the end */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, type: "spring", stiffness: 260, damping: 18 }}
            style={{
              position: "absolute",
              top: TOTAL_LEVELS * 88,
              left: `${offsetToLeft(getOffset(TOTAL_LEVELS))}%`,
              transform: "translateX(-50%)",
            }}
          >
            <div style={{
              width: 72,
              height: 72,
              borderRadius: "50%",
              background: "linear-gradient(145deg, #FFD700, #FFA500)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 34,
              boxShadow: "0 6px 0 #cc8800, 0 10px 28px rgba(255,165,0,0.5)",
            }}>
              🏆
            </div>
          </motion.div>

          {/* Spacer to ensure scroll area fits all nodes */}
          <div style={{ height: TOTAL_LEVELS * 88 + 160 }} />
        </div>
      </div>
    </div>
  );
}

// ─── Individual level node ─────────────────────────────────────────
function LevelNode({ levelNum, color, isMilestone, isFirst, onTap }) {
  const size = isMilestone ? 72 : 64;

  return (
    <motion.div
      whileTap={{ scale: 0.84, y: 4 }}
      animate={isFirst
        ? { scale: [1, 1.1, 1] }
        : {}
      }
      transition={isFirst
        ? { repeat: Infinity, duration: 1.8, repeatDelay: 1.2, ease: "easeInOut" }
        : {}
      }
      onClick={() => onTap(levelNum)}
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: `linear-gradient(145deg, ${color}, ${color}BB)`,
        border: `4px solid rgba(255,255,255,0.35)`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        boxShadow: `0 7px 0 ${color}99, 0 10px 24px ${color}55`,
        fontFamily: "Fredoka, sans-serif",
        WebkitTapHighlightColor: "transparent",
        padding: 0,
        position: "relative",
        flexShrink: 0,
      }}
    >
      {isMilestone && (
        <div style={{
          position: "absolute",
          top: -14,
          fontSize: 18,
          filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.2))",
        }}>
          ⭐
        </div>
      )}
      <span style={{
        fontSize: levelNum >= 10 ? 20 : 24,
        fontWeight: 700,
        color: "white",
        textShadow: "0 1px 5px rgba(0,0,0,0.25)",
        userSelect: "none",
        lineHeight: 1,
      }}>
        {levelNum}
      </span>
    </motion.div>
  );
}