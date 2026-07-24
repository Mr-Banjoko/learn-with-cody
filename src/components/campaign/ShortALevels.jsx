import { useState, useLayoutEffect, useRef } from "react";
import { ArrowLeft, Zap } from "lucide-react";
import { getBestStars } from "../../lib/campaignPerformance";
import CandyLevelNode from "./CandyLevelNode";
import CandyTrailPath from "./CandyTrailPath";

// PERSISTENCE_SENTINEL_2026_05_21_SHORT_A_FINAL_41
const TOTAL_LEVELS = 41;
function getLeftPct(idx) {
  return 50 + Math.sin((idx * Math.PI) / 3) * 24;
}

export default function ShortALevels({ onBack, onSelectLevel, lang = "en" }) {
  const levels = Array.from({ length: TOTAL_LEVELS }, (_, i) => i + 1);
  const NODE_SPACING = 132;
  const TOP_OFFSET = 96;

  const scrollRef = useRef(null);

  const [starMap] = useState(() => {
    const map = {};
    for (let i = 1; i <= TOTAL_LEVELS; i++) {
      map[i] = getBestStars("short-a", i);
    }
    return map;
  });
  const lastCompletedLevel = Object.keys(starMap).map(Number).filter((level) => starMap[level] > 0).reduce((max, level) => Math.max(max, level), 0);
  const activeLevel = Math.min(lastCompletedLevel + 1, TOTAL_LEVELS);
  const pathPoints = levels.slice().reverse().map((level, index) => ({ x: getLeftPct(index) * 10, y: TOP_OFFSET + index * NODE_SPACING + 52 }));

  useLayoutEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;

    const activeIdx = TOTAL_LEVELS - activeLevel;
    const nodeTopPx = TOP_OFFSET + activeIdx * NODE_SPACING;
    const targetScrollTop = nodeTopPx - scrollContainer.clientHeight / 2 + NODE_SPACING / 2;

    scrollContainer.scrollTop = Math.max(0, targetScrollTop);
  }, [activeLevel]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        fontFamily: "Fredoka, sans-serif",
        background: "linear-gradient(160deg, #E8FFFE 0%, #FFF9E6 60%, #F5F0FF 100%)",
        overflow: "hidden",
      }}
    >
      <div style={{ flexShrink: 0, minHeight: 108, display: "grid", gridTemplateColumns: "64px 1fr 92px", alignItems: "center", gap: 4, padding: "12px calc(env(safe-area-inset-right, 0px) + 14px) 12px calc(env(safe-area-inset-left, 0px) + 14px)", background: "#137F86", borderBottom: "6px solid #F47A2A", boxShadow: "0 2px 0 #A94721", color: "#FFFFFF" }}>
        <button type="button" onClick={onBack} aria-label="Back" style={{ width: 54, height: 54, display: "flex", alignItems: "center", justifyContent: "center", border: 0, background: "transparent", color: "#FFFFFF", cursor: "pointer", filter: "drop-shadow(0 3px 0 rgba(145,36,36,0.45))" }}><ArrowLeft size={46} strokeWidth={4} /></button>
        <div style={{ textAlign: "center", minWidth: 0 }}>
          <p style={{ margin: 0, fontSize: 25, lineHeight: 1.15, fontWeight: 800 }}>🍎 {lang === "zh" ? "短元音 A" : "Short a"}</p>
          <p style={{ margin: "5px 0 0", fontSize: 15, color: "#D9FFFA" }}>{lang === "zh" ? "41 关卡冒险" : "41-level adventure"}</p>
        </div>
        <div style={{ height: 46, borderRadius: 23, background: "#F47A2A", display: "flex", alignItems: "center", justifyContent: "center", gap: 5, color: "#FFD33D", fontWeight: 800, fontSize: 17 }}><Zap size={25} fill="#FFD33D" />0 XP</div>
      </div>

      <div
        ref={scrollRef}
        style={{
          flex: 1,
          minHeight: 0,
          overflowY: "auto",
          overflowX: "hidden",
          position: "relative",
          paddingBottom: "env(safe-area-inset-bottom, 0px)",
          overscrollBehaviorY: "contain",
          WebkitOverflowScrolling: "touch",
          backgroundColor: "#2A969C",
          backgroundImage: "url(https://media.base44.com/images/public/69c4ec00726384fdef1ab181/44941d18f_generated_image.png)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          backgroundAttachment: "scroll",
        }}
      >
        <div
          style={{
            position: "relative",
            width: "100%",
            height: TOP_OFFSET + TOTAL_LEVELS * NODE_SPACING + 80,
          }}
        >
          <CandyTrailPath points={pathPoints} />
          {levels.map((lvl) => {
            const pathIndex = TOTAL_LEVELS - lvl;
            const leftPct = getLeftPct(pathIndex);
            const topPx = TOP_OFFSET + pathIndex * NODE_SPACING;
            return (
              <div key={lvl} style={{ position: "absolute", top: topPx, left: `${leftPct}%`, transform: "translateX(-50%)", display: "flex", flexDirection: "column", alignItems: "center" }}>
                <CandyLevelNode
                  num={lvl}
                  isMilestone={lvl % 10 === 0}
                  isFinal={lvl === TOTAL_LEVELS}
                  isActive={lvl === activeLevel}
                  isCompleted={(starMap[lvl] ?? 0) > 0}
                  onTap={onSelectLevel || (() => {})}
                  stars={starMap[lvl] ?? 0}
                  lang={lang}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}