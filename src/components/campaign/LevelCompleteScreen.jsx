/**
 * LevelCompleteScreen — level completion sequence:
 *
 *   Phase 1: Trophy Lottie animation plays + level_completion_sound.mp3 plays simultaneously
 *   Phase 2: Static layout appears. Wait for level_completion_sound.mp3 to finish (onended).
 *   Phase 3: Stars awarded one-at-a-time, each with stars.mp3 (chained via onended)
 *   Phase 4: Back to Map button appears
 *
 * Audio files fetched from GitHub main branch:
 *   letter_sound/feedback/level_completion_sound.mp3
 *   letter_sound/feedback/stars.mp3
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

const TROPHY_URL = "https://media.base44.com/files/public/69c4ec00726384fdef1ab181/60db8f70c_Trophy.json";

const COMPLETION_SOUND_URL =
  "https://raw.githubusercontent.com/Mr-Banjoko/learn-with-cody/main/letter_sound/feedback/level_completion_sound.mp3";
const STARS_SOUND_URL =
  "https://raw.githubusercontent.com/Mr-Banjoko/learn-with-cody/main/letter_sound/feedback/stars.mp3";
const THREE_STARS_SOUND_URL =
  "https://raw.githubusercontent.com/Mr-Banjoko/learn-with-cody/main/letter_sound/feedback/getting%203%20stars.mp3";

const GITHUB_FEEDBACK_BASE =
  "https://raw.githubusercontent.com/Mr-Banjoko/learn-with-cody/main/letter_sound/feedback";

// ── Hardcoded performance audio lookup: [levelIndex][starRating] ─────────────
// levelIndex = levelNum - 1 (0-based), starRating key: 3 | 2 | 1
const PERFORMANCE_AUDIO_TABLE = [
  /* L1  */ { 3: "Amazing.mp3",       2: "goodJob.mp3",  1: "keepItUp.mp3" },
  /* L2  */ { 3: "awesome.mp3",       2: "Great.mp3",    1: "Nice.mp3"     },
  /* L3  */ { 3: "brilliant.mp3",     2: "veryGood.mp3", 1: "Super.mp3"    },
  /* L4  */ { 3: "Fantastic job.mp3", 2: "Super.mp3",    1: "keepItUp.mp3" },
  /* L5  */ { 3: "outstanding.mp3",   2: "Cool.mp3",     1: "Nice.mp3"     },
  /* L6  */ { 3: "Amazing.mp3",       2: "goodJob.mp3",  1: "Super.mp3"    },
  /* L7  */ { 3: "awesome.mp3",       2: "Great.mp3",    1: "keepItUp.mp3" },
  /* L8  */ { 3: "brilliant.mp3",     2: "veryGood.mp3", 1: "Nice.mp3"     },
  /* L9  */ { 3: "Fantastic job.mp3", 2: "Super.mp3",    1: "Super.mp3"    },
  /* L10 */ { 3: "outstanding.mp3",   2: "Cool.mp3",     1: "keepItUp.mp3" },
  /* L11 */ { 3: "Amazing.mp3",       2: "goodJob.mp3",  1: "Nice.mp3"     },
  /* L12 */ { 3: "awesome.mp3",       2: "Great.mp3",    1: "Super.mp3"    },
  /* L13 */ { 3: "brilliant.mp3",     2: "veryGood.mp3", 1: "keepItUp.mp3" },
  /* L14 */ { 3: "Fantastic job.mp3", 2: "Super.mp3",    1: "Nice.mp3"     },
  /* L15 */ { 3: "outstanding.mp3",   2: "Cool.mp3",     1: "Super.mp3"    },
  /* L16 */ { 3: "Amazing.mp3",       2: "goodJob.mp3",  1: "keepItUp.mp3" },
  /* L17 */ { 3: "awesome.mp3",       2: "Great.mp3",    1: "Nice.mp3"     },
  /* L18 */ { 3: "brilliant.mp3",     2: "veryGood.mp3", 1: "Super.mp3"    },
  /* L19 */ { 3: "Fantastic job.mp3", 2: "Super.mp3",    1: "keepItUp.mp3" },
  /* L20 */ { 3: "outstanding.mp3",   2: "Cool.mp3",     1: "Nice.mp3"     },
  /* L21 */ { 3: "Amazing.mp3",       2: "goodJob.mp3",  1: "Super.mp3"    },
  /* L22 */ { 3: "awesome.mp3",       2: "Great.mp3",    1: "keepItUp.mp3" },
  /* L23 */ { 3: "brilliant.mp3",     2: "veryGood.mp3", 1: "Nice.mp3"     },
  /* L24 */ { 3: "Fantastic job.mp3", 2: "Super.mp3",    1: "Super.mp3"    },
  /* L25 */ { 3: "outstanding.mp3",   2: "Cool.mp3",     1: "keepItUp.mp3" },
  /* L26 */ { 3: "Amazing.mp3",       2: "goodJob.mp3",  1: "Nice.mp3"     },
  /* L27 */ { 3: "awesome.mp3",       2: "Great.mp3",    1: "Super.mp3"    },
  /* L28 */ { 3: "brilliant.mp3",     2: "veryGood.mp3", 1: "keepItUp.mp3" },
  /* L29 */ { 3: "Fantastic job.mp3", 2: "Super.mp3",    1: "Nice.mp3"     },
  /* L30 */ { 3: "outstanding.mp3",   2: "Cool.mp3",     1: "Super.mp3"    },
  /* L31 */ { 3: "Amazing.mp3",       2: "goodJob.mp3",  1: "keepItUp.mp3" },
  /* L32 */ { 3: "awesome.mp3",       2: "Great.mp3",    1: "Nice.mp3"     },
  /* L33 */ { 3: "brilliant.mp3",     2: "veryGood.mp3", 1: "Super.mp3"    },
  /* L34 */ { 3: "Fantastic job.mp3", 2: "Super.mp3",    1: "keepItUp.mp3" },
  /* L35 */ { 3: "outstanding.mp3",   2: "Cool.mp3",     1: "Nice.mp3"     },
  /* L36 */ { 3: "Amazing.mp3",       2: "goodJob.mp3",  1: "Super.mp3"    },
  /* L37 */ { 3: "awesome.mp3",       2: "Great.mp3",    1: "keepItUp.mp3" },
  /* L38 */ { 3: "brilliant.mp3",     2: "veryGood.mp3", 1: "Nice.mp3"     },
  /* L39 */ { 3: "Fantastic job.mp3", 2: "Super.mp3",    1: "Super.mp3"    },
  /* L40 */ { 3: "outstanding.mp3",   2: "Cool.mp3",     1: "keepItUp.mp3" },
];

