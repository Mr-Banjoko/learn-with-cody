import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import BackArrow from "../BackArrow";
import { tx } from "../../lib/i18n";
import {
  VOWEL_GROUPS,
  GAME_ROUNDS,
  buildWordData,
} from "../../lib/picSliceGameData";
import PicSliceBoard from "./PicSliceBoard";
import PicSliceBoardEasy from "./PicSliceBoardEasy";

// ── Screen 1: Vowel group selection ────────────────────────────────────────
function VowelSelect({ onSelect, onBack, lang = "en" }) {
  return (
    <div style={{ fontFamily: "Fredoka, sans-serif", padding: "0 16px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
        <BackArrow onPress={onBack} />
        <h2 style={{ fontSize: 22, fontWeight: 700, color: "#1E3A5F" }}>
          {tx("Rearrange the Pictures", "rearrange_pictures", lang)}
        </h2>
      </div>
      <p style={{ fontSize: 15, fontWeight: 600, color: "#4A90C4", marginBottom: 14 }}>
        {tx("📂 Choose a Word Group", "pick_word_group", lang)}
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {VOWEL_GROUPS.map((g, i) => (
          <motion.button
            key={g.id}
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.07 }}
            whileTap={g.available ? { scale: 0.97 } : {}}
            onClick={() => g.available && onSelect(g.id)}
            style={{
              display: "flex", alignItems: "center", gap: 14,
              padding: "14px 16px", borderRadius: 18,
              background: g.available ? "white" : "rgba(255,255,255,0.5)",
              border: g.available ? "2px solid #A8D0E6" : "2px solid rgba(168,208,230,0.3)",
              boxShadow: g.available ? "0 4px 18px rgba(30,58,95,0.09)" : "none",
              cursor: g.available ? "pointer" : "not-allowed",
              opacity: g.available ? 1 : 0.55,
              textAlign: "left", width: "100%",
              fontFamily: "Fredoka, sans-serif",
            }}
          >
            <div style={{
              width: 48, height: 48, borderRadius: 14,
              background: g.available ? "#D6EEFF" : "#EEF6FF",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 24, flexShrink: 0,
            }}>
              {g.emoji}
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 19, fontWeight: 700, color: "#1E3A5F", margin: 0 }}>{g.label}</p>
              <p style={{ fontSize: 13, color: "#7BACC8", margin: 0 }}>
                {g.available ? tx("Tap to open", "tap_to_open", lang) : tx("Coming soon", "coming_soon", lang)}
              </p>
            </div>
            {g.available ? (
              <div style={{
                width: 30, height: 30, borderRadius: 15,
                background: "#4A90C4", display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <span style={{ color: "white", fontSize: 18, lineHeight: 1 }}>›</span>
              </div>
            ) : (
              <span style={{ fontSize: 11, fontWeight: 600, color: "#7BACC8", background: "#EEF6FF", padding: "3px 10px", borderRadius: 99 }}>
                {tx("Soon", "soon_badge", lang)}
              </span>
            )}
          </motion.button>
        ))}
      </div>
    </div>
  );
}

