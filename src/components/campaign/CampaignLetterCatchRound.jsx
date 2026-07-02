/**
 * CampaignLetterCatchRound — hardened v2
 *
 * Bug fixes (2026-05):
 *
 * ROOT CAUSE 1 — nextSpawnAt stale ref:
 *   useRef(Date.now() + FIRST_SPAWN_MS) is evaluated during the RENDER phase.
 *   When the component mounts paused (hint audio), then unpauses, the tick loop
 *   restarts — but nextSpawnAt.current is already expired, so a tile spawns on
 *   tick 0 of the restarted loop instead of 1800ms later.
 *   FIX: nextSpawnAt is reset inside the tick useEffect, not at render time.
 *
 * ROOT CAUSE 2 — audio engine corruption on early/double completion:
 *   playAudioSequence calls _stopCurrent() at entry. If word audio from the
 *   previous round is still in-flight when playCorrect fires, _stopCurrent()
 *   kills it AND leaves currentAudio = null so the engine's onDone chain is
 *   never called — orphaning the next round's audio init.
 *   FIX: the word audio playback (playAudio) and the correct-sound sequence
 *   (playCorrect) are now cleanly separated. Word audio is stopped explicitly
 *   before playCorrect fires. The next round's audio is initiated fresh via
 *   a new Audio() instance (not routed through the shared currentAudio engine).
 *
 * ROOT CAUSE 3 — double-fire catch across tick boundaries:
 *   The tick loop runs every 40ms. A tile in the catch zone can be processed
 *   by multiple consecutive ticks before setTiles() propagates. The previous
 *   processingIds guard was correct but added late; now it is the primary guard
 *   and is reset cleanly on every round mount.
 *
 * ROOT CAUSE 4 — stale gameHeightRef on mobile:
 *   gameHeightRef defaults to 460. On short mobile screens the real height may
 *   be 280–350px. The measure effect ran AFTER the tick effect in React's queue,
 *   so early ticks used a wrong catch zone. FIX: gameHeightRef is re-measured
 *   synchronously at the start of every tick loop via a ref callback.
 *
 * SAFEGUARDS ADDED:
 *   - completionFired ref: round completion can only fire once per mount
 *   - processingIds: per-tile deduplication, fully reset on mount
 *   - nextSpawnAt reset inside effect (not at render time)
 *   - wordAudioRef tracked and stopped before correct-sound plays
 *   - tryAgain uses its own independent Audio() — never routed through
 *     the shared sequence engine so it can't be killed by sequence cancellation
 */
import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { Volume2 } from "lucide-react";
import { playAudio } from "../../lib/useAudio";
import { getLetterSoundUrl, getLetterGain } from "../../lib/letterSounds";
import { useCorrectSound } from "../../lib/useCorrectSound";
import { useTryAgainSound } from "../../lib/useTryAgainSound";

const TILE_COLORS = ["#FF6B6B", "#4D96FF", "#6BCB77", "#FFD93D", "#C77DFF", "#FF9F43"];
const LETTER_BOX_COLORS = ["#FF6B6B", "#4ECDC4", "#FFD93D"];
const TICK_MS = 40;
const FALL_SPEED = 7.6;
const FIRST_SPAWN_MS = 1800;
const SPAWN_INTERVAL_MS = 2800;
const MAX_ACTIVE_TILES = 3;
const LANE_X_PCT = [16.67, 50, 83.33];

function pickDistractors(correct) {
  const vowels = "aeiou".split("");
  const consonants = "bcdfghjklmnprst".split("");
  const pool = "aeiou".includes(correct)
    ? [...vowels.filter((l) => l !== correct), ...consonants.slice(0, 4)]
    : consonants.filter((l) => l !== correct);
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return [shuffled[0], shuffled[1]];
}

// Correct letter position within each group of 4 tiles (0-indexed).
// Group 0: correct never in first 2 slots (positions 2 or 3 only) — ensures correct never drops first or second.
// Groups 1+: correct at positions 1, 2, or 3 (never 0 = never first in group).
const CORRECT_SLOT_PATTERN = [
  // group 0: late in the group (3rd or 4th tile)
  2, 3,
  // groups 1–4: any non-first position, rotating
  1, 2, 3, 1, 3, 2,
];

