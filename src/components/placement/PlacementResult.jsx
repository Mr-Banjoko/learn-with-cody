/**
 * PlacementResult — completion screen for the Placement Test.
 * Campaign-style trophy + animated stars, then a level-gauge message and a
 * "Back to Home" button. Lighter than LevelCompleteScreen (no per-level
 * performance-audio table) but uses the same look & feel.
 */
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Lottie from "lottie-react";

const TROPHY_URL = "https://media.base44.com/files/public/69c4ec00726384fdef1ab181/60db8f70c_Trophy.json";
const COMPLETION_SOUND = "https://cdn.jsdelivr.net/gh/Mr-Banjoko/learn-with-cody@main/letter_sound/feedback/level_completion_sound.mp3";
const STARS_SOUND = "https://cdn.jsdelivr.net/gh/Mr-Banjoko/learn-with-cody@main/letter_sound/feedback/stars.mp3";

const GAUGE = {
  3: { en: "Advanced — ready for CVC Champion mode!", zh: "进阶 — 可以挑战 CVC 冠军模式！" },
  2: { en: "On track — keep working through the vowels.", zh: "进度良好 — 继续学习元音。" },
  1: { en: "Keep practising your letter sounds.", zh: "继续练习字母发音。" },
  0: { en: "Great start — begin with Short A.", zh: "好的开始 — 从 Short A 入门。" },
};

function preload(url) {
  return fetch(url).then((r) => r.blob()).then(URL.createObjectURL);
}
function playOnce(url) {
  return new Promise((res) => {
    const a = new Audio(url);
    a.onended = res;
    a.onerror = res;
    a.play().catch(res);
  });
}

function Star({ visible, grey }) {
  return (
    <motion.div
      initial={{ scale: 0, opacity: 0, rotate: -30 }}
      animate={visible ? { scale: 1, opacity: 1, rotate: 0 } : { scale: 0, opacity: 0 }}
      transition={{ type: "spring", stiffness: 280, damping: 16 }}
      style={{ width: 96, height: 96 }}
    >
      <svg width="96" height="96" viewBox="0 0 48 48" fill="none">
        <path
          d="M24 4L29.8 16.26L43 17.9L33.5 27.14L35.96 40.1L24 33.77L12.04 40.1L14.5 27.14L5 17.9L18.2 16.26L24 4Z"
          fill={grey ? "rgba(200,200,200,0.25)" : "#FFD93D"}
          stroke={grey ? "rgba(180,180,180,0.55)" : "#F4B942"}
          strokeWidth="2"
          strokeLinejoin="round"
        />
      </svg>
    </motion.div>
  );
}

export default function PlacementResult({ stars = 0, onBack, lang = "en" }) {
  const clamped = Math.max(0, Math.min(3, stars));
  const [trophy, setTrophy] = useState(null);
  const [phase, setPhase] = useState(1); // 1 trophy animating, 2 awarding stars, 3 done
  const [shown, setShown] = useState(0);
  const completionUrl = useRef(null);
  const starsUrl = useRef(null);
  const soundStarted = useRef(false);

  useEffect(() => {
    fetch(TROPHY_URL).then((r) => r.json()).then(setTrophy).catch(() => {});
    preload(COMPLETION_SOUND).then((u) => { completionUrl.current = u; }).catch(() => {});
    preload(STARS_SOUND).then((u) => { starsUrl.current = u; }).catch(() => {});
  }, []);

  // Start the completion sound once the trophy animation begins
  useEffect(() => {
    if (!trophy || soundStarted.current) return;
    soundStarted.current = true;
    if (completionUrl.current) playOnce(completionUrl.current);
  }, [trophy]);

  // Phase 2: award earned stars one-by-one, then reveal grey stars + finish
  useEffect(() => {
    if (phase !== 2) return;
    let cancelled = false;
    (async () => {
      for (let i = 1; i <= clamped; i++) {
        if (cancelled) return;
        setShown(i);
        if (starsUrl.current) await playOnce(starsUrl.current);
        else await new Promise((r) => setTimeout(r, 400));
      }
      if (cancelled) return;
      setPhase(3);
    })();
    return () => { cancelled = true; };
  }, [phase, clamped]);

  if (!trophy) return null;

  const gauge = GAUGE[clamped] || GAUGE[0];

  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1, alignItems: "center", justifyContent: "flex-start", padding: "24px", textAlign: "center", fontFamily: "Fredoka, sans-serif", overflow: "hidden" }}>
      <div style={{ width: 300, height: 300, marginBottom: 8, flexShrink: 0, position: "relative" }}>
        <motion.div animate={{ opacity: phase >= 2 ? 1 : 0 }} transition={{ duration: 0.3 }} style={{ position: "absolute", inset: 0 }}>
          <Lottie animationData={trophy} loop={false} autoplay={false} initialSegment={[70, 71]} style={{ width: "100%", height: "100%" }} />
        </motion.div>
        <AnimatePresence>
          {phase === 1 && (
            <motion.div key="anim" initial={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} style={{ position: "absolute", inset: 0 }}>
              <Lottie animationData={trophy} loop={false} autoplay onComplete={() => setPhase(2)} style={{ width: "100%", height: "100%" }} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {phase >= 2 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%" }}>
            <h1 style={{ fontSize: 40, fontWeight: 700, color: "#1E293B", margin: "0 0 8px" }}>
              {lang === "zh" ? "测试完成！" : "Test Complete!"}
            </h1>
            <p style={{ fontSize: 20, color: "#64748B", margin: "0 0 20px" }}>
              {lang === "zh" ? "分班测试" : "Placement Test"}
            </p>

            <div style={{ display: "flex", gap: 20, marginBottom: 24, minHeight: 96 }}>
              {[1, 2, 3].map((n) => (
                <Star key={n} visible={n <= clamped ? shown >= n : phase >= 3} grey={n > clamped} />
              ))}
            </div>

            <AnimatePresence>
              {phase >= 3 && (
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
                  <p style={{ fontSize: 20, fontWeight: 600, color: "#1E3A5F", maxWidth: 320, margin: 0 }}>
                    {gauge[lang] || gauge.en}
                  </p>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={onBack}
                    style={{
                      padding: "18px 56px", borderRadius: 999, background: "linear-gradient(135deg, #FF6B6B, #FF9F43)",
                      color: "white", border: "none", fontSize: 24, fontWeight: 700, fontFamily: "Fredoka, sans-serif",
                      cursor: "pointer", boxShadow: "0 6px 0 rgba(0,0,0,0.12)", touchAction: "manipulation",
                    }}
                  >
                    {lang === "zh" ? "返回首页 🏠" : "Back to Home 🏠"}
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}