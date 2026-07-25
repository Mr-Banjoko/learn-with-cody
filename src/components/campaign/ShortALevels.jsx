import { useState, useLayoutEffect, useRef } from "react";
import { ArrowLeft } from "lucide-react";
import { getBestStars } from "../../lib/campaignPerformance";
import CandyLevelNode from "./CandyLevelNode";
import CandyTrailPath from "./CandyTrailPath";

// PERSISTENCE_SENTINEL_2026_05_21_SHORT_A_FINAL_41
const TOTAL_LEVELS = 41;
function getLeftPct(idx) {
  return 50 + Math.sin((idx * Math.PI) / 2) * 24;
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
        position: "relative",
        height: "100%",
        fontFamily: "Fredoka, sans-serif",
        background: "linear-gradient(160deg, #E8FFFE 0%, #FFF9E6 60%, #F5F0FF 100%)",
        overflow: "hidden",
      }}
    >
      <button type="button" onClick={onBack} aria-label="Back" style={{ position: "absolute", top: "max(calc(env(safe-area-inset-top, 0px) + 8px), 44px)", left: "calc(env(safe-area-inset-left, 0px) + 14px)", zIndex: 10, width: 54, height: 54, display: "flex", alignItems: "center", justifyContent: "center", border: 0, background: "transparent", color: "#FFFFFF", cursor: "pointer", filter: "drop-shadow(0 3px 0 rgba(19,127,134,0.75))" }}><ArrowLeft size={46} strokeWidth={4} /></button>

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
          background: "linear-gradient(180deg, #D9FFFA 0%, #A9E6E1 52%, #62C9C4 100%)",
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