import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Volume2 } from "lucide-react";
import { playAudio, playAudioSequence } from "../../lib/useAudio";
import { getLetterSoundUrl, getLetterGain } from "../../lib/letterSounds";

const CODY_IMG = "https://media.base44.com/images/public/69c4ec00726384fdef1ab181/93a5cd462_transparent_cody.png";
const TILE_COLORS = ["#FF6B6B", "#4D96FF", "#6BCB77", "#FFD93D", "#C77DFF", "#FF9F43"];
const TICK_MS = 40;
const FALL_SPEED = 2.0;
const FIRST_SPAWN_MS = 1400;
const SPAWN_INTERVAL_MS = 2700;
const MAX_ACTIVE_TILES = 3;
const LETTER_BOX_COLORS = ["#FF6B6B", "#4ECDC4", "#FFD93D"];
const ROUNDS_PER_SESSION = 10;
const LANE_X = [16.67, 50, 83.33];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function pickDistractors(correct) {
  const vowels = "aeiou".split("");
  const consonants = "bcdfghjklmnprst".split("");
  const isVowel = vowels.includes(correct.toLowerCase());
  const pool = isVowel
    ? [...vowels.filter((l) => l !== correct), ...consonants.slice(0, 4)]
    : consonants.filter((l) => l !== correct);
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return [shuffled[0], shuffled[1]];
}

function buildQueue(correct, distractors) {
  const q = [];
  for (let i = 0; i < 12; i++) {
    q.push(i % 3 === 1 ? correct : distractors[i % 2]);
  }
  return q;
}

function pickLane(activeTiles) {
  const counts = [0, 0, 0];
  activeTiles.forEach((t) => counts[t.lane]++);
  const min = Math.min(...counts);
  const opts = [0, 1, 2].filter((l) => counts[l] === min);
  return opts[Math.floor(Math.random() * opts.length)];
}

// ─── Candy Arrow Button ───────────────────────────────────────────────────────

function CandyArrow({ direction, onPress, disabled }) {
  const isLeft = direction === "left";
  const mainColor = isLeft ? "#4ECDC4" : "#6BCB77";
  const accentColor = isLeft ? "#FF6B6B" : "#FF9F43";
  const stripeColor = isLeft ? "#FFD93D" : "#FF6B8A";

  return (
    <button
      onTouchStart={(e) => { e.preventDefault(); if (!disabled) onPress(); }}
      onClick={() => { if (!disabled) onPress(); }}
      style={{
        WebkitTapHighlightColor: "transparent",
        background: "transparent",
        border: "none",
        padding: 0,
        cursor: disabled ? "default" : "pointer",
        opacity: disabled ? 0.35 : 1,
        transition: "opacity 0.2s",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: 120,
        height: 90,
        flexShrink: 0,
      }}
    >
      <svg
        width="112"
        height="78"
        viewBox="0 0 112 78"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ transform: isLeft ? "scaleX(-1)" : "none", filter: `drop-shadow(0 5px 12px ${mainColor}70)` }}
      >
        {/* Main arrow body */}
        <path
          d="M42 16 L80 16 Q96 16 96 30 L96 48 Q96 62 80 62 L42 62 L42 56 L20 39 L42 22 Z"
          fill={mainColor}
        />
        {/* Accent tail stripes */}
        <path d="M62 16 L80 16 Q96 16 96 30 L96 48 Q96 62 80 62 L62 62 Z" fill={stripeColor} opacity="0.65" />
        <path d="M72 16 L80 16 Q96 16 96 30 L96 48 Q96 62 80 62 L72 62 Z" fill={accentColor} opacity="0.55" />
        {/* Arrow pointer */}
        <path
          d="M42 62 L42 56 L20 39 L42 22 L42 16"
          fill={mainColor}
          stroke="white"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        {/* Dots decoration */}
        <circle cx="52" cy="27" r="3.5" fill="white" opacity="0.7" />
        <circle cx="64" cy="22" r="2.5" fill="white" opacity="0.5" />
        <circle cx="78" cy="30" r="3" fill="white" opacity="0.55" />
        <circle cx="50" cy="52" r="2.5" fill="white" opacity="0.5" />
        <circle cx="70" cy="54" r="3" fill="white" opacity="0.6" />
        {/* Cheek blushes */}
        <ellipse cx="57" cy="46" rx="5" ry="3.5" fill={accentColor} opacity="0.45" />
        {/* Eyes */}
        <circle cx="50" cy="37" r="5" fill="white" />
        <circle cx="50" cy="37" r="3" fill="#1E293B" />
        <circle cx="51.5" cy="35.5" r="1.2" fill="white" />
        {/* Smile */}
        <path d="M44 42 Q50 47 56 42" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none" />
        {/* Outline */}
        <path
          d="M42 16 L80 16 Q96 16 96 30 L96 48 Q96 62 80 62 L42 62 L42 56 L20 39 L42 22 Z"
          fill="none"
          stroke="white"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}

