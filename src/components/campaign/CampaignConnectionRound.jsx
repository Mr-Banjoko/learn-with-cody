/**
 * CampaignConnectionRound
 *
 * Campaign-mode draw-a-line game.
 * Bottom row shows speaker icons (hidden letters) until correctly matched.
 * On correct match:
 *   Step 1: match-end.mp3 plays
 *   Step 2: speaker icon → letter revealed
 *   Step 3: letter sound plays (after match-end finishes)
 *   Step 4: word sound plays (after letter sound finishes)
 * Tapping a speaker icon before match plays the word hint audio.
 */
import { useState, useRef, useCallback, useLayoutEffect, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Volume2 } from "lucide-react";
import { getLetterSoundUrl, getLetterGain } from "../../lib/letterSounds";
import { playAudio, playAudioSequence, warmupAudio } from "../../lib/useAudio";
import RainbowLetterBlock from "../RainbowLetterBlock";
import { useTryAgainSound } from "../../lib/useTryAgainSound";

const MATCH_END_URL = "https://raw.githubusercontent.com/Mr-Banjoko/learn-with-cody/main/letter_sound/feedback/match-end.mp3";

const CARD_COLORS = ["#FFAFC5", "#A8D8EA", "#FFE57A"];
const LETTER_COLORS = ["#FFAFC5", "#A8D8EA", "#FFE57A"];

function shuffleArr(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildShuffledOrder() {
  let order = shuffleArr([0, 1, 2]);
  let tries = 0;
  while (tries < 20 && order.every((v, i) => v === i)) {
    order = shuffleArr([0, 1, 2]);
    tries++;
  }
  return order;
}

function LinesLayer({ matches, connectorRects, containerRect }) {
  if (!containerRect) return null;
  return (
    <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 5, overflow: "visible" }}>
      {matches.map((m) => {
        const topR = connectorRects[`top-${m.topIdx}`];
        const botR = connectorRects[`bot-${m.botIdx}`];
        if (!topR || !botR) return null;
        const x1 = topR.left + topR.width / 2 - containerRect.left;
        const y1 = topR.top + topR.height / 2 - containerRect.top;
        const x2 = botR.left + botR.width / 2 - containerRect.left;
        const y2 = botR.top + botR.height / 2 - containerRect.top;
        return (
          <motion.line key={m.topIdx} x1={x1} y1={y1} x2={x2} y2={y2}
            stroke={CARD_COLORS[m.topIdx % CARD_COLORS.length]}
            strokeWidth={4} strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
          />
        );
      })}
    </svg>
  );
}

function ConnectorDot({ dotRef, selected, matched, onTap, color }) {
  return (
    <div
      ref={dotRef}
      onClick={onTap}
      style={{
        width: 28, height: 28, borderRadius: "50%",
        border: matched ? `3px solid ${color}` : selected ? `3px solid #4A90C4` : "3px solid #CBD5E1",
        background: matched ? color : selected ? "#4A90C4" : "white",
        boxShadow: (selected || matched) ? `0 0 0 4px ${color}44` : "0 2px 6px rgba(0,0,0,0.10)",
        cursor: matched ? "default" : "pointer",
        transition: "background 0.18s, border 0.18s",
        flexShrink: 0,
      }}
    />
  );
}

function WinScreen({ card, onDone }) {
  const seqRef = useRef(null);
  const [activeLetterIndex, setActiveLetterIndex] = useState(null);

  useEffect(() => {
    const letters = card.word.split("");
    const steps = letters.map((letter, i) => {
      const url = getLetterSoundUrl(letter);
      return url ? { url, gain: getLetterGain(letter), onStart: () => setActiveLetterIndex(i) } : null;
    }).filter(Boolean);
    if (card.audio) steps.push({ url: card.audio, onStart: () => setActiveLetterIndex(null) });

    const t = setTimeout(() => {
      seqRef.current = playAudioSequence(steps, () => {
        seqRef.current = null;
        setActiveLetterIndex(null);
        onDone();
      });
    }, 400);

    return () => {
      clearTimeout(t);
      if (seqRef.current) { seqRef.current(); seqRef.current = null; }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.3 }}
      style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "24px", gap: 20 }}
    >
      <div style={{ background: "white", borderRadius: 28, padding: 16, boxShadow: "0 12px 48px rgba(30,58,95,0.18)", width: "min(364px, calc(100vw - 48px))" }}>
        <img src={card.fullImage || card.image} alt={card.word} style={{ width: "100%", aspectRatio: "1/1", objectFit: "cover", borderRadius: 18, display: "block" }} />
      </div>
      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        {card.word.split("").map((letter, i) => (
          <RainbowLetterBlock key={i} letter={letter} index={i} isActive={activeLetterIndex === i} />
        ))}
      </div>
    </motion.div>
  );
}

