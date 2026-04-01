import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const REPO = "Mr-Banjoko/learn-with-cody";
const SOURCE_BRANCH = "audio-feature";
const TARGET_BRANCH = "l-a-d-game";

// All files changed in this session — content is the exact current state
const FILES = {
  "src/components/AppShell.jsx": `import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import TabBar from "./TabBar";
import ParentSettings from "./ParentSettings";
import Home from "../pages/Home";
import LearnPhonics from "../pages/LearnPhonics";
import Games from "../pages/Games";
import Album from "../pages/Album";

export default function AppShell() {
  const [activeTab, setActiveTab] = useState("learn");
  const [isDeepScreen, setIsDeepScreen] = useState(false);
  const [language, setLanguage] = useState(() => localStorage.getItem("lang") || "en");

  const handleTabChange = (tab) => {
    setIsDeepScreen(false);
    setActiveTab(tab);
  };

  const handleLanguageChange = (lang) => {
    setLanguage(lang);
    localStorage.setItem("lang", lang);
  };

  const renderPage = () => {
    switch (activeTab) {
      case "home":
        return <Home onNavigate={handleTabChange} />;
      case "learn":
        return <LearnPhonics onDeepScreen={setIsDeepScreen} />;
      case "games":
        return <Games onDeepScreen={setIsDeepScreen} />;
      case "album":
        return <Album />;
      default:
        return <LearnPhonics onDeepScreen={setIsDeepScreen} />;
    }
  };

  return (
    <div
      className="fixed inset-0 overflow-hidden"
      style={{
        background: "linear-gradient(160deg, #E8FFFE 0%, #FFF9E6 60%, #F5F0FF 100%)",
      }}
    >
      {/* Settings gear */}
      <ParentSettings language={language} onLanguageChange={handleLanguageChange} />

      {/* Page content */}
      <div
        className="absolute inset-0"
        style={{
          paddingTop: "env(safe-area-inset-top, 0px)",
          paddingBottom: isDeepScreen ? "0" : "calc(80px + env(safe-area-inset-bottom, 0px))",
          overflow: isDeepScreen ? "hidden" : "auto",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}
          >
            {renderPage()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Tab Bar */}
      {!isDeepScreen && (
        <TabBar
          activeTab={activeTab}
          onTabChange={handleTabChange}
          language={language}
          showCodyInBar={true}
        />
      )}
    </div>
  );
}
`,

  "src/components/FlashcardScreen.jsx": `import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Camera, Save, Check, BookImage } from "lucide-react";
import html2canvas from "html2canvas";
import { shortAWords } from "../lib/shortAWords";
import { getLetterSoundUrl, getLetterGain } from "../lib/letterSounds";
import RainbowLetterBlock from "./RainbowLetterBlock";
import { playAudio, preloadAudio, playAudioSequence, warmupAudio } from "../lib/useAudio";

const LETTER_COLORS = ["#FFAFC5", "#A8D8EA", "#FFE57A", "#B5EAD7", "#FFDAC1"];

function LetterBlock({ letter, index }) {
  return (
    <div
      style={{
        width: 72, height: 72, borderRadius: 18,
        background: LETTER_COLORS[index % LETTER_COLORS.length],
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 42, fontWeight: 700, color: "#1E3A5F",
        fontFamily: "Fredoka, sans-serif",
        boxShadow: "0 4px 12px rgba(0,0,0,0.10)",
      }}
    >
      {letter}
    </div>
  );
}

export default function FlashcardScreen({ onBack, words, title, enableLetterSounds }) {
  const wordList = words || shortAWords;
  const screenTitle = title || "Short a Words";
  const [index, setIndex] = useState(0);
  const [customImages, setCustomImages] = useState({});
  const [justSaved, setJustSaved] = useState(false);
  const [activeLetterIndex, setActiveLetterIndex] = useState(null);
  const sequenceRef = useRef(null);
  const activeTimerRef = useRef(null);
  const captureRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    cancelSequence();
    setActiveLetterIndex(null);
  }, [index]);

  useEffect(() => {
    wordList.forEach((card) => {
      const img = new Image();
      img.src = card.image;
    });
    const audioUrls = wordList.map((c) => c.audio).filter(Boolean);
    if (audioUrls.length > 0) preloadAudio(audioUrls);
    if (enableLetterSounds) {
      const letters = [...new Set(wordList.flatMap((c) => c.word.split("")))];
      const letterUrls = letters.map(getLetterSoundUrl).filter(Boolean);
      if (letterUrls.length > 0) warmupAudio(letterUrls);
    }
  }, []);

  const card = wordList[index];
  const total = wordList.length;
  const currentImage = customImages[index] || card.image;
  const hasCustom = !!customImages[index];

  const cancelSequence = useCallback(() => {
    if (sequenceRef.current) {
      sequenceRef.current();
      sequenceRef.current = null;
    }
    if (activeTimerRef.current) {
      clearTimeout(activeTimerRef.current);
      activeTimerRef.current = null;
    }
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
    const letters = card.word.split("");
    const steps = letters
      .map((letter, i) => {
        const url = getLetterSoundUrl(letter);
        if (!url) return null;
        return { url, gain: getLetterGain(letter), onStart: () => setActiveLetterIndex(i) };
      })
      .filter(Boolean);

    if (card.audio) {
      steps.push({ url: card.audio, onStart: () => setActiveLetterIndex(null) });
    }

    const cancel = playAudioSequence(steps, () => {
      setActiveLetterIndex(null);
      sequenceRef.current = null;
    });
    sequenceRef.current = cancel;
  }, [card, cancelSequence]);

  const handleCamera = () => fileInputRef.current.click();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setCustomImages((prev) => ({ ...prev, [index]: ev.target.result }));
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleSave = async () => {
    if (!captureRef.current) return;
    const canvas = await html2canvas(captureRef.current, {
      scale: 2, useCORS: true, allowTaint: true, backgroundColor: "#D6EEFF",
    });
    const dataUrl = canvas.toDataURL("image/png");
    const album = JSON.parse(localStorage.getItem("cody_album") || "[]");
    album.push({ id: Date.now(), word: card.word, snapshot: dataUrl, date: new Date().toLocaleDateString() });
    localStorage.setItem("cody_album", JSON.stringify(album));
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 2000);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", flex: 1, background: "#D6EEFF", fontFamily: "Fredoka, sans-serif", overflow: "hidden" }}>
      <div style={{ background: "#A8D0E6", borderBottomLeftRadius: 28, borderBottomRightRadius: 28, padding: "16px 20px 20px", display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
        <button onClick={onBack} style={{ width: 40, height: 40, borderRadius: 20, background: "rgba(255,255,255,0.7)", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
          <ArrowLeft size={22} color="#1E3A5F" />
        </button>
        <h1 style={{ flex: 1, textAlign: "center", fontSize: 24, fontWeight: 700, color: "#1E3A5F", marginRight: 40 }}>{screenTitle}</h1>
      </div>

      <div ref={captureRef} style={{ flex: 1, background: "#D6EEFF", padding: "20px 24px 16px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 20, position: "relative" }}>
        <div className="relative flex items-center justify-center" style={{ width: "100%", maxWidth: 340 }}>
          <div style={{ position: "absolute", top: -20, right: -10, width: 160, height: 140, borderRadius: 40, background: "#FFCDD2", zIndex: 0, transform: "rotate(8deg)" }} />
          <div style={{ position: "absolute", bottom: -20, left: -10, width: 140, height: 140, borderRadius: "50%", background: "#FFF59D", zIndex: 0 }} />
          <AnimatePresence mode="wait">
            <motion.div key={index} initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.94 }} transition={{ duration: 0.22 }} style={{ position: "relative", zIndex: 1, background: "white", borderRadius: 28, padding: 14, boxShadow: "0 12px 48px rgba(30,58,95,0.15)", width: "100%" }}>
              <img
                src={currentImage}
                alt={card.word}
                onClick={() => card.audio && playAudio(card.audio)}
                style={{ width: "100%", aspectRatio: "1/1", objectFit: "cover", borderRadius: 18, display: "block", cursor: card.audio ? "pointer" : "default" }}
              />
              <button onClick={handleCamera} style={{ position: "absolute", bottom: 18, right: 18, width: 48, height: 48, borderRadius: 24, background: "white", boxShadow: "0 4px 16px rgba(0,0,0,0.18)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2 }}>
                <Camera size={24} color="#A8D0E6" strokeWidth={2.2} />
              </button>
            </motion.div>
          </AnimatePresence>
        </div>

        <AnimatePresence>
          {hasCustom && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={handleSave}
              style={{
                position: "absolute", top: 18, left: 18,
                width: 48, height: 48, borderRadius: 24,
                background: justSaved ? "#4ECDC4" : "#5B8DEF",
                color: "white", border: "none", cursor: "pointer",
                boxShadow: "0 4px 16px rgba(91,141,239,0.40)",
                display: "flex", alignItems: "center", justifyContent: "center",
                zIndex: 3, transition: "background 0.3s",
                touchAction: "manipulation",
              }}
              aria-label="Save to Album"
            >
              {justSaved ? <Check size={22} /> : <BookImage size={22} />}
            </motion.button>
          )}
        </AnimatePresence>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, zIndex: 1 }}>
          {enableLetterSounds ? (
            <>
              {card.word.split("").map((letter, i) => (
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
                style={{
                  width: 56, height: 56, borderRadius: 28,
                  background: "#FFD93D",
                  border: "3px solid #F4B942",
                  boxShadow: "0 4px 16px rgba(255,193,7,0.45)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: "pointer", flexShrink: 0, marginLeft: 6,
                  transition: "transform 0.12s",
                }}
                onMouseDown={e => e.currentTarget.style.transform = "scale(0.92)"}
                onMouseUp={e => e.currentTarget.style.transform = "scale(1)"}
                onTouchStart={e => e.currentTarget.style.transform = "scale(0.92)"}
                onTouchEnd={e => e.currentTarget.style.transform = "scale(1)"}
                aria-label="Play letter sounds"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="#1E3A5F">
                  <polygon points="5,3 19,12 5,21" />
                </svg>
              </button>
            </>
          ) : (
            card.word.split("").map((letter, i) => (
              <LetterBlock key={i} letter={letter} index={i} />
            ))
          )}
        </div>
      </div>

      <div style={{ flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 28px", paddingBottom: "calc(12px + env(safe-area-inset-bottom, 8px))", maxWidth: 480, width: "100%", alignSelf: "center", boxSizing: "border-box" }}>
        <button onClick={() => { if (index > 0) setIndex(index - 1); }} disabled={index === 0} style={{ padding: "14px 28px", borderRadius: 999, background: index === 0 ? "#C5DCF0" : "#A8C8E0", color: index === 0 ? "#9CB8CC" : "#1E3A5F", border: "none", cursor: index === 0 ? "not-allowed" : "pointer", fontSize: 18, fontWeight: 600, fontFamily: "Fredoka, sans-serif", opacity: index === 0 ? 0.6 : 1, minWidth: 110, touchAction: "manipulation" }}>Previous</button>
        <span style={{ fontSize: 20, fontWeight: 700, color: "#1E3A5F" }}>{index + 1}/{total}</span>
        <button onClick={() => { if (index < total - 1) setIndex(index + 1); }} disabled={index === total - 1} style={{ padding: "14px 28px", borderRadius: 999, background: index === total - 1 ? "#C5DCF0" : "#4A90C4", color: index === total - 1 ? "#9CB8CC" : "white", border: "none", cursor: index === total - 1 ? "not-allowed" : "pointer", fontSize: 18, fontWeight: 600, fontFamily: "Fredoka, sans-serif", opacity: index === total - 1 ? 0.6 : 1, minWidth: 110, touchAction: "manipulation" }}>Next</button>
      </div>

      <input ref={fileInputRef} type="file" accept="image/*" capture="environment" style={{ display: "none" }} onChange={handleFileChange} />
    </div>
  );
}
`,

  "src/pages/LearnPhonics.jsx": `import { useState } from "react";
import { motion } from "framer-motion";
import FlashcardScreen from "../components/FlashcardScreen";
import { shortEWords } from "../lib/shortEWords";
import { shortIWords } from "../lib/shortIWords";
import { shortOWords } from "../lib/shortOWords";
import { shortUWords } from "../lib/shortUWords";

const CODY_IMG = "https://media.base44.com/images/public/69c4ec00726384fdef1ab181/6b8f13599_cody.png";

const vowelGroups = [
  { id: "short-a", label: "Short a", emoji: "🍎", active: true },
  { id: "short-e", label: "Short e", emoji: "🥚", active: true },
  { id: "short-i", label: "Short i", emoji: "🐟", active: true },
  { id: "short-o", label: "Short o", emoji: "🐙", active: true },
  { id: "short-u", label: "Short u", emoji: "☂️", active: true },
];

export default function LearnPhonics({ onDeepScreen }) {
  const [openFolder, setOpenFolder] = useState(null);

  const enterFolder = (id) => {
    setOpenFolder(id);
    onDeepScreen && onDeepScreen(true);
  };

  const exitFolder = () => {
    setOpenFolder(null);
    onDeepScreen && onDeepScreen(false);
  };

  if (openFolder) {
    const wordMap = {
      "short-a": { words: undefined, title: "Short a Words" },
      "short-e": { words: shortEWords, title: "Short e Words" },
      "short-i": { words: shortIWords, title: "Short i Words" },
      "short-o": { words: shortOWords, title: "Short o Words" },
      "short-u": { words: shortUWords, title: "Short u Words" },
    };
    const cfg = wordMap[openFolder];
    return (
      <div style={{ display: "flex", flexDirection: "column", flex: 1, height: "100%" }}>
        <FlashcardScreen onBack={exitFolder} words={cfg.words} title={cfg.title} enableLetterSounds />
      </div>
    );
  }

  return (
    <div
      className="min-h-full pb-32"
      style={{ background: "#D6EEFF", fontFamily: "Fredoka, sans-serif" }}
    >
      <div
        style={{
          background: "#A8D0E6",
          borderBottomLeftRadius: 28,
          borderBottomRightRadius: 28,
          padding: "16px 20px 24px",
        }}
      >
        <div className="flex items-center gap-3">
          <img src={CODY_IMG} alt="Cody" style={{ width: 52, height: 58, objectFit: "contain" }} />
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: "#1E3A5F" }}>Learn Phonics</h1>
            <p style={{ fontSize: 14, color: "#3A6080" }}>Pick a word group to start!</p>
          </div>
        </div>
      </div>

      <div className="px-4 pt-6">
        <p style={{ fontSize: 15, fontWeight: 600, color: "#4A90C4", marginBottom: 14 }}>
          📂 Word Groups
        </p>
        <div className="flex flex-col gap-3">
          {vowelGroups.map((group, i) => (
            <motion.button
              key={group.id}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.07 }}
              whileTap={group.active ? { scale: 0.97 } : {}}
              onClick={() => group.active && enterFolder(group.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                padding: "16px 18px",
                borderRadius: 20,
                background: group.active ? "white" : "rgba(255,255,255,0.55)",
                border: group.active ? "2px solid #A8D0E6" : "2px solid rgba(168,208,230,0.3)",
                boxShadow: group.active ? "0 6px 24px rgba(30,58,95,0.10)" : "none",
                cursor: group.active ? "pointer" : "not-allowed",
                opacity: group.active ? 1 : 0.6,
                textAlign: "left",
                width: "100%",
              }}
            >
              <div
                style={{
                  width: 52, height: 52, borderRadius: 16,
                  background: group.active ? "#D6EEFF" : "#EEF6FF",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 26, flexShrink: 0,
                }}
              >
                {group.emoji}
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 20, fontWeight: 700, color: "#1E3A5F" }}>{group.label}</p>
                <p style={{ fontSize: 13, color: "#7BACC8" }}>
                  {group.id === "short-a" && "41 flashcards · Tap to open"}
                  {group.id === "short-e" && "23 flashcards · Tap to open"}
                  {group.id === "short-i" && "36 flashcards · Tap to open"}
                  {group.id === "short-o" && "25 flashcards · Tap to open"}
                  {group.id === "short-u" && "23 flashcards · Tap to open"}
                  {!group.active && "Coming soon"}
                </p>
              </div>
              {group.active ? (
                <div
                  style={{
                    width: 32, height: 32, borderRadius: 16,
                    background: "#4A90C4",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}
                >
                  <span style={{ color: "white", fontSize: 18, lineHeight: 1 }}>›</span>
                </div>
              ) : (
                <span
                  style={{
                    fontSize: 11, fontWeight: 600, color: "#7BACC8",
                    background: "#EEF6FF", padding: "3px 10px", borderRadius: 99,
                  }}
                >
                  Soon
                </span>
              )}
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}
`,

  "src/components/games/WordMatch.jsx": `import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import WordMatchGame from "./WordMatchGame";
import { shortAWords } from "../../lib/shortAWords";
import { shortEWords } from "../../lib/shortEWords";
import { shortIWords } from "../../lib/shortIWords";
import { shortOWords } from "../../lib/shortOWords";
import { shortUWords } from "../../lib/shortUWords";

const VOWEL_GROUPS = [
  { id: "short-a", label: "Short a", emoji: "🍎", color: "#FF6B6B", bg: "#FFF0F0", words: shortAWords, available: true },
  { id: "short-e", label: "Short e", emoji: "🥚", color: "#FFD93D", bg: "#FFFDE7", words: shortEWords, available: true },
  { id: "short-i", label: "Short i", emoji: "🐟", color: "#6BCB77", bg: "#F0FFF4", words: shortIWords, available: true },
  { id: "short-o", label: "Short o", emoji: "🐙", color: "#4D96FF", bg: "#EFF6FF", words: shortOWords, available: true },
  { id: "short-u", label: "Short u", emoji: "☂️", color: "#C77DFF", bg: "#FAF0FF", words: shortUWords, available: true },
];

export default function WordMatch({ onBack }) {
  const [selected, setSelected] = useState(null);

  if (selected) {
    const group = VOWEL_GROUPS.find((g) => g.id === selected);
    return (
      <WordMatchGame
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
        <button
          onClick={onBack}
          style={{ width: 40, height: 40, borderRadius: 20, background: "rgba(255,255,255,0.7)", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
        >
          <ArrowLeft size={22} color="#1E3A5F" />
        </button>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: "#1E3A5F" }}>Word Match 🎯</h1>
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
            style={{
              display: "flex", alignItems: "center", gap: 14,
              padding: "16px 18px", borderRadius: 20,
              background: group.available ? "white" : "rgba(255,255,255,0.55)",
              border: \`2px solid \${group.available ? group.color + "55" : "rgba(168,208,230,0.3)"}\`,
              boxShadow: group.available ? \`0 6px 24px \${group.color}20\` : "none",
              cursor: group.available ? "pointer" : "not-allowed",
              opacity: group.available ? 1 : 0.6, width: "100%", textAlign: "left",
            }}
          >
            <div style={{ width: 52, height: 52, borderRadius: 16, background: group.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, flexShrink: 0 }}>
              {group.emoji}
            </div>
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
`,
};

