import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Volume2 } from "lucide-react";
import { playAudio, playAudioSequence } from "../../lib/useAudio";
import { getLetterSoundUrl, getLetterGain } from "../../lib/letterSounds";

const CODY_IMG = "https://media.base44.com/images/public/69c4ec00726384fdef1ab181/93a5cd462_transparent_cody.png";
const TILE_COLORS = ["#FF6B6B", "#4D96FF", "#6BCB77", "#FFD93D", "#C77DFF", "#FF9F43"];
const TICK_MS = 40; // 25fps — smooth enough, light on mobile
const FALL_SPEED = 2.0; // px per tick ≈ 50px/sec (nice and slow for 4-year-olds)
const FIRST_SPAWN_MS = 1600; // slight pause before first tile
const SPAWN_INTERVAL_MS = 2700; // gap between spawns
const MAX_ACTIVE_TILES = 3;
const LETTER_BOX_COLORS = ["#FF6B6B", "#4ECDC4", "#FFD93D"];
const ROUNDS_PER_SESSION = 10;

// ─── Helpers ────────────────────────────────────────────────────────────────

function pickDistractors(correct) {
  // Use consonant pool if correct is a consonant, vowel pool if vowel
  const vowels = "aeiou".split("");
  const consonants = "bcdfghjklmnprst".split("");
  const isVowel = vowels.includes(correct.toLowerCase());
  let pool = isVowel
    ? [...vowels.filter((l) => l !== correct), ...consonants.slice(0, 4)]
    : consonants.filter((l) => l !== correct);
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return [shuffled[0], shuffled[1]];
}

// Build a repeating spawn sequence so the correct letter appears regularly
function buildQueue(correct, distractors) {
  const q = [];
  for (let i = 0; i < 12; i++) {
    if (i % 3 === 1) q.push(correct); // correct at positions 1, 4, 7, 10 …
    else q.push(distractors[i % 2]);
  }
  return q;
}

// Pick a lane that's least occupied by currently falling tiles
function pickLane(activeTiles) {
  const counts = [0, 0, 0];
  activeTiles.forEach((t) => counts[t.lane]++);
  const min = Math.min(...counts);
  const opts = [0, 1, 2].filter((l) => counts[l] === min);
  return opts[Math.floor(Math.random() * opts.length)];
}

const LANE_X = [16.67, 50, 83.33]; // % from left, centred in lane

// ─── Single Round ─────────────────────────────────────────────────────────

