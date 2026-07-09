/**
 * ShortELevels — Level map for the Short E campaign (24 levels)
 */
import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import BackArrow from "../BackArrow";
import ShortELevel1 from "./ShortELevel1";
import ShortELevel2 from "./ShortELevel2";
import ShortELevel3 from "./ShortELevel3";
import ShortELevel4 from "./ShortELevel4";
import ShortELevel5 from "./ShortELevel5";
import ShortELevel6 from "./ShortELevel6";
import ShortELevel7 from "./ShortELevel7";
import ShortELevel8 from "./ShortELevel8";
import ShortELevel9 from "./ShortELevel9";
import ShortELevel10 from "./ShortELevel10";
import ShortELevel11 from "./ShortELevel11";
import ShortELevel12 from "./ShortELevel12";
import ShortELevel13 from "./ShortELevel13";
import ShortELevel14 from "./ShortELevel14";
import ShortELevel15 from "./ShortELevel15";
import ShortELevel16 from "./ShortELevel16";
import ShortELevel17 from "./ShortELevel17";
import ShortELevel18 from "./ShortELevel18";
import ShortELevel19 from "./ShortELevel19";
import ShortELevel20 from "./ShortELevel20";
import ShortELevel21 from "./ShortELevel21";
import ShortELevel22 from "./ShortELevel22";
import ShortELevel23 from "./ShortELevel23";
import ShortELevel24 from "./ShortELevel24";
import { getBestStars } from "../../lib/campaignPerformance";
import { getLevelTag, TAG_STYLES } from "../../lib/levelLabel";

const VOWEL_KEY = "short-e";
const TOTAL_LEVELS = 24;
const NODE_SPACING = 114;
const TOP_OFFSET = 36;

const LEVEL_COMPONENTS = {
  1: ShortELevel1, 2: ShortELevel2, 3: ShortELevel3, 4: ShortELevel4,
  5: ShortELevel5, 6: ShortELevel6, 7: ShortELevel7, 8: ShortELevel8,
  9: ShortELevel9, 10: ShortELevel10, 11: ShortELevel11, 12: ShortELevel12,
  13: ShortELevel13, 14: ShortELevel14, 15: ShortELevel15, 16: ShortELevel16,
  17: ShortELevel17, 18: ShortELevel18, 19: ShortELevel19, 20: ShortELevel20,
  21: ShortELevel21, 22: ShortELevel22, 23: ShortELevel23, 24: ShortELevel24,
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

function LevelNode({ num, stars, onTap, lang }) {
  const color = nodeColor(num);
  const isFinal = num === TOTAL_LEVELS;
  const isMilestone = num % 10 === 0 && !isFinal;
  const size = isFinal ? 82 : isMilestone ? 76 : 68;
  const tagStyle = TAG_STYLES[getLevelTag(VOWEL_KEY, num)];

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      {!isFinal && (
        <div style={{
          background: tagStyle.bg, color: tagStyle.color,
          fontSize: 10, fontWeight: 700, letterSpacing: 0.5,
          borderRadius: 99, padding: "2px 8px", marginBottom: 4,
          textTransform: "uppercase", fontFamily: "Fredoka, sans-serif",
        }}>
          {tagStyle.label}
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

export default function ShortELevels({ onBack, lang = "en" }) {
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
          <p style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "#1E293B" }}>🥚 {lang === "zh" ? "短元音 E" : "Short e"}</p>
          <p style={{ margin: 0, fontSize: 12, color: "#64748B" }}>{lang === "zh" ? "24 关卡冒险" : "24-level adventure"}</p>
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
                <LevelNode num={lvl} stars={starMap[lvl] ?? 0} onTap={setActiveLevel} lang={lang} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}