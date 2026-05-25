/**
 * DrawLineBoard — core game screen for one drawline round.
 *
 * round shape:
 *   topCards: [{ id, word, image, audio, targetLetter, positionType: "initial"|"final" }]
 *   bottomLetters: [{ letter, topCardId, botIdx }]  — pre-shuffled order (not aligned with top)
 *
 * Layout:
 *   TOP    — 3 combined picture + partial-word cards (blank slot LEFT or RIGHT per positionType)
 *   BOTTOM — 3 speaker-icon tokens (connector dot above each)
 *
 * Matching: tap a top connector dot, then tap a bottom connector dot (or vice versa).
 * Tapping a speaker icon (unmatched) plays the letter sound for that token.
 *
 * On correct match — chained audio sequence (no overlaps):
 *   Step 1: match-end.mp3 plays
 *   Step 2: letter revealed in bottom token AND in top card blank simultaneously (when match-end ends)
 *   Step 3: letter sound plays
 *   Step 4: word sound plays
 *
 * Wrong: shake + try-again sound + onMistake.
 */
import { useState, useRef, useCallback, useLayoutEffect, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Volume2 } from "lucide-react";
import { playAudio, playAudioSequence } from "../../../lib/useAudio";
import { getLetterSoundUrl, getLetterGain } from "../../../lib/letterSounds";
import { useTryAgainSound } from "../../../lib/useTryAgainSound";

const MATCH_END_URL = "https://raw.githubusercontent.com/Mr-Banjoko/learn-with-cody/main/letter_sound/feedback/match-end.mp3";

const CARD_COLORS = ["#7EC8E3", "#F4A7C3", "#B39DDB"];
const CARD_BG     = ["#E8F7FC", "#FDEEF5", "#F3EFFE"];
const LINE_COLORS = ["#7EC8E3", "#F4A7C3", "#B39DDB"];

// ── SVG line layer ─────────────────────────────────────────────────────────────
function LinesLayer({ matches, connectorRects, containerRect, topCards }) {
  if (!containerRect) return null;
  return (
    <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 5, overflow: "visible" }}>
      {matches.map((m) => {
        const topR = connectorRects[`top-${m.topCardId}`];
        const botR = connectorRects[`bot-${m.botIdx}`];
        if (!topR || !botR) return null;
        const x1 = topR.left + topR.width / 2 - containerRect.left;
        const y1 = topR.top  + topR.height / 2 - containerRect.top;
        const x2 = botR.left + botR.width / 2 - containerRect.left;
        const y2 = botR.top  + botR.height / 2 - containerRect.top;
        const ci = topCards.findIndex((c) => c.id === m.topCardId);
        return (
          <motion.line key={m.topCardId}
            x1={x1} y1={y1} x2={x2} y2={y2}
            stroke={LINE_COLORS[ci >= 0 ? ci : 0]} strokeWidth={4} strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
          />
        );
      })}
    </svg>
  );
}

// ── ConnectorDot ──────────────────────────────────────────────────────────────
function ConnectorDot({ selected, matched, onTap, dotRef, color }) {
  return (
    <div ref={dotRef} onClick={onTap}
      style={{
        width: 28, height: 28, borderRadius: "50%",
        border: matched ? `3px solid ${color}` : selected ? "3px solid #4A90C4" : "3px solid #CBD5E1",
        background: matched ? color : selected ? "#4A90C4" : "white",
        boxShadow: selected || matched ? "0 0 0 4px rgba(74,144,196,0.2)" : "0 2px 6px rgba(0,0,0,0.10)",
        cursor: matched ? "default" : "pointer",
        transition: "background 0.18s, border 0.18s",
        flexShrink: 0,
      }}
    />
  );
}

