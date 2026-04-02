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
// Match Learn Phonics word-box color palette
const LETTER_COLORS = ["#FFAFC5", "#A8D8EA", "#FFE57A", "#B5EAD7", "#FFDAC1", "#FFAFC5"];

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
  const [placedColors, setPlacedColors] = useState({});
  const [shake, setShake] = useState(null);
  const [completing, setCompleting] = useState(false);
  const [bouncingIndex, setBouncingIndex] = useState(null);
  const [dragState, setDragState] = useState(null);
  const dropZoneRefs = useRef([]);
  const sequenceRef = useRef(null);
  const isDragging = useRef(false);
  const total = words.length;

  useEffect(() => {
    const newRound = buildRound(words[roundIndex]);
    setRound(newRound);
    setPlaced([null, null, null]);
    setPlacedColors({});
    setShake(null);
    setCompleting(false);
    setBouncingIndex(null);
    setDragState(null);
    isDragging.current = false;
    if (sequenceRef.current) { sequenceRef.current(); sequenceRef.current = null; }
  }, [roundIndex]);

  const playCompletion = useCallback((card, letters) => {
    setCompleting(true);
    const letterSteps = letters.map((letter, i) => {
      const url = getLetterSoundUrl(letter);
      return url ? { url, gain: getLetterGain(letter), onStart: () => setBouncingIndex(i) } : null;
    }).filter(Boolean);
    const wordStep = card.audio ? [{ url: card.audio, onStart: () => setBouncingIndex(null) }] : [];
    const steps = [...letterSteps, ...wordStep];
    const cancel = playAudioSequence(steps, () => {
      sequenceRef.current = null;
      setBouncingIndex(null);
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
      const optIdx = round.options.findIndex((o) => o.id === dragState.id);
      const tileColor = LETTER_COLORS[optIdx % LETTER_COLORS.length];
      const newPlaced = [...placed];
      newPlaced[hitBox] = dragState.id;
      setPlacedColors((prev) => ({ ...prev, [hitBox]: tileColor }));
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
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "#1E3A5F" }}>Drag the Letters \u270b</h1>
          <p style={{ fontSize: 13, color: "#3A6080" }}>{title} \u00b7 {roundIndex + 1} / {total}</p>
        </div>
      </div>
      <div style={{ height: 6, background: "rgba(255,255,255,0.5)", margin: "0 24px", borderRadius: 99, flexShrink: 0 }}>
        <div style={{ height: "100%", borderRadius: 99, background: color || "#4A90C4", width: ((roundIndex / total) * 100) + "%", transition: "width 0.4s" }} />
      </div>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-evenly", padding: "10px 20px 14px", minHeight: 0 }}>
        <motion.div
          key={roundIndex}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.25 }}
          onClick={() => card.audio && playAudio(card.audio)}
          style={{ background: "white", borderRadius: 28, padding: 10, boxShadow: "0 10px 40px rgba(30,58,95,0.15)", cursor: card.audio ? "pointer" : "default", touchAction: "manipulation", flexShrink: 0 }}
        >
          <img src={card.image} alt={card.word} style={{ width: "min(260px, 56vw)", height: "min(260px, 56vw)", objectFit: "cover", borderRadius: 20, display: "block" }} />
        </motion.div>
        <div style={{ display: "flex", gap: 14, alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          {round.letters.map((correctLetter, i) => {
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
                style={{ width: "min(76px, 20vw)", height: "min(76px, 20vw)", borderRadius: 18, background: tileColor || "rgba(255,255,255,0.7)", border: "3px solid " + (tileColor ? "rgba(255,255,255,0.85)" : isShaking ? "#FF6B6B" : "rgba(74,144,196,0.4)"), display: "flex", alignItems: "center", justifyContent: "center", boxShadow: tileColor ? "0 4px 16px rgba(0,0,0,0.12)" : "inset 0 2px 8px rgba(0,0,0,0.06)", transition: "background 0.2s, border 0.2s" }}
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
          {completing ? "\ud83c\udf89 Great job! Listen..." : progress === 0 ? "Drag the letters to spell the word!" : (progress + " of " + round.letters.length + " placed")}
        </p>
        <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap", flexShrink: 0, paddingBottom: 4 }}>
          {round.options.map((option, i) => {
            const isPlaced = placed.includes(option.id);
            const isDraggingThis = dragState && dragState.id === option.id;
            const bgColor = LETTER_COLORS[i % LETTER_COLORS.length];
            if (isPlaced) {
              return <div key={option.id} style={{ width: "min(74px, 18vw)", height: "min(74px, 18vw)", visibility: "hidden", flexShrink: 0 }} />;
            }
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
      <AnimatePresence>
        {dragState && isDragging.current && (
          <div style={{ position: "fixed", left: dragState.x, top: dragState.y, transform: "translate(-50%, -50%)", zIndex: 9999, pointerEvents: "none", width: "min(80px, 20vw)", height: "min(80px, 20vw)", borderRadius: 18, background: LETTER_COLORS[round.options.findIndex((o) => o.id === dragState.id) % LETTER_COLORS.length], display: "flex", alignItems: "center", justifyContent: "center", fontSize: "min(44px, 11vw)", fontWeight: 700, color: "#1E3A5F", boxShadow: "0 12px 36px rgba(0,0,0,0.25)", border: "3px solid rgba(255,255,255,0.8)" }}>
            {dragState.letter}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
`;

    const useAudioContent = `// v4: force audio/mpeg MIME type on blobs to fix iOS Safari decoder selection.
// Old blobs (v3) had no explicit MIME → iOS used a slow generic decoder → half-speed playback.
const CACHE_NAME = "cody-audio-v4";

// Inter-phoneme gap for beginner CVC blending
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
  } catch {
    return remoteUrl;
  }
}

export async function warmupAudio(urls) {
  for (const url of urls) {
    if (!resolvedBlobUrls.has(url)) {
      getCachedAudioUrl(url).catch(() => {});
    }
  }
}

export async function playAudio(remoteUrl, gain = 1) {
  if (!remoteUrl) return;
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
    currentAudio = null;
  }
  const src = await getCachedAudioUrl(remoteUrl);
  const audio = new Audio();
  audio.preload = "auto";
  audio.playbackRate = 1.0;
  audio.volume = Math.min(1, Math.max(0, gain));
  audio.src = src;
  currentAudio = audio;
  audio.onended = () => {
    if (currentAudio === audio) currentAudio = null;
  };
  audio.load();
  audio.play().catch(() => {
    if (currentAudio === audio) currentAudio = null;
  });
}

export function playAudioSequence(steps, onDone) {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio = null;
  }

  let cancelled = false;

  function playStep(i) {
    if (cancelled || i >= steps.length) {
      if (!cancelled) onDone && onDone();
      return;
    }
    const { url, onStart, gain = 1 } = steps[i];
    onStart && onStart(i);

    getCachedAudioUrl(url).then((src) => {
      if (cancelled) return;

      const audio = new Audio();
      audio.preload = "auto";
      audio.playbackRate = 1.0;
      audio.volume = Math.min(1, Math.max(0, gain));
      audio.src = src;
      currentAudio = audio;

      audio.onended = () => {
        if (currentAudio === audio) currentAudio = null;
        if (!cancelled) setTimeout(() => { if (!cancelled) playStep(i + 1); }, BLEND_GAP_MS);
      };

      audio.load();
      audio.play().catch(() => {
        if (currentAudio === audio) currentAudio = null;
        if (!cancelled) playStep(i + 1);
      });
    }).catch(() => {
      if (!cancelled) playStep(i + 1);
    });
  }

  playStep(0);

  return function cancel() {
    cancelled = true;
    if (currentAudio) {
      currentAudio.pause();
      currentAudio = null;
    }
  };
}

export async function preloadAudio(urls) {
  try {
    const cache = await caches.open(CACHE_NAME);
    for (const url of urls) {
      const cached = await cache.match(url);
      if (!cached) {
        fetch(url)
          .then((res) => { if (res.ok && res.status === 200) cache.put(url, res); })
          .catch(() => {});
      }
    }
  } catch {
    // silently fail
  }
}
`;

    const newFileContents = {
      "src/lib/useAudio.js": useAudioContent,
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