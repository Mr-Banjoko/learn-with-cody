import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import BackArrow from "../BackArrow";
import IdentifyingRound from "../games/IdentifyingRound";
import { playAudio } from "../../lib/useAudio";
import { shortAWords } from "../../lib/shortAWords";
import { shortEWords } from "../../lib/shortEWords";
import { shortIWords } from "../../lib/shortIWords";
import { shortOWords } from "../../lib/shortOWords";
import { shortUWords } from "../../lib/shortUWords";
import { tx } from "../../lib/i18n";

const ALL_WORDS = [
  ...shortAWords,
  ...shortEWords,
  ...shortIWords,
  ...shortOWords,
  ...shortUWords,
];

function buildRound(lastWord) {
  const pool = lastWord ? ALL_WORDS.filter((w) => w !== lastWord) : ALL_WORDS;
  const target = pool[Math.floor(Math.random() * pool.length)];
  const distractorPool = ALL_WORDS.filter((w) => w.word !== target.word);
  const shuffled = [...distractorPool].sort(() => Math.random() - 0.5);
  const distractors = shuffled.slice(0, 2);
  const choices = [target, ...distractors].sort(() => Math.random() - 0.5);
  return { target, choices };
}

export default function WordToPicture({ onBack, lang = "en", onRoundComplete, hideBackArrow }) {
  const [round, setRound] = useState(() => buildRound(null));
  // roundKey forces IdentifyingRound to fully remount on advance
  const [roundKey, setRoundKey] = useState(0);
  const wrongAttempts = useRef(0);
  const lastWordRef = useRef(null);

  const handleRoundComplete = useCallback(() => {
    if (onRoundComplete) onRoundComplete(Math.max(0, 2 - wrongAttempts.current));
    wrongAttempts.current = 0;
    lastWordRef.current = round.target;
    setRound(buildRound(round.target));
    setRoundKey((k) => k + 1);
  }, [onRoundComplete, round]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        fontFamily: "Fredoka, sans-serif",
        background: "linear-gradient(160deg, #E8FFFE 0%, #FFF9E6 60%, #F5F0FF 100%)",
        overflow: "hidden",
        position: "relative",
      }}
    >
      {!hideBackArrow && (
        <div style={{ padding: "12px 16px 0", flexShrink: 0 }}>
          <BackArrow onPress={onBack} />
        </div>
      )}

      <IdentifyingRound
        key={roundKey}
        round={round}
        onComplete={handleRoundComplete}
        lang={lang}
      />
    </div>
  );
}