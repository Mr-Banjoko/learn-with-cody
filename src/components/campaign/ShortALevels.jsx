import { useState } from "react";
import { motion } from "framer-motion";
import BackArrow from "../BackArrow";

const TOTAL_LEVELS   = 50;
const LEVELS_PER_ROW = 5;

// Pastel stepping-stone colors cycling through the path
const STONE_COLORS = [
  "#A8E6CF", // mint green
  "#FFD3B6", // peach
  "#FFAAA5", // coral pink
  "#A8D8EA", // sky blue
  "#AA96DA", // soft purple
  "#FCBAD3", // bubblegum
  "#FFE5A0", // butter yellow
];

function stoneColor(n) {
  return STONE_COLORS[(n - 1) % STONE_COLORS.length];
}

// The title letters get cycling bright colors
const TITLE_COLORS = ["#FF6B6B", "#FFB830", "#6BCB77", "#4D96FF", "#C77DFF", "#FF6B9D", "#4ECDC4"];

function ColorfulTitle({ text }) {
  return (
    <span style={{ display: "inline-flex", flexWrap: "wrap", justifyContent: "center" }}>
      {text.split("").map((ch, i) => (
        <span key={i} style={{
          color: ch === " " ? "transparent" : TITLE_COLORS[i % TITLE_COLORS.length],
          fontWeight: 800,
          WebkitTextStroke: ch === " " ? "none" : "1.5px rgba(0,0,0,0.15)",
          display: "inline-block",
          width: ch === " " ? "0.3em" : "auto",
        }}>{ch}</span>
      ))}
    </span>
  );
}

// Stepping stone — flat pill / platform shape
function Stone({ levelNum, onTap, delay = 0 }) {
  const color  = stoneColor(levelNum);
  const isOne  = levelNum === 1;

  return (
    <motion.button
      initial={{ opacity: 0, y: 20, scale: 0.7 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, type: "spring", stiffness: 280, damping: 20 }}
      whileTap={{ scale: 0.88, y: 4 }}
      // Pulse the first stone so it draws attention
      {...(isOne ? {
        animate: { opacity: 1, y: [0, -4, 0], scale: [1, 1.06, 1] },
        transition: { repeat: Infinity, duration: 2, repeatDelay: 1 }
      } : {})}
      onClick={() => onTap(levelNum)}
      style={{
        // Pill / platform shape
        width: 64,
        height: 38,
        borderRadius: 999,
        background: `linear-gradient(180deg, ${color} 0%, ${color}CC 60%, ${color}88 100%)`,
        border: "none",
        // 3D platform shadow underneath
        boxShadow: `0 6px 0 ${color}77, 0 9px 16px rgba(0,0,0,0.12)`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        fontFamily: "Fredoka, sans-serif",
        WebkitTapHighlightColor: "transparent",
        padding: 0,
        flexShrink: 0,
        position: "relative",
      }}
    >
      <span style={{
        fontSize: levelNum >= 10 ? 16 : 18,
        fontWeight: 700,
        color: "white",
        textShadow: "0 1px 4px rgba(0,0,0,0.25)",
        userSelect: "none",
        lineHeight: 1,
      }}>
        {levelNum}
      </span>
    </motion.button>
  );
}

// Small connector dots between stones in a row
function Connector() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 3, paddingBottom: 4 }}>
      {[0, 1].map(i => (
        <div key={i} style={{
          width: 5, height: 5, borderRadius: "50%",
          background: "rgba(255,255,255,0.6)",
          boxShadow: "0 1px 3px rgba(0,0,0,0.15)",
        }} />
      ))}
    </div>
  );
}

// Build snake rows
function buildRows() {
  const rows = [];
  for (let r = 0; r < Math.ceil(TOTAL_LEVELS / LEVELS_PER_ROW); r++) {
    const start = r * LEVELS_PER_ROW + 1;
    const end   = Math.min(start + LEVELS_PER_ROW - 1, TOTAL_LEVELS);
    const lvls  = Array.from({ length: end - start + 1 }, (_, i) => start + i);
    rows.push(r % 2 === 0 ? lvls : [...lvls].reverse());
  }
  return rows;
}

// Decorative floating elements for the background
const DECO = [
  { emoji: "⭐", top: "4%",  left: "8%",  size: 22, delay: 0 },
  { emoji: "✨", top: "8%",  left: "75%", size: 18, delay: 0.4 },
  { emoji: "🌸", top: "15%", left: "88%", size: 20, delay: 0.2 },
  { emoji: "🍀", top: "28%", left: "6%",  size: 18, delay: 0.6 },
  { emoji: "🌼", top: "55%", left: "92%", size: 16, delay: 0.3 },
  { emoji: "💫", top: "72%", left: "5%",  size: 20, delay: 0.8 },
  { emoji: "🌈", top: "5%",  left: "45%", size: 24, delay: 0.1 },
];

