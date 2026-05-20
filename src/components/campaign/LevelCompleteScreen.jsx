/**
 * LevelCompleteScreen — level completion sequence:
 *
 *   Phase 1 : Trophy Lottie animation begins → level_completion_sound.mp3 plays simultaneously
 *   Phase 2 : Trophy animation ends → layout appears, wait for level sound to fully end
 *   Phase 3 : Stars awarded one-at-a-time, each star + stars.mp3 synchronized
 *   Phase 4 : Back to Map button appears
 *
 * Audio files fetched from GitHub main branch:
 *   letter_sound/feedback/level_completion_sound.mp3
 *   letter_sound/feedback/stars.mp3
 */
import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Lottie from "lottie-react";

const TROPHY_URL =
  "https://media.base44.com/files/public/69c4ec00726384fdef1ab181/60db8f70c_Trophy.json";

const LEVEL_SOUND_URL =
  "https://raw.githubusercontent.com/Mr-Banjoko/learn-with-cody/main/letter_sound/feedback/level_completion_sound.mp3";
const STARS_SOUND_URL =
  "https://raw.githubusercontent.com/Mr-Banjoko/learn-with-cody/main/letter_sound/feedback/stars.mp3";

// Fetch a URL into a blob URL for zero-latency playback
async function toBlobUrl(url) {
  const res = await fetch(url);
  const blob = await res.blob();
  return URL.createObjectURL(blob);
}

// Play a blob URL once; resolves on ended (or error)
function playOnce(blobUrl) {
  return new Promise((resolve) => {
    if (!blobUrl) { resolve(); return; }
    const audio = new Audio(blobUrl);
    audio.onended = resolve;
    audio.onerror = resolve;
    audio.play().catch(resolve);
  });
}

