import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import LetterTrace from "../write/short-a/LetterTrace";
import BackArrow from "../../BackArrow";
import { getLetterSoundUrl, getLetterGain } from "../../../lib/letterSounds";
import { playAudioSequence, preloadAudio, warmupAudio } from "../../../lib/useAudio";

const WORD_LIST_SIZE = 10;
const TILE_SIZE = 100;

function shuffleArray(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

function createRound(wordData, roundKey) {
  const word = wordData.word.toLowerCase();
  const wordLetters = word.split("");

  const correctCards = wordLetters.map((letter, index) => ({
    id: `correct-${index}-${letter}-${roundKey}`,
    letter,
    isCorrect: true,
    correctIndex: index,
  }));

  const blocked = new Set(wordLetters);
  const alphabet = "abcdefghijklmnopqrstuvwxyz".split("");
  const available = alphabet.filter((l) => !blocked.has(l));
  const distractors = shuffleArray(available).slice(0, 3);

  const distractorCards = distractors.map((letter, index) => ({
    id: `distractor-${index}-${letter}-${roundKey}`,
    letter,
    isCorrect: false,
    correctIndex: null,
  }));

  const shuffledCards = shuffleArray([...correctCards, ...distractorCards]);

  return { correctCards, distractorCards, shuffledCards };
}

function getAllAudioUrls(wordList) {
  const urls = [];
  wordList.forEach((w) => {
    if (w.audio) urls.push(w.audio);
    w.word.split("").forEach((l) => {
      const u = getLetterSoundUrl(l);
      if (u) urls.push(u);
    });
  });
  return [...new Set(urls)];
}

function ProgressBar({ value, max }) {
  return (
    <div style={{ width: "100%", height: 10, background: "rgba(74,144,196,0.18)", borderRadius: 99, overflow: "hidden" }}>
      <div
        style={{
          height: "100%",
          width: `${(value / max) * 100}%`,
          background: "linear-gradient(90deg,#4ade80,#22c55e)",
          borderRadius: 99,
          transition: "width 0.4s ease",
        }}
      />
    </div>
  );
}

export default function WriteV2Game({ wordList, title, onBack }) {
  const WORD_LIST = wordList.slice(0, WORD_LIST_SIZE);

  const [wordIdx, setWordIdx] = useState(0);
  const [roundKey, setRoundKey] = useState(0);
  const [round, setRound] = useState(() => createRound(WORD_LIST[0], 0));

  // tracedCardIds: set of card ids that have been fully traced
  const [tracedCardIds, setTracedCardIds] = useState(new Set());

  // phase: "tracing" | "wrong" | "success"
  const [phase, setPhase] = useState("tracing");

  const [locked, setLocked] = useState(true);
  const [audioReady, setAudioReady] = useState(false);

  // For success animation: which card index is bouncing, and ordered correct cards to show
  const [bouncingCardIdx, setBouncingCardIdx] = useState(null);
  const [successCards, setSuccessCards] = useState(null); // ordered correct cards after success

  const wordIdxRef = useRef(0);
  const lockedRef = useRef(true);
  const cancelAudioRef = useRef(null);

  useEffect(() => { wordIdxRef.current = wordIdx; }, [wordIdx]);
  useEffect(() => { lockedRef.current = locked; }, [locked]);

  // Preload audio
  useEffect(() => {
    let cancelled = false;
    const urls = getAllAudioUrls(WORD_LIST);
    preloadAudio(urls).then(() => warmupAudio(urls)).then(() => {
      if (!cancelled) setAudioReady(true);
    });
    return () => { cancelled = true; };
  }, []);

  const cancelAudio = useCallback(() => {
    if (cancelAudioRef.current) {
      cancelAudioRef.current();
      cancelAudioRef.current = null;
    }
  }, []);

  // On audio ready or word change: play word audio then unlock
  useEffect(() => {
    if (!audioReady) return;
    setLocked(true);
    lockedRef.current = true;
    cancelAudio();

    const wData = WORD_LIST[wordIdxRef.current];
    const cancel = playAudioSequence(
      [{ url: wData.audio, gain: 1 }],
      () => {
        cancelAudioRef.current = null;
        setLocked(false);
        lockedRef.current = false;
      }
    );
    cancelAudioRef.current = cancel;
    return () => cancelAudio();
  }, [audioReady, wordIdx]);

  const goNextWord = useCallback(() => {
    cancelAudio();
    const next = (wordIdxRef.current + 1) % WORD_LIST.length;
    const nextKey = roundKey + 1;
    setWordIdx(next);
    setRoundKey(nextKey);
    setRound(createRound(WORD_LIST[next], nextKey));
    setTracedCardIds(new Set());
    setPhase("tracing");
    setBouncingCardIdx(null);
    setSuccessCards(null);
  }, [cancelAudio, roundKey, WORD_LIST]);

  const handleCardComplete = useCallback((cardId) => {
    if (lockedRef.current || phase !== "tracing") return;
    setTracedCardIds((prev) => {
      const next = new Set(prev);
      next.add(cardId);
      return next;
    });
  }, [phase]);

  const handleSubmit = useCallback(() => {
    if (lockedRef.current || phase !== "tracing") return;

    const tracedCards = round.shuffledCards.filter((c) => tracedCardIds.has(c.id));
    const isCorrect =
      tracedCards.length === round.correctCards.length &&
      tracedCards.every((c) => c.isCorrect);

    if (!isCorrect) {
      // Wrong — flash wrong feedback, reset traced, let retry
      setPhase("wrong");
      setTimeout(() => {
        setTracedCardIds(new Set());
        setPhase("tracing");
      }, 900);
      return;
    }

    // Correct — build ordered correct cards and start success sequence
    const ordered = round.correctCards.slice().sort((a, b) => a.correctIndex - b.correctIndex);
    setSuccessCards(ordered);
    setPhase("success");
    setLocked(true);
    lockedRef.current = true;
    cancelAudio();

    const wordData = WORD_LIST[wordIdxRef.current];

    const steps = ordered.map((card, i) => {
      const url = getLetterSoundUrl(card.letter);
      return url ? { url, gain: getLetterGain(card.letter), onStart: () => setBouncingCardIdx(i) } : null;
    }).filter(Boolean);

    if (wordData.audio) {
      steps.push({ url: wordData.audio, gain: 1, onStart: () => setBouncingCardIdx(null) });
    }

    const cancel = playAudioSequence(steps, () => {
      cancelAudioRef.current = null;
      setBouncingCardIdx(null);
      goNextWord();
    });
    cancelAudioRef.current = cancel;
  }, [phase, round, tracedCardIds, cancelAudio, goNextWord, WORD_LIST]);

  const wordData = WORD_LIST[wordIdx];
  const allCorrectTraced = round.correctCards.every((c) => tracedCardIds.has(c.id));
  const noDistractorTraced = round.distractorCards.every((c) => !tracedCardIds.has(c.id));
  const canSubmit = allCorrectTraced && noDistractorTraced && phase === "tracing" && !locked;

  // Cards to display: during success show ordered correct cards; otherwise show shuffled
  const displayCards = phase === "success" && successCards ? successCards : round.shuffledCards;

  return (
    <div style={{ minHeight: "100%", background: "linear-gradient(160deg, #E8FFFE 0%, #FFF9E6 60%, #F5F0FF 100%)", fontFamily: "Fredoka, sans-serif", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <div style={{ background: "#A8D0E6", borderBottomLeftRadius: 28, borderBottomRightRadius: 28, padding: "10px 20px 16px", display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
        <BackArrow onPress={onBack} />
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: "#1E3A5F", margin: 0 }}>{title} — Write V2</h1>
        </div>
        <div style={{ minWidth: 100 }}>
          <ProgressBar value={wordIdx} max={WORD_LIST.length} />
        </div>
      </div>

      {/* Loading overlay */}
      {!audioReady && (
        <div style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(255,255,255,0.85)", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 12 }}>
          <div style={{ width: 40, height: 40, border: "4px solid #A8D0E6", borderTopColor: "#4A90C4", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}

      {/* Body */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", padding: "16px 16px 32px", gap: 16, overflowY: "auto" }}>
        {/* Interaction lock overlay */}
        {locked && <div style={{ position: "fixed", inset: 0, zIndex: 100, pointerEvents: "all" }} />}

        {/* Wrong feedback overlay */}
        {phase === "wrong" && (
          <div style={{ position: "fixed", inset: 0, zIndex: 150, pointerEvents: "none", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <motion.div
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{ fontSize: 64, filter: "drop-shadow(0 4px 12px rgba(255,80,80,0.4))" }}
            >
              ❌
            </motion.div>
          </div>
        )}

        {/* Word picture */}
        <AnimatePresence mode="wait">
          <motion.div
            key={wordIdx}
            initial={{ opacity: 0, scale: 0.93 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.93 }}
            transition={{ duration: 0.22 }}
            style={{ position: "relative", width: "100%", maxWidth: 220 }}
          >
            <div style={{ position: "absolute", top: -12, right: -6, width: 100, height: 85, borderRadius: 28, background: "#FFCDD2", zIndex: 0, transform: "rotate(8deg)" }} />
            <div style={{ position: "absolute", bottom: -12, left: -6, width: 85, height: 85, borderRadius: "50%", background: "#FFF59D", zIndex: 0 }} />
            <div
              onPointerDown={(e) => {
                e.preventDefault();
                if (!lockedRef.current) {
                  cancelAudio();
                  const cancel = playAudioSequence([{ url: wordData.audio, gain: 1 }], () => { cancelAudioRef.current = null; });
                  cancelAudioRef.current = cancel;
                }
              }}
              style={{ position: "relative", zIndex: 1, background: "#E8FFFE", borderRadius: 22, padding: 10, boxShadow: "0 10px 32px rgba(30,58,95,0.15)", cursor: "pointer" }}
            >
              <img src={wordData.image} alt="" style={{ width: "100%", aspectRatio: "1/1", objectFit: "cover", borderRadius: 14, display: "block" }} />
            </div>
          </motion.div>
        </AnimatePresence>

        {/* 6-card grid (2 cols × 3 rows) or 3-card row during success */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`${roundKey}-${phase === "success" ? "success" : "tracing"}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.25 }}
            style={{
              display: "grid",
              gridTemplateColumns: phase === "success" ? `repeat(${displayCards.length}, ${TILE_SIZE}px)` : `repeat(2, ${TILE_SIZE}px)`,
              gap: 8,
              justifyContent: "center",
              width: "100%",
            }}
          >
            {displayCards.map((card, i) => {
              const isTraced = tracedCardIds.has(card.id);
              const isBouncing = phase === "success" && bouncingCardIdx === i;
              const isSuccess = phase === "success";

              return (
                <motion.div
                  key={card.id}
                  animate={isBouncing ? { y: [0, -18, 0, -10, 0] } : { y: 0 }}
                  transition={isBouncing ? { duration: 0.5, ease: "easeInOut" } : {}}
                  style={{
                    opacity: isTraced ? 1 : 0.65,
                    transition: "opacity 0.3s",
                    outline: isTraced && !isSuccess ? "3px solid #22c55e" : "none",
                    borderRadius: 18,
                  }}
                >
                  <LetterTrace
                    letter={card.letter}
                    size={TILE_SIZE}
                    locked={locked || isTraced || phase !== "tracing"}
                    onComplete={() => handleCardComplete(card.id)}
                  />
                </motion.div>
              );
            })}
          </motion.div>
        </AnimatePresence>

        {/* Submit button */}
        <motion.button
          onPointerDown={(e) => { e.preventDefault(); if (canSubmit) handleSubmit(); }}
          animate={canSubmit ? { scale: [1, 1.04, 1] } : {}}
          transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut" }}
          style={{
            marginTop: 4,
            padding: "14px 52px",
            borderRadius: 999,
            border: "none",
            fontSize: 22,
            fontWeight: 700,
            fontFamily: "Fredoka, sans-serif",
            cursor: canSubmit ? "pointer" : "default",
            background: canSubmit
              ? "linear-gradient(135deg, #4A90C4, #22c55e)"
              : "#C5DCF0",
            color: canSubmit ? "white" : "#9CB8CC",
            boxShadow: canSubmit ? "0 6px 24px rgba(74,144,196,0.45)" : "none",
            transition: "background 0.3s, color 0.3s, box-shadow 0.3s",
            touchAction: "manipulation",
          }}
        >
          ✓
        </motion.button>
      </div>
    </div>
  );
}