// ── PartialWord — shows letters with a blank slot box ─────────────────────────
function PartialWord({ word, positionType, isMatched, color, revealedLetter }) {
  const letters = word.toLowerCase().split("");
  const missingIdx = positionType === "initial" ? 0 : letters.length - 1;

  return (
    <div style={{ display: "flex", gap: 4, justifyContent: "center", alignItems: "center", padding: "4px 2px 6px" }}>
      {letters.map((ch, i) => {
        const isMissing = i === missingIdx;
        if (isMissing) {
          return (
            <div key={i} style={{
              width: 28, height: 32, borderRadius: 7,
              border: isMatched ? `2.5px solid ${color}` : "2.5px dashed #94A3B8",
              background: isMatched ? `${color}22` : "rgba(255,255,255,0.6)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 18, fontWeight: 700, color: color || "#1E3A5F",
              fontFamily: "Fredoka, sans-serif",
              transition: "border 0.18s, background 0.18s",
            }}>
              {isMatched && revealedLetter ? (
                <motion.span
                  initial={{ scale: 0.4, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 18 }}
                >
                  {revealedLetter}
                </motion.span>
              ) : null}
            </div>
          );
        }
        return (
          <span key={i} style={{
            fontSize: 22, fontWeight: 700,
            color: isMatched ? color : "#1E3A5F",
            fontFamily: "Fredoka, sans-serif",
            lineHeight: 1,
            transition: "color 0.18s",
          }}>
            {ch}
          </span>
        );
      })}
    </div>
  );
}

