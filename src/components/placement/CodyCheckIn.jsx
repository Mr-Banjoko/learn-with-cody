import { useState, useRef, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import CheckInIntro from "./CheckInIntro";
import CheckInMiniWin from "./CheckInMiniWin";
import CheckInResult from "./CheckInResult";
import CheckInProgressBar from "./CheckInProgressBar";
import UpperAndLower from "../test/UpperAndLower";
import OneLetter3Sounds from "../test/OneLetter3Sounds";
import OneSound3Letters from "../test/OneSound3Letters";
import LetterIsSoundIs from "../test/LetterIsSoundIs";

const SAVED_KEY = "cody_placement_result";

// Game order: upper-lower (0), 1-letter-3-sounds (1), 1-sound-3-letters (2), letter-is-sound-is (3)
const CORE_ROUNDS = [4, 5, 5, 4];
const MAX_EXTRA = [2, 2, 2, 2];
const WEIGHTS = [0.15, 0.30, 0.30, 0.25];

function calcResult(scores, targetRounds) {
  const norm = scores.map((s, i) => targetRounds[i] > 0 ? s / (targetRounds[i] * 2) : 0);
  const [sUL, sLS, sSL, sCombo] = norm;
  const placementScore = 100 * (0.15 * sUL + 0.30 * sLS + 0.30 * sSL + 0.25 * sCombo);

  let level = "Intermediate";
  if (placementScore < 60 || sLS < 0.50 || sSL < 0.50) {
    level = "Beginner";
  } else if (placementScore >= 85 && sLS >= 0.85 && sSL >= 0.85 && sCombo >= 0.80) {
    level = "Advanced";
  }

  const badgeMap = { Beginner: "Sound Explorer", Intermediate: "Word Builder", Advanced: "Reading Star" };
  const wordsMap = { Beginner: [2, 3], Intermediate: [4, 5], Advanced: [6, 8] };

  return {
    placementLevel: level,
    childBadgeName: badgeMap[level],
    placementScore: Math.round(placementScore),
    upperLowerScore: Math.round(sUL * 100),
    letterToSoundScore: Math.round(sLS * 100),
    soundToLetterScore: Math.round(sSL * 100),
    letterSoundComboScore: Math.round(sCombo * 100),
    recommendedDailyWordsMin: wordsMap[level][0],
    recommendedDailyWordsMax: wordsMap[level][1],
    placementCompletedAt: new Date().toISOString(),
  };
}

// stage: 'intro' | 'playing' | 'mini-win' | 'result'
export default function CodyCheckIn({ onBack, onDeepScreen, lang = "en" }) {
  const [stage, setStage] = useState("intro");
  const [gameIdx, setGameIdx] = useState(0);
  const [targetRounds, setTargetRounds] = useState([...CORE_ROUNDS]);
  const [result, setResult] = useState(null);

  const roundsDone = useRef([0, 0, 0, 0]);
  const pointsEarned = useRef([0, 0, 0, 0]);
  // Track whether extra rounds have already been added per game
  const extrasAdded = useRef([false, false, false, false]);

  const finalize = useCallback((finalTargets) => {
    const res = calcResult(pointsEarned.current, finalTargets || targetRounds);
    try { localStorage.setItem(SAVED_KEY, JSON.stringify(res)); } catch {}
    setResult(res);
    setStage("result");
  }, [targetRounds]);

  const handleRoundDone = useCallback((pts) => {
    const gi = gameIdx;
    roundsDone.current[gi]++;
    pointsEarned.current[gi] += pts;

    const done = roundsDone.current[gi];
    const target = targetRounds[gi];

    if (done >= target) {
      // Check if adaptive extra rounds needed
      const norm = pointsEarned.current[gi] / (done * 2);
      const isBorderline = norm >= 0.40 && norm < 0.75;
      const canAdd = !extrasAdded.current[gi] && target === CORE_ROUNDS[gi] && MAX_EXTRA[gi] > 0;

      if (isBorderline && canAdd) {
        extrasAdded.current[gi] = true;
        const newTargets = [...targetRounds];
        newTargets[gi] = target + MAX_EXTRA[gi];
        setTargetRounds(newTargets);
        // Game keeps running — no stage change
      } else {
        // Move on
        if (gi < 3) {
          setStage("mini-win");
        } else {
          finalize(targetRounds);
        }
      }
    }
  }, [gameIdx, targetRounds, finalize]);

  const handleMiniWinDone = useCallback(() => {
    const nextIdx = gameIdx + 1;
    setGameIdx(nextIdx);
    setStage("playing");
  }, [gameIdx]);

  const handleStart = useCallback(() => {
    roundsDone.current = [0, 0, 0, 0];
    pointsEarned.current = [0, 0, 0, 0];
    extrasAdded.current = [false, false, false, false];
    setTargetRounds([...CORE_ROUNDS]);
    setGameIdx(0);
    setResult(null);
    setStage("playing");
    onDeepScreen && onDeepScreen(true);
  }, [onDeepScreen]);

  const handleQuit = useCallback(() => {
    setStage("intro");
    setGameIdx(0);
    onDeepScreen && onDeepScreen(false);
  }, [onDeepScreen]);

  const handleDone = useCallback(() => {
    setStage("intro");
    setGameIdx(0);
    onDeepScreen && onDeepScreen(false);
  }, [onDeepScreen]);

  const handleIntroBack = useCallback(() => {
    onDeepScreen && onDeepScreen(false);
    onBack && onBack();
  }, [onBack, onDeepScreen]);

  // Common game props
  const gameProps = {
    lang,
    onRoundComplete: handleRoundDone,
    hideBackArrow: true,
    onBack: handleQuit,
  };

  const GAMES = [
    <UpperAndLower key="ul" {...gameProps} />,
    <OneLetter3Sounds key="ol" {...gameProps} />,
    <OneSound3Letters key="os" {...gameProps} />,
    <LetterIsSoundIs key="lis" {...gameProps} />,
  ];

  return (
    <AnimatePresence mode="wait">
      {stage === "intro" && (
        <motion.div key="intro" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} style={{ height: "100%" }}>
          <CheckInIntro onStart={handleStart} onBack={handleIntroBack} lang={lang} />
        </motion.div>
      )}

      {stage === "playing" && (
        <motion.div
          key={`game-${gameIdx}`}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -40 }}
          transition={{ duration: 0.22 }}
          style={{ height: "100%", display: "flex", flexDirection: "column" }}
        >
          <CheckInProgressBar
            gameIdx={gameIdx}
            roundsDone={roundsDone.current[gameIdx] ?? 0}
            totalRounds={targetRounds[gameIdx] ?? CORE_ROUNDS[gameIdx] ?? 1}
            onQuit={handleQuit}
          />
          <div style={{ flex: 1, minHeight: 0, overflow: "hidden" }}>
            {GAMES[gameIdx]}
          </div>
        </motion.div>
      )}

      {stage === "mini-win" && (
        <motion.div key={`mini-win-${gameIdx}`} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} style={{ height: "100%" }}>
          <CheckInMiniWin gameIdx={gameIdx} onContinue={handleMiniWinDone} lang={lang} />
        </motion.div>
      )}

      {stage === "result" && result && (
        <motion.div key="result" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} style={{ height: "100%" }}>
          <CheckInResult result={result} onDone={handleDone} lang={lang} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}