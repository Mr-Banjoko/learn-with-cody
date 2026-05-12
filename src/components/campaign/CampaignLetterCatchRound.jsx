/**
 * CampaignLetterCatchRound
 *
 * Wraps the GameRound logic from LetterCatchGame for use inside campaign levels.
 * Accepts a specific word + missingLetter instead of randomising.
 * Calls onMistake() for every wrong catch (heart system).
 * Calls onComplete() when the correct letter is caught.
 * Audio auto-plays at start (word audio), UI is NOT locked during audio
 * to match the existing GameRound behaviour.
 */
import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { Volume2 } from "lucide-react";
import { playAudio } from "../../lib/useAudio";
import { getLetterSoundUrl, getLetterGain } from "../../lib/letterSounds";

const TILE_COLORS = ["#FF6B6B", "#4D96FF", "#6BCB77", "#FFD93D", "#C77DFF", "#FF9F43"];
const LETTER_BOX_COLORS = ["#FF6B6B", "#4ECDC4", "#FFD93D"];
const TICK_MS = 40;
const FALL_SPEED = 7.6; // difficult mode
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

export default function CampaignLetterCatchRound({ word, missingLetter, image, audio, onComplete, onMistake, lang = "en" }) {
  const letters = word.split("");
  // Find the index of the missing letter in the word
  const missingPos = letters.indexOf(missingLetter);

  const [tiles, setTiles] = useState([]);
  const [codyLane, setCodyLane] = useState(1);
  const [phase, setPhase] = useState("playing");
  const [caughtVisible, setCaughtVisible] = useState(false);
  const [redGlowId, setRedGlowId] = useState(null);

  const tilesRef = useRef([]);
  const codyLaneRef = useRef(1);
  const phaseRef = useRef("playing");
  const tickRef = useRef(null);
  const gameAreaRef = useRef(null);
  const gameHeightRef = useRef(460);
  const distractors = useRef(pickDistractors(missingLetter)).current;
  const queue = useRef(buildQueue(missingLetter, distractors)).current;
  const queueIdx = useRef(0);
  const nextSpawnAt = useRef(Date.now() + FIRST_SPAWN_MS);
  const tileCounter = useRef(0);

  useEffect(() => { codyLaneRef.current = codyLane; }, [codyLane]);

  // Auto-play word audio at round start
  useEffect(() => {
    const t = setTimeout(() => playAudio(audio), 300);
    return () => clearTimeout(t);
  }, [audio]);

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
        phaseRef.current = "caught";
        setPhase("caught");
        clearInterval(tickRef.current);
        tilesRef.current = [];
        setTiles([]);
        setCaughtVisible(true);
        playAudio(audio);
        setTimeout(() => onComplete(), 1200);
      } else {
        // Wrong catch — deduct life
        onMistake && onMistake();
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
    [missingLetter, audio, onComplete, onMistake]
  );

  const handleCatchRef = useRef(handleCatch);
  useEffect(() => { handleCatchRef.current = handleCatch; }, [handleCatch]);

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
    return () => { clearInterval(tickRef.current); };
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
      {/* Word Card */}
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
      </div>

      {/* Game Field */}
      <div ref={gameAreaRef} style={{ flex: 1, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, display: "flex", pointerEvents: "none" }}>
          {[0, 1, 2].map((l) => (
            <div key={l} style={{ flex: 1, borderRight: l < 2 ? "1px dashed rgba(168,208,230,0.35)" : "none" }} />
          ))}
        </div>

        <div style={{
          position: "absolute", top: 0, bottom: 0,
          left: `${(codyLane / 3) * 100}%`, width: "33.33%",
          background: "rgba(74,144,196,0.07)",
          transition: "left 0.16s ease-out", pointerEvents: "none",
        }} />

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

        <div style={{
          position: "absolute", bottom: "17%", left: "4%", right: "4%",
          height: 2, background: "rgba(74,144,196,0.18)", borderRadius: 2,
          pointerEvents: "none",
        }} />
      </div>

      {/* Arrow controls */}
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