// ─── Single Round ─────────────────────────────────────────────────────────────

function GameRound({ wordData, roundNum, totalRounds, onSuccess, onExit }) {
  const { word, image, audio } = wordData;
  const letters = word.split("");

  const [missingPos] = useState(() => Math.floor(Math.random() * 3));
  const missingLetter = letters[missingPos];

  const [tiles, setTiles] = useState([]);
  const [codyLane, setCodyLane] = useState(1);
  const [phase, setPhase] = useState("playing");
  const [caughtVisible, setCaughtVisible] = useState(false);
  const [wrongGlowIds, setWrongGlowIds] = useState(new Set());
  const [showSuccess, setShowSuccess] = useState(false);

  const tilesRef = useRef([]);
  const codyLaneRef = useRef(1);
  const phaseRef = useRef("playing");
  const tickRef = useRef(null);
  const gameAreaRef = useRef(null);
  const gameHeightRef = useRef(480);
  const cancelAudioRef = useRef(null);
  const distractors = useRef(pickDistractors(missingLetter)).current;
  const queue = useRef(buildQueue(missingLetter, distractors)).current;
  const queueIdx = useRef(0);
  const nextSpawnAt = useRef(Date.now() + FIRST_SPAWN_MS);
  const tileCounter = useRef(0);

  useEffect(() => { codyLaneRef.current = codyLane; }, [codyLane]);

  // Auto-play word on round start
  useEffect(() => {
    const t = setTimeout(() => {
      playAudio(audio);
    }, 500);
    return () => clearTimeout(t);
  }, [audio]);

  useEffect(() => {
    const measure = () => {
      if (gameAreaRef.current) {
        gameHeightRef.current = gameAreaRef.current.getBoundingClientRect().height || 480;
      }
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  const handleCatch = useCallback(
    (tile) => {
      if (phaseRef.current !== "playing") return;

      if (tile.letter === missingLetter) {
        // ── Correct catch ──
        phaseRef.current = "caught";
        setPhase("caught");
        clearInterval(tickRef.current);
        tilesRef.current = [];
        setTiles([]);
        setCaughtVisible(true);
        setShowSuccess(true);

        if (cancelAudioRef.current) cancelAudioRef.current();

        // Just play the full word once, then advance
        setTimeout(() => {
          playAudio(audio);
        }, 200);

        setTimeout(() => {
          onSuccess();
        }, 1400);
      } else {
        // ── Wrong catch — soft red glow ──
        const id = tile.id;
        setWrongGlowIds((prev) => new Set([...prev, id]));
        tilesRef.current = tilesRef.current.map((t) =>
          t.id === id ? { ...t, status: "wrong" } : t
        );
        setTimeout(() => {
          tilesRef.current = tilesRef.current.filter((t) => t.id !== id);
          setTiles([...tilesRef.current]);
          setWrongGlowIds((prev) => {
            const next = new Set(prev);
            next.delete(id);
            return next;
          });
        }, 700);
      }
    },
    [missingLetter, audio, onSuccess]
  );

  const handleCatchRef = useRef(handleCatch);
  useEffect(() => { handleCatchRef.current = handleCatch; }, [handleCatch]);

  // Game tick
  useEffect(() => {
    if (phase !== "playing") return;

    tickRef.current = setInterval(() => {
      if (phaseRef.current !== "playing") return;

      const now = Date.now();
      const height = gameHeightRef.current;
      const catchTop = height * 0.66;
      const catchBottom = height * 0.82;
      const toRemove = [];

      tilesRef.current = tilesRef.current.map((tile) => {
        if (tile.status !== "falling") return tile;
        const newY = tile.y + FALL_SPEED;

        if (newY >= catchTop && newY <= catchBottom && tile.lane === codyLaneRef.current) {
          handleCatchRef.current(tile);
          return { ...tile, y: newY, status: "catching" };
        }
        if (newY > height + 80) {
          toRemove.push(tile.id);
          return { ...tile, y: newY, status: "gone" };
        }
        return { ...tile, y: newY };
      });

      if (toRemove.length > 0) {
        tilesRef.current = tilesRef.current.filter((t) => !toRemove.includes(t.id));
      }

      const activeFalling = tilesRef.current.filter((t) => t.status === "falling").length;
      if (now >= nextSpawnAt.current && activeFalling < MAX_ACTIVE_TILES) {
        const letter = queue[queueIdx.current % queue.length];
        queueIdx.current++;
        const id = ++tileCounter.current;
        const lane = pickLane(tilesRef.current.filter((t) => t.status === "falling"));
        const color = TILE_COLORS[Math.floor(Math.random() * TILE_COLORS.length)];
        tilesRef.current = [...tilesRef.current, { id, letter, lane, y: -80, status: "falling", color }];
        nextSpawnAt.current = now + SPAWN_INTERVAL_MS;
      }

      setTiles([...tilesRef.current]);
    }, TICK_MS);

    return () => clearInterval(tickRef.current);
  }, [phase, queue]);

  useEffect(() => {
    return () => {
      clearInterval(tickRef.current);
      if (cancelAudioRef.current) cancelAudioRef.current();
    };
  }, []);

  // One-lane-per-tap with edge clamping
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
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        background: "linear-gradient(180deg, #D6EEFF 0%, #E8F7FF 100%)",
        fontFamily: "Fredoka, sans-serif",
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* ── Header ───────────────────────────────────────────── */}
      <div
        style={{
          background: "#A8D0E6",
          padding: "10px 16px 12px",
          display: "flex",
          alignItems: "center",
          gap: 10,
          flexShrink: 0,
        }}
      >
        <button
          onClick={onExit}
          style={{
            width: 36, height: 36, borderRadius: 18,
            background: "rgba(255,255,255,0.75)", border: "none",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", flexShrink: 0,
          }}
        >
          <ArrowLeft size={20} color="#1E3A5F" />
        </button>
        <div style={{ flex: 1 }} />
        <div style={{ display: "flex", gap: 5 }}>
          {Array.from({ length: totalRounds }).map((_, i) => (
            <div
              key={i}
              style={{
                width: 7, height: 7, borderRadius: "50%",
                background:
                  i < roundNum - 1 ? "#4A90C4"
                  : i === roundNum - 1 ? "#FFD93D"
                  : "rgba(255,255,255,0.45)",
                transition: "background 0.3s",
              }}
            />
          ))}
        </div>
      </div>

      {/* ── Word Card (30% bigger) ───────────────────────────── */}
      <div style={{ padding: "10px 16px 4px", flexShrink: 0 }}>
        <div
          style={{
            background: "white",
            borderRadius: 22,
            padding: "12px 16px",
            display: "flex",
            alignItems: "center",
            gap: 16,
            boxShadow: "0 4px 20px rgba(30,58,95,0.10)",
          }}
        >
          {/* Picture — tap to replay */}
          <button
            onTouchStart={() => playAudio(audio)}
            onClick={() => playAudio(audio)}
            style={{
              width: 98, height: 98, borderRadius: 18, overflow: "hidden",
              flexShrink: 0, border: "2.5px solid #A8D0E6",
              background: "#EFF6FF", position: "relative", cursor: "pointer",
              WebkitTapHighlightColor: "transparent",
            }}
          >
            <img src={image} alt={word} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            <div
              style={{
                position: "absolute", bottom: 5, right: 5,
                width: 26, height: 26, borderRadius: 13,
                background: "#4A90C4",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              <Volume2 size={14} color="white" />
            </div>
          </button>

          {/* CVC letter boxes — 30% bigger */}
          <div style={{ display: "flex", gap: 9, flex: 1, justifyContent: "center" }}>
            {letters.map((letter, i) => {
              const isMissing = i === missingPos;
              const showLetter = !isMissing || caughtVisible;
              const boxColor = LETTER_BOX_COLORS[i];
              return (
                <motion.button
                  key={i}
                  animate={isMissing && caughtVisible ? { scale: [1, 1.35, 1] } : {}}
                  transition={{ duration: 0.4 }}
                  onTouchStart={() => { if (showLetter) playAudio(getLetterSoundUrl(letter), getLetterGain(letter)); }}
                  onClick={() => { if (showLetter) playAudio(getLetterSoundUrl(letter), getLetterGain(letter)); }}
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
                    textTransform: "uppercase",
                    flexShrink: 0,
                  }}
                >
                  {showLetter ? letter.toUpperCase() : "?"}
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Instruction hint */}
        <p
          style={{
            textAlign: "center",
            fontSize: 13,
            color: phase === "caught" ? "#27AE60" : "#4A90C4",
            marginTop: 5,
            fontWeight: 600,
            transition: "color 0.3s",
          }}
        >
          {phase === "caught"
            ? "🌟 Amazing!"
            : `Catch the letter  "${missingLetter.toUpperCase()}"`}
        </p>
      </div>

      {/* ── Game Field ──────────────────────────────────────── */}
      <div ref={gameAreaRef} style={{ flex: 1, position: "relative", overflow: "hidden" }}>
        {/* Lane dividers */}
        <div style={{ position: "absolute", inset: 0, display: "flex", pointerEvents: "none" }}>
          {[0, 1, 2].map((l) => (
            <div key={l} style={{ flex: 1, borderRight: l < 2 ? "1px dashed rgba(168,208,230,0.35)" : "none" }} />
          ))}
        </div>

        {/* Active lane highlight */}
        <div
          style={{
            position: "absolute",
            top: 0, bottom: 0,
            left: `${(codyLane / 3) * 100}%`,
            width: "33.33%",
            background: "rgba(74,144,196,0.07)",
            transition: "left 0.18s ease-out",
            pointerEvents: "none",
          }}
        />

        {/* Falling tiles */}
        {tiles
          .filter((t) => t.status === "falling" || t.status === "wrong" || t.status === "catching")
          .map((tile) => {
            const isWrong = wrongGlowIds.has(tile.id);
            return (
              <div
                key={tile.id}
                style={{
                  position: "absolute",
                  left: `${LANE_X[tile.lane]}%`,
                  top: tile.y,
                  transform: "translateX(-50%)",
                  width: 68, height: 68, borderRadius: 20,
                  background: isWrong ? "#FF4444" : tile.color,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 34, fontWeight: 700, color: "white",
                  fontFamily: "Fredoka, sans-serif",
                  textTransform: "uppercase",
                  boxShadow: isWrong
                    ? "0 0 24px 8px rgba(255,60,60,0.55)"
                    : `0 6px 20px ${tile.color}60`,
                  opacity: isWrong ? 0 : 1,
                  transition: isWrong ? "opacity 0.5s ease-out, box-shadow 0.3s" : "none",
                  userSelect: "none",
                  pointerEvents: "none",
                  zIndex: 10,
                }}
              >
                {tile.letter.toUpperCase()}
              </div>
            );
          })}

        {/* Success sparkle overlay */}
        <AnimatePresence>
          {showSuccess && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                pointerEvents: "none",
                zIndex: 50,
              }}
            >
              <motion.div
                animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
                transition={{ duration: 0.5, repeat: 1 }}
                style={{ fontSize: 72 }}
              >
                ⭐
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Cody */}
        <div
          style={{
            position: "absolute",
            bottom: 8,
            left: `${LANE_X[codyLane]}%`,
            transform: "translateX(-50%)",
            transition: "left 0.18s ease-out",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            zIndex: 20,
            pointerEvents: "none",
          }}
        >
          <motion.img
            src={CODY_IMG}
            alt="Cody"
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
            style={{
              width: 78, height: 86,
              objectFit: "contain",
              filter: "drop-shadow(0 4px 8px rgba(30,58,95,0.20))",
            }}
          />
        </div>

        {/* Catch line */}
        <div
          style={{
            position: "absolute",
            bottom: "17%",
            left: "4%", right: "4%",
            height: 2,
            background: "rgba(74,144,196,0.18)",
            borderRadius: 2,
            pointerEvents: "none",
          }}
        />
      </div>

      {/* ── Candy Arrow Controls ────────────────────────────── */}
      <div
        style={{
          flexShrink: 0,
          background: "linear-gradient(180deg, rgba(168,208,230,0.25) 0%, rgba(168,208,230,0.45) 100%)",
          padding: "10px 12px 14px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <CandyArrow direction="left" onPress={moveLeft} disabled={codyLane === 0} />

        {/* Center lane indicator */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
          <div style={{ display: "flex", gap: 8 }}>
            {[0, 1, 2].map((l) => (
              <div
                key={l}
                style={{
                  width: 12, height: 12, borderRadius: 6,
                  background: codyLane === l ? "#4A90C4" : "rgba(74,144,196,0.25)",
                  transition: "background 0.2s",
                }}
              />
            ))}
          </div>
          <p style={{ fontSize: 11, color: "#7BACC8", margin: 0, fontWeight: 600 }}>
            {codyLane === 0 ? "Left" : codyLane === 1 ? "Middle" : "Right"}
          </p>
        </div>

        <CandyArrow direction="right" onPress={moveRight} disabled={codyLane === 2} />
      </div>
    </div>
  );
}

// ─── Main wrapper ─────────────────────────────────────────────────────────────

export default function LetterCatchGame({ words, title, color, onBack }) {
  const [roundIndex, setRoundIndex] = useState(0);

  const [gameWords] = useState(() => {
    const shuffled = [...words].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, ROUNDS_PER_SESSION);
  });

  const handleSuccess = useCallback(() => {
    setTimeout(() => {
      setRoundIndex((prev) => prev + 1);
    }, 1500);
  }, []);

  if (roundIndex >= gameWords.length) {
    return (
      <div
        style={{
          display: "flex", flexDirection: "column", height: "100%",
          background: "linear-gradient(160deg, #E8FFFE 0%, #FFF9E6 100%)",
          fontFamily: "Fredoka, sans-serif",
          alignItems: "center", justifyContent: "center", gap: 12,
          padding: 24,
        }}
      >
        <motion.div
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 18 }}
          style={{ fontSize: 80 }}
        >
          🏆
        </motion.div>
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          style={{ fontSize: 34, fontWeight: 700, color: "#1E3A5F", margin: 0 }}
        >
          Amazing!
        </motion.p>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          style={{ fontSize: 18, color: "#4A90C4", margin: 0, textAlign: "center" }}
        >
          You caught all the letters!
        </motion.p>
        <motion.img
          src={CODY_IMG}
          alt="Cody"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          style={{ width: 100, height: 110, objectFit: "contain" }}
        />
        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.9 }}
          onClick={onBack}
          style={{
            marginTop: 8, padding: "14px 44px", borderRadius: 30,
            background: "#4A90C4", color: "white",
            fontSize: 20, fontWeight: 700, border: "none", cursor: "pointer",
            boxShadow: "0 6px 20px rgba(74,144,196,0.4)",
          }}
        >
          Back to Games
        </motion.button>
      </div>
    );
  }

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <GameRound
        key={`round-${roundIndex}`}
        wordData={gameWords[roundIndex]}
        roundNum={roundIndex + 1}
        totalRounds={gameWords.length}
        onSuccess={handleSuccess}
        onExit={onBack}
      />
    </div>
  );
}