// All unique filenames that need preloading
const ALL_PERFORMANCE_FILES = [
  "Amazing.mp3", "awesome.mp3", "brilliant.mp3", "Fantastic job.mp3", "outstanding.mp3",
  "goodJob.mp3", "Great.mp3", "veryGood.mp3", "Super.mp3", "Cool.mp3",
  "keepItUp.mp3", "Nice.mp3",
];

// ── Preload audio into a blob URL so repeat plays are instant ────────────────
async function preloadAudio(url) {
  const res = await fetch(url);
  const blob = await res.blob();
  return URL.createObjectURL(blob);
}

// ── Play an Audio element once, resolve when it ends ────────────────────────
function playOnce(blobUrl) {
  return new Promise((resolve) => {
    const audio = new Audio(blobUrl);
    audio.onended = resolve;
    audio.onerror = resolve; // don't block sequence on error
    audio.play().catch(resolve);
  });
}

// ── Individual animated star ─────────────────────────────────────────────────
function AnimatedStar({ visible, size = 72 }) {
  return (
    <motion.div
      initial={{ scale: 0, opacity: 0, rotate: -30 }}
      animate={visible ? { scale: 1, opacity: 1, rotate: 0 } : { scale: 0, opacity: 0, rotate: -30 }}
      transition={{ type: "spring", stiffness: 280, damping: 16 }}
      style={{ width: size, height: size, display: "flex", alignItems: "center", justifyContent: "center" }}
    >
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
        <path
          d="M24 4L29.8 16.26L43 17.9L33.5 27.14L35.96 40.1L24 33.77L12.04 40.1L14.5 27.14L5 17.9L18.2 16.26L24 4Z"
          fill="#FFD93D"
          stroke="#F4B942"
          strokeWidth="2"
          strokeLinejoin="round"
        />
      </svg>
    </motion.div>
  );
}

