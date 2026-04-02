import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const REPO = "Mr-Banjoko/learn-with-cody";
const SOURCE_BRANCH = "main";
const TARGET_BRANCH = "feature-missingSquareGame";

const FILES_TO_COPY = [
  "src/components/AppShell.jsx",
  "src/components/FlashcardScreen.jsx",
  "src/pages/LearnPhonics.jsx",
  "src/components/games/WordMatch.jsx",
  "src/pages/Games.jsx",
  "src/lib/content.js",
  "src/lib/shortAWords.js",
  "src/lib/shortEWords.js",
  "src/lib/shortIWords.js",
  "src/lib/shortOWords.js",
  "src/lib/shortUWords.js",
];

async function getFileSha(token, path, branch) {
  const res = await fetch(
    `https://api.github.com/repos/${REPO}/contents/${path}?ref=${branch}`,
    { headers: { Authorization: `Bearer ${token}`, Accept: "application/vnd.github+json" } }
  );
  if (!res.ok) return null;
  const data = await res.json();
  return data.sha || null;
}

async function getFileContent(token, path, branch) {
  const res = await fetch(
    `https://api.github.com/repos/${REPO}/contents/${path}?ref=${branch}`,
    { headers: { Authorization: `Bearer ${token}`, Accept: "application/vnd.github+json" } }
  );
  if (!res.ok) return null;
  const data = await res.json();
  return data.content ? data.content.replace(/\n/g, "") : null;
}

