/**
 * ShortILevels — Level map for the Short I campaign (31 levels)
 */
import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Star, Lock } from "lucide-react";
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
import { getBestStars } from "../../lib/campaignPerformance";

const VOWEL_KEY = "short-i";
const TOTAL_LEVELS = 31;

const LEVEL_COMPONENTS = {
  1: ShortILevel1, 2: ShortILevel2, 3: ShortILevel3, 4: ShortILevel4,
  5: ShortILevel5, 6: ShortILevel6, 7: ShortILevel7, 8: ShortILevel8,
  9: ShortILevel9, 10: ShortILevel10, 11: ShortILevel11, 12: ShortILevel12,
  13: ShortILevel13, 14: ShortILevel14, 15: ShortILevel15, 16: ShortILevel16,
  17: ShortILevel17, 18: ShortILevel18, 19: ShortILevel19, 20: ShortILevel20,
  21: ShortILevel21, 22: ShortILevel22, 23: ShortILevel23, 24: ShortILevel24,
  25: ShortILevel25, 26: ShortILevel26, 27: ShortILevel27, 28: ShortILevel28,
  29: ShortILevel29, 30: ShortILevel30, 31: ShortILevel31,
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
};

const NODE_X = [160, 220, 120, 180, 240, 140, 200, 160, 220, 130,
               180, 240, 150, 200, 120, 170, 230, 160, 200, 140,
               190, 240, 130, 180, 220, 160, 200, 140, 190, 230, 170];

function getProgress() {
  try {
    const data = JSON.parse(localStorage.getItem("campaign_progress") || "{}");
    return data[VOWEL_KEY] || {};
  } catch (_) { return {}; }
}

function getFirstUnlocked(progress) {
  for (let i = 1; i <= TOTAL_LEVELS; i++) {
    if (!progress[i]?.completed) return i;
  }
  return TOTAL_LEVELS;
}

function StarRow({ count }) {
  return (
    <div style={{ display: "flex", gap: 2, justifyContent: "center" }}>
      {[1, 2, 3].map((s) => (
        <Star key={s} size={11} fill={s <= count ? "#FFD93D" : "none"} stroke={s <= count ? "#FFD93D" : "#ccc"} />
      ))}
    </div>
  );
}

function LevelNode({ levelNum, progress, isUnlocked, onClick }) {
  const bestStars = getBestStars(VOWEL_KEY, levelNum);
  const completed = !!progress[levelNum]?.completed;
  const isFinal = levelNum === TOTAL_LEVELS;
  const isMilestone = levelNum % 5 === 0;
  const tag = LEVEL_TAGS[levelNum] || "Practice";

  const bgColor = completed
    ? isFinal ? "linear-gradient(135deg, #6BCB77, #4ECDC4)"
    : isMilestone ? "linear-gradient(135deg, #4ECDC4, #45B7D1)"
    : "linear-gradient(135deg, #6BCB77, #95E7A0)"
    : isUnlocked ? "linear-gradient(135deg, #b8f0e0, #d4f5ff)"
    : "linear-gradient(135deg, #e8e8e8, #f0f0f0)";

  const size = isFinal ? 72 : isMilestone ? 60 : 52;

  return (
    <motion.div
      whileTap={{ scale: isUnlocked ? 0.92 : 1 }}
      whileHover={{ scale: isUnlocked ? 1.06 : 1 }}
      onClick={isUnlocked ? onClick : undefined}
      style={{
        position: "absolute",
        left: NODE_X[levelNum - 1] - size / 2,
        top: (TOTAL_LEVELS - levelNum) * 88 + 20,
        width: size,
        height: size,
        borderRadius: "50%",
        background: bgColor,
        boxShadow: isUnlocked ? "0 4px 12px rgba(0,0,0,0.15)" : "0 2px 6px rgba(0,0,0,0.08)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        cursor: isUnlocked ? "pointer" : "default",
        border: completed ? "3px solid #4ECDC4" : isUnlocked ? "2px dashed #4ECDC4" : "2px solid #ddd",
        opacity: isUnlocked ? 1 : 0.55,
        zIndex: 2,
      }}
    >
      {!isUnlocked ? (
        <Lock size={16} color="#aaa" />
      ) : (
        <>
          <span style={{ fontSize: isFinal ? 16 : 14, fontWeight: 700, color: completed ? "#fff" : "#2c7a7b", lineHeight: 1 }}>{levelNum}</span>
          {completed && <StarRow count={bestStars} />}
          <span style={{ fontSize: 9, color: completed ? "rgba(255,255,255,0.85)" : "#4ECDC4", fontWeight: 600, marginTop: 1 }}>{tag}</span>
        </>
      )}
    </motion.div>
  );
}

