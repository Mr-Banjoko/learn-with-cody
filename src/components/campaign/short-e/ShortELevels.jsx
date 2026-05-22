/**
 * ShortELevels — winding-path level map for Short E (22 levels)
 */
import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import BackArrow from "../../BackArrow";
import { getBestStars } from "../../../lib/campaignPerformance";

const TOTAL_LEVELS = 22;
const PATH_OFFSETS = [-38, -32, -18, 0, 18, 32, 38, 32, 18, 0, -18, -32];

function getLeftPct(idx) {
  return 50 + PATH_OFFSETS[idx % PATH_OFFSETS.length];
}

const NODE_COLORS = [
  "#FF6B6B", "#FF9F43", "#FFD93D", "#6BCB77",
  "#4ECDC4", "#4D96FF", "#C77DFF",
];

function nodeColor(n) {
  return NODE_COLORS[(n - 1) % NODE_COLORS.length];
}

function StarStrip({ stars }) {
  return (
    <div style={{ display: "flex", gap: 3, marginTop: 5, justifyContent: "center" }}>
      {[1, 2, 3].map((s) => (
        <svg key={s} width="14" height="14" viewBox="0 0 24 24" fill={stars >= s ? "#FFD93D" : "none"} stroke={stars >= s ? "#F59E0B" : "#CBD5E1"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
    </div>
  );
}

function LevelNode({ num, color, onTap, isMilestone, stars, isFinal, lang = "en" }) {
  const size = isFinal ? 82 : isMilestone ? 76 : 68;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <motion.div
        whileTap={{ scale: 0.85 }}
        onClick={() => onTap(num)}
        style={{
          width: size, height: size, borderRadius: "50%",
          background: isFinal
            ? "linear-gradient(145deg, #FFD700, #FFA500)"
            : `linear-gradient(145deg, ${color} 0%, ${color}CC 100%)`,
          border: isFinal ? "4px solid white" : "3px solid white",
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          cursor: "pointer",
          boxShadow: isFinal
            ? "0 7px 0 #cc8800, 0 12px 28px rgba(255,165,0,0.55)"
            : `0 6px 0 ${color}99, 0 10px 22px ${color}44`,
          WebkitTapHighlightColor: "transparent",
          position: "relative", flexShrink: 0,
        }}
      >
        {isFinal ? (
          <span style={{ fontSize: 36, pointerEvents: "none", lineHeight: 1 }}>🏆</span>
        ) : (
          <>
            {isMilestone && <span style={{ position: "absolute", top: -18, fontSize: 18, pointerEvents: "none" }}>⭐</span>}
            <span style={{ fontSize: num >= 10 ? 20 : 24, fontWeight: 700, color: "white", textShadow: "0 1px 4px rgba(0,0,0,0.20)", userSelect: "none", lineHeight: 1, pointerEvents: "none" }}>{num}</span>
            {isMilestone && <span style={{ fontSize: 9, color: "rgba(255,255,255,0.9)", pointerEvents: "none", lineHeight: 1, marginTop: 2, letterSpacing: 0.5 }}>BOSS</span>}
          </>
        )}
      </motion.div>
      {isFinal ? (
        <span style={{ color: "#F59E0B", fontSize: 13, fontWeight: 700, marginTop: 6 }}>{lang === "zh" ? "完成！" : "Complete!"}</span>
      ) : (
        <StarStrip stars={stars} />
      )}
    </div>
  );
}

export default function ShortELevels({ onBack, onSelectLevel, lang = "en" }) {
  const levels = Array.from({ length: TOTAL_LEVELS }, (_, i) => i + 1);
  const NODE_SPACING = 100;
  const TOP_OFFSET = 36;
  const scrollRef = useRef(null);

  const [starMap, setStarMap] = useState(() => {
    const map = {};
    for (let i = 1; i <= TOTAL_LEVELS; i++) map[i] = getBestStars("short-e", i);
    return map;
  });

  useEffect(() => {
    const map = {};
    for (let i = 1; i <= TOTAL_LEVELS; i++) map[i] = getBestStars("short-e", i);
    setStarMap(map);
    const lastCompleted = Object.keys(map).map(Number).filter((lvl) => map[lvl] > 0).reduce((max, lvl) => Math.max(max, lvl), 0);
    const activeLevel = Math.min(lastCompleted + 1, TOTAL_LEVELS);
    const activeIdx = activeLevel - 1;
    const nodeTopPx = TOP_OFFSET + activeIdx * NODE_SPACING;
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;
    const viewportHeight = scrollContainer.clientHeight;
    const targetScrollTop = nodeTopPx - viewportHeight / 2 + NODE_SPACING / 2;
    requestAnimationFrame(() => {
      scrollContainer.scrollTo({ top: Math.max(0, targetScrollTop), behavior: "smooth" });
    });
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", fontFamily: "Fredoka, sans-serif", background: "linear-gradient(160deg, #E8FFFE 0%, #FFF9E6 60%, #F5F0FF 100%)", overflow: "hidden" }}>
      <div style={{ flexShrink: 0, display: "flex", alignItems: "center", gap: 4, padding: "calc(env(safe-area-inset-top, 0px) + 8px) 16px 8px", borderBottom: "1.5px solid rgba(0,0,0,0.06)", background: "rgba(255,255,255,0.75)", backdropFilter: "blur(10px)" }}>
        <BackArrow onPress={onBack} />
        <div style={{ flex: 1 }}>
          <p style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "#1E293B" }}>🥚 {lang === "zh" ? "短元音 E" : "Short e"}</p>
          <p style={{ margin: 0, fontSize: 12, color: "#64748B" }}>{lang === "zh" ? "22 关卡冒险" : "22-level adventure"}</p>
        </div>
        <div style={{ background: "#FFF9E6", border: "1.5px solid #FFD93D", borderRadius: 99, padding: "5px 13px", display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}>
          <span style={{ fontSize: 13 }}>⚡</span>
          <span style={{ color: "#B45309", fontWeight: 700, fontSize: 13 }}>0 XP</span>
        </div>
      </div>
      <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", overflowX: "hidden", position: "relative" }}>
        <div style={{ position: "relative", width: "100%", height: TOP_OFFSET + TOTAL_LEVELS * NODE_SPACING + 80 }}>
          {levels.map((lvl, idx) => {
            const leftPct = getLeftPct(idx);
            const topPx = TOP_OFFSET + idx * NODE_SPACING;
            const color = nodeColor(lvl);
            const isMilestone = lvl % 10 === 0;
            return (
              <div key={lvl} style={{ position: "absolute", top: topPx, left: `${leftPct}%`, transform: "translateX(-50%)", display: "flex", flexDirection: "column", alignItems: "center" }}>
                <LevelNode num={lvl} color={color} isMilestone={isMilestone} isFinal={lvl === TOTAL_LEVELS} onTap={onSelectLevel || (() => {})} stars={starMap[lvl] ?? 0} lang={lang} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}