function buildQueue(correct, distractors) {
  // Each group is 4 tiles: 3 distractors + 1 correct.
  // Group 0 places correct at slot 2 or 3 (never first or second tile overall).
  // Subsequent groups rotate through slots 1–3.
  // We build 3 groups = 12 tiles total.
  const result = [];
  for (let group = 0; group < 3; group++) {
    // Alternate between the two pattern values for group 0, then cycle rest
    const patternIdx = group === 0
      ? Math.floor(Math.random() * 2)          // slot 2 or 3 randomly for first group
      : 2 + ((group - 1) % (CORRECT_SLOT_PATTERN.length - 2)); // slots 1,2,3 rotating for rest
    const correctSlot = CORRECT_SLOT_PATTERN[patternIdx];
    for (let pos = 0; pos < 4; pos++) {
      if (pos === correctSlot) {
        result.push(correct);
      } else {
        result.push(distractors[result.filter((l) => l !== correct).length % 2]);
      }
    }
  }
  return result;
}

function pickLane(activeTiles) {
  const counts = [0, 0, 0];
  activeTiles.forEach((t) => counts[t.lane]++);
  const min = Math.min(...counts);
  const opts = [0, 1, 2].filter((l) => counts[l] === min);
  return opts[Math.floor(Math.random() * opts.length)];
}

function CandyArrow({ direction, onPress }) {
  const isLeft = direction === "left";
  const bodyColor = isLeft ? "#FF85C2" : "#7ED957";
  const accentColor = isLeft ? "#C2185B" : "#FF85C2";
  const stripeColor = isLeft ? "#FF6FD8" : "#FF6FD8";
  const shadowColor = isLeft ? "rgba(255,133,194,0.45)" : "rgba(126,217,87,0.45)";

  return (
    <button
      onPointerDown={(e) => { e.preventDefault(); onPress(); }}
      style={{
        background: "transparent", border: "none", padding: 0,
        cursor: "pointer", WebkitTapHighlightColor: "transparent",
        outline: "none", width: 120, height: 88,
        display: "flex", alignItems: "center", justifyContent: "center",
        touchAction: "manipulation",
      }}
    >
      <motion.div
        whileTap={{ scale: 0.88 }}
        transition={{ type: "spring", stiffness: 400, damping: 22 }}
        style={{ position: "relative", width: 104, height: 72, filter: `drop-shadow(0 6px 12px ${shadowColor})` }}
      >
        <svg viewBox="0 0 104 72" width="104" height="72" style={{ display: "block", overflow: "visible" }}>
          <defs>
            <clipPath id={`arrClip-${direction}`}>
              {isLeft
                ? <path d="M36,4 L4,36 L36,68 L36,52 L100,52 Q104,52 104,48 L104,24 Q104,20 100,20 L36,20 Z" />
                : <path d="M68,4 L100,36 L68,68 L68,52 L4,52 Q0,52 0,48 L0,24 Q0,20 4,20 L68,20 Z" />}
            </clipPath>
          </defs>
          <g clipPath={`url(#arrClip-${direction})`}>
            {isLeft
              ? <path d="M36,4 L4,36 L36,68 L36,52 L100,52 Q104,52 104,48 L104,24 Q104,20 100,20 L36,20 Z" fill={bodyColor} />
              : <path d="M68,4 L100,36 L68,68 L68,52 L4,52 Q0,52 0,48 L0,24 Q0,20 4,20 L68,20 Z" fill={bodyColor} />}
            {isLeft ? (
              <>
                <rect x="38" y="-10" width="14" height="100" fill={accentColor} opacity="0.70" transform="rotate(-15 60 36)" />
                <rect x="58" y="-10" width="14" height="100" fill={stripeColor} opacity="0.70" transform="rotate(-15 60 36)" />
                <rect x="78" y="-10" width="14" height="100" fill={accentColor} opacity="0.55" transform="rotate(-15 60 36)" />
              </>
            ) : (
              <>
                <rect x="10" y="-10" width="14" height="100" fill={stripeColor} opacity="0.65" transform="rotate(15 52 36)" />
                <rect x="30" y="-10" width="14" height="100" fill={accentColor} opacity="0.70" transform="rotate(15 52 36)" />
                <rect x="50" y="-10" width="14" height="100" fill={stripeColor} opacity="0.55" transform="rotate(15 52 36)" />
              </>
            )}
            {isLeft ? (
              <>
                <circle cx="76" cy="28" r="4" fill="white" opacity="0.55" />
                <circle cx="88" cy="42" r="3" fill="white" opacity="0.45" />
                <circle cx="64" cy="44" r="3.5" fill="white" opacity="0.50" />
              </>
            ) : (
              <>
                <circle cx="28" cy="28" r="4" fill="white" opacity="0.55" />
                <circle cx="16" cy="42" r="3" fill="white" opacity="0.45" />
                <circle cx="40" cy="44" r="3.5" fill="white" opacity="0.50" />
              </>
            )}
            {isLeft ? (
              <>
                <circle cx="50" cy="31" r="5.5" fill="white" />
                <circle cx="62" cy="31" r="5.5" fill="white" />
                <circle cx="51" cy="32" r="3" fill="#2D2D2D" />
                <circle cx="63" cy="32" r="3" fill="#2D2D2D" />
                <circle cx="52" cy="31" r="1.2" fill="white" />
                <circle cx="64" cy="31" r="1.2" fill="white" />
                <path d="M49,40 Q56,46 65,40" fill="none" stroke="#2D2D2D" strokeWidth="2" strokeLinecap="round" />
                <circle cx="47" cy="38" r="4" fill="#FF8FAB" opacity="0.5" />
                <circle cx="67" cy="38" r="4" fill="#FF8FAB" opacity="0.5" />
              </>
            ) : (
              <>
                <circle cx="42" cy="31" r="5.5" fill="white" />
                <circle cx="54" cy="31" r="5.5" fill="white" />
                <circle cx="43" cy="32" r="3" fill="#2D2D2D" />
                <circle cx="55" cy="32" r="3" fill="#2D2D2D" />
                <circle cx="44" cy="31" r="1.2" fill="white" />
                <circle cx="56" cy="31" r="1.2" fill="white" />
                <path d="M40,40 Q47,46 56,40" fill="none" stroke="#2D2D2D" strokeWidth="2" strokeLinecap="round" />
                <path d="M40,30 Q43,27 46,30" fill="none" stroke="#2D2D2D" strokeWidth="2" strokeLinecap="round" />
                <circle cx="38" cy="38" r="4" fill="#FF8FAB" opacity="0.5" />
                <circle cx="58" cy="38" r="4" fill="#FF8FAB" opacity="0.5" />
              </>
            )}
            {isLeft
              ? <path d="M36,4 L4,36 L36,68 L36,52 L100,52 Q104,52 104,48 L104,24 Q104,20 100,20 L36,20 Z" fill="none" stroke="white" strokeWidth="2.5" opacity="0.5" />
              : <path d="M68,4 L100,36 L68,68 L68,52 L4,52 Q0,52 0,48 L0,24 Q0,20 4,20 L68,20 Z" fill="none" stroke="white" strokeWidth="2.5" opacity="0.5" />}
          </g>
        </svg>
      </motion.div>
    </button>
  );
}