async function upsertFileBase64(token, path, base64Content, branch, sha) {
  const body = { message: `sync: update ${path} to ${branch}`, content: base64Content, branch };
  if (sha) body.sha = sha;
  const res = await fetch(`https://api.github.com/repos/${REPO}/contents/${path}`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}`, Accept: "application/vnd.github+json", "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`Failed to upsert ${path}: ${JSON.stringify(data)}`);
  return data;
}

async function upsertFileText(token, path, textContent, branch, sha) {
  const base64 = btoa(unescape(encodeURIComponent(textContent)));
  return upsertFileBase64(token, path, base64, branch, sha);
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== "admin") {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    const { accessToken } = await base44.asServiceRole.connectors.getConnection("github");

    // Get source branch SHA
    const branchRes = await fetch(
      `https://api.github.com/repos/${REPO}/git/ref/heads/${SOURCE_BRANCH}`,
      { headers: { Authorization: `Bearer ${accessToken}`, Accept: "application/vnd.github+json" } }
    );
    if (!branchRes.ok) throw new Error(`Could not get ${SOURCE_BRANCH} branch`);
    const branchData = await branchRes.json();
    const sourceSha = branchData.object.sha;

    // Create target branch if not exists
    const createRes = await fetch(`https://api.github.com/repos/${REPO}/git/refs`, {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}`, Accept: "application/vnd.github+json", "Content-Type": "application/json" },
      body: JSON.stringify({ ref: `refs/heads/${TARGET_BRANCH}`, sha: sourceSha }),
    });
    if (!createRes.ok && createRes.status !== 422) {
      const d = await createRes.json();
      throw new Error(`Failed to create branch: ${JSON.stringify(d)}`);
    }

    const results = [];

    // Copy files from source
    for (const path of FILES_TO_COPY) {
      const base64Content = await getFileContent(accessToken, path, SOURCE_BRANCH);
      if (!base64Content) { results.push({ path, status: "skipped (not found on source)" }); continue; }
      const targetSha = await getFileSha(accessToken, path, TARGET_BRANCH);
      await upsertFileBase64(accessToken, path, base64Content, TARGET_BRANCH, targetSha);
      results.push({ path, status: "copied" });
    }

    // Push useAudio
    const useAudioContent = `// v4: force audio/mpeg MIME type on blobs to fix iOS Safari decoder selection.
const CACHE_NAME = "cody-audio-v4";
const BLEND_GAP_MS = 200;
let currentAudio = null;
const resolvedBlobUrls = new Map();

async function getCachedAudioUrl(remoteUrl) {
  if (resolvedBlobUrls.has(remoteUrl)) return resolvedBlobUrls.get(remoteUrl);
  try {
    const cache = await caches.open(CACHE_NAME);
    let response = await cache.match(remoteUrl);
    if (!response) {
      const fetched = await fetch(remoteUrl);
      if (!fetched.ok) return remoteUrl;
      if (fetched.status === 200) await cache.put(remoteUrl, fetched.clone());
      response = fetched;
    }
    const arrayBuffer = await response.arrayBuffer();
    const blob = new Blob([arrayBuffer], { type: "audio/mpeg" });
    const blobUrl = URL.createObjectURL(blob);
    resolvedBlobUrls.set(remoteUrl, blobUrl);
    return blobUrl;
  } catch { return remoteUrl; }
}

export async function warmupAudio(urls) {
  for (const url of urls) {
    if (!resolvedBlobUrls.has(url)) getCachedAudioUrl(url).catch(() => {});
  }
}

export async function playAudio(remoteUrl, gain = 1) {
  if (!remoteUrl) return;
  if (currentAudio) { currentAudio.pause(); currentAudio.currentTime = 0; currentAudio = null; }
  const src = await getCachedAudioUrl(remoteUrl);
  const audio = new Audio();
  audio.preload = "auto";
  audio.playbackRate = 1.0;
  audio.volume = Math.min(1, Math.max(0, gain));
  audio.src = src;
  currentAudio = audio;
  audio.onended = () => { if (currentAudio === audio) currentAudio = null; };
  audio.load();
  audio.play().catch(() => { if (currentAudio === audio) currentAudio = null; });
}

export function playAudioSequence(steps, onDone) {
  if (currentAudio) { currentAudio.pause(); currentAudio = null; }
  let cancelled = false;
  function playStep(i) {
    if (cancelled || i >= steps.length) { if (!cancelled) onDone && onDone(); return; }
    const { url, onStart, gain = 1 } = steps[i];
    onStart && onStart(i);
    getCachedAudioUrl(url).then((src) => {
      if (cancelled) return;
      const audio = new Audio();
      audio.preload = "auto"; audio.playbackRate = 1.0;
      audio.volume = Math.min(1, Math.max(0, gain));
      audio.src = src; currentAudio = audio;
      audio.onended = () => {
        if (currentAudio === audio) currentAudio = null;
        if (!cancelled) setTimeout(() => { if (!cancelled) playStep(i + 1); }, BLEND_GAP_MS);
      };
      audio.load();
      audio.play().catch(() => { if (currentAudio === audio) currentAudio = null; if (!cancelled) playStep(i + 1); });
    }).catch(() => { if (!cancelled) playStep(i + 1); });
  }
  playStep(0);
  return function cancel() { cancelled = true; if (currentAudio) { currentAudio.pause(); currentAudio = null; } };
}

export async function preloadAudio(urls) {
  try {
    const cache = await caches.open(CACHE_NAME);
    for (const url of urls) {
      const cached = await cache.match(url);
      if (!cached) fetch(url).then((res) => { if (res.ok && res.status === 200) cache.put(url, res); }).catch(() => {});
    }
  } catch {}
}
`;

    const missingSoundContent = `import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import MissingSoundGame from "./MissingSoundGame";
import { shortAWords } from "../../lib/shortAWords";

const VOWEL_GROUPS = [
  { id: "short-a", label: "Short a", emoji: "\\u{1F34E}", color: "#FF6B6B", bg: "#FFF0F0", words: shortAWords, available: true },
  { id: "short-e", label: "Short e", emoji: "\\u{1F95A}", color: "#FFD93D", bg: "#FFFDE7", words: null, available: false },
  { id: "short-i", label: "Short i", emoji: "\\u{1F41F}", color: "#6BCB77", bg: "#F0FFF4", words: null, available: false },
  { id: "short-o", label: "Short o", emoji: "\\u{1F419}", color: "#4D96FF", bg: "#EFF6FF", words: null, available: false },
  { id: "short-u", label: "Short u", emoji: "\\u2602\\uFE0F", color: "#C77DFF", bg: "#FAF0FF", words: null, available: false },
];

export default function MissingSound({ onBack }) {
  const [selected, setSelected] = useState(null);
  if (selected) {
    const group = VOWEL_GROUPS.find((g) => g.id === selected);
    return <MissingSoundGame words={group.words} title={group.label} color={group.color} onBack={() => setSelected(null)} />;
  }
  return (
    <div className="min-h-full pb-32" style={{ background: "#D6EEFF", fontFamily: "Fredoka, sans-serif" }}>
      <div style={{ background: "#A8D0E6", borderBottomLeftRadius: 28, borderBottomRightRadius: 28, padding: "16px 20px 22px", display: "flex", alignItems: "center", gap: 12 }}>
        <button onClick={onBack} style={{ width: 40, height: 40, borderRadius: 20, background: "rgba(255,255,255,0.7)", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
          <ArrowLeft size={22} color="#1E3A5F" />
        </button>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: "#1E3A5F" }}>Missing Sound \\u2753</h1>
          <p style={{ fontSize: 13, color: "#3A6080" }}>Pick a word group!</p>
        </div>
      </div>
      <div className="px-4 pt-6 flex flex-col gap-3">
        {VOWEL_GROUPS.map((group, i) => (
          <motion.button key={group.id} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.07 }} whileTap={group.available ? { scale: 0.97 } : {}} onClick={() => group.available && setSelected(group.id)}
            style={{ display: "flex", alignItems: "center", gap: 14, padding: "16px 18px", borderRadius: 20, background: group.available ? "white" : "rgba(255,255,255,0.55)", border: "2px solid " + (group.available ? group.color + "55" : "rgba(168,208,230,0.3)"), boxShadow: group.available ? "0 6px 24px " + group.color + "20" : "none", cursor: group.available ? "pointer" : "not-allowed", opacity: group.available ? 1 : 0.6, width: "100%", textAlign: "left" }}>
            <div style={{ width: 52, height: 52, borderRadius: 16, background: group.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, flexShrink: 0 }}>{group.emoji}</div>
            <div style={{ flex: 1 }}><p style={{ fontSize: 20, fontWeight: 700, color: "#1E3A5F" }}>{group.label}</p><p style={{ fontSize: 13, color: "#7BACC8" }}>{group.available ? "Tap to play!" : "Coming soon"}</p></div>
            {group.available ? (<div style={{ width: 32, height: 32, borderRadius: 16, background: group.color, display: "flex", alignItems: "center", justifyContent: "center" }}><span style={{ color: "white", fontSize: 18, lineHeight: 1 }}>\\u203a</span></div>) : (<span style={{ fontSize: 11, fontWeight: 600, color: "#7BACC8", background: "#EEF6FF", padding: "3px 10px", borderRadius: 99 }}>Soon</span>)}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
`;

    const missingSoundGameContent = `import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Play } from "lucide-react";
import { getLetterSoundUrl, getLetterGain } from "../../lib/letterSounds";
import { playAudio, playAudioSequence } from "../../lib/useAudio";

const ALL_LETTERS = "abcdefghijklmnoprstw".split("");
const LETTER_COLORS = ["#FFAFC5", "#A8D8EA", "#FFE57A", "#B5EAD7", "#FFDAC1", "#FFAFC5"];

function getDistractors(word) {
  const used = new Set(word.split(""));
  const pool = ALL_LETTERS.filter((l) => !used.has(l));
  return [...pool].sort(() => Math.random() - 0.5).slice(0, 2);
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}

function buildRound(card) {
  const letters = card.word.split("");
  const missingPos = Math.floor(Math.random() * 3);
  const correctLetter = letters[missingPos];
  const distractors = getDistractors(card.word);
  const options = shuffle([
    { id: "correct", letter: correctLetter, isCorrect: true },
    { id: "distractor-0", letter: distractors[0], isCorrect: false },
    { id: "distractor-1", letter: distractors[1], isCorrect: false },
  ]);
  return { card, letters, missingPos, options };
}

export default function MissingSoundGame({ words, title, color, onBack }) {
  const [roundIndex, setRoundIndex] = useState(0);
  const [round, setRound] = useState(() => buildRound(words[0]));
  const [placedOption, setPlacedOption] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [bouncingIndex, setBouncingIndex] = useState(null);
  const [dragState, setDragState] = useState(null);
  const dropZoneRef = useRef(null);
  const sequenceRef = useRef(null);
  const isDragging = useRef(false);
  const total = words.length;

  useEffect(() => {
    setRound(buildRound(words[roundIndex]));
    setPlacedOption(null); setFeedback(null); setBouncingIndex(null); setDragState(null);
    isDragging.current = false;
    if (sequenceRef.current) { sequenceRef.current(); sequenceRef.current = null; }
  }, [roundIndex]);

  const playCompletion = useCallback((card, letters) => {
    setFeedback("completing");
    const steps = letters.map((letter, i) => {
      const url = getLetterSoundUrl(letter);
      return url ? { url, gain: getLetterGain(letter), onStart: () => setBouncingIndex(i) } : null;
    }).filter(Boolean);
    if (card.audio) steps.push({ url: card.audio, onStart: () => setBouncingIndex(null) });
    const cancel = playAudioSequence(steps, () => {
      sequenceRef.current = null; setBouncingIndex(null);
      setRoundIndex((prev) => (prev + 1 < words.length ? prev + 1 : 0));
    });
    sequenceRef.current = cancel;
  }, [words]);

  const handleSubmit = useCallback(() => {
    if (!placedOption || feedback === "completing") return;
    if (placedOption.isCorrect) {
      playCompletion(round.card, round.letters);
    } else {
      setFeedback("wrong");
      setTimeout(() => { setPlacedOption(null); setFeedback(null); }, 700);
    }
  }, [placedOption, feedback, round, playCompletion]);

  const handleTouchStart = useCallback((e, option) => {
    if (placedOption && placedOption.id === option.id) return;
    isDragging.current = false;
    const touch = e.touches[0];
    const rect = e.currentTarget.getBoundingClientRect();
    const cx = rect.left + rect.width / 2; const cy = rect.top + rect.height / 2;
    setDragState({ id: option.id, letter: option.letter, isCorrect: option.isCorrect, optionIndex: round.options.findIndex((o) => o.id === option.id), x: cx, y: cy, startX: touch.clientX, startY: touch.clientY, originX: cx, originY: cy });
  }, [placedOption, round]);

  const handleTouchMove = useCallback((e) => {
    if (!dragState) return; e.preventDefault();
    const touch = e.touches[0];
    const dx = touch.clientX - dragState.startX; const dy = touch.clientY - dragState.startY;
    if (!isDragging.current && (Math.abs(dx) > 5 || Math.abs(dy) > 5)) isDragging.current = true;
    setDragState((prev) => prev ? { ...prev, x: prev.originX + dx, y: prev.originY + dy } : null);
  }, [dragState]);

  const handleTouchEnd = useCallback((e) => {
    if (!dragState) return;
    if (!isDragging.current) { setDragState(null); return; }
    const touch = e.changedTouches[0];
    let hitDrop = false;
    if (dropZoneRef.current && !placedOption) {
      const rect = dropZoneRef.current.getBoundingClientRect();
      hitDrop = touch.clientX >= rect.left && touch.clientX <= rect.right && touch.clientY >= rect.top && touch.clientY <= rect.bottom;
    }
    if (hitDrop) setPlacedOption({ id: dragState.id, letter: dragState.letter, isCorrect: dragState.isCorrect, optionIndex: dragState.optionIndex });
    setDragState(null); isDragging.current = false;
  }, [dragState, placedOption]);

  const handleTopLetterTap = useCallback((letter) => {
    const url = getLetterSoundUrl(letter);
    if (url) playAudio(url, getLetterGain(letter));
  }, []);

  const card = round.card;
  const canSubmit = placedOption && feedback !== "completing";

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", flex: 1, background: "#D6EEFF", fontFamily: "Fredoka, sans-serif", overflow: "hidden", touchAction: "none", userSelect: "none" }}
      onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}>
      <div style={{ background: "#A8D0E6", borderBottomLeftRadius: 28, borderBottomRightRadius: 28, padding: "14px 20px 18px", display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
        <button onClick={onBack} style={{ width: 40, height: 40, borderRadius: 20, background: "rgba(255,255,255,0.7)", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
          <ArrowLeft size={22} color="#1E3A5F" />
        </button>
        <div style={{ flex: 1, textAlign: "center", marginRight: 40 }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "#1E3A5F" }}>Missing Sound \\u2753</h1>
          <p style={{ fontSize: 13, color: "#3A6080" }}>{title} \\u00b7 {roundIndex + 1} / {total}</p>
        </div>
      </div>
      <div style={{ height: 6, background: "rgba(255,255,255,0.5)", margin: "0 24px", borderRadius: 99, flexShrink: 0 }}>
        <div style={{ height: "100%", borderRadius: 99, background: color || "#4A90C4", width: ((roundIndex / total) * 100) + "%", transition: "width 0.4s" }} />
      </div>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-evenly", padding: "12px 20px 16px", minHeight: 0 }}>
        <div style={{ display: "flex", gap: 16, alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          {round.letters.map((letter, i) => {
            const isMissing = i === round.missingPos;
            const isPlacedHere = isMissing && placedOption !== null;
            const isBouncing = bouncingIndex === i;
            const isWrong = isMissing && feedback === "wrong";
            const boxColor = LETTER_COLORS[i];
            return (
              <motion.div key={i} ref={isMissing ? dropZoneRef : null}
                animate={isWrong ? { x: [0, -8, 8, -6, 6, 0] } : isBouncing ? { y: [0, -18, 0, -8, 0, -4, 0] } : {}}
                transition={{ duration: isWrong ? 0.35 : 0.5 }}
                onClick={!isMissing ? () => handleTopLetterTap(letter) : undefined}
                style={{ width: "min(96px, 25vw)", height: "min(96px, 25vw)", borderRadius: 24, background: isPlacedHere ? LETTER_COLORS[placedOption.optionIndex % LETTER_COLORS.length] : isMissing ? "rgba(255,255,255,0.45)" : boxColor, border: isMissing && !isPlacedHere ? "3px dashed rgba(74,144,196,0.5)" : "3px solid rgba(255,255,255,0.75)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: isMissing && !isPlacedHere ? "none" : "0 6px 24px rgba(0,0,0,0.10)", cursor: isMissing ? "default" : "pointer", touchAction: isMissing ? "auto" : "manipulation", transition: "background 0.2s, border 0.2s" }}>
                {isPlacedHere ? (
                  <motion.span initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ fontSize: "min(52px, 13vw)", fontWeight: 700, color: "#1E3A5F" }}>{placedOption.letter}</motion.span>
                ) : isMissing ? (
                  <span style={{ fontSize: "min(32px, 8vw)", color: "rgba(74,144,196,0.4)", fontWeight: 700 }}>?</span>
                ) : (
                  <span style={{ fontSize: "min(52px, 13vw)", fontWeight: 700, color: "#1E3A5F" }}>{letter}</span>
                )}
              </motion.div>
            );
          })}
        </div>
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => card.audio && playAudio(card.audio)}
          style={{ width: "min(72px, 18vw)", height: "min(72px, 18vw)", borderRadius: "50%", background: color || "#4A90C4", border: "none", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 6px 28px " + (color || "#4A90C4") + "55", cursor: "pointer", flexShrink: 0, touchAction: "manipulation" }}>
          <Play size={28} color="white" fill="white" />
        </motion.button>
        <div style={{ display: "flex", gap: 16, justifyContent: "center", flexShrink: 0 }}>
          {round.options.map((option, i) => {
            const isPlaced = placedOption && placedOption.id === option.id;
            const isDraggingThis = dragState && dragState.id === option.id;
            const bgColor = LETTER_COLORS[i % LETTER_COLORS.length];
            if (isPlaced) return <div key={option.id} style={{ width: "min(86px, 21vw)", height: "min(86px, 21vw)", visibility: "hidden", flexShrink: 0 }} />;
            return (
              <motion.div key={option.id} animate={isDraggingThis ? { scale: 1.08 } : { scale: 1, opacity: 1 }}
                onTouchStart={(e) => { e.stopPropagation(); handleTouchStart(e, option); }}
                style={{ width: "min(86px, 21vw)", height: "min(86px, 21vw)", borderRadius: 22, background: bgColor, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "min(46px, 11.5vw)", fontWeight: 700, color: "#1E3A5F", boxShadow: "0 4px 14px rgba(0,0,0,0.10)", border: "3px solid rgba(255,255,255,0.7)", cursor: "grab", touchAction: "none", userSelect: "none", pointerEvents: isDraggingThis ? "none" : "auto", opacity: isDraggingThis ? 0.3 : 1 }}>
                {option.letter}
              </motion.div>
            );
          })}
        </div>
        <motion.button whileTap={canSubmit ? { scale: 0.95 } : {}} onClick={handleSubmit}
          style={{ padding: "15px 52px", borderRadius: 99, border: "none", background: canSubmit ? (color || "#4A90C4") : "rgba(168,208,230,0.4)", color: canSubmit ? "white" : "rgba(74,144,196,0.45)", fontSize: 20, fontWeight: 700, boxShadow: canSubmit ? "0 6px 24px " + (color || "#4A90C4") + "50" : "none", cursor: canSubmit ? "pointer" : "not-allowed", transition: "all 0.25s", flexShrink: 0, touchAction: "manipulation" }}>
          {feedback === "wrong" ? "Try Again! \\u{1F504}" : feedback === "completing" ? "\\u{1F389} Great!" : "Submit \\u2713"}
        </motion.button>
      </div>
      <AnimatePresence>
        {dragState && isDragging.current && (
          <div style={{ position: "fixed", left: dragState.x, top: dragState.y, transform: "translate(-50%, -50%)", zIndex: 9999, pointerEvents: "none", width: "min(92px, 23vw)", height: "min(92px, 23vw)", borderRadius: 22, background: LETTER_COLORS[dragState.optionIndex % LETTER_COLORS.length], display: "flex", alignItems: "center", justifyContent: "center", fontSize: "min(50px, 12.5vw)", fontWeight: 700, color: "#1E3A5F", boxShadow: "0 12px 36px rgba(0,0,0,0.25)", border: "3px solid rgba(255,255,255,0.8)" }}>
            {dragState.letter}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
`;

    const gamesPageContent = `import { useState } from "react";
import { motion } from "framer-motion";
import { games } from "../lib/content";
import { Lock } from "lucide-react";
import PicSliceGame from "./PicSliceGame";
import WordMatch from "../components/games/WordMatch";
import DragTheLetters from "../components/games/DragTheLetters";
import MissingSound from "../components/games/MissingSound";

const CODY_IMG = "https://media.base44.com/images/public/69c4ec00726384fdef1ab181/6b8f13599_cody.png";
const gameColors = ["#FF6B6B", "#4D96FF", "#6BCB77", "#FFD93D", "#C77DFF"];
const gameBgs = ["#FFF0F0", "#EFF6FF", "#F0FFF4"];

export default function Games({ onDeepScreen }) {
  const [activeGame, setActiveGame] = useState(null);
  const enterGame = (id) => { setActiveGame(id); onDeepScreen && onDeepScreen(true); };
  const exitGame = () => { setActiveGame(null); onDeepScreen && onDeepScreen(false); };
  if (activeGame === "pic-slice") return <PicSliceGame onBack={exitGame} />;
  if (activeGame === "word-match") return <WordMatch onBack={exitGame} />;
  if (activeGame === "drag-letters") return <DragTheLetters onBack={exitGame} />;
  if (activeGame === "missing-sound") return <MissingSound onBack={exitGame} />;
  return (
    <div className="min-h-full pb-32 pt-4" style={{ fontFamily: "Fredoka, sans-serif" }}>
      <div className="px-4 mb-6 flex items-center gap-3">
        <img src={CODY_IMG} alt="Cody" style={{ width: 56, height: 62, objectFit: "contain" }} />
        <div>
          <h1 className="text-2xl font-semibold" style={{ color: "#1E293B" }}>Games</h1>
          <p className="text-sm" style={{ color: "#64748B" }}>Fun ways to practice!</p>
        </div>
      </div>
      <div className="px-4 flex flex-col gap-4">
        {games.map((game, i) => {
          const isPlayable = game.available === true;
          return (
            <motion.div key={game.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              onClick={() => isPlayable && enterGame(game.id)}
              className="relative rounded-3xl overflow-hidden p-5"
              style={{ background: gameBgs[i % gameBgs.length], border: "2px solid " + gameColors[i % gameColors.length] + "25", boxShadow: "0 8px 32px " + gameColors[i % gameColors.length] + "15", cursor: isPlayable ? "pointer" : "default" }}>
              {!isPlayable && (<div className="absolute inset-0 flex items-center justify-end p-5" style={{ pointerEvents: "none" }}><div className="rounded-full p-2" style={{ background: gameColors[i % gameColors.length] + "18" }}><Lock size={20} style={{ color: gameColors[i % gameColors.length], opacity: 0.5 }} /></div></div>)}
              <div className="flex items-center gap-4">
                <div className="rounded-2xl text-3xl flex items-center justify-center" style={{ width: 64, height: 64, background: "white", boxShadow: "0 4px 16px " + gameColors[i % gameColors.length] + "25", flexShrink: 0 }}>{game.emoji}</div>
                <div>
                  <h3 className="text-xl font-semibold" style={{ color: "#1E293B" }}>{game.label}</h3>
                  <p className="text-sm" style={{ color: "#64748B", marginTop: 2 }}>{game.description}</p>
                  <div className="inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold" style={{ background: gameColors[i % gameColors.length] + "18", color: gameColors[i % gameColors.length] }}>
                    {isPlayable ? "Play Now! \\u{1F3AE}" : "Coming Soon \\u2728"}
                  </div>
                </div>
              </div>
              <div className="absolute top-3 right-12 text-lg opacity-30">\\u2728</div>
            </motion.div>
          );
        })}
      </div>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="px-4 mt-8 flex flex-col items-center gap-2 text-center">
        <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 2, repeat: Infinity }} style={{ fontSize: 36 }}>\\u{1F3AE}</motion.div>
        <p className="text-base font-semibold" style={{ color: "#4ECDC4" }}>More games coming soon!</p>
        <p className="text-sm" style={{ color: "#94A3B8" }}>Cody is working hard to bring you more fun activities!</p>
      </motion.div>
    </div>
  );
}
`;

    const contentJs = `// Content manifest — vowel-group-ready, scalable structure
export const lessonContent = {
  vowelGroups: [
    { id: "short-a", label: "Short A", emoji: "\\u{1F34E}", color: "#FF6B6B", available: false, words: [] },
    { id: "short-e", label: "Short E", emoji: "\\u{1F95A}", color: "#FFD93D", available: false, words: [] },
    { id: "short-i", label: "Short I", emoji: "\\u{1F41B}", color: "#6BCB77", available: false, words: [] },
    { id: "short-o", label: "Short O", emoji: "\\u{1F419}", color: "#4D96FF", available: false, words: [] },
    { id: "short-u", label: "Short U", emoji: "\\u2602\\uFE0F", color: "#C77DFF", available: false, words: [] },
  ],
};

export const activityTypes = [
  { id: "tap-sounds", label: "Tap Sounds", emoji: "\\u{1F50A}", description: "Tap each letter and hear its sound", color: "#4ECDC4", bgColor: "#E8FFFE", available: true },
  { id: "blend-listen", label: "Blend & Listen", emoji: "\\u{1F517}", description: "Listen as sounds blend into a word", color: "#FFD93D", bgColor: "#FFFDE7", available: true },
  { id: "choose-picture", label: "Choose Picture", emoji: "\\u{1F5BC}\\uFE0F", description: "Hear a word and tap the right picture", color: "#6BCB77", bgColor: "#F0FFF4", available: true },
  { id: "drag-letters", label: "Drag Letters", emoji: "\\u270B", description: "Drag letters to build the word", color: "#4D96FF", bgColor: "#EFF6FF", available: true },
  { id: "spell-word", label: "Spell the Word", emoji: "\\u270F\\uFE0F", description: "See a picture and spell the word", color: "#C77DFF", bgColor: "#FAF0FF", available: true },
];

export const games = [
  { id: "pic-slice", label: "Rearrange the Pictures", emoji: "\\u{1F5BC}\\uFE0F", description: "Drag picture pieces into the right order", available: true },
  { id: "word-match", label: "Word Match", emoji: "\\u{1F3AF}", description: "Match the word to the picture", available: true },
  { id: "drag-letters", label: "Drag the Letters", emoji: "\\u270B", description: "Drag letters into the right boxes to spell the word", available: true },
  { id: "missing-sound", label: "Missing Sound", emoji: "\\u2753", description: "Find the missing letter to complete the word", available: true },
  { id: "letter-catch", label: "Letter Catch", emoji: "\\u{1F9E9}", description: "Catch the right letters to make a word", available: false },
  { id: "sound-safari", label: "Sound Safari", emoji: "\\u{1F981}", description: "Find animals whose names start with the sound", available: false },
];
`;

    const newFileContents = {
      "src/lib/useAudio.js": useAudioContent,
      "src/lib/content.js": contentJs,
      "src/pages/Games.jsx": gamesPageContent,
      "src/components/games/MissingSound.jsx": missingSoundContent,
      "src/components/games/MissingSoundGame.jsx": missingSoundGameContent,
    };

    for (const [path, content] of Object.entries(newFileContents)) {
      const existingSha = await getFileSha(accessToken, path, TARGET_BRANCH);
      await upsertFileText(accessToken, path, content, TARGET_BRANCH, existingSha);
      results.push({ path, status: "new/updated" });
    }

    return Response.json({ success: true, branch: TARGET_BRANCH, filesUpdated: results.length, files: results });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});