export default function LevelCompleteScreen({ levelNum, stars = 3, onBack, lang = "en" }) {
  const clampedStars = Math.max(0, Math.min(3, stars));
  const levelLabel = lang === "zh" ? `第 ${levelNum} 关` : `Level ${levelNum}`;

  // ── Asset loading ─────────────────────────────────────────────────────────
  const [trophyData, setTrophyData] = useState(null);
  const [completionBlobUrl, setCompletionBlobUrl] = useState(null);
  const [starsBlobUrl, setStarsBlobUrl] = useState(null);
  const assetsReady = trophyData && completionBlobUrl && starsBlobUrl;

  // 3-star celebration audio
  const threeStarsBlobUrlRef = useRef(null);
  const threeStarsAudioRef = useRef(null);
  const threeStarsPlayedRef = useRef(false);

  // Performance audio blobs keyed by filename
  const perfBlobsRef = useRef({});

  // ── Sequence state ────────────────────────────────────────────────────────
  // phase 1 = trophy playing, phase 2 = layout visible / waiting for completion sound,
  // phase 3 = star sequence running, phase 4 = all done / button shown
  const [phase, setPhase] = useState(1);
  const [visibleStars, setVisibleStars] = useState(0); // 0–3 earned stars revealed
  const [visibleGreyStars, setVisibleGreyStars] = useState(0); // 0–N grey stars revealed

  // Refs to prevent double-firing / track both conditions
  const completionSoundStarted = useRef(false);
  const starSequenceStarted = useRef(false);
  const soundDone = useRef(false);
  const trophyDone = useRef(false);

  // ── Preload all assets before showing anything ────────────────────────────
  useEffect(() => {
    fetch(TROPHY_URL).then((r) => r.json()).then(setTrophyData).catch(() => {});
    preloadAudio(COMPLETION_SOUND_URL).then(setCompletionBlobUrl).catch(() => {});
    preloadAudio(STARS_SOUND_URL).then(setStarsBlobUrl).catch(() => {});
    preloadAudio(THREE_STARS_SOUND_URL)
      .then((blobUrl) => { threeStarsBlobUrlRef.current = blobUrl; })
      .catch(() => {});

    // Preload all performance audio files (failures are logged, not fatal)
    ALL_PERFORMANCE_FILES.forEach((filename) => {
      const url = `${GITHUB_FEEDBACK_BASE}/${encodeURIComponent(filename)}`;
      preloadAudio(url)
        .then((blobUrl) => { perfBlobsRef.current[filename] = blobUrl; })
        .catch(() => { console.warn(`[LevelCompleteScreen] Failed to preload: ${filename}`); });
    });
  }, []);

  // ── Phase 1 → play completion sound the moment trophy animation starts ────
  // Triggered when phase becomes 1 AND assets are ready (trophy Lottie autoplay fires immediately)
  useEffect(() => {
    if (phase !== 1 || !assetsReady) return;
    if (completionSoundStarted.current) return;
    completionSoundStarted.current = true;
    // Play completion sound — when it ends, check if trophy also done
    playOnce(completionBlobUrl).then(() => {
      soundDone.current = true;
      if (trophyDone.current) setPhase(2);
    });
  }, [phase, assetsReady, completionBlobUrl]);

  // ── Phase 2 → trophy Lottie onComplete fires, layout appears.
  //    Completion sound's onended already moved us to phase 2, so when
  //    phase === 2 we immediately start the star sequence (completion sound is done).
  useEffect(() => {
    if (phase !== 2) return;
    if (starSequenceStarted.current) return;
    starSequenceStarted.current = true;
    setPhase(3); // enter star-sequence phase
  }, [phase]);

  // ── Phase 3 → award stars one by one, then play performance audio ────────
  const perfPlayedRef = useRef(false);

  useEffect(() => {
    if (phase !== 3) return;
    if (clampedStars === 0) {
      setPhase(4);
      return;
    }

    let cancelled = false;

    async function awardStars() {
      // Award each star, each gated by stars.mp3 onended
      for (let i = 1; i <= clampedStars; i++) {
        if (cancelled) return;
        setVisibleStars(i);
        await playOnce(starsBlobUrl);
        if (cancelled) return;
      }

      // Reveal grey (unearned) stars one by one after earned stars, no sound
      const greyCount = 3 - clampedStars;
      for (let g = 1; g <= greyCount; g++) {
        if (cancelled) return;
        await new Promise((res) => setTimeout(res, 300));
        if (cancelled) return;
        setVisibleGreyStars(g);
      }

      // All stars awarded + last stars.mp3 finished → play performance audio once
      if (!perfPlayedRef.current) {
        perfPlayedRef.current = true;
        const levelIndex = Math.min(Math.max((levelNum || 1) - 1, 0), 39);
        const row = PERFORMANCE_AUDIO_TABLE[levelIndex] || PERFORMANCE_AUDIO_TABLE[0];
        const filename = row[clampedStars] || row[3];
        const blobUrl = perfBlobsRef.current[filename];
        if (blobUrl) {
          await playOnce(blobUrl);
        } else {
          console.warn(`[LevelCompleteScreen] Performance audio not ready: ${filename}`);
        }
      }

      if (!cancelled) {
        setPhase(4);
        // Play 3-star celebration sound (no UI lock, deduplication guard)
        if (clampedStars === 3 && !threeStarsPlayedRef.current && threeStarsBlobUrlRef.current) {
          threeStarsPlayedRef.current = true;
          const audio = new Audio(threeStarsBlobUrlRef.current);
          threeStarsAudioRef.current = audio;
          audio.onended = () => { threeStarsAudioRef.current = null; };
          audio.onerror = () => { threeStarsAudioRef.current = null; };
          audio.play().catch(() => { threeStarsAudioRef.current = null; });
        }
      }
    }

    awardStars();
    return () => { cancelled = true; };
  }, [phase, clampedStars, starsBlobUrl, levelNum]);

  // ── Don't render until all assets are ready ───────────────────────────────
  if (!assetsReady) return null;

  return (
    <div style={{
      display: "flex", flexDirection: "column", flex: 1,
      alignItems: "center", justifyContent: "flex-start",
      paddingTop: "0%", paddingBottom: "32px", paddingLeft: "24px", paddingRight: "24px",
      textAlign: "center",
      fontFamily: "Fredoka, sans-serif",
      position: "relative", overflow: "hidden",
    }}>
      {/* ── Trophy: animating overlay fades out, frozen in-flow fades in simultaneously ── */}
      <AnimatePresence>
        {phase === 1 && (
          <motion.div
            key="trophy-anim"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 20 }}
          >
            <Lottie
              animationData={trophyData}
              loop={false}
              autoplay={true}
              onComplete={() => {
                trophyDone.current = true;
                if (soundDone.current) setPhase(2);
              }}
              style={{ width: 360, height: 360 }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Phase 2+: frozen trophy in normal flow — fades in as animated one fades out */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: phase >= 2 ? 1 : 0 }}
        transition={{ duration: 0.35 }}
        style={{ width: 360, height: 360, marginBottom: 8, flexShrink: 0, pointerEvents: "none" }}
      >
        <Lottie
          animationData={trophyData}
          loop={false} autoplay={false}
          initialSegment={[70, 71]}
          style={{ width: "100%", height: "100%" }}
        />
      </motion.div>

      {/* ── Phase 2+: Text + stars + button ──────────────────────────────── */}
      <AnimatePresence>
        {phase >= 2 && (
          <motion.div
            key="layout-phase"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%" }}
          >

            <h1 style={{ fontSize: 44, fontWeight: 700, color: "#1E293B", margin: "0 0 8px", marginTop: 0 }}>
              {lang === "zh" ? "完成！" : "You did it!"}
            </h1>
            <p style={{ fontSize: 22, color: "#64748B", margin: "0 0 24px", maxWidth: 320 }}>
              {levelLabel} {lang === "zh" ? "完成！" : "Complete!"}
            </p>

            {/* ── Star row — earned stars pop in, unearned show as grey outlines ── */}
            <div style={{ display: "flex", gap: 20, alignItems: "center", justifyContent: "center", marginBottom: 28, minHeight: 100 }}>
              {[1, 2, 3].map((starNum) => {
                const isEarned = starNum <= clampedStars;
                const isRevealed = visibleStars >= starNum;
                const greyIndex = starNum - clampedStars;
                const isGreyRevealed = !isEarned && visibleGreyStars >= greyIndex;
                return (
                  <div key={starNum} style={{ position: "relative", width: 96, height: 96 }}>
                    {isEarned ? (
                      <AnimatedStar visible={isRevealed} size={96} />
                    ) : (
                      <motion.div
                        initial={{ scale: 0, opacity: 0, rotate: -30 }}
                        animate={isGreyRevealed ? { scale: 1, opacity: 1, rotate: 0 } : { scale: 0, opacity: 0, rotate: -30 }}
                        transition={{ type: "spring", stiffness: 280, damping: 16 }}
                        style={{ width: 96, height: 96 }}
                      >
                        <svg width={96} height={96} viewBox="0 0 48 48" fill="none">
                          <path
                            d="M24 4L29.8 16.26L43 17.9L33.5 27.14L35.96 40.1L24 33.77L12.04 40.1L14.5 27.14L5 17.9L18.2 16.26L24 4Z"
                            fill="rgba(200,200,200,0.25)"
                            stroke="rgba(180,180,180,0.55)"
                            strokeWidth="2"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </motion.div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* ── Back to Map button — appears after all stars awarded ──── */}
            <AnimatePresence>
              {phase >= 4 && (
                <motion.button
                  key="back-btn"
                  initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    try {
                      if (threeStarsAudioRef.current) {
                        threeStarsAudioRef.current.pause();
                        threeStarsAudioRef.current.currentTime = 0;
                        threeStarsAudioRef.current = null;
                      }
                    } catch (_) {}
                    onBack();
                  }}
                  style={{
                    padding: "18px 56px", borderRadius: 999,
                    background: "linear-gradient(135deg, #FF6B6B, #FF9F43)",
                    color: "white", border: "none", fontSize: 24, fontWeight: 700,
                    fontFamily: "Fredoka, sans-serif", cursor: "pointer",
                    boxShadow: "0 6px 0 rgba(0,0,0,0.12)", touchAction: "manipulation",
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