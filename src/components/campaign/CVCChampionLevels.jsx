/**
 * CVCChampionLevels — Level map for the CVC Champion campaign (88 levels).
 * Final world mixing all short-vowel CVC words. Design/colors mirror Short E.
 * Only implemented levels are tappable — others are visibly locked for now.
 */
import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import BackArrow from "../BackArrow";
import CVCChampionLevel1 from "./CVCChampionLevel1";
import CVCChampionLevel2 from "./CVCChampionLevel2";
import CVCChampionLevel3 from "./CVCChampionLevel3";
import CVCChampionLevel4 from "./CVCChampionLevel4";
import CVCChampionLevel5 from "./CVCChampionLevel5";
import CVCChampionLevel6 from "./CVCChampionLevel6";
import CVCChampionLevel7 from "./CVCChampionLevel7";
import CVCChampionLevel8 from "./CVCChampionLevel8";
import CVCChampionLevel9 from "./CVCChampionLevel9";
import CVCChampionLevel10 from "./CVCChampionLevel10";
import CVCChampionLevel11 from "./CVCChampionLevel11";
import CVCChampionLevel12 from "./CVCChampionLevel12";
import CVCChampionLevel13 from "./CVCChampionLevel13";
import CVCChampionLevel14 from "./CVCChampionLevel14";
import CVCChampionLevel15 from "./CVCChampionLevel15";
import CVCChampionLevel16 from "./CVCChampionLevel16";
import CVCChampionLevel17 from "./CVCChampionLevel17";
import CVCChampionLevel18 from "./CVCChampionLevel18";
import CVCChampionLevel19 from "./CVCChampionLevel19";
import CVCChampionLevel20 from "./CVCChampionLevel20";
import CVCChampionLevel21 from "./CVCChampionLevel21";
import CVCChampionLevel22 from "./CVCChampionLevel22";
import CVCChampionLevel23 from "./CVCChampionLevel23";
import CVCChampionLevel24 from "./CVCChampionLevel24";
import CVCChampionLevel25 from "./CVCChampionLevel25";
import CVCChampionLevel26 from "./CVCChampionLevel26";
import CVCChampionLevel27 from "./CVCChampionLevel27";
import CVCChampionLevel28 from "./CVCChampionLevel28";
import CVCChampionLevel29 from "./CVCChampionLevel29";
import CVCChampionLevel30 from "./CVCChampionLevel30";
import CVCChampionLevel31 from "./CVCChampionLevel31";
import CVCChampionLevel32 from "./CVCChampionLevel32";
import CVCChampionLevel33 from "./CVCChampionLevel33";
import CVCChampionLevel34 from "./CVCChampionLevel34";
import CVCChampionLevel35 from "./CVCChampionLevel35";
import CVCChampionLevel36 from "./CVCChampionLevel36";
import CVCChampionLevel37 from "./CVCChampionLevel37";
import CVCChampionLevel38 from "./CVCChampionLevel38";
import CVCChampionLevel39 from "./CVCChampionLevel39";
import CVCChampionLevel40 from "./CVCChampionLevel40";
import CVCChampionLevel41 from "./CVCChampionLevel41";
import CVCChampionLevel42 from "./CVCChampionLevel42";
import CVCChampionLevel43 from "./CVCChampionLevel43";
import CVCChampionLevel44 from "./CVCChampionLevel44";
import CVCChampionLevel45 from "./CVCChampionLevel45";
import CVCChampionLevel46 from "./CVCChampionLevel46";
import CVCChampionLevel47 from "./CVCChampionLevel47";
import CVCChampionLevel48 from "./CVCChampionLevel48";
import CVCChampionLevel49 from "./CVCChampionLevel49";
import CVCChampionLevel50 from "./CVCChampionLevel50";
import CVCChampionLevel51 from "./CVCChampionLevel51";
import CVCChampionLevel52 from "./CVCChampionLevel52";
import CVCChampionLevel53 from "./CVCChampionLevel53";
import { getBestStars } from "../../lib/campaignPerformance";

const VOWEL_KEY = "cvc-champion";
const TOTAL_LEVELS = 88;
const NODE_SPACING = 114;
const TOP_OFFSET = 36;

const LEVEL_COMPONENTS = {
  1: CVCChampionLevel1,
  2: CVCChampionLevel2,
  3: CVCChampionLevel3,
  4: CVCChampionLevel4,
  5: CVCChampionLevel5,
  6: CVCChampionLevel6,
  7: CVCChampionLevel7,
  8: CVCChampionLevel8,
  9: CVCChampionLevel9,
  10: CVCChampionLevel10,
  11: CVCChampionLevel11,
  12: CVCChampionLevel12,
  13: CVCChampionLevel13,
  14: CVCChampionLevel14,
  15: CVCChampionLevel15,
  16: CVCChampionLevel16,
  17: CVCChampionLevel17,
  18: CVCChampionLevel18,
  19: CVCChampionLevel19,
  20: CVCChampionLevel20,
  21: CVCChampionLevel21,
  22: CVCChampionLevel22,
  23: CVCChampionLevel23,
  24: CVCChampionLevel24,
  25: CVCChampionLevel25,
  26: CVCChampionLevel26,
  27: CVCChampionLevel27,
  28: CVCChampionLevel28,
  29: CVCChampionLevel29,
  30: CVCChampionLevel30,
  31: CVCChampionLevel31,
  32: CVCChampionLevel32,
  33: CVCChampionLevel33,
  34: CVCChampionLevel34,
  35: CVCChampionLevel35,
  36: CVCChampionLevel36,
  37: CVCChampionLevel37,
  38: CVCChampionLevel38,
  39: CVCChampionLevel39,
  40: CVCChampionLevel40,
  41: CVCChampionLevel41,
  42: CVCChampionLevel42,
  43: CVCChampionLevel43,
  44: CVCChampionLevel44,
  45: CVCChampionLevel45,
  46: CVCChampionLevel46,
  47: CVCChampionLevel47,
  48: CVCChampionLevel48,
  49: CVCChampionLevel49,
  50: CVCChampionLevel50,
  51: CVCChampionLevel51,
  52: CVCChampionLevel52,
  53: CVCChampionLevel53,
};

