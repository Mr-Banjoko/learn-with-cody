import { useState } from "react";
import { motion } from "framer-motion";
import BackArrow from "../BackArrow";

// ─── Design tokens ────────────────────────────────────────────────
const HEADER_COLOR   = "#FF6B6B";
const NODE_PRIMARY   = "#FF7F72";   // warm coral
const NODE_MILESTONE = "#FFB830";   // golden — every 5th
const PATH_COLOR     = "#FFCEC9";   // muted coral for connectors

const NODE_SIZE      = 56;
const LEVELS_PER_ROW = 5;
const TOTAL_LEVELS   = 50;

function isMilestone(n) { return n % 5 === 0; }
function nodeColor(n)   { return isMilestone(n) ? NODE_MILESTONE : NODE_PRIMARY; }

// ─── Horizontal dashes between two nodes ─────────────────────────
function HorizPath() {
  return (
    <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}>
      {[0, 1, 2, 3].map((i) => (
        <div key={i} style={{ width: 6, height: 5, borderRadius: 3, background: PATH_COLOR }} />
      ))}
    </div>
  );
}

// ─── Curved turn between rows ─────────────────────────────────────
// Uses an SVG cubic bezier that snakes from the end of one row
// around and down to the start of the next, correctly connecting:
//   exitRight=true  → last node is on the RIGHT (levels 5, 15, 25, 35, 45)
//   exitRight=false → last node is on the LEFT  (levels 10, 20, 30, 40, 50)
function TurnConnector({ exitRight }) {
  const vw   = 320; // virtual width matching phone row
  const vh   = 54;
  const half = NODE_SIZE / 2; // 28 — horizontal centre of edge node

  const startX = exitRight ? vw - half : half;
  const endX   = exitRight ? half      : vw - half;
  const outX   = exitRight ? vw + 24   : -24; // control point outside the container

  // Single cubic bezier: exits one side, curves around, enters opposite side
  const d = `M ${startX} 0 C ${outX} 0, ${outX} ${vh}, ${endX} ${vh}`;

  return (
    <svg
      width="100%"
      height={vh}
      viewBox={`0 0 ${vw} ${vh}`}
      preserveAspectRatio="none"
      style={{ display: "block", overflow: "visible" }}
    >
      <path
        d={d}
        stroke={PATH_COLOR}
        strokeWidth={4.5}
        strokeLinecap="round"
        strokeDasharray="7 6"
        fill="none"
      />
    </svg>
  );
}

// ─── Single level node ────────────────────────────────────────────
function LevelNode({ levelNum, onTap }) {
  const [pressed, setPressed] = useState(false);
  const color  = nodeColor(levelNum);
  const ms     = isMilestone(levelNum);
  const isOne  = levelNum === 1;

  const handleTap = () => {
    setPressed(true);
    setTimeout(() => { setPressed(false); onTap(levelNum); }, 160);
  };

  return (
    <motion.button
      whileTap={{ scale: 0.82 }}
      animate={isOne ? { scale: [1, 1.08, 1] } : {}}
      transition={isOne
        ? { repeat: Infinity, duration: 1.9, repeatDelay: 1.4, ease: "easeInOut" }
        : {}}
      onClick={handleTap}
      style={{
        width: NODE_SIZE,
        height: NODE_SIZE,
        borderRadius: NODE_SIZE / 2,
        flexShrink: 0,
        background: pressed
          ? `linear-gradient(145deg, ${color}99, ${color}66)`
          : `linear-gradient(145deg, ${color}, ${color}CC)`,
        border: "none",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        boxShadow: `0 5px 0 ${color}88, 0 8px 18px ${color}44`,
        fontFamily: "Fredoka, sans-serif",
        WebkitTapHighlightColor: "transparent",
        padding: 0,
        position: "relative",
        transition: "background 0.12s",
      }}
    >
      {/* Inner ring for milestone nodes */}
      {ms && (
        <div style={{
          position: "absolute", inset: 5,
          borderRadius: "50%",
          border: "2px solid rgba(255,255,255,0.5)",
          pointerEvents: "none",
        }} />
      )}
      <span style={{
        fontSize: levelNum >= 10 ? 19 : 22,
        fontWeight: 700,
        color: "white",
        lineHeight: 1,
        textShadow: "0 1px 4px rgba(0,0,0,0.2)",
        userSelect: "none",
      }}>
        {levelNum}
      </span>
    </motion.button>
  );
}