function StarIcon({ filled, size = 64 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path
        d="M12 2L14.9 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L9.1 8.26L12 2Z"
        fill={filled ? "#FFD93D" : "rgba(200,200,200,0.35)"}
        stroke={filled ? "#F4B942" : "rgba(180,180,180,0.5)"}
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function LevelCompleteScreen({ levelNum, stars = 3, onBack, lang = "en" }) {
  const clampedStars = Math.max(0, Math.min(3, stars));
  const levelLabel = lang === "zh" ? `第 ${levelNum} 关` : `Level ${levelNum}`;

  // JSON + audio assets
  const [trophyData, setTrophyData] = useState(null);
  const levelBlobRef = useRef(null);   // blob URL for level_completion_sound
  const starsBlobRef  = useRef(null);  // blob URL for stars.mp3

  // Phases: 1 = trophy anim, 2 = layout (waiting for level sound), 4 = button
  const [phase, setPhase] = useState(1);

  // How many stars are currently shown (0–3)
  const [revealedStars, setRevealedStars] = useState(0);

  // Guard: star sequence fires only once
  const starSeqStarted = useRef(false);

  // Reference to the level-sound Audio element created at trophy start
  const levelAudioRef = useRef(null);

  // ── 1. Preload everything ────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    Promise.all([
      fetch(TROPHY_URL).then((r) => r.json()),
      toBlobUrl(LEVEL_SOUND_URL).catch(() => null),
      toBlobUrl(STARS_SOUND_URL).catch(() => null),
    ]).then(([trophy, levelBlob, starsBlob]) => {
      if (cancelled) return;
      setTrophyData(trophy);
      levelBlobRef.current = levelBlob;
      starsBlobRef.current  = starsBlob;
    }).catch(() => {});

    return () => { cancelled = true; };
  }, []);

  // ── 2. Play level_completion_sound the moment trophy animation begins ────
  //    We fire it in the first animation frame after trophyData is set (phase 1).
  const levelSoundFired = useRef(false);
  useEffect(() => {
    if (phase !== 1 || !trophyData || levelSoundFired.current) return;
    levelSoundFired.current = true;

    // Wait one frame so the Lottie has started rendering before audio begins
    const raf = requestAnimationFrame(() => {
      if (!levelBlobRef.current) return;
      const audio = new Audio(levelBlobRef.current);
      audio.play().catch(() => {});
      levelAudioRef.current = audio;
    });
    return () => cancelAnimationFrame(raf);
  }, [phase, trophyData]);

  // ── 3. Star award sequence (chained by audio completion events) ──────────
  const awardStarsSequence = useCallback(async (total) => {
    if (starSeqStarted.current) return;
    starSeqStarted.current = true;

    for (let i = 1; i <= total; i++) {
      // Show star i and play stars.mp3 simultaneously
      setRevealedStars(i);
      await playOnce(starsBlobRef.current);
    }

    setPhase(4);
  }, []);

  // ── 4. When trophy animation ends → move to phase 2, then wait for level sound ─
  const handleTrophyComplete = useCallback(() => {
    setPhase(2);

    const audio = levelAudioRef.current;

    if (audio && !audio.ended && !audio.paused) {
      // Level sound is still playing — wait for it to finish naturally
      audio.onended = () => awardStarsSequence(clampedStars);
      audio.onerror = () => awardStarsSequence(clampedStars);
    } else {
      // Level sound already done (or wasn't loaded) — start stars immediately
      awardStarsSequence(clampedStars);
    }
  }, [clampedStars, awardStarsSequence]);

  if (!trophyData) return null;

  return (
    <div
      style={{
        display: "flex", flexDirection: "column", flex: 1,
        alignItems: "center", justifyContent: "center",
        padding: "32px 24px", textAlign: "center",
        fontFamily: "Fredoka, sans-serif",
        position: "relative", overflow: "hidden",
      }}
    >
      {/* ── Phase 1: Full-screen trophy animation ── */}
      <AnimatePresence>
        {phase === 1 && (
          <motion.div
            key="trophy-phase"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{
              position: "absolute", inset: 0,
              display: "flex", alignItems: "center", justifyContent: "center",
              zIndex: 20,
            }}
          >
            <Lottie
              animationData={trophyData}
              loop={false}
              autoplay={true}
              onComplete={handleTrophyComplete}
              style={{ width: 320, height: 320 }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Phase 2+: Static layout ── */}
      <AnimatePresence>
        {phase >= 2 && (
          <motion.div
            key="layout-phase"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%" }}
          >
            {/* Frozen trophy thumbnail */}
            <div style={{ width: 180, height: 180, marginBottom: 4 }}>
              <Lottie
                animationData={trophyData}
                loop={false}
                autoplay={false}
                initialSegment={[70, 71]}
                style={{ width: "100%", height: "100%" }}
              />
            </div>

            <h1 style={{ fontSize: 34, fontWeight: 700, color: "#1E293B", margin: "0 0 4px" }}>
              {lang === "zh" ? "完成！" : "You did it!"}
            </h1>
            <p style={{ fontSize: 16, color: "#64748B", margin: "0 0 20px", maxWidth: 280 }}>
              {levelLabel} {lang === "zh" ? "完成！" : "Complete!"}
            </p>

            {/* ── Stars — one-at-a-time reveal with spring pop-in ── */}
            <div
              style={{
                display: "flex", gap: 16,
                alignItems: "center", justifyContent: "center",
                minHeight: 80, marginBottom: 16,
              }}
            >
              {[0, 1, 2].map((i) => {
                const isRevealed = i < revealedStars;
                return (
                  <div key={i} style={{ width: 64, height: 64, position: "relative" }}>
                    <AnimatePresence>
                      {isRevealed ? (
                        <motion.div
                          key="star-filled"
                          initial={{ scale: 0, opacity: 0, rotate: -25 }}
                          animate={{ scale: 1, opacity: 1, rotate: 0 }}
                          transition={{ type: "spring", stiffness: 260, damping: 14 }}
                          style={{ position: "absolute", inset: 0 }}
                        >
                          <StarIcon filled={true} size={64} />
                        </motion.div>
                      ) : (
                        <motion.div
                          key="star-empty"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: phase >= 2 ? 1 : 0 }}
                          style={{ position: "absolute", inset: 0 }}
                        >
                          <StarIcon filled={false} size={64} />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>

            {/* ── Back button — appears after all stars awarded ── */}
            <AnimatePresence>
              {phase >= 4 && (
                <motion.button
                  key="back-btn"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onBack}
                  style={{
                    marginTop: 4, padding: "16px 48px", borderRadius: 999,
                    background: "linear-gradient(135deg, #FF6B6B, #FF9F43)",
                    color: "white", border: "none", fontSize: 20,
                    fontWeight: 700, fontFamily: "Fredoka, sans-serif",
                    cursor: "pointer", boxShadow: "0 6px 0 rgba(0,0,0,0.12)",
                    touchAction: "manipulation",
                  }}
                >
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