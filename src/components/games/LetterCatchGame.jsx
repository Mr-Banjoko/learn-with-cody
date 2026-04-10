import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Volume2 } from "lucide-react";
import { tx } from "../../lib/i18n";
import BackArrow from "../BackArrow";
import { playAudio } from "../../lib/useAudio";
import { getLetterSoundUrl, getLetterGain } from "../../lib/letterSounds";

const CODY_IMG =
  "https://media.base44.com/images/public/69c4ec00726384fdef1ab181/93a5cd462_transparent_cody.png";

const TILE_COLORS = ["#FF6B6B", "#4D96FF", "#6BCB77", "#FFD93D", "#C77DFF", "#FF9F43"];
const LETTER_BOX_COLORS = ["#FF6B6B", "#4ECDC4", "#FFD93D"];
const TICK_MS = 40;
const DEFAULT_FALL_SPEED = 1.9;
const FIRST_SPAWN_MS = 1800;
const SPAWN_INTERVAL_MS = 2800;
const MAX_ACTIVE_TILES = 3;
const ROUNDS_PER_SESSION = 10;
const LANE_X_PCT = [16.67, 50, 83.33];

// ── Helpers ──────────────────────────────────────────────────────────────────

function pickDistractors(correct) {
  const vowels = "aeiou".split("");
  const consonants = "bcdfghjklmnprst".split("");
  const pool = "aeiou".includes(correct)
    ? [...vowels.filter((l) => l !== correct), ...consonants.slice(0, 4)]
    : consonants.filter((l) => l !== correct);
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return [shuffled[0], shuffled[1]];
}

function buildQueue(correct, distractors) {
  return Array.from({ length: 12 }, (_, i) =>
    i % 3 === 1 ? correct : distractors[i % 2]
  );
}

function pickLane(activeTiles) {
  const counts = [0, 0, 0];
  activeTiles.forEach((t) => counts[t.lane]++);
  const min = Math.min(...counts);
  const opts = [0, 1, 2].filter((l) => counts[l] === min);
  return opts[Math.floor(Math.random() * opts.length)];
}

// ── Candy Arrow Button ────────────────────────────────────────────────────────
// Left: sky-blue + red/yellow stripes  |  Right: lime-green + pink swirls

