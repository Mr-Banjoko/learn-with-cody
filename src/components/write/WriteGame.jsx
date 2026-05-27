/**
 * WriteGame — Short A tracing game
 * Uses same template as CampaignWriteRound (WriteV2 style):
 * shuffled tiles, rainbow image border, reset + submit buttons.
 */
import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RotateCcw } from "lucide-react";
import BackArrow from "../BackArrow";
import LetterTrace from "../games/write/short-a/LetterTrace";
import { shortAWords } from "../../lib/shortAWords";
import { playAudioSequence } from "../../lib/useAudio";
import { getLetterSoundUrl, getLetterGain } from "../../lib/letterSounds";
import { useCorrectSound } from "../../lib/useCorrectSound";

const WORDS = shortAWords;
const TILE_SIZE = 96;

function createRound(card, key) {
  const letters = card.word.toLowerCase().split("");
  const cards = letters.map((letter, index) => ({
    id: `letter-${index}-${letter}-${key}`,
    letter, correctIndex: index,
  }));
  return { cards, shuffledCards: [...cards] };
}

export default function WriteGame({ onBack, lang = "en" }) {
  const [wordIndex, setWordIndex] = useState(0);
  const [roundKey, setRoundKey] = useState(0);
  const [round, setRound] = useState(() => createRound(WORDS[0], 0));
  const [tracedCardIds, setTracedCardIds] = useState(new Set());
  const [phase, setPhase] = useState("tracing");
  const [locked, setLocked] = useState(true);
  const [bouncingCardIdx, setBouncingCardIdx] = useState(null);
  const [successCards, setSuccessCards] = useState(null);

  const lockedRef = useRef(true);
  const cancelAudioRef = useRef(null);
  const { play: playCorrect } = useCorrectSound();

  const card = WORDS[wordIndex];

  useEffect(() => { lockedRef.current = locked; }, [locked]);

  const cancelAudio = useCallback(() => {
    if (cancelAudioRef.current) { cancelAudioRef.current(); cancelAudioRef.current = null; }
  }, []);

  // Auto-play word audio at start of each round
  useEffect(() => {
    setLocked(true); lockedRef.current = true;
    const t = setTimeout(() => {
      if (card.audio) {
        const cancel = playAudioSequence([{ url: card.audio, gain: 1 }], () => {
          cancelAudioRef.current = null;
          setLocked(false); lockedRef.current = false;
        });
        cancelAudioRef.current = cancel;
      } else { setLocked(false); lockedRef.current = false; }
    }, 300);
    return () => { clearTimeout(t); cancelAudio(); };
  }, [wordIndex]); // eslint-disable-line react-hooks/exhaustive-deps

  // Reset round state when word changes
  useEffect(() => {
    setRound(createRound(WORDS[wordIndex], Date.now()));
    setTracedCardIds(new Set());
    setPhase("tracing");
    setSuccessCards(null);
    setBouncingCardIdx(null);
  }, [wordIndex]);

  const handleRefresh = useCallback(() => {
    if (locked || phase !== "tracing") return;
    setTracedCardIds(new Set());
    setRoundKey((k) => k + 1);
    setRound(createRound(card, Date.now()));
  }, [locked, phase, card]);

  const handleCardComplete = useCallback((cardId) => {
    if (lockedRef.current || phase !== "tracing") return;
    setTracedCardIds((prev) => { const next = new Set(prev); next.add(cardId); return next; });
  }, [phase]);

  const handleSubmit = useCallback(() => {
    if (lockedRef.current || phase !== "tracing") return;
    const ordered = round.shuffledCards
      .filter((c) => tracedCardIds.has(c.id))
      .sort((a, b) => a.correctIndex - b.correctIndex);
    setSuccessCards(ordered);
    setPhase("success");
    setLocked(true); lockedRef.current = true;
    cancelAudio();
    playCorrect(() => {
      setTimeout(() => {
        const steps = ordered.map((c, i) => {
          const url = getLetterSoundUrl(c.letter);
          return url ? { url, gain: getLetterGain(c.letter), onStart: () => setBouncingCardIdx(i) } : null;
        }).filter(Boolean);
        if (card.audio) steps.push({ url: card.audio, gain: 1, onStart: () => setBouncingCardIdx(null) });
        const cancel = playAudioSequence(steps, () => {
          cancelAudioRef.current = null;
          setBouncingCardIdx(null);
          const next = wordIndex + 1;
          if (next >= WORDS.length) { onBack && onBack(); return; }
          setWordIndex(next);
        });
        cancelAudioRef.current = cancel;
      }, 10);
    });
  }, [phase, round, tracedCardIds, cancelAudio, card, wordIndex, onBack, playCorrect]);

  const tracedCount = tracedCardIds.size;
  const canSubmit = tracedCount >= round.cards.length && phase === "tracing" && !locked;
  const displayCards = phase === "success" && successCards ? successCards : round.shuffledCards;
  const progressPct = (wordIndex / WORDS.length) * 100;

  const playLetterSound = useCallback((letter) => {
    const url = getLetterSoundUrl(letter);
    if (url) playAudioSequence([{ url, gain: getLetterGain(letter) }], () => {});
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", fontFamily: "Fredoka, sans-serif", background: "linear-gradient(160deg, #E8FFFE 0%, #FFF9E6 60%, #F5F0FF 100%)", overflow: "hidden" }}>
      {/* Header */}
      <div style={{ flexShrink: 0, display: "flex", alignItems: "center", gap: 8, padding: "calc(env(safe-area-inset-top, 0px) + 8px) 16px 8px", borderBottom: "1.5px solid rgba(0,0,0,0.06)", background: "rgba(255,255,255,0.8)", backdropFilter: "blur(10px)" }}>
        <BackArrow onPress={onBack} />
        <div style={{ flex: 1 }} />
        <span style={{ fontSize: 14, color: "#94A3B8", fontWeight: 600 }}>{wordIndex + 1}/{WORDS.length}</span>
      </div>

      {/* Progress bar */}
      <div style={{ height: 5, background: "rgba(0,0,0,0.06)", flexShrink: 0 }}>
        <motion.div animate={{ width: `${progressPct}%` }} transition={{ duration: 0.4 }} style={{ height: "100%", borderRadius: 99, background: "linear-gradient(90deg, #4ECDC4, #C77DFF)" }} />
      </div>

      {/* Content */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", padding: "16px 16px 32px", gap: 24, overflowY: "auto", position: "relative" }}>
        {(locked || phase === "success") && <div style={{ position: "fixed", inset: 0, zIndex: 100, pointerEvents: "all" }} />}

        {/* Word image — rainbow border */}
        <AnimatePresence mode="wait">
          <motion.div key={card.word} initial={{ opacity: 0, scale: 0.93 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.22 }} style={{ position: "relative", width: "100%", maxWidth: 330 }}>
            <div style={{ position: "absolute", top: -12, right: -6, width: 100, height: 85, borderRadius: 28, background: "#FFCDD2", zIndex: 0, transform: "rotate(8deg)" }} />
            <div style={{ position: "absolute", bottom: -12, left: -6, width: 85, height: 85, borderRadius: "50%", background: "#FFF59D", zIndex: 0 }} />
            <div
              onPointerDown={(e) => { e.preventDefault(); if (!lockedRef.current && card.audio) { cancelAudio(); const cancel = playAudioSequence([{ url: card.audio, gain: 1 }], () => { cancelAudioRef.current = null; }); cancelAudioRef.current = cancel; } }}
              style={{ position: "relative", zIndex: 1, borderRadius: 22, padding: 10, boxShadow: "0 10px 32px rgba(30,58,95,0.15)", cursor: "pointer", border: "4px solid transparent", background: "linear-gradient(white, white) padding-box, linear-gradient(135deg, #FF6B6B, #FFD93D, #4ECDC4, #9B59B6) border-box" }}
            >
              <img src={card.image} alt={card.word} style={{ width: "100%", aspectRatio: "1/1", objectFit: "cover", borderRadius: 14, display: "block" }} />
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Letter trace tiles — 3 shuffled */}
        <AnimatePresence mode="wait">
          <motion.div key={`${roundKey}-${phase}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.25 }}
            style={{ display: "flex", flexDirection: "row", gap: 10, justifyContent: "center", width: "100%" }}>
            {displayCards.map((c, i) => {
              const isTraced = tracedCardIds.has(c.id);
              const isBouncing = phase === "success" && bouncingCardIdx === i;
              if (phase === "success") {
                return (
                  <motion.div key={c.id} animate={isBouncing ? { y: [0, -18, 0, -10, 0] } : { y: 0 }} transition={isBouncing ? { duration: 0.5 } : {}} style={{ borderRadius: 18 }}>
                    <div style={{ borderRadius: 18, overflow: "hidden", border: "4px solid transparent", background: "linear-gradient(white, white) padding-box, linear-gradient(135deg, #FF6B6B, #FFD93D, #4ECDC4, #9B59B6) border-box", boxShadow: "0 8px 32px rgba(155,89,182,0.25), 0 4px 18px rgba(78,205,196,0.3)" }}>
                      <LetterTrace letter={c.letter} size={TILE_SIZE} locked={true} transparent={true} forceCompleted={true} onComplete={() => {}} />
                    </div>
                  </motion.div>
                );
              }
              return (
                <motion.div key={c.id} onPointerDown={() => playLetterSound(c.letter)}
                  style={{ opacity: isTraced ? 1 : 0.75, transition: "opacity 0.3s", borderRadius: 18, cursor: "pointer", touchAction: "manipulation" }}>
                  <div style={{ borderRadius: 18, overflow: "hidden", border: "4px solid transparent", background: isTraced ? "linear-gradient(white, white) padding-box, linear-gradient(135deg, #FF6B6B, #FFD93D, #4ECDC4, #9B59B6) border-box" : "transparent", boxShadow: isTraced ? "0 8px 32px rgba(155,89,182,0.25), 0 4px 18px rgba(78,205,196,0.3)" : "none", transition: "background 0.2s, box-shadow 0.2s" }}>
                    <LetterTrace letter={c.letter} size={TILE_SIZE} locked={locked || isTraced} transparent={true} onComplete={() => handleCardComplete(c.id)} />
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </AnimatePresence>

        {/* Buttons */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 4 }}>
          <button onPointerDown={(e) => { e.preventDefault(); handleRefresh(); }}
            style={{ width: 48, height: 48, borderRadius: 24, background: "white", boxShadow: "0 4px 16px rgba(0,0,0,0.14)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, touchAction: "manipulation", opacity: tracedCount > 0 && !locked && phase === "tracing" ? 1 : 0.35 }}>
            <RotateCcw size={22} color="#A8D0E6" strokeWidth={2.2} />
          </button>
          <motion.button
            onPointerDown={(e) => { e.preventDefault(); if (canSubmit) handleSubmit(); }}
            animate={canSubmit ? { scale: [1, 1.04, 1] } : {}}
            transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut" }}
            style={{ padding: "14px 52px", borderRadius: 999, border: "none", fontSize: 22, fontWeight: 700, fontFamily: "Fredoka, sans-serif", cursor: canSubmit ? "pointer" : "default", background: canSubmit ? "linear-gradient(135deg, #4A90C4, #22c55e)" : "#C5DCF0", color: canSubmit ? "white" : "#9CB8CC", boxShadow: canSubmit ? "0 6px 24px rgba(74,144,196,0.45)" : "none", transition: "background 0.3s, color 0.3s", touchAction: "manipulation" }}>
            ✓
          </motion.button>
        </div>
      </div>
    </div>
  );
}