/**
 * ShortULevels — Level map for the Short U campaign (20 levels)
 */
import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import BackArrow from "../BackArrow";
import ShortULevel1 from "./ShortULevel1";
import ShortULevel2 from "./ShortULevel2";
import ShortULevel3 from "./ShortULevel3";
import ShortULevel4 from "./ShortULevel4";
import ShortULevel5 from "./ShortULevel5";
import ShortULevel6 from "./ShortULevel6";
import ShortULevel7 from "./ShortULevel7";
import ShortULevel8 from "./ShortULevel8";
import ShortULevel9 from "./ShortULevel9";
import ShortULevel10 from "./ShortULevel10";
import ShortULevel11 from "./ShortULevel11";
import ShortULevel12 from "./ShortULevel12";
import ShortULevel13 from "./ShortULevel13";
import ShortULevel14 from "./ShortULevel14";
import ShortULevel15 from "./ShortULevel15";
import ShortULevel16 from "./ShortULevel16";
import ShortULevel17 from "./ShortULevel17";
import ShortULevel18 from "./ShortULevel18";
import ShortULevel19 from "./ShortULevel19";
import ShortULevel20 from "./ShortULevel20";
import { getBestStars } from "../../lib/campaignPerformance";

const VOWEL_KEY = "short-u";
const TOTAL_LEVELS = 20;
const NODE_SPACING = 114;
const TOP_OFFSET = 36;

const LEVEL_COMPONENTS = {
  1: ShortULevel1, 2: ShortULevel2, 3: ShortULevel3, 4: ShortULevel4,
  5: ShortULevel5, 6: ShortULevel6, 7: ShortULevel7, 8: ShortULevel8,
  9: ShortULevel9, 10: ShortULevel10, 11: ShortULevel11, 12: ShortULevel12,
  13: ShortULevel13, 14: ShortULevel14, 15: ShortULevel15, 16: ShortULevel16,
  17: ShortULevel17, 18: ShortULevel18, 19: ShortULevel19, 20: ShortULevel20,
};

const LEVEL_TAGS = {
  1: "Learn",  2: "Review", 3: "Learn",  4: "Review",
  5: "Learn",  6: "Review", 7: "Learn",  8: "Review",
  9: "Learn",  10: "Review", 11: "Learn", 12: "Review",
  13: "Learn", 14: "Review", 15: "Learn", 16: "Review",
  17: "Draw",  18: "Audio",  19: "Build", 20: "Final",
};

const TAG_STYLES = {
  Learn:    { bg: "#D1FAE5", color: "#065F46" },
  Review:   { bg: "#FEF3C7", color: "#92400E" },
  Draw:     { bg: "#EDE9FE", color: "#5B21B6" },
  Audio:    { bg: "#DBEAFE", color: "#1E40AF" },
  Build:    { bg: "#FCE7F3", color: "#9D174D" },
  Final:    { bg: "#FEF2F2", color: "#991B1B" },
};

const PATH_OFFSETS = [-38, -32, -18, 0, 18, 32, 38, 32, 18, 0, -18, -32];
const NODE_COLORS = [
  "#C77DFF", "#9B5DE5", "#A78BFA", "#FF9F43", "#4D96FF",
  "#C77DFF", "#FF6B6B", "#FFD93D", "#C77DFF", "#9B5DE5",
];
function nodeColor(n) { return NODE_COLORS[(n - 1) % NODE_COLORS.length]; }
function getLeftPct(idx) { return 50 + PATH_OFFSETS[idx % PATH_OFFSETS.length]; }