// Speaker icon tile used for unmatched bottom slots
function SpeakerTile({ color, onHintTap, isWrong, isSelected }) {
  return (
    <motion.div
      animate={isWrong ? { x: [0, -8, 8, -6, 6, 0] } : {}}
      transition={{ duration: 0.4 }}
      onPointerDown={(e) => { e.preventDefault(); onHintTap(); }}
      style={{
        width: "100%",
        aspectRatio: "1/2",
        borderRadius: 18,
        background: isSelected ? "rgba(74,144,196,0.12)" : "rgba(255,255,255,0.85)",
        border: isWrong
          ? "2.5px solid #FF6B6B"
          : isSelected
          ? "2.5px solid #4A90C4"
          : "2.5px solid rgba(168,208,230,0.6)",
        boxShadow: isWrong
          ? "0 0 0 4px rgba(255,107,107,0.2)"
          : isSelected
          ? "0 0 0 4px rgba(74,144,196,0.22)"
          : "0 4px 14px rgba(0,0,0,0.09)",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        touchAction: "manipulation",
        WebkitTapHighlightColor: "transparent",
        transition: "border 0.18s, box-shadow 0.18s, background 0.18s",
      }}
    >
      <Volume2 size={28} color={isSelected ? "#4A90C4" : "#A8D8EA"} strokeWidth={2} />
    </motion.div>
  );
}

// Revealed letter tile (shown after correct match)
function RevealedLetterTile({ letter, color, isWrong }) {
  return (
    <motion.div
      initial={{ scale: 0.5, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 340, damping: 22 }}
      style={{
        width: "100%",
        aspectRatio: "1/2",
        borderRadius: 18,
        background: color,
        border: `2.5px solid ${color}`,
        boxShadow: `0 0 0 4px ${color}44`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "min(38px, 10vw)",
        fontWeight: 700,
        color: "#1E3A5F",
      }}
    >
      {letter}
    </motion.div>
  );
}

