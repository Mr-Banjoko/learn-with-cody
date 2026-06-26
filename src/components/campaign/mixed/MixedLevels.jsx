/**
 * MixedLevels — level-select map for the CVC Champion mixed-vowel campaign.
 * 5 levels, same winding-path layout as ShortALevels.
 */
import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import BackArrow from "../../BackArrow";
import { getBestStars } from "../../../lib/campaignPerformance";

const TOTAL_LEVELS = 5;
const PATH_OFFSETS = [-30, -10, 10, -10, 30];
const NODE_COLORS = ["#FF6B6B", "#FF9F43", "#FFD93D", "#4ECDC4", "#F59E0B"];

function getLeftPct(idx) {
  return 50 + PATH_OFFSETS[idx % PATH_OFFSETS.length];
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

function LevelNode({ num, color, onTap, stars, isFinal, lang = "en" }) {
  const size = isFinal ? 82 : 68;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <motion.div
        whileTap={{ scale: 0.85 }}
        onClick={() => onTap(num)}
        style={{
          width: size, height: size, borderRadius: "50%",
          background: isFinal ? "linear-gradient(145deg, #FFD700, #FFA500)" : `linear-gradient(145deg, ${color} 0%, ${color}CC 100%)`,
          border: isFinal ? "4px solid white" : "3px solid white",
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          cursor: "pointer",
          boxShadow: isFinal ? "0 7px 0 #cc8800, 0 12px 28px rgba(255,165,0,0.55)" : `0 6px 0 ${color}99, 0 10px 22px ${color}44`,
          WebkitTapHighlightColor: "transparent", position: "relative", flexShrink: 0,
        }}
      >
        {isFinal ? (
          <span style={{ fontSize: 36, pointerEvents: "none", lineHeight: 1 }}>🏆</span>
        ) : (
          <span style={{ fontSize: 24, fontWeight: 700, color: "white", textShadow: "0 1px 4px rgba(0,0,0,0.20)", userSelect: "none", lineHeight: 1, pointerEvents: "none" }}>
            {num}
          </span>
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

export default function MixedLevels({ onBack, onSelectLevel, lang = "en" }) {
  const levels = Array.from({ length: TOTAL_LEVELS }, (_, i) => i + 1);
  const NODE_SPACING = 110;
  const TOP_OFFSET = 36;
  const scrollRef = useRef(null);

  const [starMap, setStarMap] = useState(() => {
    const map = {};
    for (let i = 1; i <= TOTAL_LEVELS; i++) map[i] = getBestStars("mixed", i);
    return map;
  });

  useEffect(() => {
    const map = {};
    for (let i = 1; i <= TOTAL_LEVELS; i++) map[i] = getBestStars("mixed", i);
    setStarMap(map);
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", fontFamily: "Fredoka, sans-serif", background: "linear-gradient(160deg, #FFF9E6 0%, #E8FFF8 60%, #F5F0FF 100%)", overflow: "hidden" }}>
      {/* Header */}
      <div style={{ flexShrink: 0, display: "flex", alignItems: "center", gap: 4, padding: "calc(env(safe-area-inset-top, 0px) + 8px) 16px 8px", borderBottom: "1.5px solid rgba(0,0,0,0.06)", background: "rgba(255,255,255,0.75)", backdropFilter: "blur(10px)" }}>
        <BackArrow onPress={onBack} />
        <div style={{ flex: 1 }}>
          <p style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "#1E293B" }}>🏆 {lang === "zh" ? "CVC 冠军" : "CVC Champion"}</p>
          <p style={{ margin: 0, fontSize: 12, color: "#64748B" }}>{lang === "zh" ? "5 关卡混合元音" : "5-level mixed vowel challenge"}</p>
        </div>
        <div style={{ background: "#FFF9E6", border: "1.5px solid #FFD93D", borderRadius: 99, padding: "5px 13px", display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}>
          <span style={{ fontSize: 13 }}>⭐</span>
          <span style={{ color: "#B45309", fontWeight: 700, fontSize: 13 }}>{Object.values(starMap).reduce((a, b) => a + b, 0)} / {TOTAL_LEVELS * 3}</span>
        </div>
      </div>

      {/* Scrollable map */}
      <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", overflowX: "hidden", position: "relative" }}>
        <div style={{ position: "relative", width: "100%", height: TOP_OFFSET + TOTAL_LEVELS * NODE_SPACING + 80 }}>
          {levels.map((lvl, idx) => (
            <div key={lvl} style={{ position: "absolute", top: TOP_OFFSET + idx * NODE_SPACING, left: `${getLeftPct(idx)}%`, transform: "translateX(-50%)", display: "flex", flexDirection: "column", alignItems: "center" }}>
              <LevelNode
                num={lvl}
                color={NODE_COLORS[idx % NODE_COLORS.length]}
                isFinal={lvl === TOTAL_LEVELS}
                onTap={onSelectLevel || (() => {})}
                stars={starMap[lvl] ?? 0}
                lang={lang}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}