function CandyArrow({ direction, onPress }) {
  const isLeft = direction === "left";

  const bodyColor = isLeft ? "#4EC8F0" : "#7ED957";
  const accentColor = isLeft ? "#FF5E5E" : "#FF85C2";
  const stripeColor = isLeft ? "#FFD93D" : "#FF6FD8";
  const shadowColor = isLeft ? "rgba(78,200,240,0.45)" : "rgba(126,217,87,0.45)";

  return (
    <button
      onPointerDown={(e) => { e.preventDefault(); onPress(); }}
      style={{
        background: "transparent",
        border: "none",
        padding: 0,
        cursor: "pointer",
        WebkitTapHighlightColor: "transparent",
        outline: "none",
        width: 120,
        height: 88,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        touchAction: "manipulation",
      }}
    >
      <motion.div
        whileTap={{ scale: 0.88 }}
        transition={{ type: "spring", stiffness: 400, damping: 22 }}
        style={{
          position: "relative",
          width: 104,
          height: 72,
          filter: `drop-shadow(0 6px 12px ${shadowColor})`,
        }}
      >
        {/* SVG arrow shape */}
        <svg
          viewBox="0 0 104 72"
          width="104"
          height="72"
          style={{ display: "block", overflow: "visible" }}
        >
          <defs>
            <clipPath id={`arrowClip-${direction}`}>
              {isLeft ? (
                <path d="M36,4 L4,36 L36,68 L36,52 L100,52 Q104,52 104,48 L104,24 Q104,20 100,20 L36,20 Z" />
              ) : (
                <path d="M68,4 L100,36 L68,68 L68,52 L4,52 Q0,52 0,48 L0,24 Q0,20 4,20 L68,20 Z" />
              )}
            </clipPath>
          </defs>

          {/* Arrow body */}
          <g clipPath={`url(#arrowClip-${direction})`}>
            {/* Base color */}
            {isLeft ? (
              <path d="M36,4 L4,36 L36,68 L36,52 L100,52 Q104,52 104,48 L104,24 Q104,20 100,20 L36,20 Z" fill={bodyColor} />
            ) : (
              <path d="M68,4 L100,36 L68,68 L68,52 L4,52 Q0,52 0,48 L0,24 Q0,20 4,20 L68,20 Z" fill={bodyColor} />
            )}

            {/* Diagonal stripes */}
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

            {/* Polka dots */}
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

            {/* Cute eyes */}
            {isLeft ? (
              <>
                <circle cx="50" cy="31" r="5.5" fill="white" />
                <circle cx="62" cy="31" r="5.5" fill="white" />
                <circle cx="51" cy="32" r="3" fill="#2D2D2D" />
                <circle cx="63" cy="32" r="3" fill="#2D2D2D" />
                <circle cx="52" cy="31" r="1.2" fill="white" />
                <circle cx="64" cy="31" r="1.2" fill="white" />
                {/* Smile */}
                <path d="M49,40 Q56,46 65,40" fill="none" stroke="#2D2D2D" strokeWidth="2" strokeLinecap="round" />
                {/* Cheeks */}
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
                {/* Wink */}
                <path d="M40,40 Q47,46 56,40" fill="none" stroke="#2D2D2D" strokeWidth="2" strokeLinecap="round" />
                {/* Wink line over left eye */}
                <path d="M40,30 Q43,27 46,30" fill="none" stroke="#2D2D2D" strokeWidth="2" strokeLinecap="round" />
                {/* Cheeks */}
                <circle cx="38" cy="38" r="4" fill="#FF8FAB" opacity="0.5" />
                <circle cx="58" cy="38" r="4" fill="#FF8FAB" opacity="0.5" />
              </>
            )}

            {/* Outline */}
            {isLeft ? (
              <path d="M36,4 L4,36 L36,68 L36,52 L100,52 Q104,52 104,48 L104,24 Q104,20 100,20 L36,20 Z" fill="none" stroke="white" strokeWidth="2.5" opacity="0.5" />
            ) : (
              <path d="M68,4 L100,36 L68,68 L68,52 L4,52 Q0,52 0,48 L0,24 Q0,20 4,20 L68,20 Z" fill="none" stroke="white" strokeWidth="2.5" opacity="0.5" />
            )}
          </g>
        </svg>
      </motion.div>
    </button>
  );
}

// ── Single Round ──────────────────────────────────────────────────────────────