async function getFileSha(token, path, branch) {
  const url = `https://api.github.com/repos/${REPO}/contents/${path}?ref=${branch}`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}`, Accept: "application/vnd.github+json" } });
  if (!res.ok) return null;
  const data = await res.json();
  return data.sha || null;
}

async function upsertFile(token, path, content, branch, sha) {
  const body = {
    message: `sync: update ${path} to l-a-d-game branch`,
    content: btoa(unescape(encodeURIComponent(content))),
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

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== "admin") {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    const { accessToken } = await base44.asServiceRole.connectors.getConnection("github");

    // 1. Get source branch SHA
    const branchRes = await fetch(`https://api.github.com/repos/${REPO}/git/ref/heads/${SOURCE_BRANCH}`, {
      headers: { Authorization: `Bearer ${accessToken}`, Accept: "application/vnd.github+json" },
    });
    if (!branchRes.ok) throw new Error(`Could not get ${SOURCE_BRANCH} branch`);
    const branchData = await branchRes.json();
    const sha = branchData.object.sha;

    // 2. Create target branch (ignore 422 = already exists)
    const createRes = await fetch(`https://api.github.com/repos/${REPO}/git/refs`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/vnd.github+json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ref: `refs/heads/${TARGET_BRANCH}`, sha }),
    });
    const createData = await createRes.json();
    const branchCreated = createRes.ok || createRes.status === 422;
    if (!branchCreated) throw new Error(`Failed to create branch: ${JSON.stringify(createData)}`);

    // 3. Push each changed file
    const results = [];
    for (const [path, content] of Object.entries(FILES)) {
      const existingSha = await getFileSha(accessToken, path, TARGET_BRANCH);
      const result = await upsertFile(accessToken, path, content, TARGET_BRANCH, existingSha);
      results.push({ path, status: "ok", sha: result.content?.sha });
    }

    return Response.json({
      success: true,
      branch: TARGET_BRANCH,
      branchCreated: createRes.ok,
      filesUpdated: results.length,
      files: results.map((r) => r.path),
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});