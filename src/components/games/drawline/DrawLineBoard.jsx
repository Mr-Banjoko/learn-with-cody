/**
 * DrawLineBoard — core game screen for one drawline round.
 *
 * round shape:
 *   topCards: [{ id, word, image, audio, targetLetter, positionType: "initial"|"final" }]
 *   bottomLetters: [{ letter, topCardId, botIdx }]  — already in fixed order (not shuffled)
 *
 * Layout:
 *   TOP    — 3 combined picture + partial-word cards (blank slot LEFT or RIGHT per positionType)
 *   BOTTOM — 3 letter tokens (connector dot above each)
 *
 * Matching: tap a top connector dot, then tap a bottom connector dot (or vice versa).
 * Correct: line locks, letter fills blank, letter sound → word audio plays.
 * Wrong: shake + try-again sound + onMistake.
 */
import { useState, useRef, useCallback, useLayoutEffect, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { playAudio } from "../../../lib/useAudio";
import { getLetterSoundUrl, getLetterGain } from "../../../lib/letterSounds";
import { useTryAgainSound } from "../../../lib/useTryAgainSound";

// Card accent colours — one per card index
const CARD_COLORS = ["#7EC8E3", "#F4A7C3", "#B39DDB"];
const CARD_BG     = ["#E8F7FC", "#FDEEF5", "#F3EFFE"];
const LINE_COLORS = ["#7EC8E3", "#F4A7C3", "#B39DDB"];

// ── SVG line layer ────────────────────────────────────────────────────────────
function LinesLayer({ matches, connectorRects, containerRect, topCards }) {
  if (!containerRect) return null;
  return (
    <svg
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%",
               pointerEvents: "none", zIndex: 5, overflow: "visible" }}
    >
      {matches.map((m) => {
        const topR = connectorRects[`top-${m.topCardId}`];
        const botR = connectorRects[`bot-${m.botIdx}`];
        if (!topR || !botR) return null;
        const x1 = topR.left + topR.width / 2 - containerRect.left;
        const y1 = topR.top  + topR.height / 2 - containerRect.top;
        const x2 = botR.left + botR.width / 2 - containerRect.left;
        const y2 = botR.top  + botR.height / 2 - containerRect.top;
        const ci = topCards.findIndex((c) => c.id === m.topCardId);
        const lineColor = LINE_COLORS[ci >= 0 ? ci : 0];
        return (
          <motion.line key={m.topCardId}
            x1={x1} y1={y1} x2={x2} y2={y2}
            stroke={lineColor} strokeWidth={4} strokeLinecap="round"
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
        flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center",
      }}
    />
  );
}

// ── PartialWord — shows letters with a blank slot box ─────────────────────────
// positionType: "initial" → blank on LEFT;  "final" → blank on RIGHT
function PartialWord({ word, targetLetter, positionType, isMatched, color, revealedLetter }) {
  const letters = word.toLowerCase().split("");
  const missingIdx = positionType === "initial" ? 0 : letters.length - 1;

  return (
    <div style={{ display: "flex", gap: 4, justifyContent: "center", alignItems: "center",
                  padding: "4px 2px 6px" }}>
      {letters.map((ch, i) => {
        const isMissing = i === missingIdx;
        if (isMissing) {
          return (
            <div key={i} style={{
              width: 28, height: 32,
              borderRadius: 7,
              border: isMatched ? `2.5px solid ${color}` : "2.5px dashed #94A3B8",
              background: isMatched ? `${color}22` : "rgba(255,255,255,0.6)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 18, fontWeight: 700, color: color || "#1E3A5F",
              fontFamily: "Fredoka, sans-serif",
              transition: "border 0.18s, background 0.18s",
            }}>
              {isMatched ? revealedLetter?.toLowerCase() : ""}
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
            {ch.toLowerCase()}
          </span>
        );
      })}
    </div>
  );
}

export default function DrawLineBoard({ round, onRoundComplete, lang = "en", onMistake }) {
  const { topCards, bottomLetters } = round;
  const { play: playTryAgain } = useTryAgainSound();

  const [selected, setSelected] = useState(null); // "top-<id>" | "bot-<idx>" | null
  const [matches, setMatches] = useState([]);      // [{ topCardId, letter, botIdx }]
  const [wrongFeedback, setWrongFeedback] = useState(null); // { topCardId, botIdx }
  const [locked, setLocked] = useState(false);
  const [bounceTop, setBounceTop] = useState(null);
  const [bounceBot, setBounceBot] = useState(null);
  const [revealedBotIdxs, setRevealedBotIdxs] = useState(new Set());

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
    setSelected(null);
    setLocked(true);
    setMatches((prev) => [...prev, { topCardId, letter, botIdx }]);

    setTimeout(() => {
      setBounceBot(botIdx);
      playAudio(getLetterSoundUrl(letter), getLetterGain(letter));
      setTimeout(() => {
        setBounceBot(null);
        setRevealedBotIdxs((prev) => new Set([...prev, botIdx]));
        setBounceTop(topCardId);
        if (topCard.audio) playAudio(topCard.audio);
        setTimeout(() => {
          setBounceTop(null);
          setLocked(false);
          setMatches((prev) => {
            if (prev.length === 3) setTimeout(() => onRoundComplete && onRoundComplete(), 400);
            return prev;
          });
        }, 900);
      }, 900);
    }, 120);
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

  const handleBotLetterTap = useCallback((botIdx) => {
    if (locked) return;
    const letter = bottomLetters[botIdx].letter;
    playAudio(getLetterSoundUrl(letter), getLetterGain(letter));
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

      <LinesLayer matches={matches} connectorRects={connectorRects}
                  containerRect={containerRect} topCards={topCards} />

      {/* ── TOP CARDS ─────────────────────────────────────────────────────── */}
      <div style={{ display: "flex", justifyContent: "center", gap: 10, width: "100%", zIndex: 10 }}>
        {topCards.map((card, i) => {
          const isMatched     = matchedTopIds.has(card.id);
          const isSelectedTop = selected === `top-${card.id}`;
          const isWrongTop    = wrongFeedback?.topCardId === card.id;
          const isBouncing    = bounceTop === card.id;
          const color         = CARD_COLORS[i];
          // find the letter that was matched to this card (for blank slot reveal)
          const matchedLetter = matches.find((m) => m.topCardId === card.id)?.letter;

          return (
            <div key={card.id}
              style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, flex: 1, maxWidth: 120 }}>
              {/* Picture + partial word card */}
              <motion.div
                animate={
                  isBouncing    ? { y: [0, -14, 0, -7, 0] } :
                  isWrongTop    ? { x: [0, -8, 8, -6, 6, 0] } : {}
                }
                transition={{ duration: 0.5 }}
                onClick={() => handleTopCardTap(card)}
                style={{
                  background: isMatched ? CARD_BG[i] : "white",
                  border: `2.5px solid ${isSelectedTop ? color : isMatched ? color : CARD_COLORS[i]}`,
                  borderRadius: 18, overflow: "hidden",
                  boxShadow: isMatched  ? `0 0 0 5px ${color}55` :
                             isSelectedTop ? `0 0 0 4px ${color}44` :
                             "0 4px 14px rgba(0,0,0,0.09)",
                  cursor: "pointer", width: "100%",
                  transition: "border 0.18s, background 0.18s, box-shadow 0.18s",
                  userSelect: "none", WebkitTapHighlightColor: "transparent",
                }}
              >
                <img src={card.image} alt={card.word}
                  style={{ width: "100%", aspectRatio: "1/1", objectFit: "cover",
                           display: "block", pointerEvents: "none" }} />
                <PartialWord
                  word={card.word}
                  targetLetter={card.targetLetter}
                  positionType={card.positionType}
                  isMatched={isMatched}
                  color={color}
                  revealedLetter={matchedLetter}
                />
              </motion.div>

              {/* Top connector dot */}
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

      {/* ── spacer ────────────────────────────────────────────────────────── */}
      <div style={{ flex: 1, minHeight: 12 }} />

      {/* ── BOTTOM LETTER TOKENS ──────────────────────────────────────────── */}
      <div style={{ display: "flex", justifyContent: "center", gap: 10, width: "100%", zIndex: 10 }}>
        {bottomLetters.map((bl, botIdx) => {
          const isMatched     = matchedBotIdxs.has(botIdx);
          const isSelectedBot = selected === `bot-${botIdx}`;
          const isWrongBot    = wrongFeedback?.botIdx === botIdx;
          const isBouncing    = bounceBot === botIdx;
          const isRevealed    = revealedBotIdxs.has(botIdx);
          const matchedTopIdx = isMatched ? topCards.findIndex((c) => c.id === matches.find((m) => m.botIdx === botIdx)?.topCardId) : -1;
          const matchColor    = matchedTopIdx >= 0 ? CARD_COLORS[matchedTopIdx] : null;
          const matchBg       = matchedTopIdx >= 0 ? CARD_BG[matchedTopIdx]     : null;

          return (
            <div key={`bot-${botIdx}-${bl.letter}`}
              style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, flex: 1, maxWidth: 120 }}>
              {/* Bottom connector dot */}
              <ConnectorDot
                selected={isSelectedBot} matched={isMatched}
                onTap={() => handleBotConnector(botIdx)}
                dotRef={setRef(`bot-${botIdx}`)}
                color={matchColor || "#7EC8E3"}
              />

              {/* Letter token */}
              <motion.div
                animate={
                  isBouncing ? { y: [0, -14, 0, -7, 0] } :
                  isWrongBot ? { x: [0, -8, 8, -6, 6, 0] } : {}
                }
                transition={{ duration: 0.5 }}
                onClick={() => handleBotLetterTap(botIdx)}
                style={{
                  width: "100%", height: 80, borderRadius: 18,
                  background: isMatched ? matchBg : "white",
                  border: isMatched   ? `2.5px solid ${matchColor}` :
                          isSelectedBot ? "2.5px solid #4A90C4" :
                          "2.5px solid #CBD5E1",
                  boxShadow: isMatched    ? `0 0 0 5px ${matchColor}55` :
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
                      style={{ fontSize: 36, fontWeight: 700,
                               color: matchColor || "#A8D0E6",
                               fontFamily: "Fredoka, sans-serif", lineHeight: 1 }}
                    >
                      {bl.letter.toLowerCase()}
                    </motion.span>
                  ) : (
                    /* Always show the letter clearly — no hidden speaker icon */
                    <motion.span key="token"
                      initial={{ opacity: 1 }} exit={{ opacity: 0 }}
                      style={{ fontSize: 36, fontWeight: 700,
                               color: isSelectedBot ? "#4A90C4" : "#64748B",
                               fontFamily: "Fredoka, sans-serif", lineHeight: 1,
                               transition: "color 0.18s" }}
                    >
                      {bl.letter.toLowerCase()}
                    </motion.span>
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