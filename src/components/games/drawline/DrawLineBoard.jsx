/**
 * DrawLineBoard — the core game screen for one round.
 *
 * Layout:
 *   TOP    — 3 combined picture+word cards (each with a connector dot below)
 *   BOTTOM — 3 letter buttons (each with a connector dot above)
 *
 * Matching: tap a connector dot on either side → tap matching dot on other side.
 * Success sequence: letter sound → word audio → unlock.
 * Wrong: both items glow red simultaneously, then reset.
 */
import { useState, useRef, useCallback, useEffect, useLayoutEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { playAudio, playAudioSequence } from "../../../lib/useAudio";
import { getLetterSoundUrl, getLetterGain } from "../../../lib/letterSounds";

// ── Colours ──────────────────────────────────────────────────────────────────
const CARD_COLORS = ["#A8D8EA", "#FFAFC5", "#B5EAD7"];
const LINE_COLORS = ["#4ECDC4", "#FF6B6B", "#FFD93D"];

// ── SVG line layer ────────────────────────────────────────────────────────────
function LinesLayer({ matches, connectorRects, containerRect }) {
  if (!containerRect) return null;
  return (
    <svg
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 5,
        overflow: "visible",
      }}
    >
      {matches.map((m, i) => {
        const topR = connectorRects[`top-${m.topCardId}`];
        const botR = connectorRects[`bot-${m.letter}-${m.botIdx}`];
        if (!topR || !botR) return null;
        const x1 = topR.left + topR.width / 2 - containerRect.left;
        const y1 = topR.top + topR.height / 2 - containerRect.top;
        const x2 = botR.left + botR.width / 2 - containerRect.left;
        const y2 = botR.top + botR.height / 2 - containerRect.top;
        return (
          <motion.line
            key={m.topCardId}
            x1={x1} y1={y1} x2={x2} y2={y2}
            stroke={LINE_COLORS[i % LINE_COLORS.length]}
            strokeWidth={4}
            strokeLinecap="round"
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
function ConnectorDot({ id, selected, matched, onTap, dotRef }) {
  return (
    <div
      ref={dotRef}
      onClick={onTap}
      style={{
        width: 28,
        height: 28,
        borderRadius: "50%",
        border: matched
          ? "3px solid #4ECDC4"
          : selected
          ? "3px solid #4A90C4"
          : "3px solid #CBD5E1",
        background: matched ? "#4ECDC4" : selected ? "#4A90C4" : "white",
        boxShadow: selected || matched ? "0 0 0 4px rgba(74,144,196,0.2)" : "0 2px 6px rgba(0,0,0,0.10)",
        cursor: matched ? "default" : "pointer",
        transition: "background 0.18s, border 0.18s, box-shadow 0.18s",
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    />
  );
}

export default function DrawLineBoard({ round, onRoundComplete, lang = "en" }) {
  const { topCards, bottomLetters } = round;

  // Which connector is selected ("top-<id>" | "bot-<idx>" | null)
  const [selected, setSelected] = useState(null);
  // Completed correct matches: [{ topCardId, letter, botIdx }]
  const [matches, setMatches] = useState([]);
  // Wrong-feedback state: { topCardId, botIdx } | null
  const [wrongFeedback, setWrongFeedback] = useState(null);
  // UI locked during success sequence
  const [locked, setLocked] = useState(false);
  // Bounce targets during success sequence
  const [bounceTop, setBounceTop] = useState(null);   // topCardId
  const [bounceBot, setBounceBot] = useState(null);   // botIdx
  // Revealed letters (replaces speaker icon after match)
  const [revealedBotIdxs, setRevealedBotIdxs] = useState(new Set());

  // Connector element refs for line positioning
  const connectorRefs = useRef({});
  const [connectorRects, setConnectorRects] = useState({});
  const containerRef = useRef(null);
  const [containerRect, setContainerRect] = useState(null);

  const seqCancelRef = useRef(null);

  // Remeasure connector positions whenever layout settles
  const measureAll = useCallback(() => {
    const rects = {};
    for (const [key, el] of Object.entries(connectorRefs.current)) {
      if (el) rects[key] = el.getBoundingClientRect();
    }
    setConnectorRects(rects);
    if (containerRef.current) {
      setContainerRect(containerRef.current.getBoundingClientRect());
    }
  }, []);

  useLayoutEffect(() => {
    measureAll();
  }, [round, matches, measureAll]);

  useEffect(() => {
    window.addEventListener("resize", measureAll);
    return () => window.removeEventListener("resize", measureAll);
  }, [measureAll]);

  const matchedTopIds = new Set(matches.map((m) => m.topCardId));
  const matchedBotIdxs = new Set(matches.map((m) => m.botIdx));

  const handleTopConnector = useCallback((cardId) => {
    if (locked) return;
    if (matchedTopIds.has(cardId)) return;

    if (selected === null) {
      setSelected(`top-${cardId}`);
      return;
    }

    if (selected.startsWith("top-")) {
      // Re-select different top
      setSelected(`top-${cardId}`);
      return;
    }

    // selected is a bottom — evaluate match
    const botIdx = parseInt(selected.replace("bot-", ""), 10);
    const botLetter = bottomLetters[botIdx];
    const topCard = topCards.find((c) => c.id === cardId);

    if (botLetter.topCardId === cardId) {
      // CORRECT
      triggerCorrectMatch(cardId, botLetter.letter, botIdx, topCard);
    } else {
      // WRONG
      triggerWrong(cardId, botIdx);
    }
  }, [locked, selected, matches, bottomLetters, topCards]);

  const handleBotConnector = useCallback((botIdx) => {
    if (locked) return;
    if (matchedBotIdxs.has(botIdx)) return;

    if (selected === null) {
      setSelected(`bot-${botIdx}`);
      return;
    }

    if (selected.startsWith("bot-")) {
      setSelected(`bot-${botIdx}`);
      return;
    }

    // selected is a top — evaluate match
    const topCardId = selected.replace("top-", "");
    const botLetter = bottomLetters[botIdx];
    const topCard = topCards.find((c) => c.id === topCardId);

    if (botLetter.topCardId === topCardId) {
      triggerCorrectMatch(topCardId, botLetter.letter, botIdx, topCard);
    } else {
      triggerWrong(topCardId, botIdx);
    }
  }, [locked, selected, matches, bottomLetters, topCards]);

  const triggerCorrectMatch = useCallback((topCardId, letter, botIdx, topCard) => {
    setSelected(null);
    setLocked(true);

    // Add match (line appears)
    setMatches((prev) => [...prev, { topCardId, letter, botIdx }]);

    // Success sequence: bounce letter → play letter sound → bounce top card → play word
    setTimeout(() => {
      setBounceBot(botIdx);
      const letterUrl = getLetterSoundUrl(letter);
      playAudio(letterUrl, getLetterGain(letter));

      setTimeout(() => {
        setBounceBot(null);
        setRevealedBotIdxs((prev) => new Set([...prev, botIdx]));
        setBounceTop(topCardId);
        if (topCard.audio) playAudio(topCard.audio);

        setTimeout(() => {
          setBounceTop(null);
          setLocked(false);

          // Check if round complete
          setMatches((prev) => {
            if (prev.length === 3) {
              setTimeout(() => onRoundComplete && onRoundComplete(), 400);
            }
            return prev;
          });
        }, 900);
      }, 900);
    }, 120);
  }, [onRoundComplete]);

  const triggerWrong = useCallback((topCardId, botIdx) => {
    setWrongFeedback({ topCardId, botIdx });
    setTimeout(() => {
      setWrongFeedback(null);
      setSelected(null);
    }, 700);
  }, []);

  const handleTopCardTap = useCallback((card) => {
    if (locked) return;
    if (card.audio) playAudio(card.audio);
  }, [locked]);

  const handleBotLetterTap = useCallback((botIdx) => {
    if (locked) return;
    const letter = bottomLetters[botIdx].letter;
    playAudio(getLetterSoundUrl(letter), getLetterGain(letter));
  }, [locked, bottomLetters]);

  const setConnectorRef = (key) => (el) => {
    connectorRefs.current[key] = el;
  };

  return (
    <div
      ref={containerRef}
      style={{
        position: "relative",
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "16px 12px 20px",
        gap: 0,
        overflow: "visible",
      }}
    >
      {/* SVG line overlay */}
      <LinesLayer
        matches={matches}
        connectorRects={connectorRects}
        containerRect={containerRect}
      />

      {/* ── TOP CARDS ─────────────────────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: 10,
          width: "100%",
          zIndex: 10,
        }}
      >
        {topCards.map((card, i) => {
          const isMatched = matchedTopIds.has(card.id);
          const isSelectedTop = selected === `top-${card.id}`;
          const isWrongTop = wrongFeedback?.topCardId === card.id;
          const isBouncing = bounceTop === card.id;

          return (
            <div
              key={card.id}
              style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, flex: 1, maxWidth: 120 }}
            >
              {/* Combined picture + word card */}
              <motion.div
                animate={
                  isBouncing
                    ? { y: [0, -14, 0, -7, 0] }
                    : isWrongTop
                    ? { x: [0, -8, 8, -6, 6, 0] }
                    : {}
                }
                transition={{ duration: 0.5 }}
                onClick={() => handleTopCardTap(card)}
                style={{
                  background: isWrongTop
                    ? "#FFECEC"
                    : isMatched
                    ? "#E8FFFE"
                    : "white",
                  border: isWrongTop
                    ? "2.5px solid #FF6B6B"
                    : isMatched
                    ? "2.5px solid #4ECDC4"
                    : isSelectedTop
                    ? "2.5px solid #4A90C4"
                    : `2.5px solid ${CARD_COLORS[i]}`,
                  borderRadius: 18,
                  overflow: "hidden",
                  boxShadow: isWrongTop
                    ? "0 0 0 4px rgba(255,107,107,0.25)"
                    : isSelectedTop
                    ? "0 0 0 4px rgba(74,144,196,0.2)"
                    : "0 4px 14px rgba(0,0,0,0.09)",
                  cursor: "pointer",
                  width: "100%",
                  transition: "border 0.18s, background 0.18s, box-shadow 0.18s",
                  userSelect: "none",
                  WebkitTapHighlightColor: "transparent",
                }}
              >
                {/* Picture */}
                <img
                  src={card.image}
                  alt={card.word}
                  style={{
                    width: "100%",
                    aspectRatio: "1/1",
                    objectFit: "cover",
                    display: "block",
                    pointerEvents: "none",
                  }}
                />
                {/* Word */}
                <div
                  style={{
                    padding: "6px 4px 8px",
                    textAlign: "center",
                    fontSize: 18,
                    fontWeight: 700,
                    color: isWrongTop ? "#FF6B6B" : isMatched ? "#4ECDC4" : "#1E3A5F",
                    fontFamily: "Fredoka, sans-serif",
                    letterSpacing: 0.5,
                    transition: "color 0.18s",
                  }}
                >
                  {card.word}
                </div>
              </motion.div>

              {/* Top connector dot */}
              <ConnectorDot
                id={`top-${card.id}`}
                selected={isSelectedTop}
                matched={isMatched}
                onTap={() => handleTopConnector(card.id)}
                dotRef={setConnectorRef(`top-${card.id}`)}
              />
            </div>
          );
        })}
      </div>

      {/* ── GAP between top and bottom ──────────────────────────────────── */}
      <div style={{ flex: 1, minHeight: 16 }} />

      {/* ── BOTTOM LETTERS ─────────────────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: 10,
          width: "100%",
          zIndex: 10,
        }}
      >
        {bottomLetters.map((bl, botIdx) => {
          const isMatched = matchedBotIdxs.has(botIdx);
          const isSelectedBot = selected === `bot-${botIdx}`;
          const isWrongBot = wrongFeedback?.botIdx === botIdx;
          const isBouncing = bounceBot === botIdx;
          const isRevealed = revealedBotIdxs.has(botIdx);

          return (
            <div
              key={`bot-${botIdx}-${bl.letter}`}
              style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, flex: 1, maxWidth: 120 }}
            >
              {/* Bottom connector dot */}
              <ConnectorDot
                id={`bot-${botIdx}`}
                selected={isSelectedBot}
                matched={isMatched}
                onTap={() => handleBotConnector(botIdx)}
                dotRef={setConnectorRef(`bot-${bl.letter}-${botIdx}`)}
              />

              {/* Letter / Speaker button */}
              <motion.div
                animate={
                  isBouncing
                    ? { y: [0, -14, 0, -7, 0] }
                    : isWrongBot
                    ? { x: [0, -8, 8, -6, 6, 0] }
                    : {}
                }
                transition={{ duration: 0.5 }}
                onClick={() => handleBotLetterTap(botIdx)}
                style={{
                  width: "100%",
                  height: 80,
                  borderRadius: 18,
                  background: isWrongBot
                    ? "#FFECEC"
                    : isMatched
                    ? "#E8FFFE"
                    : "white",
                  border: isWrongBot
                    ? "2.5px solid #FF6B6B"
                    : isMatched
                    ? "2.5px solid #4ECDC4"
                    : isSelectedBot
                    ? "2.5px solid #4A90C4"
                    : "2.5px solid #CBD5E1",
                  boxShadow: isWrongBot
                    ? "0 0 0 4px rgba(255,107,107,0.25)"
                    : isSelectedBot
                    ? "0 0 0 4px rgba(74,144,196,0.2)"
                    : "0 4px 14px rgba(0,0,0,0.09)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: isMatched ? "default" : "pointer",
                  transition: "border 0.18s, background 0.18s, box-shadow 0.18s",
                  userSelect: "none",
                  WebkitTapHighlightColor: "transparent",
                }}
              >
                <AnimatePresence mode="wait">
                  {isRevealed ? (
                    /* Revealed letter */
                    <motion.span
                      key="letter"
                      initial={{ scale: 0.4, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: "spring", stiffness: 300, damping: 18 }}
                      style={{
                        fontSize: 36,
                        fontWeight: 700,
                        color: "#4ECDC4",
                        fontFamily: "Fredoka, sans-serif",
                        lineHeight: 1,
                      }}
                    >
                      {bl.letter}
                    </motion.span>
                  ) : (
                    /* Speaker icon */
                    <motion.div key="speaker" initial={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      <svg
                        width="38"
                        height="38"
                        viewBox="0 0 52 52"
                        fill="none"
                        style={{ display: "block" }}
                      >
                        <path
                          d="M18 21h-4a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h4l8 6V15l-8 6z"
                          fill={isWrongBot ? "#FF6B6B" : isSelectedBot ? "#4A90C4" : "#A8D0E6"}
                        />
                        <path
                          d="M30 20.5a8 8 0 0 1 0 11"
                          stroke={isWrongBot ? "#FF6B6B" : isSelectedBot ? "#4A90C4" : "#A8D0E6"}
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          fill="none"
                        />
                        <path
                          d="M33.5 17a13 13 0 0 1 0 18"
                          stroke={isWrongBot ? "#FF6B6B" : isSelectedBot ? "#4A90C4" : "#A8D0E6"}
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          fill="none"
                          opacity="0.6"
                        />
                      </svg>
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