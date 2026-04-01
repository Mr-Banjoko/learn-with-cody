import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const REPO = "Mr-Banjoko/learn-with-cody";
const SOURCE_BRANCH = "audio-feature";
const TARGET_BRANCH = "l-a-d-game";

// Files to copy from SOURCE_BRANCH to TARGET_BRANCH
const FILES_TO_COPY = [
  "src/components/AppShell.jsx",
  "src/components/FlashcardScreen.jsx",
  "src/pages/LearnPhonics.jsx",
  "src/components/games/WordMatch.jsx",
  "src/pages/Games.jsx",
  "src/lib/content.js",
];

// New files to add that don't exist on source branch yet
// These are fetched from base44 project files via raw content
const NEW_FILES = [
  "src/components/games/DragTheLetters.jsx",
  "src/components/games/DragTheLettersGame.jsx",
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
  return data.content ? data.content.replace(/\n/g, "") : null; // base64 content
}

async function upsertFileBase64(token, path, base64Content, branch, sha, message) {
  const body = {
    message: message || `sync: update ${path} to ${branch}`,
    content: base64Content,
    branch,
  };
  if (sha) body.sha = sha;
  const res = await fetch(`https://api.github.com/repos/${REPO}/contents/${path}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "Content-Type": "application/json",
    },
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

    // 1. Get source branch SHA to create/reset target branch
    const branchRes = await fetch(
      `https://api.github.com/repos/${REPO}/git/ref/heads/${SOURCE_BRANCH}`,
      { headers: { Authorization: `Bearer ${accessToken}`, Accept: "application/vnd.github+json" } }
    );
    if (!branchRes.ok) throw new Error(`Could not get ${SOURCE_BRANCH} branch`);
    const branchData = await branchRes.json();
    const sourceSha = branchData.object.sha;

    // 2. Create target branch if it doesn't exist (ignore 422 = already exists)
    const createRes = await fetch(`https://api.github.com/repos/${REPO}/git/refs`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/vnd.github+json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ref: `refs/heads/${TARGET_BRANCH}`, sha: sourceSha }),
    });
    if (!createRes.ok && createRes.status !== 422) {
      const d = await createRes.json();
      throw new Error(`Failed to create branch: ${JSON.stringify(d)}`);
    }

    const results = [];

    // 3. Copy files from source branch
    for (const path of FILES_TO_COPY) {
      const base64Content = await getFileContent(accessToken, path, SOURCE_BRANCH);
      if (!base64Content) {
        results.push({ path, status: "skipped (not found on source)" });
        continue;
      }
      const targetSha = await getFileSha(accessToken, path, TARGET_BRANCH);
      await upsertFileBase64(accessToken, path, base64Content, TARGET_BRANCH, targetSha);
      results.push({ path, status: "copied" });
    }

    // 4. Push new game files — fetch their raw content from the base44 app's source
    // Since these files were just created in the base44 project, we fetch them via
    // the GitHub API from the same repo if they already exist, otherwise we post placeholder.
    // The actual content is stored below as encoded strings.
    const dragTheLettersContent = `import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import DragTheLettersGame from "./DragTheLettersGame";
import { shortAWords } from "../../lib/shortAWords";

const VOWEL_GROUPS = [
  { id: "short-a", label: "Short a", emoji: "🍎", color: "#FF6B6B", bg: "#FFF0F0", words: shortAWords, available: true },
  { id: "short-e", label: "Short e", emoji: "🥚", color: "#FFD93D", bg: "#FFFDE7", words: null, available: false },
  { id: "short-i", label: "Short i", emoji: "🐟", color: "#6BCB77", bg: "#F0FFF4", words: null, available: false },
  { id: "short-o", label: "Short o", emoji: "🐙", color: "#4D96FF", bg: "#EFF6FF", words: null, available: false },
  { id: "short-u", label: "Short u", emoji: "☂️", color: "#C77DFF", bg: "#FAF0FF", words: null, available: false },
];

export default function DragTheLetters({ onBack }) {
  const [selected, setSelected] = useState(null);

  if (selected) {
    const group = VOWEL_GROUPS.find((g) => g.id === selected);
    return (
      <DragTheLettersGame
        words={group.words}
        title={group.label}
        color={group.color}
        onBack={() => setSelected(null)}
      />
    );
  }

  return (
    <div className="min-h-full pb-32" style={{ background: "#D6EEFF", fontFamily: "Fredoka, sans-serif" }}>
      <div style={{ background: "#A8D0E6", borderBottomLeftRadius: 28, borderBottomRightRadius: 28, padding: "16px 20px 22px", display: "flex", alignItems: "center", gap: 12 }}>
        <button onClick={onBack} style={{ width: 40, height: 40, borderRadius: 20, background: "rgba(255,255,255,0.7)", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
          <ArrowLeft size={22} color="#1E3A5F" />
        </button>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: "#1E3A5F" }}>Drag the Letters ✋</h1>
          <p style={{ fontSize: 13, color: "#3A6080" }}>Pick a word group!</p>
        </div>
      </div>
      <div className="px-4 pt-6 flex flex-col gap-3">
        {VOWEL_GROUPS.map((group, i) => (
          <motion.button
            key={group.id}
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.07 }}
            whileTap={group.available ? { scale: 0.97 } : {}}
            onClick={() => group.available && setSelected(group.id)}
            style={{ display: "flex", alignItems: "center", gap: 14, padding: "16px 18px", borderRadius: 20, background: group.available ? "white" : "rgba(255,255,255,0.55)", border: "2px solid " + (group.available ? group.color + "55" : "rgba(168,208,230,0.3)"), boxShadow: group.available ? "0 6px 24px " + group.color + "20" : "none", cursor: group.available ? "pointer" : "not-allowed", opacity: group.available ? 1 : 0.6, width: "100%", textAlign: "left" }}
          >
            <div style={{ width: 52, height: 52, borderRadius: 16, background: group.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, flexShrink: 0 }}>{group.emoji}</div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 20, fontWeight: 700, color: "#1E3A5F" }}>{group.label}</p>
              <p style={{ fontSize: 13, color: "#7BACC8" }}>{group.available ? "Tap to play!" : "Coming soon"}</p>
            </div>
            {group.available ? (
              <div style={{ width: 32, height: 32, borderRadius: 16, background: group.color, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ color: "white", fontSize: 18, lineHeight: 1 }}>›</span>
              </div>
            ) : (
              <span style={{ fontSize: 11, fontWeight: 600, color: "#7BACC8", background: "#EEF6FF", padding: "3px 10px", borderRadius: 99 }}>Soon</span>
            )}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
`;

    const dragTheLettersGameContent = `import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { getLetterSoundUrl, getLetterGain } from "../../lib/letterSounds";
import { playAudio, playAudioSequence } from "../../lib/useAudio";

const ALL_LETTERS = "abcdefghijklmnoprstw".split("");
const LETTER_COLORS = ["#FF6B6B", "#4D96FF", "#6BCB77", "#FFD93D", "#C77DFF", "#FF9F43"];

function getDistractor(word) {
  const used = new Set(word.split(""));
  const pool = ALL_LETTERS.filter((l) => !used.has(l));
  return pool[Math.floor(Math.random() * pool.length)];
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildRound(card) {
  const letters = card.word.split("");
  const distractor = getDistractor(card.word);
  const options = shuffle([
    ...letters.map((l, i) => ({ id: "correct-" + i, letter: l, correctPos: i })),
    { id: "distractor", letter: distractor, correctPos: -1 },
  ]);
  return { card, letters, options };
}

export default function DragTheLettersGame({ words, title, color, onBack }) {
  const [roundIndex, setRoundIndex] = useState(0);
  const [round, setRound] = useState(() => buildRound(words[0]));
  const [placed, setPlaced] = useState([null, null, null]);
  const [shake, setShake] = useState(null);
  const [completing, setCompleting] = useState(false);
  const [dragState, setDragState] = useState(null);
  const dropZoneRefs = useRef([]);
  const sequenceRef = useRef(null);
  const isDragging = useRef(false);
  const total = words.length;

  useEffect(() => {
    const newRound = buildRound(words[roundIndex]);
    setRound(newRound);
    setPlaced([null, null, null]);
    setShake(null);
    setCompleting(false);
    setDragState(null);
    isDragging.current = false;
    if (sequenceRef.current) { sequenceRef.current(); sequenceRef.current = null; }
  }, [roundIndex]);

  const playCompletion = useCallback((card, letters) => {
    setCompleting(true);
    const steps = letters.map((letter) => {
      const url = getLetterSoundUrl(letter);
      return url ? { url, gain: getLetterGain(letter) } : null;
    }).filter(Boolean);
    if (card.audio) steps.push({ url: card.audio });
    const cancel = playAudioSequence(steps, () => {
      sequenceRef.current = null;
      setRoundIndex((prev) => (prev + 1 < words.length ? prev + 1 : 0));
    });
    sequenceRef.current = cancel;
  }, [words]);

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
      const newPlaced = [...placed];
      newPlaced[hitBox] = dragState.id;
      setPlaced(newPlaced);
      setDragState(null);
      isDragging.current = false;
      if (newPlaced.every((p) => p !== null)) setTimeout(() => playCompletion(round.card, round.letters), 300);
    } else {
      if (hitBox !== -1) setShake(hitBox);
      setTimeout(() => setShake(null), 500);
      setDragState(null);
      isDragging.current = false;
    }
  }, [dragState, placed, round, playCompletion]);

  const handleLetterTap = useCallback((option) => {
    if (placed.includes(option.id)) return;
    const url = getLetterSoundUrl(option.letter);
    if (url) playAudio(url, getLetterGain(option.letter));
  }, [placed]);

  const progress = placed.filter(Boolean).length;
  const card = round.card;

  return (
    <div
      style={{ display: "flex", flexDirection: "column", height: "100%", flex: 1, background: "#D6EEFF", fontFamily: "Fredoka, sans-serif", overflow: "hidden", touchAction: "none", userSelect: "none" }}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div style={{ background: "#A8D0E6", borderBottomLeftRadius: 28, borderBottomRightRadius: 28, padding: "14px 20px 18px", display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
        <button onClick={onBack} style={{ width: 40, height: 40, borderRadius: 20, background: "rgba(255,255,255,0.7)", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
          <ArrowLeft size={22} color="#1E3A5F" />
        </button>
        <div style={{ flex: 1, textAlign: "center", marginRight: 40 }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "#1E3A5F" }}>Drag the Letters ✋</h1>
          <p style={{ fontSize: 13, color: "#3A6080" }}>{title} · {roundIndex + 1} / {total}</p>
        </div>
      </div>
      <div style={{ height: 6, background: "rgba(255,255,255,0.5)", margin: "0 24px", borderRadius: 99, flexShrink: 0 }}>
        <div style={{ height: "100%", borderRadius: 99, background: color || "#4A90C4", width: ((roundIndex / total) * 100) + "%", transition: "width 0.4s" }} />
      </div>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-evenly", padding: "12px 20px 16px", minHeight: 0 }}>
        <motion.div
          key={roundIndex}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.25 }}
          onClick={() => card.audio && playAudio(card.audio)}
          style={{ background: "white", borderRadius: 28, padding: 10, boxShadow: "0 10px 40px rgba(30,58,95,0.15)", cursor: card.audio ? "pointer" : "default", touchAction: "manipulation", flexShrink: 0 }}
        >
          <img src={card.image} alt={card.word} style={{ width: "min(200px, 42vw)", height: "min(200px, 42vw)", objectFit: "cover", borderRadius: 20, display: "block" }} />
          <div style={{ textAlign: "center", marginTop: 6, fontSize: 12, color: "#7BACC8" }}>🔊 Tap to hear</div>
        </motion.div>
        <div style={{ display: "flex", gap: 14, alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          {round.letters.map((correctLetter, i) => {
            const placedId = placed[i];
            const placedOption = placedId ? round.options.find((o) => o.id === placedId) : null;
            const isShaking = shake === i;
            return (
              <motion.div
                key={i}
                ref={(el) => (dropZoneRefs.current[i] = el)}
                animate={isShaking ? { x: [0, -8, 8, -6, 6, 0] } : {}}
                transition={{ duration: 0.35 }}
                style={{ width: "min(76px, 20vw)", height: "min(76px, 20vw)", borderRadius: 18, background: placedOption ? "#B5EAD7" : "rgba(255,255,255,0.7)", border: "3px solid " + (placedOption ? "#4ECDC4" : isShaking ? "#FF6B6B" : "rgba(74,144,196,0.4)"), display: "flex", alignItems: "center", justifyContent: "center", boxShadow: placedOption ? "0 4px 16px rgba(78,205,196,0.3)" : "inset 0 2px 8px rgba(0,0,0,0.06)", transition: "background 0.2s, border 0.2s" }}
              >
                {placedOption ? (
                  <motion.span initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ fontSize: "min(40px, 10vw)", fontWeight: 700, color: "#1E3A5F" }}>
                    {placedOption.letter}
                  </motion.span>
                ) : (
                  <span style={{ fontSize: "min(22px, 5vw)", color: "rgba(74,144,196,0.3)", fontWeight: 700 }}>{i + 1}</span>
                )}
              </motion.div>
            );
          })}
        </div>
        <p style={{ fontSize: 15, color: "#4A90C4", fontWeight: 600, textAlign: "center", flexShrink: 0 }}>
          {completing ? "🎉 Great job! Listen..." : progress === 0 ? "Drag the letters to spell the word!" : (progress + " of " + round.letters.length + " placed")}
        </p>
        <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap", flexShrink: 0, paddingBottom: 4 }}>
          {round.options.map((option, i) => {
            const isPlaced = placed.includes(option.id);
            const isDraggingThis = dragState && dragState.id === option.id;
            const bgColor = LETTER_COLORS[i % LETTER_COLORS.length];
            return (
              <motion.div
                key={option.id}
                animate={isPlaced ? { scale: 0.85, opacity: 0.3 } : isDraggingThis ? { scale: 1.1 } : { scale: 1, opacity: 1 }}
                onTouchStart={(e) => { if (!isPlaced) { e.stopPropagation(); handleTouchStart(e, option); } }}
                onClick={() => !isPlaced && handleLetterTap(option)}
                style={{ width: "min(74px, 18vw)", height: "min(74px, 18vw)", borderRadius: 18, background: isPlaced ? "#E0EAF5" : bgColor, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "min(40px, 10vw)", fontWeight: 700, color: isPlaced ? "#aaa" : "#1E3A5F", boxShadow: isPlaced ? "none" : ("0 6px 18px " + bgColor + "66"), border: "3px solid " + (isPlaced ? "transparent" : "rgba(255,255,255,0.6)"), cursor: isPlaced ? "default" : "grab", touchAction: "none", userSelect: "none", pointerEvents: isDraggingThis ? "none" : "auto", opacity: isDraggingThis ? 0.3 : isPlaced ? 0.3 : 1 }}
              >
                {option.letter}
              </motion.div>
            );
          })}
        </div>
      </div>
      <AnimatePresence>
        {dragState && isDragging.current && (
          <div style={{ position: "fixed", left: dragState.x, top: dragState.y, transform: "translate(-50%, -50%)", zIndex: 9999, pointerEvents: "none", width: "min(80px, 20vw)", height: "min(80px, 20vw)", borderRadius: 18, background: LETTER_COLORS[round.options.findIndex((o) => o.id === dragState.id) % LETTER_COLORS.length], display: "flex", alignItems: "center", justifyContent: "center", fontSize: "min(44px, 11vw)", fontWeight: 700, color: "#1E3A5F", boxShadow: "0 12px 36px rgba(0,0,0,0.25)", border: "3px solid rgba(255,255,255,0.8)" }}>
            {dragState.letter}
          </div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {completing && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: "absolute", inset: 0, background: "rgba(214,238,255,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, pointerEvents: "none" }}>
            <motion.div initial={{ scale: 0.5 }} animate={{ scale: [0.5, 1.2, 1] }} transition={{ duration: 0.4 }} style={{ fontSize: 80, textAlign: "center" }}>🌟</motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
`;

    const newFileContents = {
      "src/components/games/DragTheLetters.jsx": dragTheLettersContent,
      "src/components/games/DragTheLettersGame.jsx": dragTheLettersGameContent,
    };

    for (const [path, content] of Object.entries(newFileContents)) {
      const existingSha = await getFileSha(accessToken, path, TARGET_BRANCH);
      await upsertFileText(accessToken, path, content, TARGET_BRANCH, existingSha);
      results.push({ path, status: "new/updated" });
    }

    return Response.json({
      success: true,
      branch: TARGET_BRANCH,
      filesUpdated: results.length,
      files: results,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});