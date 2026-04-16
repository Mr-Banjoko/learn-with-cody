import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { shortAWords } from "../../lib/shortAWords";
import FlashcardScreen from "../FlashcardScreen";
import DragTheLettersGame from "../games/DragTheLettersGame";
import LevelCelebration from "./LevelCelebration";

// The 5 Level 1 words in exact fixed order
const LEVEL1_WORDS = shortAWords.slice(0, 5); // cat, dad, rat, hat, bat

// Build the 10-round sequence: Learn → Drag for each word
// round.type: "learn" | "drag"
// round.wordIndex: 0–4
function buildRounds() {
  const rounds = [];
  for (let i = 0; i < LEVEL1_WORDS.length; i++) {
    rounds.push({ type: "learn", wordIndex: i });
    rounds.push({ type: "drag",  wordIndex: i });
  }
  return rounds;
}

const ROUNDS = buildRounds(); // 10 rounds total

export default function CampaignLevel1({ onBack, lang = "en" }) {
  const [roundIdx, setRoundIdx] = useState(0);
  const [done, setDone] = useState(false);

  const round = ROUNDS[roundIdx];
  const word = LEVEL1_WORDS[round.wordIndex];

  // Progress: how many rounds completed out of 10
  const progressPct = (roundIdx / ROUNDS.length) * 100;

  const advanceRound = useCallback(() => {
    const next = roundIdx + 1;
    if (next >= ROUNDS.length) {
      // Mark level 1 complete
      localStorage.setItem("campaign_short_a_level1_done", "true");
      setDone(true);
    } else {
      setRoundIdx(next);
    }
  }, [roundIdx]);

  if (done) {
    return <LevelCelebration onBack={onBack} lang={lang} />;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
      {/* Thin progress bar at the very top */}
      <div style={{
        height: 6,
        background: "rgba(168,208,230,0.35)",
        flexShrink: 0,
        position: "relative",
        zIndex: 20,
      }}>
        <motion.div
          animate={{ width: `${progressPct}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          style={{
            height: "100%",
            background: "linear-gradient(90deg, #4ECDC4, #4D96FF)",
            borderRadius: 99,
          }}
        />
      </div>

      {/* Round indicator dots */}
      <div style={{
        flexShrink: 0,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: 6,
        padding: "6px 0 2px",
        background: "#D6EEFF",
        zIndex: 10,
      }}>
        {ROUNDS.map((r, i) => (
          <div
            key={i}
            style={{
              width: r.type === "drag" ? 6 : 10,
              height: r.type === "drag" ? 6 : 10,
              borderRadius: "50%",
              background: i < roundIdx
                ? "#4ECDC4"
                : i === roundIdx
                ? "#4D96FF"
                : "rgba(168,208,230,0.4)",
              transition: "background 0.3s, transform 0.3s",
              transform: i === roundIdx ? "scale(1.3)" : "scale(1)",
            }}
          />
        ))}
      </div>

      {/* Activity area */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`round-${roundIdx}`}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -40 }}
          transition={{ duration: 0.22, ease: "easeInOut" }}
          style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0, overflow: "hidden" }}
        >
          {round.type === "learn" ? (
            <LearnPhonicsStep
              key={`learn-${round.wordIndex}`}
              word={word}
              lang={lang}
              onBack={onBack}
              onNext={advanceRound}
            />
          ) : (
            <DragStep
              key={`drag-${round.wordIndex}`}
              word={word}
              lang={lang}
              onBack={onBack}
              onComplete={advanceRound}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// ─── Learn Phonics Step ───────────────────────────────────────────────────────
// Wraps FlashcardScreen for a single word, with a "Next →" button
import { Camera, Check, BookImage } from "lucide-react";
import BackArrow from "../BackArrow";
import html2canvas from "html2canvas";
import { getLetterSoundUrl, getLetterGain } from "../../lib/letterSounds";
import RainbowLetterBlock from "../RainbowLetterBlock";
import { playAudio, preloadAudio, playAudioSequence, warmupAudio } from "../../lib/useAudio";

const LETTER_COLORS_FC = ["#FFAFC5", "#A8D8EA", "#FFE57A", "#B5EAD7", "#FFDAC1"];

function LearnPhonicsStep({ word, lang, onBack, onNext }) {
  const [activeLetterIndex, setActiveLetterIndex] = useState(null);
  const sequenceRef = useRef(null);
  const activeTimerRef = useRef(null);
  const captureRef = useRef(null);
  const fileInputRef = useRef(null);
  const [customImage, setCustomImage] = useState(null);
  const [justSaved, setJustSaved] = useState(false);

  useEffect(() => {
    // Preload word audio
    if (word.audio) preloadAudio([word.audio]);
    const letters = [...new Set(word.word.split(""))];
    const letterUrls = letters.map(getLetterSoundUrl).filter(Boolean);
    if (letterUrls.length > 0) warmupAudio(letterUrls);
  }, [word]);

  const cancelSequence = useCallback(() => {
    if (sequenceRef.current) { sequenceRef.current(); sequenceRef.current = null; }
    if (activeTimerRef.current) { clearTimeout(activeTimerRef.current); activeTimerRef.current = null; }
  }, []);

  const handleLetterTap = useCallback((letter, i) => {
    cancelSequence();
    const url = getLetterSoundUrl(letter);
    if (!url) return;
    setActiveLetterIndex(i);
    playAudio(url, getLetterGain(letter));
    activeTimerRef.current = setTimeout(() => setActiveLetterIndex(null), 900);
  }, [cancelSequence]);

  const handlePlaySequence = useCallback(() => {
    cancelSequence();
    setActiveLetterIndex(null);
    const letters = word.word.split("");
    const steps = letters.map((letter, i) => {
      const url = getLetterSoundUrl(letter);
      if (!url) return null;
      return { url, gain: getLetterGain(letter), onStart: () => setActiveLetterIndex(i) };
    }).filter(Boolean);
    if (word.audio) steps.push({ url: word.audio, onStart: () => setActiveLetterIndex(null) });
    const cancel = playAudioSequence(steps, () => { setActiveLetterIndex(null); sequenceRef.current = null; });
    sequenceRef.current = cancel;
  }, [word, cancelSequence]);

  const handleCamera = () => fileInputRef.current.click();
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setCustomImage(ev.target.result);
    reader.readAsDataURL(file);
    e.target.value = "";
  };
  const handleSave = async () => {
    if (!captureRef.current) return;
    const canvas = await html2canvas(captureRef.current, { scale: 2, useCORS: true, allowTaint: true, backgroundColor: "#D6EEFF" });
    const dataUrl = canvas.toDataURL("image/png");
    const album = JSON.parse(localStorage.getItem("cody_album") || "[]");
    album.push({ id: Date.now(), word: word.word, snapshot: dataUrl, date: new Date().toLocaleDateString() });
    localStorage.setItem("cody_album", JSON.stringify(album));
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 2000);
  };

  const currentImage = customImage || word.image;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", flex: 1, background: "#D6EEFF", fontFamily: "Fredoka, sans-serif", overflow: "hidden" }}>
      {/* Header */}
      <div style={{ background: "#A8D0E6", borderBottomLeftRadius: 28, borderBottomRightRadius: 28, padding: "10px 20px 14px", display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
        <BackArrow onPress={onBack} />
        <h1 style={{ flex: 1, textAlign: "center", fontSize: 24, fontWeight: 700, color: "#1E3A5F", marginRight: 40 }}>
          {lang === "zh" ? "短元音 A" : "Short A"} 🍎
        </h1>
      </div>

      {/* Card area */}
      <div ref={captureRef} style={{ flex: 1, background: "#D6EEFF", padding: "20px 24px 16px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 20, position: "relative" }}>
        <div className="relative flex items-center justify-center" style={{ width: "100%", maxWidth: 340 }}>
          <div style={{ position: "absolute", top: -20, right: -10, width: 160, height: 140, borderRadius: 40, background: "#FFCDD2", zIndex: 0, transform: "rotate(8deg)" }} />
          <div style={{ position: "absolute", bottom: -20, left: -10, width: 140, height: 140, borderRadius: "50%", background: "#FFF59D", zIndex: 0 }} />
          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.22 }}
            style={{ position: "relative", zIndex: 1, background: "white", borderRadius: 28, padding: 14, boxShadow: "0 12px 48px rgba(30,58,95,0.15)", width: "100%" }}
          >
            <img
              src={currentImage}
              alt={word.word}
              onPointerDown={(e) => { e.preventDefault(); word.audio && playAudio(word.audio); }}
              style={{ width: "100%", aspectRatio: "1/1", objectFit: "cover", borderRadius: 18, display: "block", cursor: word.audio ? "pointer" : "default" }}
            />
            <button onClick={handleCamera} style={{ position: "absolute", bottom: 18, right: 18, width: 48, height: 48, borderRadius: 24, background: "white", boxShadow: "0 4px 16px rgba(0,0,0,0.18)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2 }}>
              <Camera size={24} color="#A8D0E6" strokeWidth={2.2} />
            </button>
          </motion.div>
        </div>

        <AnimatePresence>
          {customImage && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={handleSave}
              style={{ position: "absolute", top: 18, left: 18, width: 48, height: 48, borderRadius: 24, background: justSaved ? "#4ECDC4" : "#5B8DEF", color: "white", border: "none", cursor: "pointer", boxShadow: "0 4px 16px rgba(91,141,239,0.40)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 3, transition: "background 0.3s", touchAction: "manipulation" }}>
              {justSaved ? <Check size={22} /> : <BookImage size={22} />}
            </motion.button>
          )}
        </AnimatePresence>

        {/* Letter blocks with sound */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, zIndex: 1 }}>
          {word.word.split("").map((letter, i) => (
            <RainbowLetterBlock
              key={i}
              letter={letter}
              index={i}
              isActive={activeLetterIndex === i}
              onClick={() => handleLetterTap(letter, i)}
            />
          ))}
          <button
            onClick={handlePlaySequence}
            style={{ width: 56, height: 56, borderRadius: 28, background: "#FFD93D", border: "3px solid #F4B942", boxShadow: "0 4px 16px rgba(255,193,7,0.45)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0, marginLeft: 6, transition: "transform 0.12s" }}
            onTouchStart={e => e.currentTarget.style.transform = "scale(0.92)"}
            onTouchEnd={e => e.currentTarget.style.transform = "scale(1)"}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="#1E3A5F"><polygon points="5,3 19,12 5,21" /></svg>
          </button>
        </div>
      </div>

      {/* Next button */}
      <div style={{ flexShrink: 0, display: "flex", justifyContent: "flex-end", padding: "12px 28px", paddingBottom: "calc(12px + env(safe-area-inset-bottom, 8px))" }}>
        <motion.button
          whileTap={{ scale: 0.94 }}
          onClick={onNext}
          style={{ padding: "14px 36px", borderRadius: 999, background: "#4A90C4", color: "white", border: "none", cursor: "pointer", fontSize: 18, fontWeight: 600, fontFamily: "Fredoka, sans-serif", boxShadow: "0 4px 16px rgba(74,144,196,0.4)", touchAction: "manipulation" }}
        >
          {lang === "zh" ? "下一个 →" : "Next →"}
        </motion.button>
      </div>

      <input ref={fileInputRef} type="file" accept="image/*" capture="environment" style={{ display: "none" }} onChange={handleFileChange} />
    </div>
  );
}

// ─── Drag the Letters Step ────────────────────────────────────────────────────
// Wraps DragTheLettersGame for a single word; fires onComplete when done

const LETTER_COLORS_DG = ["#FFAFC5", "#A8D8EA", "#FFE57A", "#B5EAD7", "#FFDAC1", "#FFAFC5"];

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const ALL_LETTERS = "abcdefghijklmnoprstw".split("");

function getDistractor(word) {
  const used = new Set(word.split(""));
  const pool = ALL_LETTERS.filter((l) => !used.has(l));
  return pool[Math.floor(Math.random() * pool.length)];
}

function buildDragRound(card) {
  const letters = card.word.split("");
  const distractor = getDistractor(card.word);
  const options = shuffle([
    ...letters.map((l, i) => ({ id: `correct-${i}`, letter: l, correctPos: i })),
    { id: "distractor", letter: distractor, correctPos: -1 },
  ]);
  return { card, letters, options };
}

function DragStep({ word, lang, onBack, onComplete }) {
  const [round] = useState(() => buildDragRound(word));
  const [placed, setPlaced] = useState([null, null, null]);
  const [placedColors, setPlacedColors] = useState({});
  const [shake, setShake] = useState(null);
  const [completing, setCompleting] = useState(false);
  const [bouncingIndex, setBouncingIndex] = useState(null);
  const [dragState, setDragState] = useState(null);
  const dropZoneRefs = useRef([]);
  const sequenceRef = useRef(null);
  const isDragging = useRef(false);

  const playCompletion = useCallback(() => {
    setCompleting(true);
    const letterSteps = round.letters.map((letter, i) => {
      const url = getLetterSoundUrl(letter);
      return url ? { url, gain: getLetterGain(letter), onStart: () => setBouncingIndex(i) } : null;
    }).filter(Boolean);
    const wordStep = round.card.audio ? [{ url: round.card.audio, onStart: () => setBouncingIndex(null) }] : [];
    const steps = [...letterSteps, ...wordStep];
    const cancel = playAudioSequence(steps, () => {
      sequenceRef.current = null;
      setBouncingIndex(null);
      // Auto-advance to next round
      setTimeout(onComplete, 300);
    });
    sequenceRef.current = cancel;
  }, [round, onComplete]);

  const handleTouchStart = useCallback((e, option) => {
    if (placed.includes(option.id)) return;
    isDragging.current = false;
    const touch = e.touches[0];
    const rect = e.currentTarget.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    setDragState({ id: option.id, letter: option.letter, correctPos: option.correctPos, x: cx, y: cy, startX: touch.clientX, startY: touch.clientY, originX: cx, originY: cy });
  }, [placed]);

  const handleTouchMove = useCallback((e) => {
    if (!dragState) return;
    e.preventDefault();
    const touch = e.touches[0];
    const dx = touch.clientX - dragState.startX;
    const dy = touch.clientY - dragState.startY;
    if (!isDragging.current && (Math.abs(dx) > 5 || Math.abs(dy) > 5)) isDragging.current = true;
    setDragState((prev) => prev ? { ...prev, x: prev.originX + dx, y: prev.originY + dy } : null);
  }, [dragState]);

  const handleTouchEnd = useCallback((e) => {
    if (!dragState) return;
    if (!isDragging.current) {
      const url = getLetterSoundUrl(dragState.letter);
      if (url) playAudio(url, getLetterGain(dragState.letter));
      setDragState(null);
      return;
    }
    const touch = e.changedTouches[0];
    let hitBox = -1;
    dropZoneRefs.current.forEach((ref, i) => {
      if (!ref) return;
      const rect = ref.getBoundingClientRect();
      if (touch.clientX >= rect.left && touch.clientX <= rect.right && touch.clientY >= rect.top && touch.clientY <= rect.bottom) hitBox = i;
    });
    if (hitBox !== -1 && placed[hitBox] === null && dragState.correctPos === hitBox) {
      const optIdx = round.options.findIndex((o) => o.id === dragState.id);
      const tileColor = LETTER_COLORS_DG[optIdx % LETTER_COLORS_DG.length];
      const newPlaced = [...placed];
      newPlaced[hitBox] = dragState.id;
      setPlacedColors((prev) => ({ ...prev, [hitBox]: tileColor }));
      setPlaced(newPlaced);
      setDragState(null);
      isDragging.current = false;
      if (newPlaced.every((p) => p !== null)) setTimeout(playCompletion, 300);
    } else {
      if (hitBox !== -1) setShake(hitBox);
      setTimeout(() => setShake(null), 500);
      setDragState(null);
      isDragging.current = false;
    }
  }, [dragState, placed, round, playCompletion]);

  const progress = placed.filter(Boolean).length;

  return (
    <div
      style={{ display: "flex", flexDirection: "column", height: "100%", flex: 1, background: "#D6EEFF", fontFamily: "Fredoka, sans-serif", overflow: "hidden", touchAction: "none", userSelect: "none" }}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Header */}
      <div style={{ background: "#A8D0E6", borderBottomLeftRadius: 28, borderBottomRightRadius: 28, padding: "10px 20px 14px", display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
        <BackArrow onPress={onBack} />
        <div style={{ flex: 1, textAlign: "center", marginRight: 40 }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "#1E3A5F" }}>{lang === "zh" ? "拖拽字母 ✋" : "Drag the Letters ✋"}</h1>
        </div>
      </div>

      {/* Main content */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-evenly", padding: "10px 20px 14px", minHeight: 0 }}>
        {/* Picture */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.25 }}
          onPointerDown={(e) => { e.preventDefault(); round.card.audio && playAudio(round.card.audio); }}
          style={{ background: "white", borderRadius: 28, padding: 10, boxShadow: "0 10px 40px rgba(30,58,95,0.15)", cursor: round.card.audio ? "pointer" : "default", touchAction: "manipulation", flexShrink: 0 }}
        >
          <img src={round.card.image} alt={round.card.word} style={{ width: "min(220px, 50vw)", height: "min(220px, 50vw)", objectFit: "cover", borderRadius: 20, display: "block" }} />
        </motion.div>

        {/* Drop boxes */}
        <div style={{ display: "flex", gap: 14, alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          {round.letters.map((_, i) => {
            const placedId = placed[i];
            const placedOption = placedId ? round.options.find((o) => o.id === placedId) : null;
            const isShaking = shake === i;
            const isBouncing = bouncingIndex === i;
            const tileColor = placedColors[i];
            return (
              <motion.div
                key={i}
                ref={(el) => (dropZoneRefs.current[i] = el)}
                animate={isShaking ? { x: [0, -8, 8, -6, 6, 0] } : isBouncing ? { y: [0, -16, 0, -8, 0, -4, 0] } : {}}
                transition={{ duration: isShaking ? 0.35 : 0.5 }}
                style={{ width: "min(76px, 20vw)", height: "min(76px, 20vw)", borderRadius: 18, background: tileColor || "rgba(255,255,255,0.7)", border: `3px solid ${tileColor ? "rgba(255,255,255,0.85)" : isShaking ? "#FF6B6B" : "rgba(74,144,196,0.4)"}`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: tileColor ? "0 4px 16px rgba(0,0,0,0.12)" : "inset 0 2px 8px rgba(0,0,0,0.06)", transition: "background 0.2s, border 0.2s" }}
              >
                {placedOption ? (
                  <motion.span initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ fontSize: "min(40px, 10vw)", fontWeight: 700, color: "#1E3A5F" }}>{placedOption.letter}</motion.span>
                ) : (
                  <span style={{ fontSize: "min(22px, 5vw)", color: "rgba(74,144,196,0.3)", fontWeight: 700 }}>{i + 1}</span>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Instruction */}
        <p style={{ fontSize: 15, color: "#4A90C4", fontWeight: 600, textAlign: "center", flexShrink: 0 }}>
          {completing ? (lang === "zh" ? "🎉 好极了！听一听……" : "🎉 Great job! Listen...") : progress === 0 ? (lang === "zh" ? "拖动字母来拼写单词！" : "Drag the letters to spell the word!") : (lang === "zh" ? `已放置 ${progress} 个，共 ${round.letters.length} 个` : `${progress} of ${round.letters.length} placed`)}
        </p>

        {/* Letter tiles */}
        <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap", flexShrink: 0, paddingBottom: 4 }}>
          {round.options.map((option, i) => {
            const isPlaced = placed.includes(option.id);
            const isDraggingThis = dragState?.id === option.id;
            const bgColor = LETTER_COLORS_DG[i % LETTER_COLORS_DG.length];
            if (isPlaced) return <div key={option.id} style={{ width: "min(74px, 18vw)", height: "min(74px, 18vw)", visibility: "hidden", flexShrink: 0 }} />;
            return (
              <motion.div
                key={option.id}
                animate={isDraggingThis ? { scale: 1.1 } : { scale: 1, opacity: 1 }}
                onTouchStart={(e) => { e.stopPropagation(); handleTouchStart(e, option); }}
                style={{ width: "min(74px, 18vw)", height: "min(74px, 18vw)", borderRadius: 18, background: bgColor, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "min(40px, 10vw)", fontWeight: 700, color: "#1E3A5F", boxShadow: "0 4px 12px rgba(0,0,0,0.10)", border: "3px solid rgba(255,255,255,0.7)", cursor: "grab", touchAction: "none", userSelect: "none", pointerEvents: isDraggingThis ? "none" : "auto", opacity: isDraggingThis ? 0.3 : 1 }}
              >
                {option.letter}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Dragging ghost */}
      <AnimatePresence>
        {dragState && isDragging.current && (
          <div style={{ position: "fixed", left: dragState.x, top: dragState.y, transform: "translate(-50%, -50%)", zIndex: 9999, pointerEvents: "none", width: "min(80px, 20vw)", height: "min(80px, 20vw)", borderRadius: 18, background: LETTER_COLORS_DG[round.options.findIndex((o) => o.id === dragState.id) % LETTER_COLORS_DG.length], display: "flex", alignItems: "center", justifyContent: "center", fontSize: "min(44px, 11vw)", fontWeight: 700, color: "#1E3A5F", boxShadow: "0 12px 36px rgba(0,0,0,0.25)", border: "3px solid rgba(255,255,255,0.8)" }}>
            {dragState.letter}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}