export default function ShortALevels({ onBack, onSelectLevel, lang = "en" }) {
  const rows = buildRows();

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      height: "100%",
      fontFamily: "Fredoka, sans-serif",
      overflow: "hidden",
      position: "relative",
      // Sky-to-grass gradient background like the reference
      background: "linear-gradient(180deg, #87CEEB 0%, #B0E0FF 25%, #C8F5A0 60%, #7EC850 100%)",
    }}>

      {/* ── Decorative background elements ── */}
      {DECO.map((d, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1, y: [0, -6, 0] }}
          transition={{ delay: d.delay, y: { repeat: Infinity, duration: 2.5 + i * 0.3, ease: "easeInOut" } }}
          style={{
            position: "absolute",
            top: d.top, left: d.left,
            fontSize: d.size,
            pointerEvents: "none",
            zIndex: 1,
          }}
        >
          {d.emoji}
        </motion.div>
      ))}

      {/* Clouds */}
      {[
        { top: "3%", left: "15%", w: 70 },
        { top: "6%", left: "55%", w: 90 },
        { top: "2%", left: "80%", w: 60 },
      ].map((c, i) => (
        <motion.div
          key={i}
          animate={{ x: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 6 + i * 1.5, ease: "easeInOut" }}
          style={{
            position: "absolute",
            top: c.top, left: c.left,
            width: c.w, height: c.w * 0.45,
            borderRadius: 999,
            background: "rgba(255,255,255,0.85)",
            boxShadow: "0 4px 12px rgba(255,255,255,0.5)",
            zIndex: 1,
            pointerEvents: "none",
          }}
        />
      ))}

      {/* Grass stripe at bottom */}
      <div style={{
        position: "absolute",
        bottom: 0, left: 0, right: 0,
        height: "28%",
        background: "linear-gradient(180deg, #7EC850 0%, #5BAD30 100%)",
        zIndex: 1,
        borderTopLeftRadius: 40,
        borderTopRightRadius: 40,
        pointerEvents: "none",
      }} />
      {/* Grass texture dots */}
      {[...Array(8)].map((_, i) => (
        <div key={i} style={{
          position: "absolute",
          bottom: `${8 + Math.random() * 10}%`,
          left: `${5 + i * 12}%`,
          width: 12, height: 16,
          background: "#4A9E25",
          borderRadius: "50% 50% 0 0",
          zIndex: 2,
          pointerEvents: "none",
          transform: `rotate(${-10 + i * 5}deg)`,
        }} />
      ))}

      {/* ── Back button ── */}
      <div style={{ position: "absolute", top: 10, left: 10, zIndex: 20 }}>
        <BackArrow onPress={onBack} />
      </div>

      {/* ── Colorful title ── */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 22 }}
        style={{
          flexShrink: 0,
          textAlign: "center",
          paddingTop: 14,
          paddingBottom: 4,
          zIndex: 10,
        }}
      >
        <div style={{
          fontSize: 22,
          fontWeight: 800,
          letterSpacing: 1,
          lineHeight: 1.1,
          textShadow: "0 2px 8px rgba(0,0,0,0.18)",
          filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.12))",
          fontFamily: "Fredoka, sans-serif",
        }}>
          <ColorfulTitle text={lang === "zh" ? "短元音  A  冒险" : "SHORT VOWEL  A  ADVENTURE"} />
        </div>
        <div style={{
          fontSize: 13,
          fontWeight: 700,
          color: "#FF6B6B",
          letterSpacing: 2,
          marginTop: 2,
          textShadow: "0 1px 4px rgba(0,0,0,0.15)",
          textTransform: "uppercase",
        }}>
          {lang === "zh" ? "选择关卡！" : "Choose your level!"}
        </div>
      </motion.div>

      {/* ── Snake level path ── */}
      <div style={{
        flex: 1,
        overflowY: "auto",
        zIndex: 10,
        padding: "8px 12px calc(24px + env(safe-area-inset-bottom,0px))",
        position: "relative",
      }}>
        {rows.map((row, ri) => {
          const isLastRow = ri === rows.length - 1;
          const exitRight = ri % 2 === 0;
          const rowDelay  = ri * 0.04;

          return (
            <div key={ri}>
              {/* Row of stones */}
              <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
                {row.map((lvl, idx) => (
                  <div key={lvl} style={{ display: "flex", alignItems: "flex-end", flex: idx < row.length - 1 ? 1 : 0 }}>
                    <Stone levelNum={lvl} onTap={onSelectLevel || (() => {})} delay={rowDelay + idx * 0.03} />
                    {idx < row.length - 1 && <Connector />}
                  </div>
                ))}
              </div>

              {/* Turn arc connector */}
              {!isLastRow && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: rowDelay + 0.2 }}
                >
                  <TurnArc exitRight={exitRight} />
                </motion.div>
              )}
            </div>
          );
        })}

        {/* Trophy / finish castle */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.7, type: "spring", stiffness: 240, damping: 16 }}
          style={{
            display: "flex",
            justifyContent: (rows.length - 1) % 2 === 0 ? "flex-start" : "flex-end",
            marginTop: 4,
          }}
        >
          <div style={{
            width: 64, height: 64,
            borderRadius: "50%",
            background: "linear-gradient(145deg, #FFD93D, #FF9F43)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 30,
            boxShadow: "0 6px 0 #cc810099, 0 10px 24px rgba(255,159,67,0.5)",
          }}>
            🏆
          </div>
        </motion.div>
      </div>
    </div>
  );
}

// ─── SVG turn arc connecting end of one row to start of next ─────
function TurnArc({ exitRight }) {
  const vw   = 320;
  const vh   = 48;
  const half = 32; // half of stone width (64/2)

  const startX = exitRight ? vw - half : half;
  const endX   = exitRight ? half      : vw - half;
  const outX   = exitRight ? vw + 20   : -20;

  const d = `M ${startX} 0 C ${outX} 0, ${outX} ${vh}, ${endX} ${vh}`;

  return (
    <svg
      width="100%"
      height={vh}
      viewBox={`0 0 ${vw} ${vh}`}
      preserveAspectRatio="none"
      style={{ display: "block", overflow: "visible" }}
    >
      <path d={d} stroke="rgba(255,255,255,0.5)" strokeWidth={3} strokeLinecap="round"
            strokeDasharray="5 5" fill="none" />
    </svg>
  );
}