function GameRound({ wordData, roundNum, totalRounds, onSuccess, onExit }) {
  const { word, image, audio } = wordData;
  const letters = word.split(""); // always 3 letters for CVC

  // Pick missing position once on mount
  const [missingPos] = useState(() => Math.floor(Math.random() * 3));
  const missingLetter = letters[missingPos];

  const [tiles, setTiles] = useState([]);
  const [codyLane, setCodyLane] = useState(1);
  const [phase, setPhase] = useState("playing"); // playing | caught | done
  const [caughtVisible, setCaughtVisible] = useState(false);
  const [wrongIds, setWrongIds] = useState(new Set());

  // Refs for use inside intervals/rAF without stale closures
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

  // Keep refs in sync
  useEffect(() => { codyLaneRef.current = codyLane; }, [codyLane]);

  // Measure game area height after mount
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

  // Handle a tile being caught
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

        // Cancel any existing audio
        if (cancelAudioRef.current) cancelAudioRef.current();

        // Reward sequence: letter-0 → letter-1 → letter-2 → full word
        const steps = letters.map((l) => ({
          url: getLetterSoundUrl(l),
          gain: getLetterGain(l),
        })).concat([{ url: audio }]);

        setTimeout(() => {
          cancelAudioRef.current = playAudioSequence(steps, () => {
            onSuccess();
          });
        }, 600);
      } else {
        // ── Wrong catch — gentle rejection ──
        tilesRef.current = tilesRef.current.map((t) =>
          t.id === tile.id ? { ...t, status: "wrong" } : t
        );
        setWrongIds((prev) => new Set([...prev, tile.id]));
        setTimeout(() => {
          tilesRef.current = tilesRef.current.filter((t) => t.id !== tile.id);
          setTiles([...tilesRef.current]);
          setWrongIds((prev) => {
            const next = new Set(prev);
            next.delete(tile.id);
            return next;
          });
        }, 650);
      }
    },
    [missingLetter, letters, audio, onSuccess]
  );

  const handleCatchRef = useRef(handleCatch);
  useEffect(() => { handleCatchRef.current = handleCatch; }, [handleCatch]);

  // ── Game tick ──
  useEffect(() => {
    if (phase !== "playing") return;

    tickRef.current = setInterval(() => {
      if (phaseRef.current !== "playing") return;

      const now = Date.now();
      const height = gameHeightRef.current;
      const catchTop = height * 0.68;
      const catchBottom = height * 0.83;

      const toRemove = [];
      let spawned = false;

      tilesRef.current = tilesRef.current.map((tile) => {
        if (tile.status !== "falling") return tile;
        const newY = tile.y + FALL_SPEED;

        // Catch zone detection
        if (newY >= catchTop && newY <= catchBottom) {
          if (tile.lane === codyLaneRef.current) {
            handleCatchRef.current(tile);
            return { ...tile, y: newY, status: "catching" }; // prevent double-catch
          }
        }

        // Off screen
        if (newY > height + 80) {
          toRemove.push(tile.id);
          return { ...tile, y: newY, status: "gone" };
        }

        return { ...tile, y: newY };
      });

      // Remove gone tiles
      if (toRemove.length > 0) {
        tilesRef.current = tilesRef.current.filter((t) => !toRemove.includes(t.id));
      }

      // Spawn next tile if due
      const activeFalling = tilesRef.current.filter((t) => t.status === "falling").length;
      if (now >= nextSpawnAt.current && activeFalling < MAX_ACTIVE_TILES) {
        const letter = queue[queueIdx.current % queue.length];
        queueIdx.current++;
        const id = ++tileCounter.current;
        const lane = pickLane(tilesRef.current.filter((t) => t.status === "falling"));
        const color = TILE_COLORS[Math.floor(Math.random() * TILE_COLORS.length)];
        tilesRef.current = [
          ...tilesRef.current,
          { id, letter, lane, y: -80, status: "falling", color },
        ];
        nextSpawnAt.current = now + SPAWN_INTERVAL_MS;
        spawned = true;
      }

      setTiles([...tilesRef.current]);
    }, TICK_MS);

    return () => clearInterval(tickRef.current);
  }, [phase, queue]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearInterval(tickRef.current);
      if (cancelAudioRef.current) cancelAudioRef.current();
    };
  }, []);

  const moveCody = (lane) => {
    if (phaseRef.current !== "playing") return;
    setCodyLane(lane);
    codyLaneRef.current = lane;
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
      {/* ── Header ─────────────────────────────────────────── */}
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
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 12, color: "#3A6080", margin: 0 }}>
            Round {roundNum} of {totalRounds}
          </p>
        </div>
        {/* Progress dots */}
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

      {/* ── Word Card ──────────────────────────────────────── */}
      <div style={{ padding: "10px 16px 6px", flexShrink: 0 }}>
        <div
          style={{
            background: "white",
            borderRadius: 20,
            padding: "10px 14px",
            display: "flex",
            alignItems: "center",
            gap: 14,
            boxShadow: "0 4px 20px rgba(30,58,95,0.10)",
          }}
        >
          {/* Picture — tap to hear word */}
          <button
            onTouchStart={() => playAudio(audio)}
            onClick={() => playAudio(audio)}
            style={{
              width: 76, height: 76, borderRadius: 16, overflow: "hidden",
              flexShrink: 0, border: "2.5px solid #A8D0E6",
              background: "#EFF6FF", position: "relative", cursor: "pointer",
              WebkitTapHighlightColor: "transparent",
            }}
          >
            <img
              src={image}
              alt={word}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
            <div
              style={{
                position: "absolute", bottom: 4, right: 4,
                width: 22, height: 22, borderRadius: 11,
                background: "#4A90C4",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              <Volume2 size={12} color="white" />
            </div>
          </button>

          {/* CVC letter boxes */}
          <div style={{ display: "flex", gap: 8, flex: 1, justifyContent: "center" }}>
            {letters.map((letter, i) => {
              const isMissing = i === missingPos;
              const showLetter = !isMissing || caughtVisible;
              const boxColor = LETTER_BOX_COLORS[i];
              return (
                <motion.button
                  key={i}
                  animate={isMissing && caughtVisible ? { scale: [1, 1.35, 1] } : {}}
                  transition={{ duration: 0.4 }}
                  onTouchStart={() => {
                    if (showLetter) playAudio(getLetterSoundUrl(letter), getLetterGain(letter));
                  }}
                  onClick={() => {
                    if (showLetter) playAudio(getLetterSoundUrl(letter), getLetterGain(letter));
                  }}
                  style={{
                    width: 58, height: 58, borderRadius: 14,
                    background: showLetter ? boxColor : "rgba(168,208,230,0.25)",
                    border: showLetter ? "none" : "3px dashed #A8D0E6",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 28, fontWeight: 700,
                    color: showLetter ? "white" : "#A8D0E6",
                    cursor: showLetter ? "pointer" : "default",
                    boxShadow: showLetter ? `0 4px 12px ${boxColor}55` : "none",
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
            marginTop: 6,
            fontWeight: 600,
            transition: "color 0.3s",
          }}
        >
          {phase === "caught"
            ? "🌟 Amazing catch!"
            : `Move Cody to catch  "${missingLetter.toUpperCase()}"`}
        </p>
      </div>

      {/* ── Game Field ─────────────────────────────────────── */}
      <div
        ref={gameAreaRef}
        style={{ flex: 1, position: "relative", overflow: "hidden" }}
      >
        {/* Lane dividers */}
        <div
          style={{
            position: "absolute", inset: 0,
            display: "flex", pointerEvents: "none",
          }}
        >
          {[0, 1, 2].map((l) => (
            <div
              key={l}
              style={{
                flex: 1,
                borderRight: l < 2 ? "1px dashed rgba(168,208,230,0.35)" : "none",
              }}
            />
          ))}
        </div>

        {/* Active lane highlight */}
        <div
          style={{
            position: "absolute",
            top: 0, bottom: 0,
            left: `${(codyLane / 3) * 100}%`,
            width: "33.33%",
            background: "rgba(74,144,196,0.06)",
            transition: "left 0.18s ease-out",
            pointerEvents: "none",
          }}
        />

        {/* Falling tiles */}
        {tiles
          .filter((t) => t.status === "falling" || t.status === "wrong" || t.status === "catching")
          .map((tile) => {
            const isWrong = wrongIds.has(tile.id);
            return (
              <div
                key={tile.id}
                style={{
                  position: "absolute",
                  left: `${LANE_X[tile.lane]}%`,
                  top: tile.y,
                  transform: "translateX(-50%)",
                  width: 66, height: 66, borderRadius: 18,
                  background: isWrong ? "#CCC" : tile.color,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 32, fontWeight: 700, color: "white",
                  fontFamily: "Fredoka, sans-serif",
                  textTransform: "uppercase",
                  boxShadow: isWrong ? "none" : `0 6px 20px ${tile.color}60`,
                  opacity: isWrong ? 0 : 1,
                  transition: isWrong ? "opacity 0.45s ease-out" : "none",
                  userSelect: "none",
                  pointerEvents: "none",
                  zIndex: 10,
                }}
              >
                {tile.letter.toUpperCase()}
              </div>
            );
          })}

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

        {/* Subtle catch-line */}
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

        {/* ── Lane tap zones (invisible, cover full game area) ── */}
        <div style={{ position: "absolute", inset: 0, display: "flex", zIndex: 30 }}>
          {[0, 1, 2].map((lane) => (
            <button
              key={lane}
              onTouchStart={() => moveCody(lane)}
              onClick={() => moveCody(lane)}
              style={{
                flex: 1,
                background: "transparent",
                border: "none",
                cursor: "pointer",
                WebkitTapHighlightColor: "transparent",
                outline: "none",
              }}
            />
          ))}
        </div>
      </div>

      {/* ── Lane labels (below game field) ─────────────────── */}
      <div
        style={{
          display: "flex",
          flexShrink: 0,
          background: "rgba(168,208,230,0.30)",
          padding: "6px 0 8px",
        }}
      >
        {[0, 1, 2].map((lane) => (
          <button
            key={lane}
            onTouchStart={() => moveCody(lane)}
            onClick={() => moveCody(lane)}
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 2,
              background: "transparent",
              border: "none",
              cursor: "pointer",
              WebkitTapHighlightColor: "transparent",
            }}
          >
            <div
              style={{
                width: 36, height: 36, borderRadius: 18,
                background: codyLane === lane ? "#4A90C4" : "rgba(255,255,255,0.6)",
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "background 0.2s",
                boxShadow: codyLane === lane ? "0 3px 10px rgba(74,144,196,0.4)" : "none",
              }}
            >
              <span style={{ fontSize: 18 }}>
                {lane === 0 ? "⬅" : lane === 1 ? "⬆" : "➡"}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Main wrapper — manages rounds ────────────────────────────────────────

export default function LetterCatchGame({ words, title, color, onBack }) {
  const [roundIndex, setRoundIndex] = useState(0);

  // Shuffle and pick first N words once
  const [gameWords] = useState(() => {
    const shuffled = [...words].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, ROUNDS_PER_SESSION);
  });

  const handleSuccess = useCallback(() => {
    // Small pause so the child feels the success before the next round
    setTimeout(() => {
      setRoundIndex((prev) => prev + 1);
    }, 900);
  }, []);

  // ── Completion screen ──
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