function ConnectionRound({ card, onComplete, onMistake, onWrongAnswer, onSpeakerTap }) {
  const letters = card.word.split("");
  const [shuffledOrder] = useState(() => buildShuffledOrder());
  const [selected, setSelected] = useState(null);
  const [matches, setMatches] = useState([]);
  // revealedBotSlots: set of botSlot indices whose letter has been revealed
  const [revealedBotSlots, setRevealedBotSlots] = useState(new Set());
  const [wrongFeedback, setWrongFeedback] = useState(null);
  const [locked, setLocked] = useState(false);
  const [won, setWon] = useState(false);

  // Deduplication: track which topIdx matches are already processing
  const matchingInProgress = useRef(new Set());

  const connectorRefs = useRef({});
  const [connectorRects, setConnectorRects] = useState({});
  const containerRef = useRef(null);
  const [containerRect, setContainerRect] = useState(null);

  const matchedTopIdxs = new Set(matches.map((m) => m.topIdx));
  const matchedBotIdxs = new Set(matches.map((m) => m.botIdx));

  const measureAll = useCallback(() => {
    const rects = {};
    for (const [key, el] of Object.entries(connectorRefs.current)) {
      if (el) rects[key] = el.getBoundingClientRect();
    }
    setConnectorRects(rects);
    if (containerRef.current) setContainerRect(containerRef.current.getBoundingClientRect());
  }, []);

  useLayoutEffect(() => { measureAll(); }, [matches, measureAll]);
  useEffect(() => {
    window.addEventListener("resize", measureAll);
    return () => window.removeEventListener("resize", measureAll);
  }, [measureAll]);

  const setRef = (key) => (el) => { connectorRefs.current[key] = el; };

  const triggerWrong = useCallback((topIdx, botIdx) => {
    onMistake && onMistake();
    onWrongAnswer && onWrongAnswer();
    setWrongFeedback({ topIdx, botIdx });
    setTimeout(() => { setWrongFeedback(null); setSelected(null); }, 700);
  }, [onMistake, onWrongAnswer]);

  const triggerMatch = useCallback((topIdx, botIdx) => {
    // Deduplication guard
    if (matchingInProgress.current.has(topIdx)) return;
    matchingInProgress.current.add(topIdx);

    setSelected(null);
    setLocked(true);

    const newMatches = [...matches, { topIdx, botIdx }];
    const isFinal = newMatches.length === letters.length;
    const letter = letters[topIdx];
    const letterUrl = getLetterSoundUrl(letter);

    // Step 1: play match-end.mp3
    const sfx = new Audio(MATCH_END_URL);
    sfx.volume = 1;

    sfx.onended = () => {
      // Step 2: reveal the letter
      setRevealedBotSlots((prev) => new Set([...prev, botIdx]));

      // Step 3: play letter sound, then Step 4: word sound
      const audioSteps = [];
      if (letterUrl) {
        audioSteps.push({ url: letterUrl, gain: getLetterGain(letter) });
      }
      if (card.audio) {
        audioSteps.push({ url: card.audio, gain: 1 });
      }

      if (audioSteps.length > 0) {
        playAudioSequence(audioSteps, () => {
          // All audio done — unlock and advance if final
          setLocked(false);
          matchingInProgress.current.delete(topIdx);
          if (isFinal) {
            setWon(true);
            setTimeout(onComplete, 200);
          }
        });
      } else {
        setLocked(false);
        matchingInProgress.current.delete(topIdx);
        if (isFinal) {
          setWon(true);
          setTimeout(onComplete, 200);
        }
      }
    };

    sfx.onerror = () => {
      // Fallback: skip match-end, still reveal + play sounds
      setRevealedBotSlots((prev) => new Set([...prev, botIdx]));
      const audioSteps = [];
      if (letterUrl) audioSteps.push({ url: letterUrl, gain: getLetterGain(letter) });
      if (card.audio) audioSteps.push({ url: card.audio, gain: 1 });
      if (audioSteps.length > 0) {
        playAudioSequence(audioSteps, () => {
          setLocked(false);
          matchingInProgress.current.delete(topIdx);
          if (isFinal) { setWon(true); setTimeout(onComplete, 200); }
        });
      } else {
        setLocked(false);
        matchingInProgress.current.delete(topIdx);
        if (isFinal) { setWon(true); setTimeout(onComplete, 200); }
      }
    };

    // Commit match to state so line draws immediately
    setMatches(newMatches);
    sfx.play().catch(() => sfx.onerror && sfx.onerror());
  }, [matches, letters, card, onComplete]);

  const handleTopDot = useCallback((topIdx) => {
    if (locked || matchedTopIdxs.has(topIdx)) return;
    if (selected === null) { setSelected(`top-${topIdx}`); return; }
    if (selected.startsWith("top-")) { setSelected(`top-${topIdx}`); return; }
    const botIdx = parseInt(selected.replace("bot-", ""), 10);
    const expectedLetter = letters[shuffledOrder[botIdx]];
    if (letters[topIdx] === expectedLetter) { triggerMatch(topIdx, botIdx); } else { triggerWrong(topIdx, botIdx); }
  }, [locked, selected, matchedTopIdxs, shuffledOrder, letters, triggerMatch, triggerWrong]);

  const handleBotDot = useCallback((botIdx) => {
    if (locked || matchedBotIdxs.has(botIdx)) return;
    if (selected === null) { setSelected(`bot-${botIdx}`); return; }
    if (selected.startsWith("bot-")) { setSelected(`bot-${botIdx}`); return; }
    const topIdx = parseInt(selected.replace("top-", ""), 10);
    const expectedLetter = letters[shuffledOrder[botIdx]];
    if (letters[topIdx] === expectedLetter) { triggerMatch(topIdx, botIdx); } else { triggerWrong(topIdx, botIdx); }
  }, [locked, selected, matchedBotIdxs, shuffledOrder, letters, triggerMatch, triggerWrong]);

  if (won) return null;

  return (
    <div ref={containerRef} style={{ position: "relative", flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-evenly", padding: "8px 16px 16px", minHeight: 0, userSelect: "none" }}>
      <LinesLayer matches={matches} connectorRects={connectorRects} containerRect={containerRect} />

      {/* Row 1: Letters + Row 2: Top dots */}
      <div style={{ display: "flex", justifyContent: "center", gap: 12, width: "100%", zIndex: 20, transform: "translateY(20px)" }}>
        {letters.map((letter, i) => (
          <div key={i} style={{ flex: 1, maxWidth: 100, display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
            <motion.div
              animate={wrongFeedback?.topIdx === i ? { x: [0, -8, 8, -6, 6, 0] } : {}}
              transition={{ duration: 0.4 }}
              style={{ width: "100%", height: "min(80px, 22vw)", borderRadius: 20, background: LETTER_COLORS[i], display: "flex", alignItems: "center", justifyContent: "center", fontSize: "min(44px, 12vw)", fontWeight: 700, color: "#1E3A5F", boxShadow: "0 4px 16px rgba(0,0,0,0.10)" }}
            >
              {letter}
            </motion.div>
            <ConnectorDot
              dotRef={setRef(`top-${i}`)}
              selected={selected === `top-${i}`}
              matched={matchedTopIdxs.has(i)}
              onTap={() => handleTopDot(i)}
              color={CARD_COLORS[i]}
            />
          </div>
        ))}
      </div>

      {/* Spacer + Speaker button */}
      <div style={{ flex: 1, minHeight: 16, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 6, pointerEvents: "none" }}>
        <motion.button
          whileTap={{ scale: 0.88 }}
          onPointerDown={(e) => { e.preventDefault(); onSpeakerTap && onSpeakerTap(); }}
          style={{ width: 73, height: 73, borderRadius: "50%", background: "white", border: "2.5px solid #A8D8EA", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 16px rgba(74,144,196,0.22)", cursor: "pointer", touchAction: "manipulation", pointerEvents: "auto" }}
        >
          <Volume2 size={36} color="#4A90C4" strokeWidth={2} />
        </motion.button>
      </div>

      {/* Row 3: Bottom dots + Row 4: Speaker icons or revealed letters */}
      <div style={{ display: "flex", justifyContent: "center", gap: 12, width: "100%", zIndex: 20, transform: "translateY(-25%)" }}>
        {[0, 1, 2].map((botSlot) => {
          const letterIdx = shuffledOrder[botSlot];
          const isMatched = matchedBotIdxs.has(botSlot);
          const isRevealed = revealedBotSlots.has(botSlot);
          const isSelectedBot = selected === `bot-${botSlot}`;
          const isWrongBot = wrongFeedback?.botIdx === botSlot;
          const matchedTopIdx = isMatched ? matches.find((m) => m.botIdx === botSlot)?.topIdx : null;
          const dotColor = matchedTopIdx != null ? CARD_COLORS[matchedTopIdx] : CARD_COLORS[letterIdx];
          const revealedLetter = letters[letterIdx];

          return (
            <div key={botSlot} style={{ flex: 1, maxWidth: 100, display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
              <ConnectorDot
                dotRef={setRef(`bot-${botSlot}`)}
                selected={isSelectedBot}
                matched={isMatched}
                onTap={() => handleBotDot(botSlot)}
                color={dotColor}
              />
              <AnimatePresence mode="wait">
                {isRevealed ? (
                  <RevealedLetterTile
                    key="revealed"
                    letter={revealedLetter}
                    color={dotColor}
                    isWrong={isWrongBot}
                  />
                ) : (
                  <SpeakerTile
                    key="speaker"
                    color={dotColor}
                    isSelected={isSelectedBot}
                    isWrong={isWrongBot}
                    onHintTap={() => { if (card.audio) playAudio(card.audio); }}
                  />
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function CampaignConnectionRound({ card, onComplete, onMistake, lang = "en", suppressAutoPlay = false }) {
  const [audioLocked, setAudioLocked] = useState(true);
  const [showWin, setShowWin] = useState(false);
  const { play: playTryAgain } = useTryAgainSound();

  useEffect(() => {
    const letters = card.word.split("");
    const letterUrls = letters.map(getLetterSoundUrl).filter(Boolean);
    warmupAudio([...letterUrls, card.audio, MATCH_END_URL].filter(Boolean));

    if (suppressAutoPlay) {
      setAudioLocked(false);
      return;
    }

    const t = setTimeout(() => {
      if (card.audio) {
        playAudio(card.audio);
        const unlock = setTimeout(() => setAudioLocked(false), 1400);
        return () => clearTimeout(unlock);
      } else {
        setAudioLocked(false);
      }
    }, 300);
    return () => clearTimeout(t);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleRoundComplete = useCallback(() => {
    setShowWin(true);
  }, []);

  const guardedMistake = useCallback(() => {
    if (!audioLocked) onMistake && onMistake();
  }, [audioLocked, onMistake]);

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", position: "relative" }}>
      {(audioLocked || showWin) && (
        <div style={{ position: "absolute", inset: 0, zIndex: 200, touchAction: "none", pointerEvents: "all" }} />
      )}

      <AnimatePresence mode="wait">
        {showWin ? (
          <motion.div key="win" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <WinScreen card={card} onDone={onComplete} />
          </motion.div>
        ) : (
          <motion.div key="round" initial={{ opacity: 0, x: 0 }} animate={{ opacity: 1 }} style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <ConnectionRound
              card={card}
              onComplete={handleRoundComplete}
              onMistake={guardedMistake}
              onWrongAnswer={playTryAgain}
              onSpeakerTap={() => { if (card.audio) playAudio(card.audio); }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}