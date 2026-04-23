/**
 * Level 5 — 9-round REVIEW level (Short a)
 *
 * Fixed round order:
 *   R1: Rearrange the Pictures → hat
 *   R2: Identifying            → dad
 *   R3: Drag the Letters       → bat
 *   R4: Identifying            → cat
 *   R5: Rearrange the Pictures → bat
 *   R6: Drag the Letters       → rat
 *   R7: Drag the Letters       → cat
 *   R8: Identifying            → hat
 *   R9: Rearrange the Pictures → rat
 *
 * Reuses:
 *   - PicSliceBoardEasy  (same as Level 2 — Rearrange the Pictures)
 *   - Level1Drag         (same as Level 3 — Drag the Letters)
 *   - IdentifyingRound   (same as Level 4 — Identifying)
 */
import { useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import BackArrow from "../BackArrow";
import Level5Complete from "./Level5Complete";
import PicSliceBoardEasy from "../games/PicSliceBoardEasy";
import Level1DragV2 from "./Level1DragV2";
import IdentifyingRound from "../games/IdentifyingRound";
import { buildWordData } from "../../lib/picSliceGameData";
import { shortAWords } from "../../lib/shortAWords";
import { shortEWords } from "../../lib/shortEWords";
import { shortIWords } from "../../lib/shortIWords";
import { shortOWords } from "../../lib/shortOWords";
import { shortUWords } from "../../lib/shortUWords";

// ── Fixed 9-round sequence ────────────────────────────────────────────────────
const ROUND_SEQUENCE = [
  { type: "rearrange",    word: "hat" },
  { type: "identifying",  word: "dad" },
  { type: "drag",         word: "bat" },
  { type: "identifying",  word: "cat" },
  { type: "rearrange",    word: "bat" },
  { type: "drag",         word: "rat" },
  { type: "drag",         word: "cat" },
  { type: "identifying",  word: "hat" },
  { type: "rearrange",    word: "rat" },
];
const TOTAL_ROUNDS = ROUND_SEQUENCE.length; // 9

// ── Helpers ───────────────────────────────────────────────────────────────────
function findWord(name) {
  return shortAWords.find((w) => w.word === name) || { word: name, image: "", audio: "" };
}

function markLevel5Complete() {
  try {
    const data = JSON.parse(localStorage.getItem("campaign_progress") || "{}");
    if (!data["short-a"]) data["short-a"] = {};
    data["short-a"][5] = { completed: true, completedAt: new Date().toISOString() };
    localStorage.setItem("campaign_progress", JSON.stringify(data));
  } catch (_) {}
}

// ── Pool for Identifying distractors ─────────────────────────────────────────
const ALL_WORDS = [...shortAWords, ...shortEWords, ...shortIWords, ...shortOWords, ...shortUWords];

function buildIdentifyingRound(targetWord) {
  const target = shortAWords.find((w) => w.word === targetWord);
  const distractorPool = ALL_WORDS.filter((w) => w.word !== targetWord);
  const shuffled = [...distractorPool].sort(() => Math.random() - 0.5);
  const distractors = shuffled.slice(0, 2);
  const choices = [target, ...distractors].sort(() => Math.random() - 0.5);
  return { target, choices };
}

// ── Level 5 shell ─────────────────────────────────────────────────────────────
export default function Level5({ onBack, lang = "en" }) {
  const [roundIndex, setRoundIndex] = useState(0);
  const [done, setDone] = useState(false);

  const progressPct = (roundIndex / TOTAL_ROUNDS) * 100;

  const advance = useCallback(() => {
    const next = roundIndex + 1;
    if (next >= TOTAL_ROUNDS) {
      markLevel5Complete();
      setDone(true);
    } else {
      setRoundIndex(next);
    }
  }, [roundIndex]);

  const roundDef = ROUND_SEQUENCE[roundIndex];

  // Build rearrange wordPair — stable per roundIndex
  const rearrangeWordPair = useMemo(() => {
    if (!roundDef || roundDef.type !== "rearrange") return null;
    return [buildWordData(roundDef.word)];
  }, [roundIndex]); // eslint-disable-line react-hooks/exhaustive-deps

  // Build drag card — stable per roundIndex
  const dragCard = useMemo(() => {
    if (!roundDef || roundDef.type !== "drag") return null;
    return findWord(roundDef.word);
  }, [roundIndex]); // eslint-disable-line react-hooks/exhaustive-deps

  // Build identifying round — stable per roundIndex
  const identifyingRound = useMemo(() => {
    if (!roundDef || roundDef.type !== "identifying") return null;
    return buildIdentifyingRound(roundDef.word);
  }, [roundIndex]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div style={{
      display: "flex", flexDirection: "column", height: "100%",
      fontFamily: "Fredoka, sans-serif",
      background: "linear-gradient(160deg, #E8FFFE 0%, #FFF9E6 60%, #F5F0FF 100%)",
      overflow: "hidden",
    }}>
      {/* Header */}
      <div style={{
        flexShrink: 0, display: "flex", alignItems: "center", gap: 4,
        padding: "calc(env(safe-area-inset-top, 0px) + 8px) 16px 8px",
        borderBottom: "1.5px solid rgba(0,0,0,0.06)",
        background: "rgba(255,255,255,0.75)", backdropFilter: "blur(10px)",
      }}>
        <BackArrow onPress={onBack} />
        <div style={{ flex: 1 }}>
          <p style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "#1E293B" }}>
            {lang === "zh" ? "第 5 关 — 复习" : "Level 5 — Review"}
          </p>
        </div>
        <span style={{ fontSize: 13, color: "#64748B", fontWeight: 600, marginRight: 4 }}>
          {roundIndex + 1}/{TOTAL_ROUNDS}
        </span>
      </div>

      {/* Progress bar */}
      {!done && (
        <div style={{ height: 6, background: "rgba(0,0,0,0.06)", flexShrink: 0 }}>
          <motion.div
            animate={{ width: `${progressPct}%` }}
            transition={{ duration: 0.4 }}
            style={{ height: "100%", borderRadius: 99, background: "linear-gradient(90deg, #4ECDC4, #4D96FF)" }}
          />
        </div>
      )}

      {/* Content */}
      <AnimatePresence mode="wait">
        {done ? (
          <motion.div
            key="complete"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}
          >
            <Level5Complete onBack={onBack} lang={lang} />
          </motion.div>
        ) : (
          <motion.div
            key={`round-${roundIndex}`}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.22 }}
            style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}
          >
            {roundDef.type === "rearrange" && rearrangeWordPair ? (
              <PicSliceBoardEasy
                key={`rearrange-${roundIndex}`}
                wordPair={rearrangeWordPair}
                onRoundComplete={advance}
                lang={lang}
              />
            ) : roundDef.type === "drag" && dragCard ? (
              <Level1DragV2
                key={`drag-${roundIndex}`}
                card={dragCard}
                onComplete={advance}
                lang={lang}
              />
            ) : roundDef.type === "identifying" && identifyingRound ? (
              <IdentifyingRound
                key={`identifying-${roundIndex}`}
                round={identifyingRound}
                onComplete={advance}
                lang={lang}
              />
            ) : null}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}