// ── Screen 2: Difficulty selection ─────────────────────────────────────────
function DifficultySelect({ vowelId, onSelect, onBack, lang = "en" }) {
  const vowel = VOWEL_GROUPS.find((g) => g.id === vowelId);
  const hasDifficult = (GAME_ROUNDS[vowelId]?.difficult?.length || 0) > 0;
  const difficulties = [
    { id: "easy", label: "Easy", labelZh: "简单", emoji: "⭐", description: "1 word per round", descZh: "每兡1个单词", available: true, color: "#6BCB77" },
    { id: "difficult", label: "Difficult", labelZh: "困难", emoji: "🔥", description: "2 words per round", descZh: "每兡2个单词", available: hasDifficult, color: "#FF6B6B" },
  ];
  return (
    <div style={{ fontFamily: "Fredoka, sans-serif", padding: "0 16px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
        <BackArrow onPress={onBack} />
        <h2 style={{ fontSize: 22, fontWeight: 700, color: "#1E3A5F" }}>
          {vowel?.emoji} {vowel?.label}
        </h2>
      </div>
      <p style={{ fontSize: 15, fontWeight: 600, color: "#4A90C4", marginBottom: 14 }}>
        {tx("🎮 Choose Difficulty", "choose_difficulty", lang)}
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {difficulties.map((d, i) => (
          <motion.button
            key={d.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            whileTap={d.available ? { scale: 0.97 } : {}}
            onClick={() => d.available && onSelect(d.id)}
            style={{
              display: "flex", alignItems: "center", gap: 14,
              padding: "18px 16px", borderRadius: 18,
              background: d.available ? "white" : "rgba(255,255,255,0.5)",
              border: d.available ? `2px solid ${d.color}40` : "2px solid rgba(200,200,200,0.3)",
              boxShadow: d.available ? `0 4px 18px ${d.color}18` : "none",
              cursor: d.available ? "pointer" : "not-allowed",
              opacity: d.available ? 1 : 0.5,
              textAlign: "left", width: "100%",
              fontFamily: "Fredoka, sans-serif",
            }}
          >
            <div style={{
              width: 52, height: 52, borderRadius: 16, fontSize: 26,
              background: d.available ? `${d.color}18` : "#F0F0F0",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              {d.emoji}
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 20, fontWeight: 700, color: "#1E3A5F", margin: 0 }}>{lang === "zh" ? d.labelZh : d.label}</p>
              <p style={{ fontSize: 13, color: "#7BACC8", margin: 0 }}>{lang === "zh" ? d.descZh : d.description}</p>
            </div>
            {!d.available && (
              <span style={{ fontSize: 11, fontWeight: 600, color: "#7BACC8", background: "#EEF6FF", padding: "3px 10px", borderRadius: 99 }}>
                {tx("Soon", "soon_badge", lang)}
              </span>
            )}
          </motion.button>
        ))}
      </div>
    </div>
  );
}

// ── Main navigator ──────────────────────────────────────────────────────────
export default function RearrangePictures({ onBack, lang = "en" }) {
  const [screen, setScreen] = useState("vowel"); // vowel | difficulty | game
  const [selectedVowel, setSelectedVowel] = useState(null);
  const [difficulty, setDifficulty] = useState("easy");
  const [roundIndex, setRoundIndex] = useState(0);
  const [wordPair, setWordPair] = useState(null);

  const loadRound = (vowelId, difficulty, index) => {
    const rounds = GAME_ROUNDS[vowelId]?.[difficulty] || [];
    const pair = rounds[index % rounds.length];
    if (pair) {
      setWordPair(pair.map((w) => buildWordData(w)));
    }
  };

  const handleVowelSelect = (vowelId) => {
    setSelectedVowel(vowelId);
    setScreen("difficulty");
  };

  const handleDifficultySelect = (diff) => {
    setDifficulty(diff);
    setRoundIndex(0);
    loadRound(selectedVowel, diff, 0);
    setScreen("game");
  };

  const handleRoundComplete = () => {
    const nextIndex = roundIndex + 1;
    setRoundIndex(nextIndex);
    loadRound(selectedVowel, difficulty, nextIndex);
  };

  // Header for game screen
  const GameHeader = () => (
    <div style={{
      background: "#A8D0E6",
      borderBottomLeftRadius: 24,
      borderBottomRightRadius: 24,
      padding: "8px 16px 12px",
      display: "flex", alignItems: "center", gap: 8,
      marginBottom: 10,
      flexShrink: 0,
    }}>
      <BackArrow onPress={() => setScreen("difficulty")} />
      <div style={{ flex: 1 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: "#1E3A5F", margin: 0 }}>
          {tx("🧩 Rearrange the Pictures", "rearrange_pictures", lang)}
          </h2>
          <p style={{ fontSize: 13, color: "#3A6080", margin: 0 }}>
          {selectedVowel?.replace("short-", "short ")} · {lang === "zh" ? (difficulty === "easy" ? "简单" : "困难") : difficulty} · {lang === "zh" ? `第 ${roundIndex + 1} 局` : `round ${roundIndex + 1}`}
        </p>
      </div>
    </div>
  );

  return (
    <div style={{ fontFamily: "Fredoka, sans-serif", height: "100%", display: "flex", flexDirection: "column", position: "relative" }}>
      <AnimatePresence mode="wait">
        {screen === "vowel" && (
          <motion.div key="vowel" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <VowelSelect onSelect={handleVowelSelect} onBack={onBack} lang={lang} />
          </motion.div>
        )}

        {screen === "difficulty" && (
          <motion.div key="difficulty" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <DifficultySelect
              vowelId={selectedVowel}
              onSelect={handleDifficultySelect}
              onBack={() => setScreen("vowel")}
              lang={lang}
            />
          </motion.div>
        )}

        {screen === "game" && wordPair && (
          <motion.div
            key={`game-${roundIndex}`}
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            style={{ display: "flex", flexDirection: "column", height: "100%" }}
          >
            <GameHeader />
            {difficulty === "difficult" ? (
              <PicSliceBoard
                wordPair={wordPair}
                onRoundComplete={handleRoundComplete}
                lang={lang}
              />
            ) : (
              <PicSliceBoardEasy
                wordPair={wordPair}
                onRoundComplete={handleRoundComplete}
                lang={lang}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>


    </div>
  );
}