/**
 * LevelCompleteScreen — 4-phase completion sequence:
 *   Phase 1: Trophy Lottie animation (full screen, plays once, ~2.4s)
 *   Phase 2: Static layout appears (trophy frozen + "You did it!" + "Level X complete!")
 *   Phase 3: Star rating Lottie animation plays (once, ~3s)
 *   Phase 4: Back to Map button appears
 *
 * Props:
 *   levelNum  {number}     — level number for display
 *   stars     {0|1|2|3}   — stars earned
 *   onBack    {()=>void}   — navigate back to map
 *   lang      {"en"|"zh"}
 */
import { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Lottie from "lottie-react";
import { playLevelCompleteFeedback } from "../../lib/feedbackAudio";

const TROPHY_URL = "https://media.base44.com/files/public/69c4ec00726384fdef1ab181/60db8f70c_Trophy.json";
const STAR_URL = "https://media.base44.com/files/public/69c4ec00726384fdef1ab181/f3442391d_3starrating.json";

function buildStarAnimData(baseData, earnedStars) {
  const clamped = Math.max(0, Math.min(3, earnedStars));
  const data = JSON.parse(JSON.stringify(baseData));
  const goldIndToStarNum = { 3: 1, 2: 2, 1: 3 };
  data.layers = data.layers.map((layer) => {
    const starNum = goldIndToStarNum[layer.ind];
    if (starNum === undefined) return layer;
    if (starNum > clamped) {
      return { ...layer, ks: { ...layer.ks, o: { a: 0, k: 0 } } };
    }
    return layer;
  });
  return data;
}

export default function LevelCompleteScreen({ levelNum, stars = 3, onBack, lang = "en" }) {
  const clampedStars = Math.max(0, Math.min(3, stars));
  const [phase, setPhase] = useState(1);
  const [trophyData, setTrophyData] = useState(null);
  const [starBaseData, setStarBaseData] = useState(null);

  const levelLabel = lang === "zh" ? `第 ${levelNum} 关` : `Level ${levelNum}`;

  useEffect(() => {
    fetch(TROPHY_URL).then((r) => r.json()).then(setTrophyData).catch(() => {});
    fetch(STAR_URL).then((r) => r.json()).then(setStarBaseData).catch(() => {});
    // Play completion sound the moment this screen mounts (Phase 1 — trophy animation)
    playLevelCompleteFeedback();
  }, []);

  const starAnimData = useMemo(
    () => (starBaseData ? buildStarAnimData(starBaseData, clampedStars) : null),
    [starBaseData, clampedStars]
  );

  if (!trophyData || !starAnimData) return null;

  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1, alignItems: "center", justifyContent: "center", padding: "32px 24px", textAlign: "center", fontFamily: "Fredoka, sans-serif", position: "relative", overflow: "hidden" }}>
      <AnimatePresence>
        {phase === 1 && (
          <motion.div key="trophy-phase" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 20 }}>
            <Lottie animationData={trophyData} loop={false} autoplay={true} onComplete={() => setPhase(2)} style={{ width: 320, height: 320 }} />
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {phase >= 2 && (
          <motion.div key="layout-phase" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%" }}>
            <div style={{ width: 180, height: 180, marginBottom: 4 }}>
              <Lottie animationData={trophyData} loop={false} autoplay={false} initialSegment={[70, 71]} style={{ width: "100%", height: "100%" }} />
            </div>
            <h1 style={{ fontSize: 34, fontWeight: 700, color: "#1E293B", margin: "0 0 4px" }}>{lang === "zh" ? "完成！" : "You did it!"}</h1>
            <p style={{ fontSize: 16, color: "#64748B", margin: "0 0 4px", maxWidth: 280 }}>{levelLabel} {lang === "zh" ? "完成！" : "Complete!"}</p>
            <div style={{ width: "min(320px, 90vw)", aspectRatio: "1/1" }}>
              <Lottie animationData={starAnimData} loop={false} autoplay={true} onComplete={() => setPhase(4)} style={{ width: "100%", height: "100%" }} />
            </div>
            <AnimatePresence>
              {phase >= 4 && (
                <motion.button key="back-btn" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} whileTap={{ scale: 0.95 }} onClick={onBack} style={{ marginTop: 4, padding: "16px 48px", borderRadius: 999, background: "linear-gradient(135deg, #FF6B6B, #FF9F43)", color: "white", border: "none", fontSize: 20, fontWeight: 700, fontFamily: "Fredoka, sans-serif", cursor: "pointer", boxShadow: "0 6px 0 rgba(0,0,0,0.12)", touchAction: "manipulation" }}>
                  {lang === "zh" ? "返回地图 🗺️" : "Back to Map 🗺️"}
                </motion.button>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}