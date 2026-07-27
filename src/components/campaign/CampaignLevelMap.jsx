import { useLayoutEffect, useRef, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { getBestStars } from "@/lib/campaignPerformance";
import CandyLevelNode from "@/components/campaign/CandyLevelNode";
import CandyTrailPath from "@/components/campaign/CandyTrailPath";

const NODE_SPACING = 132;
const TOP_OFFSET = 96;
const getLeftPct = (index) => 50 + Math.sin((index * Math.PI) / 2) * 24;

export default function CampaignLevelMap({ totalLevels, vowelKey, onBack, onSelectLevel, lang = "en" }) {
  const levels = Array.from({ length: totalLevels }, (_, index) => index + 1);
  const scrollRef = useRef(null);
  const [starMap] = useState(() => Object.fromEntries(levels.map((level) => [level, getBestStars(vowelKey, level)])));
  const lastCompleted = levels.filter((level) => starMap[level] > 0).reduce((highest, level) => Math.max(highest, level), 0);
  const activeLevel = Math.min(lastCompleted + 1, totalLevels);
  const pathPoints = levels.slice().reverse().map((level, index) => ({ x: getLeftPct(index) * 10, y: TOP_OFFSET + index * NODE_SPACING + 52 }));

  useLayoutEffect(() => {
    const container = scrollRef.current;
    if (!container) return;
    const activeIndex = totalLevels - activeLevel;
    container.scrollTop = Math.max(0, TOP_OFFSET + activeIndex * NODE_SPACING - container.clientHeight / 2 + NODE_SPACING / 2);
  }, [activeLevel, totalLevels]);

  return (
    <div className="relative flex h-full flex-col overflow-hidden font-fredoka">
      <button type="button" onClick={onBack} aria-label="Back" style={{ position: "absolute", top: 8, left: "calc(env(safe-area-inset-left, 0px) + 14px)", zIndex: 10, width: 54, height: 54, display: "flex", alignItems: "center", justifyContent: "center", border: 0, background: "transparent", color: "#FFFFFF", cursor: "pointer", filter: "drop-shadow(0 3px 0 rgba(19,127,134,0.75))" }}><ArrowLeft size={46} strokeWidth={4} /></button>
      <div ref={scrollRef} className="relative min-h-0 flex-1 overflow-x-hidden overflow-y-auto" style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)", overscrollBehaviorY: "contain", WebkitOverflowScrolling: "touch", background: "linear-gradient(180deg, #D9FFFA 0%, #A9E6E1 52%, #62C9C4 100%)" }}>
        <div className="relative w-full" style={{ height: TOP_OFFSET + totalLevels * NODE_SPACING + 80 }}>
          <CandyTrailPath points={pathPoints} />
          {levels.map((level) => { const pathIndex = totalLevels - level; return (
            <div key={level} style={{ position: "absolute", top: TOP_OFFSET + pathIndex * NODE_SPACING, left: `${getLeftPct(pathIndex)}%`, transform: "translateX(-50%)" }}>
              <CandyLevelNode num={level} isMilestone={level % 10 === 0} isFinal={level === totalLevels} isActive={level === activeLevel} isCompleted={(starMap[level] ?? 0) > 0} onTap={onSelectLevel} stars={starMap[level] ?? 0} lang={lang} />
            </div>
          ); })}
        </div>
      </div>
    </div>
  );
}