export default function ShortILevels({ onBack, lang = "en" }) {
  const [activeLevel, setActiveLevel] = useState(null);
  const [progress, setProgress] = useState({});
  const scrollRef = useRef(null);

  useEffect(() => {
    const p = getProgress();
    setProgress(p);
    const firstUnlocked = getFirstUnlocked(p);
    setTimeout(() => {
      if (scrollRef.current) {
        const nodeTop = (TOTAL_LEVELS - firstUnlocked) * 88 + 20;
        const scrollTarget = nodeTop - scrollRef.current.clientHeight / 2 + 36;
        scrollRef.current.scrollTop = Math.max(0, scrollTarget);
      }
    }, 100);
  }, [activeLevel]);

  const firstUnlocked = getFirstUnlocked(progress);

  if (activeLevel) {
    const LevelComponent = LEVEL_COMPONENTS[activeLevel];
    if (!LevelComponent) return null;
    return (
      <LevelComponent
        onBack={() => {
          setActiveLevel(null);
          setProgress(getProgress());
        }}
        lang={lang}
      />
    );
  }

  const totalHeight = TOTAL_LEVELS * 88 + 80;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: "linear-gradient(160deg, #F0F8FF 0%, #E8FFF5 60%, #F5F0FF 100%)", fontFamily: "Fredoka, sans-serif", overflow: "hidden" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", padding: "12px 16px", gap: 12, flexShrink: 0, background: "rgba(255,255,255,0.85)", backdropFilter: "blur(8px)", borderBottom: "1px solid rgba(78,205,196,0.2)" }}>
        <button onClick={onBack} style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}>
          <ArrowLeft size={22} color="#2c7a7b" />
        </button>
        <div>
          <div style={{ fontSize: 20, fontWeight: 700, color: "#2c7a7b" }}>Short I</div>
          <div style={{ fontSize: 12, color: "#6bcb77" }}>
            {Object.keys(progress).filter(k => progress[k]?.completed).length}/{TOTAL_LEVELS} completed
          </div>
        </div>
        <div style={{ marginLeft: "auto", background: "linear-gradient(135deg, #6BCB77, #4ECDC4)", borderRadius: 20, padding: "4px 14px" }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>Short I 🐝</span>
        </div>
      </div>

      {/* Scrollable map */}
      <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", position: "relative" }}>
        <div style={{ position: "relative", width: "100%", height: totalHeight }}>
          {/* Path line */}
          <svg style={{ position: "absolute", top: 0, left: 0, width: "100%", height: totalHeight, pointerEvents: "none" }} viewBox={`0 0 380 ${totalHeight}`} preserveAspectRatio="none">
            {Array.from({ length: TOTAL_LEVELS - 1 }, (_, i) => {
              const fromLevel = TOTAL_LEVELS - i;
              const toLevel = fromLevel - 1;
              const x1 = NODE_X[fromLevel - 1];
              const y1 = i * 88 + 46;
              const x2 = NODE_X[toLevel - 1];
              const y2 = (i + 1) * 88 + 46;
              const completed = !!progress[fromLevel]?.completed;
              return (
                <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
                  stroke={completed ? "#6BCB77" : "#ddd"} strokeWidth={3} strokeDasharray={completed ? "none" : "6 4"} />
              );
            })}
          </svg>

          {Array.from({ length: TOTAL_LEVELS }, (_, i) => {
            const levelNum = TOTAL_LEVELS - i;
            const isUnlocked = levelNum <= firstUnlocked;
            return (
              <LevelNode
                key={levelNum}
                levelNum={levelNum}
                progress={progress}
                isUnlocked={isUnlocked}
                onClick={() => setActiveLevel(levelNum)}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}