const LEVEL_TAGS = {
  1: "Learn",
  2: "Learn",
  3: "Practice",
  4: "Practice",
  5: "Review",
  6: "Learn",
  7: "Practice",
  8: "Practice",
  9: "Review",
  10: "Learn",
  11: "Practice",
  12: "Practice",
  13: "Review",
  14: "Learn",
  15: "Practice",
  16: "Practice",
  17: "Review",
  18: "Learn",
  19: "Practice",
  20: "Practice",
  21: "Review",
  22: "Learn",
  23: "Practice",
  24: "Practice",
  25: "Review",
  26: "Learn",
  27: "Practice",
  28: "Practice",
  29: "Review",
  30: "Learn",
  31: "Practice",
  32: "Practice",
  33: "Review",
  34: "Learn",
  35: "Practice",
  36: "Practice",
  37: "Review",
  38: "Learn",
  39: "Practice",
  40: "Practice",
  41: "Review",
  42: "Learn",
  43: "Practice",
  44: "Practice",
  45: "Review",
  46: "Learn",
  47: "Practice",
  48: "Practice",
  49: "Review",
  50: "Learn",
  51: "Practice",
  52: "Practice",
  53: "Review",
};

const TAG_STYLES = {
  Learn:    { bg: "#D1FAE5", color: "#065F46" },
  Practice: { bg: "#DBEAFE", color: "#1E40AF" },
  Review:   { bg: "#FEF3C7", color: "#92400E" },
};

const PATH_OFFSETS = [-38, -32, -18, 0, 18, 32, 38, 32, 18, 0, -18, -32];
const NODE_COLORS = [
  "#4ECDC4", "#44A08D", "#6BCB77", "#FF9F43", "#4D96FF",
  "#C77DFF", "#FF6B6B", "#FFD93D", "#4ECDC4", "#44A08D",
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

function LevelNode({ num, stars, onTap, lang, available }) {
  const color = nodeColor(num);
  const isFinal = num === TOTAL_LEVELS;
  const isMilestone = num % 10 === 0 && !isFinal;
  const size = isFinal ? 82 : isMilestone ? 76 : 68;
  const tag = LEVEL_TAGS[num] || "Practice";
  const tagStyle = TAG_STYLES[tag] || TAG_STYLES.Practice;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", opacity: available ? 1 : 0.4 }}>
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
        whileTap={available ? { scale: 0.85 } : {}}
        onClick={() => available && onTap(num)}
        style={{
          width: size, height: size, borderRadius: "50%",
          background: isFinal
            ? "linear-gradient(145deg, #FFD700, #FFA500)"
            : `linear-gradient(145deg, ${color} 0%, ${color}CC 100%)`,
          border: isFinal ? "4px solid white" : "3px solid white",
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          cursor: available ? "pointer" : "default",
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

export default function CVCChampionLevels({ onBack, lang = "en" }) {
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
    <div style={{ display: "flex", flexDirection: "column", height: "100%", fontFamily: "Fredoka, sans-serif", background: "linear-gradient(160deg, #E8FFF8 0%, #F0FFF4 60%, #E8F4FF 100%)", overflow: "hidden" }}>
      {/* Header */}
      <div style={{ flexShrink: 0, display: "flex", alignItems: "center", gap: 4, padding: "calc(env(safe-area-inset-top, 0px) + 8px) 16px 8px", borderBottom: "1.5px solid rgba(0,0,0,0.06)", background: "rgba(255,255,255,0.75)", backdropFilter: "blur(10px)" }}>
        <BackArrow onPress={onBack} />
        <div style={{ flex: 1 }}>
          <p style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "#1E293B" }}>🏆 {lang === "zh" ? "CVC 冠军" : "CVC Champion"}</p>
          <p style={{ margin: 0, fontSize: 12, color: "#64748B" }}>{lang === "zh" ? "88 关卡冒险" : "88-level adventure"}</p>
        </div>
        <div style={{ background: "#E8FFF8", border: "1.5px solid #4ECDC4", borderRadius: 99, padding: "5px 13px", display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}>
          <span style={{ fontSize: 13 }}>⚡</span>
          <span style={{ color: "#0D7377", fontWeight: 700, fontSize: 13 }}>
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
                <LevelNode num={lvl} stars={starMap[lvl] ?? 0} onTap={setActiveLevel} lang={lang} available={!!LEVEL_COMPONENTS[lvl]} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}