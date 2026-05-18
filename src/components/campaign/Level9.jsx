/**
 * Level 9 — 10-round sequence
 * Odd rounds (1,3,5,7,9): Identifying game (Word → Picture) — unchanged original content
 * Even rounds (2,4,6,8,10): Letter Catch difficult mode
 *
 * Round 1 — Identifying: can
 * Round 2 — Letter Catch: can, missing: c
 * Round 3 — Identifying: pan
 * Round 4 — Letter Catch: pan, missing: p
 * Round 5 — Identifying: jam
 * Round 6 — Letter Catch: jam, missing: m
 * Round 7 — Identifying: map
 * Round 8 — Letter Catch: map, missing: m
 * Round 9 — Identifying: mat
 * Round 10 — Letter Catch: mat, missing: a
 */
import { useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import BackArrow from "../BackArrow";
import LevelCompleteScreen from "./LevelCompleteScreen";
import HeartDisplay from "./HeartDisplay";
import IdentifyingRound from "../games/IdentifyingRound";
import CampaignLetterCatchRound from "./CampaignLetterCatchRound";
import { calcStars, saveLevelResult, getScoredRounds } from "../../lib/campaignPerformance";
import { useRoundHintAudio, getHintAudioUrl, LOCK_OVERLAY_STYLE } from "../../lib/useRoundHintAudio";
import { shortAWords } from "../../lib/shortAWords";
import { shortEWords } from "../../lib/shortEWords";
import { shortIWords } from "../../lib/shortIWords";
import { shortOWords } from "../../lib/shortOWords";
import { shortUWords } from "../../lib/shortUWords";

const LEVEL_NUM = 9;
const SCORED_ROUNDS = getScoredRounds("short-a", LEVEL_NUM);

const ALL_WORDS = [...shortAWords, ...shortEWords, ...shortIWords, ...shortOWords, ...shortUWords];

const ROUND_SEQUENCE = [
  { type: "identifying", word: "can" },
  { type: "catch",       word: "can",  missingLetter: "c" },
  { type: "identifying", word: "pan" },
  { type: "catch",       word: "pan",  missingLetter: "p" },
  { type: "identifying", word: "jam" },
  { type: "catch",       word: "jam",  missingLetter: "m" },
  { type: "identifying", word: "map" },
  { type: "catch",       word: "map",  missingLetter: "m" },
  { type: "identifying", word: "mat" },
  { type: "catch",       word: "mat",  missingLetter: "a" },
];

const TOTAL_ROUNDS = ROUND_SEQUENCE.length;

function findWord(name) {
  return shortAWords.find((w) => w.word === name) || { word: name, image: "", audio: "" };
}

function buildIdentifyingRound(targetWord) {
  const target = shortAWords.find((w) => w.word === targetWord);
  const distractorPool = ALL_WORDS.filter((w) => w.word !== targetWord);
  const shuffled = [...distractorPool].sort(() => Math.random() - 0.5);
  const distractors = shuffled.slice(0, 2);
  const choices = [target, ...distractors].sort(() => Math.random() - 0.5);
  return { target, choices };
}

function markLevel9Complete() {
  try {
    const data = JSON.parse(localStorage.getItem("campaign_progress") || "{}");
    if (!data["short-a"]) data["short-a"] = {};
    data["short-a"][9] = { completed: true, completedAt: new Date().toISOString() };
    localStorage.setItem("campaign_progress", JSON.stringify(data));
  } catch (_) {}
}

export default function Level9({ onBack, lang = "en" }) {
  const [roundIndex, setRoundIndex] = useState(0);
  const [done, setDone] = useState(false);
  const [mistakes, setMistakes] = useState(0);
  const [earnedStars, setEarnedStars] = useState(0);
  // Round 1 only: chain word audio after hint audio before unlocking
  const round1WordAudio = roundIndex === 0 ? (findWord(ROUND_SEQUENCE[0].word)?.audio || null) : null;
  const onHintComplete = useCallback((unlock) => {
    if (!round1WordAudio) { unlock(); return; }
    const audio = new Audio(round1WordAudio);
    audio.onended = unlock;
    audio.onerror = unlock;
    audio.play().catch(unlock);
  }, [round1WordAudio]);

  const hintUrl = getHintAudioUrl(9, roundIndex, lang);
  const { locked: hintLocked } = useRoundHintAudio({
    url: hintUrl,
    onHintComplete: roundIndex === 0 ? onHintComplete : undefined,
  });

  const progressPct = (roundIndex / TOTAL_ROUNDS) * 100;

  const advance = useCallback(() => {
    const next = roundIndex + 1;
    if (next >= TOTAL_ROUNDS) {
      markLevel9Complete();
      const stars = calcStars(mistakes, SCORED_ROUNDS);
      saveLevelResult("short-a", LEVEL_NUM, stars, mistakes);
      setEarnedStars(stars);
      setDone(true);
    } else {
      setRoundIndex(next);
    }
  }, [roundIndex, mistakes]);

  const roundDef = ROUND_SEQUENCE[roundIndex];

  const identifyingRound = useMemo(() => {
    if (!roundDef || roundDef.type !== "identifying") return null;
    return buildIdentifyingRound(roundDef.word);
  }, [roundIndex]); // eslint-disable-line react-hooks/exhaustive-deps

  const catchWordData = useMemo(() => {
    if (!roundDef || roundDef.type !== "catch") return null;
    return findWord(roundDef.word);
  }, [roundIndex]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", fontFamily: "Fredoka, sans-serif", background: "linear-gradient(160deg, #E8FFFE 0%, #FFF9E6 60%, #F5F0FF 100%)", overflow: "hidden" }}>
      <div style={{ flexShrink: 0, display: "flex", alignItems: "center", gap: 4, padding: "calc(env(safe-area-inset-top, 0px) + 8px) 16px 8px", borderBottom: "1.5px solid rgba(0,0,0,0.06)", background: "rgba(255,255,255,0.75)", backdropFilter: "blur(10px)" }}>
        <BackArrow onPress={onBack} />
        <div style={{ flex: 1 }}>
          <p style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "#1E293B" }}>
            {lang === "zh" ? "第 9 关" : "Level 9"}
          </p>
        </div>
        <HeartDisplay mistakes={mistakes} size={54} />
      </div>

      {!done && (
        <div style={{ height: 6, background: "rgba(0,0,0,0.06)", flexShrink: 0 }}>
          <motion.div animate={{ width: `${progressPct}%` }} transition={{ duration: 0.4 }} style={{ height: "100%", borderRadius: 99, background: "linear-gradient(90deg, #4ECDC4, #4D96FF)" }} />
        </div>
      )}

      <AnimatePresence mode="wait">
        {done ? (
          <motion.div key="complete" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <LevelCompleteScreen levelNum={LEVEL_NUM} stars={earnedStars} mistakes={mistakes} onBack={onBack} lang={lang} />
          </motion.div>
        ) : (
          <motion.div key={`round-${roundIndex}`} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} transition={{ duration: 0.22 }} style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            {roundDef.type === "identifying" && identifyingRound ? (
              <IdentifyingRound key={roundIndex} round={identifyingRound} onComplete={advance} lang={lang} onMistake={() => setMistakes((m) => m + 1)} suppressAutoPlay={roundIndex === 0} />
            ) : roundDef.type === "catch" && catchWordData ? (
              <CampaignLetterCatchRound
                key={`catch-${roundIndex}`}
                word={roundDef.word}
                missingLetter={roundDef.missingLetter}
                image={catchWordData.image}
                audio={catchWordData.audio}
                onComplete={advance}
                onMistake={() => setMistakes((m) => m + 1)}
                lang={lang}
              />
            ) : null}
            {hintLocked && <div style={LOCK_OVERLAY_STYLE} onPointerDown={(e) => e.stopPropagation()} onTouchStart={(e) => e.stopPropagation()} />}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}