export default function DrawLineBoard({ round, onRoundComplete, lang = "en", onMistake }) {
  const { topCards, bottomLetters } = round;
  const { play: playTryAgain } = useTryAgainSound();

  const [selected, setSelected] = useState(null);
  const [matches, setMatches] = useState([]);
  const [wrongFeedback, setWrongFeedback] = useState(null);
  const [locked, setLocked] = useState(false);
  // revealedTopIds: top card IDs whose blank letter has been revealed
  const [revealedTopIds, setRevealedTopIds] = useState(new Set());
  // revealedBotIdxs: bottom slot indices whose letter has been revealed
  const [revealedBotIdxs, setRevealedBotIdxs] = useState(new Set());

  const matchingInProgress = useRef(new Set());

  const connectorRefs = useRef({});
  const [connectorRects, setConnectorRects] = useState({});
  const containerRef = useRef(null);
  const [containerRect, setContainerRect] = useState(null);

  const measureAll = useCallback(() => {
    const rects = {};
    for (const [key, el] of Object.entries(connectorRefs.current)) {
      if (el) rects[key] = el.getBoundingClientRect();
    }
    setConnectorRects(rects);
    if (containerRef.current) setContainerRect(containerRef.current.getBoundingClientRect());
  }, []);

  useLayoutEffect(() => { measureAll(); }, [round, matches, measureAll]);
  useEffect(() => {
    window.addEventListener("resize", measureAll);
    return () => window.removeEventListener("resize", measureAll);
  }, [measureAll]);

  const matchedTopIds  = new Set(matches.map((m) => m.topCardId));
  const matchedBotIdxs = new Set(matches.map((m) => m.botIdx));

  const triggerCorrectMatch = useCallback((topCardId, letter, botIdx, topCard) => {
    if (matchingInProgress.current.has(topCardId)) return;
    matchingInProgress.current.add(topCardId);

    setSelected(null);
    setLocked(true);
    // Commit match immediately so the connecting line draws
    setMatches((prev) => [...prev, { topCardId, letter, botIdx }]);

    const letterUrl = getLetterSoundUrl(letter);

    // Step 1: play match-end.mp3
    const sfx = new Audio(MATCH_END_URL);
    sfx.volume = 1;

    const afterMatchEnd = () => {
      // Step 2: reveal letter in BOTH bottom token and top card blank simultaneously
      setRevealedBotIdxs((prev) => new Set([...prev, botIdx]));
      setRevealedTopIds((prev) => new Set([...prev, topCardId]));

      // Steps 3 + 4: letter sound then word sound
      const audioSteps = [];
      if (letterUrl) audioSteps.push({ url: letterUrl, gain: getLetterGain(letter) });
      if (topCard.audio) audioSteps.push({ url: topCard.audio, gain: 1 });

      const onAllDone = () => {
        setLocked(false);
        matchingInProgress.current.delete(topCardId);
        setMatches((prev) => {
          if (prev.length === 3) setTimeout(() => onRoundComplete && onRoundComplete(), 400);
          return prev;
        });
      };

      if (audioSteps.length > 0) {
        playAudioSequence(audioSteps, onAllDone);
      } else {
        onAllDone();
      }
    };

    sfx.onended = afterMatchEnd;
    sfx.onerror = afterMatchEnd;
    sfx.play().catch(() => afterMatchEnd());
  }, [onRoundComplete]);

  const triggerWrong = useCallback((topCardId, botIdx) => {
    playTryAgain();
    setWrongFeedback({ topCardId, botIdx });
    onMistake && onMistake();
    setTimeout(() => { setWrongFeedback(null); setSelected(null); }, 700);
  }, [onMistake, playTryAgain]);

  const handleTopConnector = useCallback((cardId) => {
    if (locked) return;
    if (matchedTopIds.has(cardId)) return;
    if (!selected || selected.startsWith("top-")) { setSelected(`top-${cardId}`); return; }
    const botIdx = parseInt(selected.replace("bot-", ""), 10);
    const bl = bottomLetters[botIdx];
    const topCard = topCards.find((c) => c.id === cardId);
    if (bl.topCardId === cardId) triggerCorrectMatch(cardId, bl.letter, botIdx, topCard);
    else triggerWrong(cardId, botIdx);
  }, [locked, selected, matchedTopIds, bottomLetters, topCards, triggerCorrectMatch, triggerWrong]);

  const handleBotConnector = useCallback((botIdx) => {
    if (locked) return;
    if (matchedBotIdxs.has(botIdx)) return;
    if (!selected || selected.startsWith("bot-")) { setSelected(`bot-${botIdx}`); return; }
    const topCardId = selected.replace("top-", "");
    const bl = bottomLetters[botIdx];
    const topCard = topCards.find((c) => c.id === topCardId);
    if (bl.topCardId === topCardId) triggerCorrectMatch(topCardId, bl.letter, botIdx, topCard);
    else triggerWrong(topCardId, botIdx);
  }, [locked, selected, matchedBotIdxs, bottomLetters, topCards, triggerCorrectMatch, triggerWrong]);

  const handleTopCardTap = useCallback((card) => {
    if (locked) return;
    if (card.audio) playAudio(card.audio);
  }, [locked]);

  const handleBotSpeakerTap = useCallback((botIdx) => {
    if (locked) return;
    const letter = bottomLetters[botIdx].letter;
    const url = getLetterSoundUrl(letter);
    if (url) playAudio(url, getLetterGain(letter));
  }, [locked, bottomLetters]);

  const setRef = (key) => (el) => { connectorRefs.current[key] = el; };

  return (
    <div ref={containerRef}
      style={{
        position: "relative", flex: 1,
        display: "flex", flexDirection: "column", alignItems: "center",
        justifyContent: "space-between",
        padding: "0 12px",
        paddingTop: "8%", paddingBottom: "12%",
        overflow: "visible",
      }}
    >
      {locked && <div style={{ position: "absolute", inset: 0, zIndex: 100, touchAction: "none", pointerEvents: "all" }} />}

      <LinesLayer matches={matches} connectorRects={connectorRects} containerRect={containerRect} topCards={topCards} />

      {/* ── TOP CARDS ──────────────────────────────────────────────────────── */}
      <div style={{ display: "flex", justifyContent: "center", gap: 10, width: "100%", zIndex: 10 }}>
        {topCards.map((card, i) => {
          const isMatched     = matchedTopIds.has(card.id);
          const isSelectedTop = selected === `top-${card.id}`;
          const isWrongTop    = wrongFeedback?.topCardId === card.id;
          const isRevealed    = revealedTopIds.has(card.id);
          const color         = CARD_COLORS[i];
          const matchedLetter = isRevealed ? (matches.find((m) => m.topCardId === card.id)?.letter || null) : null;

          return (
            <div key={card.id} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, flex: 1, maxWidth: 120 }}>
              <motion.div
                animate={isWrongTop ? { x: [0, -8, 8, -6, 6, 0] } : {}}
                transition={{ duration: 0.5 }}
                onClick={() => handleTopCardTap(card)}
                style={{
                  background: isMatched ? CARD_BG[i] : "white",
                  border: `2.5px solid ${isSelectedTop ? color : isMatched ? color : CARD_COLORS[i]}`,
                  borderRadius: 18, overflow: "hidden",
                  boxShadow: isMatched     ? `0 0 0 5px ${color}55` :
                             isSelectedTop ? `0 0 0 4px ${color}44` :
                             "0 4px 14px rgba(0,0,0,0.09)",
                  cursor: "pointer", width: "100%",
                  transition: "border 0.18s, background 0.18s, box-shadow 0.18s",
                  userSelect: "none", WebkitTapHighlightColor: "transparent",
                }}
              >
                <img src={card.image} alt={card.word}
                  style={{ width: "100%", aspectRatio: "1/1", objectFit: "cover", display: "block", pointerEvents: "none" }} />
                <PartialWord
                  word={card.word}
                  positionType={card.positionType}
                  isMatched={isMatched}
                  color={color}
                  revealedLetter={matchedLetter}
                />
              </motion.div>

              <ConnectorDot
                selected={isSelectedTop} matched={isMatched}
                onTap={() => handleTopConnector(card.id)}
                dotRef={setRef(`top-${card.id}`)}
                color={color}
              />
            </div>
          );
        })}
      </div>

      <div style={{ flex: 1, minHeight: 12 }} />

      {/* ── BOTTOM LETTER TOKENS ───────────────────────────────────────────── */}
      <div style={{ display: "flex", justifyContent: "center", gap: 10, width: "100%", zIndex: 10 }}>
        {bottomLetters.map((bl, botIdx) => {
          const isMatched     = matchedBotIdxs.has(botIdx);
          const isSelectedBot = selected === `bot-${botIdx}`;
          const isWrongBot    = wrongFeedback?.botIdx === botIdx;
          const isRevealed    = revealedBotIdxs.has(botIdx);
          const matchedTopIdx = isMatched ? topCards.findIndex((c) => c.id === matches.find((m) => m.botIdx === botIdx)?.topCardId) : -1;
          const matchColor    = matchedTopIdx >= 0 ? CARD_COLORS[matchedTopIdx] : null;
          const matchBg       = matchedTopIdx >= 0 ? CARD_BG[matchedTopIdx]     : null;

          return (
            <div key={`bot-${botIdx}-${bl.letter}`}
              style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, flex: 1, maxWidth: 120 }}>
              <ConnectorDot
                selected={isSelectedBot} matched={isMatched}
                onTap={() => handleBotConnector(botIdx)}
                dotRef={setRef(`bot-${botIdx}`)}
                color={matchColor || "#7EC8E3"}
              />

              <motion.div
                animate={isWrongBot ? { x: [0, -8, 8, -6, 6, 0] } : {}}
                transition={{ duration: 0.5 }}
                onClick={() => !isRevealed && handleBotSpeakerTap(botIdx)}
                style={{
                  width: "100%", height: 80, borderRadius: 18,
                  background: isMatched ? matchBg : "white",
                  border: isMatched     ? `2.5px solid ${matchColor}` :
                          isSelectedBot ? "2.5px solid #4A90C4" :
                          "2.5px solid #CBD5E1",
                  boxShadow: isMatched     ? `0 0 0 5px ${matchColor}55` :
                             isSelectedBot ? "0 0 0 4px rgba(74,144,196,0.3)" :
                             "0 4px 14px rgba(0,0,0,0.09)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: isMatched ? "default" : "pointer",
                  transition: "border 0.18s, background 0.18s, box-shadow 0.18s",
                  userSelect: "none", WebkitTapHighlightColor: "transparent",
                }}
              >
                <AnimatePresence mode="wait">
                  {isRevealed ? (
                    <motion.span key="letter"
                      initial={{ scale: 0.4, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: "spring", stiffness: 300, damping: 18 }}
                      style={{ fontSize: 36, fontWeight: 700, color: matchColor || "#A8D0E6", fontFamily: "Fredoka, sans-serif", lineHeight: 1 }}
                    >
                      {bl.letter}
                    </motion.span>
                  ) : (
                    <motion.div key="speaker"
                      initial={{ opacity: 0, scale: 0.7 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.5 }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    >
                      <Volume2 size={32} color={isSelectedBot ? "#4A90C4" : "#A8D0E6"} strokeWidth={2} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </div>
          );
        })}
      </div>
    </div>
  );
}