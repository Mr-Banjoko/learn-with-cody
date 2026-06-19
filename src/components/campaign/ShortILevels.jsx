/**
 * ShortILevels — Level map for the Short I campaign (31 levels)
 * Level 1 at top, level 31 at bottom. All levels visible; completed ones shown with stars.
 */
import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import BackArrow from "../BackArrow";
import ShortILevel1 from "./ShortILevel1";
import ShortILevel2 from "./ShortILevel2";
import ShortILevel3 from "./ShortILevel3";
import ShortILevel4 from "./ShortILevel4";
import ShortILevel5 from "./ShortILevel5";
import ShortILevel6 from "./ShortILevel6";
import ShortILevel7 from "./ShortILevel7";
import ShortILevel8 from "./ShortILevel8";
import ShortILevel9 from "./ShortILevel9";
import ShortILevel10 from "./ShortILevel10";
import ShortILevel11 from "./ShortILevel11";
import ShortILevel12 from "./ShortILevel12";
import ShortILevel13 from "./ShortILevel13";
import ShortILevel14 from "./ShortILevel14";
import ShortILevel15 from "./ShortILevel15";
import ShortILevel16 from "./ShortILevel16";
import ShortILevel17 from "./ShortILevel17";
import ShortILevel18 from "./ShortILevel18";
import ShortILevel19 from "./ShortILevel19";
import ShortILevel20 from "./ShortILevel20";
import ShortILevel21 from "./ShortILevel21";
import ShortILevel22 from "./ShortILevel22";
import ShortILevel23 from "./ShortILevel23";
import ShortILevel24 from "./ShortILevel24";
import ShortILevel25 from "./ShortILevel25";
import ShortILevel26 from "./ShortILevel26";
import ShortILevel27 from "./ShortILevel27";
import ShortILevel28 from "./ShortILevel28";
import ShortILevel29 from "./ShortILevel29";
import ShortILevel30 from "./ShortILevel30";
import ShortILevel31 from "./ShortILevel31";
import ShortILevel32 from "./ShortILevel32";
import ShortILevel33 from "./ShortILevel33";
import ShortILevel34 from "./ShortILevel34";
import ShortILevel35 from "./ShortILevel35";
import ShortILevel36 from "./ShortILevel36";
import ShortILevel37 from "./ShortILevel37";
import ShortILevel38 from "./ShortILevel38";
import { getBestStars } from "../../lib/campaignPerformance";

const VOWEL_KEY = "short-i";
const TOTAL_LEVELS = 38;
const NODE_SPACING = 114;
const TOP_OFFSET = 36;

const LEVEL_COMPONENTS = {
  1: ShortILevel1, 2: ShortILevel2, 3: ShortILevel3, 4: ShortILevel4,
  5: ShortILevel5, 6: ShortILevel6, 7: ShortILevel7, 8: ShortILevel8,
  9: ShortILevel9, 10: ShortILevel10, 11: ShortILevel11, 12: ShortILevel12,
  13: ShortILevel13, 14: ShortILevel14, 15: ShortILevel15, 16: ShortILevel16,
  17: ShortILevel17, 18: ShortILevel18, 19: ShortILevel19, 20: ShortILevel20,
  21: ShortILevel21, 22: ShortILevel22, 23: ShortILevel23, 24: ShortILevel24,
  25: ShortILevel25, 26: ShortILevel26, 27: ShortILevel27, 28: ShortILevel28,
  29: ShortILevel29, 30: ShortILevel30, 31: ShortILevel31,
  32: ShortILevel32, 33: ShortILevel33, 34: ShortILevel34, 35: ShortILevel35,
  36: ShortILevel36, 37: ShortILevel37, 38: ShortILevel38,
};

const LEVEL_TAGS = {
  1: "Learn", 2: "Practice", 3: "Practice", 4: "Review",
  5: "Learn", 6: "Practice", 7: "Review", 8: "Practice",
  9: "Learn", 10: "Learn", 11: "Practice", 12: "Review",
  13: "Draw", 14: "Learn", 15: "Learn", 16: "Practice",
  17: "Write", 18: "Write", 19: "Listen", 20: "Review",
  21: "Learn", 22: "Learn", 23: "Practice", 24: "Draw",
  25: "Write", 26: "Write", 27: "Review", 28: "Practice",
  29: "Match", 30: "Catch", 31: "Final",
  32: "Learn", 33: "Learn", 34: "Learn", 35: "Learn",
  36: "Practice", 37: "Write", 38: "Write",
};

const TAG_STYLES = {
  Learn:    { bg: "#D1FAE5", color: "#065F46" },
  Practice: { bg: "#DBEAFE", color: "#1E40AF" },
  Review:   { bg: "#FEF3C7", color: "#92400E" },
  Draw:     { bg: "#EDE9FE", color: "#5B21B6" },
  Write:    { bg: "#FCE7F3", color: "#9D174D" },
  Listen:   { bg: "#E0F2FE", color: "#0369A1" },
  Match:    { bg: "#FEF9C3", color: "#854D0E" },
  Catch:    { bg: "#DCFCE7", color: "#166534" },
  Final:    { bg: "#FEF2F2", color: "#991B1B" },
};

const PATH_OFFSETS = [-38, -32, -18, 0, 18, 32, 38, 32, 18, 0, -18, -32];

const NODE_COLORS = [
  "#4D96FF", "#6BCB77", "#FF9F43", "#4ECDC4", "#C77DFF",
  "#FF6B6B", "#FFD93D", "#4D96FF", "#6BCB77", "#FF9F43",
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
  const tag = LEVEL_TAGS[num] || "Practice";
  const tagStyle = TAG_STYLES[tag] || TAG_STYLES.Practice;

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

export default function ShortILevels({ onBack, lang = "en" }) {
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
    const activeIdx = Math.max(lastCompleted, 0); // 0-indexed
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
    return (
      <LevelComponent
        onBack={() => {
          setActiveLevel(null);
        }}
        lang={lang}
      />
    );
  }

  const levels = Array.from({ length: TOTAL_LEVELS }, (_, i) => i + 1);
  const totalHeight = TOP_OFFSET + TOTAL_LEVELS * NODE_SPACING + 80;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", fontFamily: "Fredoka, sans-serif", background: "linear-gradient(160deg, #F0F8FF 0%, #E8FFF5 60%, #F5F0FF 100%)", overflow: "hidden" }}>
      {/* Header */}
      <div style={{ flexShrink: 0, display: "flex", alignItems: "center", gap: 4, padding: "calc(env(safe-area-inset-top, 0px) + 8px) 16px 8px", borderBottom: "1.5px solid rgba(0,0,0,0.06)", background: "rgba(255,255,255,0.75)", backdropFilter: "blur(10px)" }}>
        <BackArrow onPress={onBack} />
        <div style={{ flex: 1 }}>
          <p style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "#1E293B" }}>🐛 {lang === "zh" ? "短元音 I" : "Short i"}</p>
          <p style={{ margin: 0, fontSize: 12, color: "#64748B" }}>{lang === "zh" ? "38 关卡冒险" : "38-level adventure"}</p>
        </div>
        <div style={{ background: "#EFF6FF", border: "1.5px solid #4D96FF", borderRadius: 99, padding: "5px 13px", display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}>
          <span style={{ fontSize: 13 }}>⚡</span>
          <span style={{ color: "#1D4ED8", fontWeight: 700, fontSize: 13 }}>
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