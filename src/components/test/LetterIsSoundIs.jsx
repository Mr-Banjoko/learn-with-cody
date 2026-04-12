import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import BackArrow from "../BackArrow";
import { getLetterSoundUrl, getLetterGain } from "../../lib/letterSounds";
import { playAudioSequence, warmupAudio } from "../../lib/useAudio";

const ALL_LETTERS = "abcdefghijklmnopqrstuvwxyz".split("");

const LETTER_COLORS = ["#FFAFC5", "#A8D8EA", "#FFE57A", "#B5EAD7", "#FFDAC1", "#FFAFC5"];
const SPEAKER_COLORS = [
  { main: "#4ECDC4", shadow: "rgba(78,205,196,0.35)" },
  { main: "#FF6B6B", shadow: "rgba(255,107,107,0.35)" },
  { main: "#FFD93D", shadow: "rgba(255,217,61,0.35)" },
];

// Audio URL builders
const SPEECH_BASE =
  "https://raw.githubusercontent.com/Mr-Banjoko/learn-with-cody/main/letter_sound/speech%20prompt";
const LETTER_NAMES_BASE =
  "https://raw.githubusercontent.com/Mr-Banjoko/learn-with-cody/main/letter_sound/letter_names";

function getSpeechUrl(phrase, lang) {
  const suffix = lang === "zh" ? "chinese" : "english";
  return `${SPEECH_BASE}/${phrase}_${suffix}.mp3`;
}

function getLetterNameUrl(letter) {
  return `${LETTER_NAMES_BASE}/${letter.toLowerCase()}.mp3`;
}

function SpeakerIcon({ color = "white", size = 44 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 52 52" fill="none">
      <path d="M18 21h-4a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h4l8 6V15l-8 6z" fill={color} />
      <path d="M30 20.5a8 8 0 0 1 0 11" stroke={color} strokeWidth="2.5" strokeLinecap="round" fill="none" />
      <path d="M33.5 17a13 13 0 0 1 0 18" stroke={color} strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.6" />
    </svg>
  );
}

function buildRound() {
  const situation = Math.random() < 0.5 ? 1 : 2;
  const letter = ALL_LETTERS[Math.floor(Math.random() * ALL_LETTERS.length)];
  const pool = ALL_LETTERS.filter((l) => l !== letter);
  const distractors = pool.sort(() => Math.random() - 0.5).slice(0, 2);
  const choices = [letter, ...distractors].sort(() => Math.random() - 0.5);
  const correctIdx = choices.indexOf(letter);
  return { situation, letter, choices, correctIdx };
}