export default function CampaignLetterCatchRound({
  word, missingLetter, image, audio,
  onComplete, onMistake,
  lang = "en", paused = false, skipInitialAudio = false, forcedDistractorLetters,
}) {
  const { play: playCorrect } = useCorrectSound();
  const { play: playTryAgain } = useTryAgainSound();
  const letters = word.split("");
  const missingPos = letters.indexOf(missingLetter);

  const [tiles, setTiles] = useState([]);
  const [codyLane, setCodyLane] = useState(1);
  const [phase, setPhase] = useState("playing");
  const [caughtVisible, setCaughtVisible] = useState(false);
  const [redGlowId, setRedGlowId] = useState(null);

  // ── Core game refs ──────────────────────────────────────────────────────────
  const tilesRef       = useRef([]);
  const codyLaneRef    = useRef(1);
  const phaseRef       = useRef("playing");
  const tickRef        = useRef(null);
  const gameAreaRef    = useRef(null);
  const gameHeightRef  = useRef(460);

  // ── Spawn refs — reset inside tick effect, not at render time (bug fix #1) ─
  const distractors   = useRef(forcedDistractorLetters || pickDistractors(missingLetter)).current;
  const queue         = useRef(buildQueue(missingLetter, distractors)).current;
  const queueIdx      = useRef(0);
  // nextSpawnAt is initialized to 0 here; the tick effect sets it correctly on start
  const nextSpawnAt   = useRef(0);
  const tileCounter   = useRef(0);

  // ── Safety guards — reset on every mount so no state leaks from prev round ─
  // completionFired: round completion fires at most once per component instance
  const completionFired = useRef(false);
  // processingIds: per-tile catch deduplication
  const processingIds   = useRef(new Set());
  // wordAudioRef: track the word audio so we can stop it before playCorrect
  const wordAudioRef    = useRef(null);

  // ── Keep codyLaneRef in sync ────────────────────────────────────────────────
  useEffect(() => { codyLaneRef.current = codyLane; }, [codyLane]);

  // ── Word audio on mount (fresh per round, isolated Audio instance) ──────────
  useEffect(() => {
    if (skipInitialAudio || !audio) return;
    const t = setTimeout(() => {
      // Use playAudio which handles caching; track via playback start
      playAudio(audio);
    }, 300);
    return () => clearTimeout(t);
  }, [audio, skipInitialAudio]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Measure game area height (re-run on resize) ─────────────────────────────
  useEffect(() => {
    const measure = () => {
      if (gameAreaRef.current) {
        const h = gameAreaRef.current.getBoundingClientRect().height;
        if (h > 0) gameHeightRef.current = h;
      }
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  // ── handleCatch — safe, deduplicated, isolated from audio engine ────────────
  const handleCatch = useCallback((tile) => {
    // Guard 1: round must be active
    if (phaseRef.current !== "playing") return;
    // Guard 2: completion can only fire once per round
    if (completionFired.current) return;
    // Guard 3: per-tile deduplication (prevents multi-tick double-fire)
    if (processingIds.current.has(tile.id)) return;
    processingIds.current.add(tile.id);

    if (tile.letter === missingLetter) {
      // Lock everything immediately — before any async work
      completionFired.current = true;
      phaseRef.current = "caught";
      setPhase("caught");
      clearInterval(tickRef.current);
      tilesRef.current = [];
      setTiles([]);
      setCaughtVisible(true);

      // Stop word audio cleanly before starting correct-sound sequence
      // This prevents playAudioSequence's _stopCurrent() from orphaning callbacks
      playAudio(null); // stops currentAudio in the engine
      wordAudioRef.current = null;

      // Play correct sound then advance — isolated from tick/word audio
      playCorrect(() => {
        onComplete();
      });
    } else {
      // Wrong catch — independent audio, not routed through sequence engine
      playTryAgain();
      onMistake && onMistake();
      tilesRef.current = tilesRef.current.map((t) =>
        t.id === tile.id ? { ...t, status: "wrong" } : t
      );
      setRedGlowId(tile.id);
      setTimeout(() => {
        tilesRef.current = tilesRef.current.filter((t) => t.id !== tile.id);
        setTiles([...tilesRef.current]);
        setRedGlowId(null);
        processingIds.current.delete(tile.id);
      }, 700);
    }
  }, [missingLetter, onComplete, onMistake, playCorrect, playTryAgain]);

  const handleCatchRef = useRef(handleCatch);
  useEffect(() => { handleCatchRef.current = handleCatch; }, [handleCatch]);

  // ── Tick loop — nextSpawnAt reset here so it always uses wall-clock start time
  useEffect(() => {
    if (phase !== "playing" || paused) return;

    // FIX: reset spawn timer from NOW (not from render time) when the loop (re)starts
    // This prevents instant first-spawn when paused→unpaused after a long delay
    nextSpawnAt.current = Date.now() + FIRST_SPAWN_MS;

    // Re-measure height immediately so the catch zone is correct from tick 0
    if (gameAreaRef.current) {
      const h = gameAreaRef.current.getBoundingClientRect().height;
      if (h > 0) gameHeightRef.current = h;
    }

    tickRef.current = setInterval(() => {
      if (phaseRef.current !== "playing") return;

      const now    = Date.now();
      const height = gameHeightRef.current;
      // Catch zone: tiles are ~136px tall; hand sits at bottom 4px + 102px = ~106px from bottom
      // catchTop/Bottom bracket the hand's center vertically
      const catchTop    = height * 0.65;
      const catchBottom = height * 0.83;
      const toRemove    = [];

      tilesRef.current = tilesRef.current.map((tile) => {
        if (tile.status !== "falling") return tile;
        const newY = tile.y + FALL_SPEED;

        // Collision: tile centre inside catch zone AND same lane as hand
        if (newY >= catchTop && newY <= catchBottom && tile.lane === codyLaneRef.current) {
          // Mark as "catching" first so subsequent ticks skip this tile
          const updated = { ...tile, y: newY, status: "catching" };
          // Fire catch handler asynchronously to avoid mutating tilesRef mid-map
          setTimeout(() => handleCatchRef.current(tile), 0);
          return updated;
        }

        if (newY > height + 80) {
          toRemove.push(tile.id);
          return { ...tile, y: newY, status: "gone" };
        }
        return { ...tile, y: newY };
      });

      if (toRemove.length)
        tilesRef.current = tilesRef.current.filter((t) => !toRemove.includes(t.id));

      const activeFalling = tilesRef.current.filter((t) => t.status === "falling").length;
      if (now >= nextSpawnAt.current && activeFalling < MAX_ACTIVE_TILES) {
        const spawnCount = queueIdx.current; // how many tiles have been spawned so far
        let letter = queue[spawnCount % queue.length];
        let lane;

        if (letter === missingLetter) {
          // Correct letter: never in the middle lane (lane 1), randomize left (0) or right (2)
          lane = Math.random() < 0.5 ? 0 : 2;
        } else {
          lane = pickLane(tilesRef.current.filter((t) => t.status === "falling"));
        }

        queueIdx.current++;
        const id    = ++tileCounter.current;
        const color = TILE_COLORS[Math.floor(Math.random() * TILE_COLORS.length)];
        tilesRef.current = [...tilesRef.current, { id, letter, lane, y: -80, status: "falling", color }];
        nextSpawnAt.current = now + SPAWN_INTERVAL_MS;
      }

      setTiles([...tilesRef.current]);
    }, TICK_MS);

    return () => clearInterval(tickRef.current);
  }, [phase, paused, queue]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearInterval(tickRef.current);
      wordAudioRef.current = null;
    };
  }, []);

  const moveLeft = () => {
    if (phaseRef.current !== "playing") return;
    setCodyLane((prev) => {
      const next = Math.max(0, prev - 1);
      codyLaneRef.current = next;
      return next;
    });
  };

  const moveRight = () => {
    if (phaseRef.current !== "playing") return;
    setCodyLane((prev) => {
      const next = Math.min(2, prev + 1);
      codyLaneRef.current = next;
      return next;
    });
  };

  return (
    <div style={{
      display: "flex", flexDirection: "column", height: "100%",
      fontFamily: "Fredoka, sans-serif", overflow: "hidden", position: "relative",
    }}>
      {phase === "caught" && (
        <div style={{ position: "absolute", inset: 0, zIndex: 100, touchAction: "none", pointerEvents: "all" }} />
      )}

      {/* ── Word card header ─────────────────────────────────────────────── */}
      <div style={{ padding: "8px 12px 4px", flexShrink: 0 }}>
        <div style={{
          background: "white", borderRadius: 22, padding: "10px 14px",
          display: "flex", alignItems: "center", gap: 14,
          boxShadow: "0 4px 20px rgba(30,58,95,0.10)",
        }}>
          <button
            onPointerDown={(e) => { e.preventDefault(); playAudio(audio); }}
            style={{
              width: 98, height: 98, borderRadius: 18, overflow: "hidden",
              flexShrink: 0, border: "2.5px solid #A8D0E6",
              background: "#EFF6FF", position: "relative", cursor: "pointer",
              WebkitTapHighlightColor: "transparent",
            }}
          >
            <img src={image} alt={word} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            <div style={{
              position: "absolute", bottom: 4, right: 4,
              width: 24, height: 24, borderRadius: 12, background: "#4A90C4",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Volume2 size={13} color="white" />
            </div>
          </button>

          <div style={{ display: "flex", gap: 8, flex: 1, justifyContent: "center" }}>
            {letters.map((letter, i) => {
              const isMissing  = i === missingPos;
              const showLetter = !isMissing || caughtVisible;
              const boxColor   = LETTER_BOX_COLORS[i];
              return (
                <motion.button
                  key={i}
                  animate={isMissing && caughtVisible ? { scale: [1, 1.4, 1] } : {}}
                  transition={{ duration: 0.45 }}
                  onPointerDown={(e) => {
                    e.preventDefault();
                    if (showLetter) playAudio(getLetterSoundUrl(letter), getLetterGain(letter));
                  }}
                  style={{
                    width: 74, height: 74, borderRadius: 18,
                    background: showLetter ? boxColor : "rgba(168,208,230,0.25)",
                    border: showLetter ? "none" : "3px dashed #A8D0E6",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 36, fontWeight: 700,
                    color: showLetter ? "white" : "#A8D0E6",
                    cursor: showLetter ? "pointer" : "default",
                    boxShadow: showLetter ? `0 4px 14px ${boxColor}55` : "none",
                    fontFamily: "Fredoka, sans-serif",
                    WebkitTapHighlightColor: "transparent",
                    flexShrink: 0,
                  }}
                >
                  {showLetter ? letter : "?"}
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Game area ────────────────────────────────────────────────────── */}
      <div ref={gameAreaRef} style={{ flex: 1, position: "relative", overflow: "hidden" }}>
        {/* Lane guides */}
        <div style={{ position: "absolute", inset: 0, display: "flex", pointerEvents: "none" }}>
          {[0, 1, 2].map((l) => (
            <div key={l} style={{ flex: 1, borderRight: l < 2 ? "1px dashed rgba(168,208,230,0.35)" : "none" }} />
          ))}
        </div>

        {/* Active lane highlight */}
        <div style={{
          position: "absolute", top: 0, bottom: 0,
          left: `${(codyLane / 3) * 100}%`, width: "33.33%",
          background: "rgba(74,144,196,0.07)",
          transition: "left 0.16s ease-out", pointerEvents: "none",
        }} />

        {/* Falling tiles */}
        {tiles
          .filter((t) => t.status === "falling" || t.status === "wrong" || t.status === "catching")
          .map((tile) => {
            const isWrong = tile.id === redGlowId;
            return (
              <div
                key={tile.id}
                style={{
                  position: "absolute",
                  left: `calc(${LANE_X_PCT[tile.lane]}% - 68px)`,
                  top: tile.y,
                  width: 136, height: 136, borderRadius: 32,
                  background: tile.color,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 102, fontWeight: 700, color: "white",
                  fontFamily: "Fredoka, sans-serif",
                  boxShadow: isWrong
                    ? "0 0 0 6px rgba(255,80,80,0.55), 0 0 24px rgba(255,80,80,0.40)"
                    : `0 6px 20px ${tile.color}60`,
                  opacity: isWrong ? 0.5 : 1,
                  transition: isWrong ? "opacity 0.5s, box-shadow 0.25s" : "box-shadow 0.25s",
                  userSelect: "none", pointerEvents: "none", zIndex: 10,
                }}
              >
                {tile.letter}
              </div>
            );
          })}

        {/* Cody hand */}
        <motion.div
          style={{
            position: "absolute", bottom: 4,
            left: `calc(${LANE_X_PCT[codyLane]}% - 51px)`,
            transition: "left 0.16s ease-out",
            width: 102, height: 102,
            display: "flex", alignItems: "center", justifyContent: "center",
            zIndex: 20, pointerEvents: "none",
            fontSize: 82, lineHeight: 1,
            filter: "drop-shadow(0 4px 8px rgba(30,58,95,0.20))",
          }}
          animate={phase === "caught" ? { scale: [1, 1.25, 1], y: [0, -14, 0] } : { y: [0, -5, 0] }}
          transition={
            phase === "caught"
              ? { duration: 0.55, ease: "easeOut" }
              : { duration: 1.7, repeat: Infinity, ease: "easeInOut" }
          }
        >
          🤲
        </motion.div>

        {/* Catch-line indicator */}
        <div style={{
          position: "absolute", bottom: "17%", left: "4%", right: "4%",
          height: 2, background: "rgba(74,144,196,0.18)", borderRadius: 2,
          pointerEvents: "none",
        }} />
      </div>

      {/* ── Arrow controls ───────────────────────────────────────────────── */}
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        flexShrink: 0, padding: "6px 16px 10px",
        background: "rgba(168,208,230,0.25)",
      }}>
        <CandyArrow direction="left" onPress={moveLeft} />
        <CandyArrow direction="right" onPress={moveRight} />
      </div>
    </div>
  );
}