// ─── Main page ────────────────────────────────────────────────────
export default function ShortALevels({ onBack, onSelectLevel, lang = "en" }) {
  // rows[0] = [1,2,3,4,5]  (L→R, exits right)
  // rows[1] = [10,9,8,7,6] (R→L, exits left)
  // rows[2] = [11,12,13,14,15] (L→R) …
  const rows = [];
  for (let r = 0; r < Math.ceil(TOTAL_LEVELS / LEVELS_PER_ROW); r++) {
    const start = r * LEVELS_PER_ROW + 1;
    const end   = Math.min(start + LEVELS_PER_ROW - 1, TOTAL_LEVELS);
    const lvls  = Array.from({ length: end - start + 1 }, (_, i) => start + i);
    rows.push(r % 2 === 0 ? lvls : [...lvls].reverse());
  }

  // The last row is row index 9 (levels 46–50), which is even → exits right.
  // Trophy sits to the LEFT (where level 51 would start, i.e. left side).
  // Actually rows 0,2,4,6,8 exit right → trophy on left
  //          rows 1,3,5,7,9 exit left  → trophy on right
  // Last row index = 9 (even) → exits right → trophy on LEFT.
  const lastRowExitsRight = (rows.length - 1) % 2 === 0;

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      height: "100%",
      fontFamily: "Fredoka, sans-serif",
      background: "#FFF7F5",
      overflow: "hidden",
    }}>
      {/* Header */}
      <div style={{
        flexShrink: 0,
        background: `linear-gradient(135deg, ${HEADER_COLOR}, #FF8C69)`,
        borderBottomLeftRadius: 28,
        borderBottomRightRadius: 28,
        padding: "12px 20px 18px",
        display: "flex",
        alignItems: "center",
        gap: 12,
        boxShadow: `0 6px 24px ${HEADER_COLOR}44`,
      }}>
        <BackArrow onPress={onBack} />
        <h1 style={{ fontSize: 26, fontWeight: 700, color: "white", margin: 0 }}>
          🍎 {lang === "zh" ? "短元音 a" : "Short a"}
        </h1>
      </div>

      {/* Snake path */}
      <div style={{
        flex: 1,
        overflowY: "auto",
        padding: "28px 16px calc(32px + env(safe-area-inset-bottom,0px))",
      }}>
        {rows.map((row, ri) => {
          const isLastRow  = ri === rows.length - 1;
          const exitRight  = ri % 2 === 0; // true for rows 0,2,4,6,8

          return (
            <motion.div
              key={ri}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: ri * 0.045, type: "spring", stiffness: 260, damping: 26 }}
            >
              {/* Row of nodes */}
              <div style={{ display: "flex", alignItems: "center" }}>
                {row.map((lvl, idx) => (
                  <div key={lvl} style={{ display: "flex", alignItems: "center", flex: idx < row.length - 1 ? 1 : 0 }}>
                    <LevelNode levelNum={lvl} onTap={onSelectLevel || (() => {})} />
                    {idx < row.length - 1 && <HorizPath />}
                  </div>
                ))}
              </div>

              {/* Turn arc to next row */}
              {!isLastRow && <TurnConnector exitRight={exitRight} />}
            </motion.div>
          );
        })}

        {/* Trophy — positioned under the first node of where level 51 would be */}
        <motion.div
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6, type: "spring", stiffness: 240, damping: 18 }}
          style={{
            display: "flex",
            // Last row (row 9) exits right → next start is on the left
            justifyContent: lastRowExitsRight ? "flex-start" : "flex-end",
            paddingLeft:  lastRowExitsRight ? 0        : undefined,
            paddingRight: lastRowExitsRight ? undefined : 0,
          }}
        >
          <div style={{
            width: NODE_SIZE + 8,
            height: NODE_SIZE + 8,
            borderRadius: "50%",
            background: "linear-gradient(145deg, #FFD93D, #FF9F43)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 26,
            boxShadow: "0 5px 0 #cc810099, 0 8px 24px rgba(255,159,67,0.45)",
          }}>
            🏆
          </div>
        </motion.div>
      </div>
    </div>
  );
}