export default function LetterIsSoundIs({ onBack, lang = "en" }) {
  const [round, setRound] = useState(() => buildRound());
  const [placedIdx, setPlacedIdx] = useState(null);
  const [wrongShake, setWrongShake] = useState(false);
  const [dragState, setDragState] = useState(null);

  const dropZoneRef = useRef(null);
  const isDragging = useRef(false);
  const sequenceRef = useRef(null);
  const shakeTimeout = useRef(null);
  const advanceTimeout = useRef(null);

  const { situation, letter, choices, correctIdx } = round;

  const cancelAudio = useCallback(() => {
    if (sequenceRef.current) { sequenceRef.current(); sequenceRef.current = null; }
    clearTimeout(advanceTimeout.current);
  }, []);

  // ── Intro audio on each new round ────────────────────────────────────────
  useEffect(() => {
    const letterIsUrl = getSpeechUrl("letter_is", lang);
    const soundIsUrl = getSpeechUrl("sound_is", lang);
    const letterNameUrl = getLetterNameUrl(letter);
    const letterSoundUrl = getLetterSoundUrl(letter);
    const letterGain = getLetterGain(letter);

    // Warm up all assets used in this round
    const allUrls = [letterIsUrl, soundIsUrl, letterNameUrl, letterSoundUrl].filter(Boolean);
    warmupAudio(allUrls);

    cancelAudio();

    if (situation === 1) {
      // Situation A: "letter is" … pause … "sound is" + letter sound
      const cancel = playAudioSequence([{ url: letterIsUrl }], () => {
        advanceTimeout.current = setTimeout(() => {
          const steps = [
            { url: soundIsUrl },
            ...(letterSoundUrl ? [{ url: letterSoundUrl, gain: letterGain }] : []),
          ];
          const c2 = playAudioSequence(steps);
          sequenceRef.current = c2;
        }, 450);
      });
      sequenceRef.current = cancel;
    } else {
      // Situation B: "letter is" + letter name + "sound is" then stop
      const steps = [
        { url: letterIsUrl },
        { url: letterNameUrl },
        { url: soundIsUrl },
      ];
      const cancel = playAudioSequence(steps);
      sequenceRef.current = cancel;
    }

    return () => cancelAudio();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round]);

  // ── Completion audio → auto-advance ──────────────────────────────────────
  const playCompletion = useCallback(() => {
    cancelAudio();
    const letterIsUrl = getSpeechUrl("letter_is", lang);
    const soundIsUrl = getSpeechUrl("sound_is", lang);
    const letterNameUrl = getLetterNameUrl(letter);
    const letterSoundUrl = getLetterSoundUrl(letter);
    const letterGain = getLetterGain(letter);

    const steps = [
      { url: letterIsUrl },
      { url: letterNameUrl },
      { url: soundIsUrl },
      ...(letterSoundUrl ? [{ url: letterSoundUrl, gain: letterGain }] : []),
    ];

    const cancel = playAudioSequence(steps, () => {
      sequenceRef.current = null;
      // Auto-advance to next round
      setRound(buildRound());
      setPlacedIdx(null);
      setWrongShake(false);
      setDragState(null);
      isDragging.current = false;
    });
    sequenceRef.current = cancel;
  }, [letter, lang, cancelAudio]);

  // ── Touch drag handlers ───────────────────────────────────────────────────
  const handleTouchStart = useCallback((e, choiceIdx) => {
    if (placedIdx === choiceIdx) return;
    isDragging.current = false;
    const touch = e.touches[0];
    const rect = e.currentTarget.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    setDragState({
      choiceIdx,
      x: cx, y: cy,
      startX: touch.clientX, startY: touch.clientY,
      originX: cx, originY: cy,
    });
  }, [placedIdx]);

  const handleTouchMove = useCallback((e) => {
    if (!dragState) return;
    e.preventDefault();
    const touch = e.touches[0];
    const dx = touch.clientX - dragState.startX;
    const dy = touch.clientY - dragState.startY;
    if (!isDragging.current && (Math.abs(dx) > 5 || Math.abs(dy) > 5)) {
      isDragging.current = true;
    }
    setDragState((prev) => prev ? { ...prev, x: prev.originX + dx, y: prev.originY + dy } : null);
  }, [dragState]);

  const handleTouchEnd = useCallback((e) => {
    if (!dragState) return;

    if (!isDragging.current) {
      // Pure tap — toggle selection silently
      setPlacedIdx((prev) => prev === dragState.choiceIdx ? null : dragState.choiceIdx);
      setDragState(null);
      return;
    }

    const touch = e.changedTouches[0];
    const ref = dropZoneRef.current;
    let hit = false;
    if (ref) {
      const rect = ref.getBoundingClientRect();
      hit =
        touch.clientX >= rect.left && touch.clientX <= rect.right &&
        touch.clientY >= rect.top && touch.clientY <= rect.bottom;
    }

    if (hit) {
      setPlacedIdx(dragState.choiceIdx);
    }
    setDragState(null);
    isDragging.current = false;
  }, [dragState]);

  // ── Box tap (unplace) ────────────────────────────────────────────────────
  const handleBoxTap = useCallback(() => {
    setPlacedIdx(null);
  }, []);

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = useCallback(() => {
    if (placedIdx === null) return;

    if (placedIdx === correctIdx) {
      // Correct — play completion then auto-advance
      playCompletion();
    } else {
      // Wrong — shake and unplace
      clearTimeout(shakeTimeout.current);
      setWrongShake(true);
      setPlacedIdx(null);
      shakeTimeout.current = setTimeout(() => setWrongShake(false), 600);
    }
  }, [placedIdx, correctIdx, playCompletion]);

  const placedChoice = placedIdx !== null ? choices[placedIdx] : null;
  const placedColor = placedIdx !== null ? LETTER_COLORS[placedIdx % LETTER_COLORS.length] : null;
  const placedSpeakerColorSet = placedIdx !== null ? SPEAKER_COLORS[placedIdx % SPEAKER_COLORS.length] : null;

  const labelLetterIs = lang === "zh" ? "信是" : "letter is";
  const labelSoundIs = lang === "zh" ? "声音是" : "sound is";

  const boxBase = {
    width: 110,
    height: 110,
    borderRadius: 24,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "3px solid rgba(74,144,196,0.35)",
    boxShadow: "0 6px 24px rgba(30,58,95,0.10)",
  };

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
        touchAction: "none",
        userSelect: "none",
      }}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Back arrow */}
      <div style={{ padding: "12px 16px 0", flexShrink: 0 }}>
        <BackArrow onPress={onBack} />
      </div>

      {/* Main content */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "0 32px",
          gap: 28,
        }}
      >
        {/* Row 1: letter is */}
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <span style={{ fontSize: 30, fontWeight: 700, color: "#1E3A5F", minWidth: 130, flexShrink: 0 }}>
            {labelLetterIs}
          </span>

          {situation === 1 ? (
            /* Situation A: empty drop box for letter */
            <div
              ref={dropZoneRef}
              onClick={placedChoice ? handleBoxTap : undefined}
              style={{
                ...boxBase,
                background: placedChoice ? (placedColor || "white") : "rgba(255,255,255,0.55)",
                cursor: placedChoice ? "pointer" : "default",
                border: `3px solid rgba(74,144,196,${placedChoice ? "0.5" : "0.35"})`,
              }}
            >
              {placedChoice && (
                <motion.span
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  style={{ fontSize: 62, fontWeight: 700, color: "#1E3A5F", lineHeight: 1, fontFamily: "Fredoka, sans-serif" }}
                >
                  {placedChoice}
                </motion.span>
              )}
            </div>
          ) : (
            /* Situation B: filled letter box */
            <div style={{ ...boxBase, background: "white" }}>
              <span style={{ fontSize: 62, fontWeight: 700, color: "#1E3A5F", lineHeight: 1, fontFamily: "Fredoka, sans-serif" }}>
                {letter}
              </span>
            </div>
          )}
        </div>

        {/* Row 2: sound is */}
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <span style={{ fontSize: 30, fontWeight: 700, color: "#1E3A5F", minWidth: 130, flexShrink: 0 }}>
            {labelSoundIs}
          </span>

          {situation === 2 ? (
            /* Situation B: empty drop box for speaker */
            <div
              ref={dropZoneRef}
              onClick={placedChoice ? handleBoxTap : undefined}
              style={{
                ...boxBase,
                background: placedChoice ? placedSpeakerColorSet.main : "rgba(255,255,255,0.55)",
                border: `3px solid ${placedChoice ? placedSpeakerColorSet.main : "rgba(74,144,196,0.35)"}`,
                boxShadow: placedChoice ? `0 8px 28px ${placedSpeakerColorSet.shadow}` : "0 6px 24px rgba(30,58,95,0.10)",
                cursor: placedChoice ? "pointer" : "default",
              }}
            >
              {placedChoice && (
                <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                  <SpeakerIcon color="white" size={52} />
                </motion.div>
              )}
            </div>
          ) : (
            /* Situation A: filled speaker box */
            <div style={{ ...boxBase, background: "white" }}>
              <SpeakerIcon color="#4ECDC4" size={52} />
            </div>
          )}
        </div>

        {/* Row 3: draggable choices */}
        <motion.div
          animate={wrongShake ? { x: [0, -10, 10, -8, 8, 0] } : { x: 0 }}
          transition={{ duration: 0.45 }}
          style={{ display: "flex", justifyContent: "center", gap: 18, marginTop: 8 }}
        >
          {choices.map((choice, idx) => {
            const isPlaced = placedIdx === idx;
            const isDraggingThis = dragState?.choiceIdx === idx;
            const speakerSet = SPEAKER_COLORS[idx % SPEAKER_COLORS.length];

            if (isPlaced) {
              return (
                <div key={idx} style={{ width: 104, height: 104, visibility: "hidden", flexShrink: 0 }} />
              );
            }

            return (
              <motion.div
                key={idx}
                animate={isDraggingThis ? { scale: 1.08, opacity: 0.3 } : { scale: 1, opacity: 1 }}
                onTouchStart={(e) => { e.stopPropagation(); handleTouchStart(e, idx); }}
                style={{
                  width: 104,
                  height: 104,
                  borderRadius: 28,
                  background: situation === 1 ? LETTER_COLORS[idx % LETTER_COLORS.length] : "white",
                  border: situation === 1 ? "3px solid rgba(255,255,255,0.7)" : `3px solid ${speakerSet.main}55`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "grab",
                  touchAction: "none",
                  userSelect: "none",
                  pointerEvents: isDraggingThis ? "none" : "auto",
                  boxShadow: situation === 1 ? "0 4px 16px rgba(0,0,0,0.12)" : `0 6px 20px ${speakerSet.shadow}`,
                  flexShrink: 0,
                }}
              >
                {situation === 1 ? (
                  <span style={{ fontSize: 52, fontWeight: 700, color: "#1E3A5F", fontFamily: "Fredoka, sans-serif", lineHeight: 1 }}>
                    {choice}
                  </span>
                ) : (
                  <SpeakerIcon color={speakerSet.main} size={48} />
                )}
              </motion.div>
            );
          })}
        </motion.div>
      </div>

      {/* Submit */}
      <div style={{ flexShrink: 0, display: "flex", justifyContent: "center", padding: "0 24px 20px" }}>
        <motion.button
          onClick={handleSubmit}
          whileTap={placedIdx !== null ? { scale: 0.95 } : {}}
          style={{
            background: placedIdx !== null ? "linear-gradient(135deg, #4ECDC4, #44A08D)" : "#D1D5DB",
            color: placedIdx !== null ? "white" : "#9CA3AF",
            border: "none",
            borderRadius: 999,
            padding: "16px 56px",
            fontSize: 22,
            fontWeight: 700,
            cursor: placedIdx !== null ? "pointer" : "not-allowed",
            fontFamily: "Fredoka, sans-serif",
            boxShadow: placedIdx !== null ? "0 8px 28px rgba(78,205,196,0.4)" : "none",
            transition: "background 0.2s, color 0.2s, box-shadow 0.2s",
            WebkitTapHighlightColor: "transparent",
          }}
        >
          submit ✓
        </motion.button>
      </div>

      {/* Safe area spacer */}
      <div style={{ flexShrink: 0, height: "calc(28px + env(safe-area-inset-bottom, 0px))" }} />

      {/* Drag ghost */}
      <AnimatePresence>
        {dragState && isDragging.current && (
          <div
            style={{
              position: "fixed",
              left: dragState.x,
              top: dragState.y,
              transform: "translate(-50%, -50%)",
              zIndex: 9999,
              pointerEvents: "none",
              width: 108,
              height: 108,
              borderRadius: 24,
              background: situation === 1 ? LETTER_COLORS[dragState.choiceIdx % LETTER_COLORS.length] : "white",
              border: situation === 1 ? "3px solid rgba(255,255,255,0.8)" : `3px solid ${SPEAKER_COLORS[dragState.choiceIdx % SPEAKER_COLORS.length].main}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 12px 36px rgba(0,0,0,0.25)",
            }}
          >
            {situation === 1 ? (
              <span style={{ fontSize: 56, fontWeight: 700, color: "#1E3A5F", fontFamily: "Fredoka, sans-serif", lineHeight: 1 }}>
                {choices[dragState.choiceIdx]}
              </span>
            ) : (
              <SpeakerIcon color={SPEAKER_COLORS[dragState.choiceIdx % SPEAKER_COLORS.length].main} size={52} />
            )}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}