function GameRound({ wordData, roundNum, totalRounds, onSuccess, onExit, fallSpeed, lang = "en" }) {
  const { word, image, audio } = wordData;
  const letters = word.split("");
  const [missingPos] = useState(() => Math.floor(Math.random() * 3));
  const missingLetter = letters[missingPos];

  const [tiles, setTiles] = useState([]);
  const [codyLane, setCodyLane] = useState(1);
  const [phase, setPhase] = useState("playing"); // playing | caught
  const [caughtVisible, setCaughtVisible] = useState(false);
  const [redGlowId, setRedGlowId] = useState(null); // id of wrong tile currently glowing

  const tilesRef = useRef([]);
  const codyLaneRef = useRef(1);
  const phaseRef = useRef("playing");
  const tickRef = useRef(null);
  const gameAreaRef = useRef(null);
  const gameHeightRef = useRef(460);
  const cancelRef = useRef(null); // not used for sequence but kept for cleanup
  const distractors = useRef(pickDistractors(missingLetter)).current;
  const queue = useRef(buildQueue(missingLetter, distractors)).current;
  const queueIdx = useRef(0);
  const nextSpawnAt = useRef(Date.now() + FIRST_SPAWN_MS);
  const tileCounter = useRef(0);

  // Keep ref in sync
  useEffect(() => { codyLaneRef.current = codyLane; }, [codyLane]);

  // Auto-play word on mount
  useEffect(() => {
    const t = setTimeout(() => playAudio(audio), 300);
    return () => clearTimeout(t);
  }, [audio]);

  // Measure game area
  useEffect(() => {
    const measure = () => {
      if (gameAreaRef.current)
        gameHeightRef.current = gameAreaRef.current.getBoundingClientRect().height || 460;
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  const handleCatch = useCallback(
    (tile) => {
      if (phaseRef.current !== "playing") return;

      if (tile.letter === missingLetter) {
        // ── Correct ──
        phaseRef.current = "caught";
        setPhase("caught");
        clearInterval(tickRef.current);
        tilesRef.current = [];
        setTiles([]);
        setCaughtVisible(true);
        // Just play the full word once, then advance
        playAudio(audio);
        setTimeout(() => onSuccess(), 1200);
      } else {
        // ── Wrong — soft red glow, then remove tile ──
        tilesRef.current = tilesRef.current.map((t) =>
          t.id === tile.id ? { ...t, status: "wrong" } : t
        );
        setRedGlowId(tile.id);
        setTimeout(() => {
          tilesRef.current = tilesRef.current.filter((t) => t.id !== tile.id);
          setTiles([...tilesRef.current]);
          setRedGlowId(null);
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
      const catchTop = height * 0.65;
      const catchBottom = height * 0.83;
      const toRemove = [];

      tilesRef.current = tilesRef.current.map((tile) => {
        if (tile.status !== "falling") return tile;
        const newY = tile.y + fallSpeed;

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

      if (toRemove.length)
        tilesRef.current = tilesRef.current.filter((t) => !toRemove.includes(t.id));

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
      if (cancelRef.current) cancelRef.current();
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
    <div
      style={{
        display: "flex", flexDirection: "column", height: "100%",
        background: "linear-gradient(180deg, #D6EEFF 0%, #E8F7FF 100%)",
        fontFamily: "Fredoka, sans-serif", overflow: "hidden", position: "relative",
      }}
    >
      {/* ── Header ── */}
      <div
        style={{
          background: "#A8D0E6", padding: "10px 16px 10px",
          display: "flex", alignItems: "center", gap: 10, flexShrink: 0,
        }}
      >
        <BackArrow onPress={onExit} />
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 12, color: "#3A6080", margin: 0 }}>
            {lang === "zh" ? `第 ${roundNum} 关 / 共 ${totalRounds}` : `Round ${roundNum} of ${totalRounds}`}
          </p>
        </div>
        <div style={{ display: "flex", gap: 5 }}>
          {Array.from({ length: totalRounds }).map((_, i) => (
            <div
              key={i}
              style={{
                width: 7, height: 7, borderRadius: "50%",
                background: i < roundNum - 1 ? "#4A90C4" : i === roundNum - 1 ? "#FFD93D" : "rgba(255,255,255,0.45)",
                transition: "background 0.3s",
              }}
            />
          ))}
        </div>
      </div>

      {/* ── Word Card (30% bigger) ── */}
      <div style={{ padding: "8px 12px 4px", flexShrink: 0 }}>
        <div
          style={{
            background: "white", borderRadius: 22, padding: "10px 14px",
            display: "flex", alignItems: "center", gap: 14,
            boxShadow: "0 4px 20px rgba(30,58,95,0.10)",
          }}
        >
          {/* Picture — tap to replay word */}
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
            <div
              style={{
                position: "absolute", bottom: 4, right: 4,
                width: 24, height: 24, borderRadius: 12,
                background: "#4A90C4",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              <Volume2 size={13} color="white" />
            </div>
          </button>

          {/* CVC letter boxes — 30% bigger */}
          <div style={{ display: "flex", gap: 8, flex: 1, justifyContent: "center" }}>
            {letters.map((letter, i) => {
              const isMissing = i === missingPos;
              const showLetter = !isMissing || caughtVisible;
              const boxColor = LETTER_BOX_COLORS[i];
              return (
                <motion.button
                  key={i}
                  animate={isMissing && caughtVisible ? { scale: [1, 1.4, 1] } : {}}
                  transition={{ duration: 0.45 }}
                  onPointerDown={(e) => { e.preventDefault(); showLetter && playAudio(getLetterSoundUrl(letter), getLetterGain(letter)); }}
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

        <p
          style={{
            textAlign: "center", fontSize: 13,
            color: phase === "caught" ? "#27AE60" : "#4A90C4",
            marginTop: 5, fontWeight: 600, transition: "color 0.3s",
          }}
        >
          {phase === "caught"
            ? tx("🌟 Amazing catch!", "amazing_catch", lang)
            : lang === "zh"
            ? `接住字母「${missingLetter.toUpperCase()}」`
            : `Catch the letter  "${missingLetter.toUpperCase()}"`}
        </p>
      </div>

      {/* ── Game Field ── */}
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
            position: "absolute", top: 0, bottom: 0,
            left: `${(codyLane / 3) * 100}%`, width: "33.33%",
            background: "rgba(74,144,196,0.07)",
            transition: "left 0.16s ease-out", pointerEvents: "none",
          }}
        />

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
                  left: `${LANE_X_PCT[tile.lane]}%`,
                  top: tile.y,
                  transform: "translateX(-50%)",
                  width: 68, height: 68, borderRadius: 20,
                  background: tile.color,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 34, fontWeight: 700, color: "white",
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

        {/* Cody */}
        <div
          style={{
            position: "absolute", bottom: 4,
            left: `${LANE_X_PCT[codyLane]}%`,
            transform: "translateX(-50%)",
            transition: "left 0.16s ease-out",
            display: "flex", flexDirection: "column", alignItems: "center",
            zIndex: 20, pointerEvents: "none",
          }}
        >
          <motion.img
            src={CODY_IMG}
            alt="Cody"
            animate={phase === "caught" ? { scale: [1, 1.25, 1], y: [0, -14, 0] } : { y: [0, -5, 0] }}
            transition={
              phase === "caught"
                ? { duration: 0.55, ease: "easeOut" }
                : { duration: 1.7, repeat: Infinity, ease: "easeInOut" }
            }
            style={{
              width: 80, height: 88, objectFit: "contain",
              filter: "drop-shadow(0 4px 8px rgba(30,58,95,0.20))",
            }}
          />
        </div>

        {/* Catch line */}
        <div
          style={{
            position: "absolute", bottom: "17%", left: "4%", right: "4%",
            height: 2, background: "rgba(74,144,196,0.18)", borderRadius: 2,
            pointerEvents: "none",
          }}
        />


      </div>

      {/* ── Arrow controls — only LEFT and RIGHT ── */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexShrink: 0,
          padding: "6px 16px 10px",
          background: "rgba(168,208,230,0.25)",
        }}
      >
        <CandyArrow direction="left" onPress={moveLeft} />
        <p
          style={{
            fontSize: 13, color: "#4A90C4", fontWeight: 600,
            textAlign: "center", margin: 0, flex: 1,
          }}
        >
          {tx("Move Cody!", "move_cody", lang)}
        </p>
        <CandyArrow direction="right" onPress={moveRight} />
      </div>
    </div>
  );
}

// ── Main Wrapper ──────────────────────────────────────────────────────────────

export default function LetterCatchGame({ words, title, color, fallSpeed = DEFAULT_FALL_SPEED, onBack, lang = "en" }) {
  const [roundIndex, setRoundIndex] = useState(0);

  const [gameWords] = useState(() =>
    [...words].sort(() => Math.random() - 0.5).slice(0, ROUNDS_PER_SESSION)
  );

  const handleSuccess = useCallback(() => {
    setTimeout(() => setRoundIndex((p) => p + 1), 400);
  }, []);

  if (roundIndex >= gameWords.length) {
    return (
      <div
        style={{
          display: "flex", flexDirection: "column", height: "100%",
          background: "linear-gradient(160deg, #E8FFFE 0%, #FFF9E6 100%)",
          fontFamily: "Fredoka, sans-serif",
          alignItems: "center", justifyContent: "center", gap: 12, padding: 24,
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
          {tx("Amazing!", "amazing", lang)}
        </motion.p>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          style={{ fontSize: 18, color: "#4A90C4", margin: 0, textAlign: "center" }}
        >
          {tx("You caught all the letters!", "caught_all_letters", lang)}
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
          {tx("Back to Games", "back_to_games", lang)}
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
        fallSpeed={fallSpeed}
        lang={lang}
      />
    </div>
  );
}