function StarStrip({ stars }) {
  return (
    <div style={{ display: "flex", gap: 3, marginTop: 5, justifyContent: "center" }}>
      {[1, 2, 3].map((s) => (
        <svg key={s} width="14" height="14" viewBox="0 0 24 24"
          fill={stars >= s ? "#FFD93D" : "none"}
          stroke={stars >= s ? "#F59E0B" : "#CBD5E1"}
          strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
    </div>
  );
}

function LevelNode({ num, stars, onTap, lang }) {
  const color = nodeColor(num);
  const isFinal = num === TOTAL_LEVELS;
  const isMilestone = num % 10 === 0 && !isFinal;
  const size = isFinal ? 82 : isMilestone ? 76 : 68;
  const tag = LEVEL_TAGS[num] || "Review";
  const tagStyle = TAG_STYLES[tag] || TAG_STYLES.Review;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      {!isFinal && (
        <div style={{
          background: tagStyle.bg, color: tagStyle.color,
          fontSize: 10, fontWeight: 700, letterSpacing: 0.5,
          borderRadius: 99, padding: "2px 8px", marginBottom: 4,
          textTransform: "uppercase", fontFamily: "Fredoka, sans-serif",
        }}>
          {tag}
        </div>
      )}
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

export default function ShortULevels({ onBack, lang = "en" }) {
  const [activeLevel, setActiveLevel] = useState(null);
  const [starMap, setStarMap] = useState(() => {
    const map = {};
    for (let i = 1; i <= TOTAL_LEVELS; i++) map[i] = getBestStars(VOWEL_KEY, i);
    return map;
  });
  const scrollRef = useRef(null);

  useEffect(() => {
    const map = {};
    for (let i = 1; i <= TOTAL_LEVELS; i++) map[i] = getBestStars(VOWEL_KEY, i);
    setStarMap(map);

    const lastCompleted = Object.keys(map).map(Number).filter((lvl) => map[lvl] > 0).reduce((max, lvl) => Math.max(max, lvl), 0);
    const activeIdx = Math.max(lastCompleted, 0);
    const nodeTopPx = TOP_OFFSET + activeIdx * NODE_SPACING;
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;
    const viewportHeight = scrollContainer.clientHeight;
    const targetScrollTop = nodeTopPx - viewportHeight / 2 + NODE_SPACING / 2;
    requestAnimationFrame(() => {
      scrollContainer.scrollTo({ top: Math.max(0, targetScrollTop), behavior: "smooth" });
    });
  }, [activeLevel]);

  if (activeLevel) {
    const LevelComponent = LEVEL_COMPONENTS[activeLevel];
    if (!LevelComponent) return null;
    return <LevelComponent onBack={() => setActiveLevel(null)} lang={lang} />;
  }

  const levels = Array.from({ length: TOTAL_LEVELS }, (_, i) => i + 1);
  const totalHeight = TOP_OFFSET + TOTAL_LEVELS * NODE_SPACING + 80;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", fontFamily: "Fredoka, sans-serif", background: "linear-gradient(160deg, #F5F0FF 0%, #FFF9E6 60%, #F0E8FF 100%)", overflow: "hidden" }}>
      {/* Header */}
      <div style={{ flexShrink: 0, display: "flex", alignItems: "center", gap: 4, padding: "calc(env(safe-area-inset-top, 0px) + 8px) 16px 8px", borderBottom: "1.5px solid rgba(0,0,0,0.06)", background: "rgba(255,255,255,0.75)", backdropFilter: "blur(10px)" }}>
        <BackArrow onPress={onBack} />
        <div style={{ flex: 1 }}>
          <p style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "#1E293B" }}>☂️ {lang === "zh" ? "短元音 U" : "Short u"}</p>
          <p style={{ margin: 0, fontSize: 12, color: "#64748B" }}>{lang === "zh" ? "20 关卡冒险" : "20-level adventure"}</p>
        </div>
        <div style={{ background: "#F5F0FF", border: "1.5px solid #C77DFF", borderRadius: 99, padding: "5px 13px", display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}>
          <span style={{ fontSize: 13 }}>⚡</span>
          <span style={{ color: "#7C3AED", fontWeight: 700, fontSize: 13 }}>
            {Object.values(starMap).filter(s => s > 0).length}/{TOTAL_LEVELS}
          </span>
        </div>
      </div>

      {/* Scrollable map */}
      <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", overflowX: "hidden", position: "relative" }}>
        <div style={{ position: "relative", width: "100%", height: totalHeight }}>
          {levels.map((lvl, idx) => {
            const leftPct = getLeftPct(idx);
            const topPx = TOP_OFFSET + idx * NODE_SPACING;
            return (
              <div key={lvl} style={{ position: "absolute", top: topPx, left: `${leftPct}%`, transform: "translateX(-50%)", display: "flex", flexDirection: "column", alignItems: "center" }}>
                <LevelNode num={lvl} stars={starMap[lvl] ?? 0} onTap={setActiveLevel} lang={lang} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}