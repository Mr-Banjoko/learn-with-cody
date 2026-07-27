import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { tx } from "../lib/i18n";
import FlashcardScreen from "../components/FlashcardScreen";
import BackArrow from "../components/BackArrow";
import { shortEWords } from "../lib/shortEWords";
import { shortIWords } from "../lib/shortIWords";
import { shortOWords } from "../lib/shortOWords";
import { shortUWords } from "../lib/shortUWords";
import { getVaultCountByVowel } from "../lib/userFlashcardVault";
import YourFlashcardFolder from "../components/learn/YourFlashcardFolder";

const CODY_IMG = "https://media.base44.com/images/public/69c4ec00726384fdef1ab181/93a5cd462_transparent_cody.png";

const vowelGroups = [
  { id: "short-a", label: "Short a", emoji: "🍎", count: 41 },
  { id: "short-e", label: "Short e", emoji: "🥚", count: 23 },
  { id: "short-i", label: "Short i", emoji: "🐟", count: 36 },
  { id: "short-o", label: "Short o", emoji: "🐙", count: 25 },
  { id: "short-u", label: "Short u", emoji: "☂️", count: 23 },
];

const cvcWords = {
  "short-a": undefined, // FlashcardScreen defaults to shortAWords
  "short-e": shortEWords,
  "short-i": shortIWords,
  "short-o": shortOWords,
  "short-u": shortUWords,
};
const cvcTitles = {
  "short-a": "Short a Words",
  "short-e": "Short e Words",
  "short-i": "Short i Words",
  "short-o": "Short o Words",
  "short-u": "Short u Words",
};

const ZERO_COUNTS = { "short-a": 0, "short-e": 0, "short-i": 0, "short-o": 0, "short-u": 0 };

const mainFolders = [
  { id: "cvc", label: "CVC Flashcards", emoji: "📚", desc: "Short a → Short u word sets" },
  { id: "yours", label: "Your Flashcards", emoji: "📸", desc: "Photos you took in campaign mode" },
];

export default function LearnPhonics({ onDeepScreen, lang = "en" }) {
  const [view, setView] = useState("root"); // root | cvc | yours
  const [openFolder, setOpenFolder] = useState(null);
  const [vaultCounts, setVaultCounts] = useState(ZERO_COUNTS);

  const goDeep = (deep) => onDeepScreen && onDeepScreen(deep);

  const enterMain = (id) => {
    setView(id);
    goDeep(true);
  };
  const exitMain = () => {
    setView("root");
    setOpenFolder(null);
    goDeep(false);
  };
  const openVowel = (id) => setOpenFolder(id);
  const exitFolder = () => setOpenFolder(null);

  // Load vault counts when entering the "Your Flashcards" main view
  useEffect(() => {
    if (view === "yours") getVaultCountByVowel().then(setVaultCounts);
  }, [view]);

  // Open CVC folder → FlashcardScreen with the library words
  if (view === "cvc" && openFolder) {
    return (
      <div style={{ display: "flex", flexDirection: "column", flex: 1, height: "100%" }}>
        <FlashcardScreen onBack={exitFolder} words={cvcWords[openFolder]} title={cvcTitles[openFolder]} enableLetterSounds lang={lang} />
      </div>
    );
  }

  // Open "Your Flashcards" folder → vault-backed flashcards
  if (view === "yours" && openFolder) {
    return (
      <div style={{ display: "flex", flexDirection: "column", flex: 1, height: "100%" }}>
        <YourFlashcardFolder vowel={openFolder} title={cvcTitles[openFolder]} onBack={exitFolder} lang={lang} />
      </div>
    );
  }

  // Main folder view (CVC or Yours): list Short a → Short u sub-folders
  if (view !== "root") {
    const isYours = view === "yours";
    const mainTitle = isYours ? tx("Your Flashcards", "your_flashcards", lang) : tx("CVC Flashcards", "cvc_flashcards", lang);
    return (
      <div
        className="min-h-full pb-32"
        style={{ background: "linear-gradient(160deg, #E8FFFE 0%, #FFF9E6 60%, #F5F0FF 100%)", fontFamily: "Fredoka, sans-serif" }}
      >
        <div style={{ background: "#A9E6E1", borderBottomLeftRadius: 28, borderBottomRightRadius: 28, padding: "16px 20px 24px" }}>
          <div className="flex items-center gap-3">
            <BackArrow onPress={exitMain} />
            <h1 style={{ fontSize: 24, fontWeight: 700, color: "#1E3A5F" }}>{mainTitle}</h1>
          </div>
        </div>

        <div className="px-4 pt-6">
          <p style={{ fontSize: 15, fontWeight: 600, color: "#4A90C4", marginBottom: 14 }}>
            {tx("📂 Word Groups", "word_groups_label", lang)}
          </p>
          <div className="flex flex-col gap-3">
            {vowelGroups.map((group, i) => {
              const count = isYours ? vaultCounts[group.id] || 0 : group.count;
              return (
                <motion.button
                  key={group.id}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.07 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => openVowel(group.id)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                    padding: "16px 18px",
                    borderRadius: 20,
                    background: "white",
                    border: "2px solid #A8D0E6",
                    boxShadow: "0 6px 24px rgba(30,58,95,0.10)",
                    cursor: "pointer",
                    textAlign: "left",
                    width: "100%",
                  }}
                >
                  <div
                    style={{
                      width: 52, height: 52, borderRadius: 16, background: "#D6EEFF",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 26, flexShrink: 0,
                    }}
                  >
                    {group.emoji}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 20, fontWeight: 700, color: "#1E3A5F" }}>{group.label}</p>
                    <p style={{ fontSize: 13, color: "#7BACC8" }}>
                      {count} {count === 1 ? tx("flashcard", "flashcard_singular", lang) : tx("flashcards", "flashcards_plural", lang)} · {tx("Tap to open", "tap_to_open", lang)}
                    </p>
                  </div>
                  <div
                    style={{
                      width: 32, height: 32, borderRadius: 16, background: "#4A90C4",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}
                  >
                    <span style={{ color: "white", fontSize: 18, lineHeight: 1 }}>›</span>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Root view: two main folders
  return (
    <div
      className="min-h-full pb-32"
      style={{ background: "linear-gradient(160deg, #E8FFFE 0%, #FFF9E6 60%, #F5F0FF 100%)", fontFamily: "Fredoka, sans-serif" }}
    >
      <div style={{ background: "#A9E6E1", borderBottomLeftRadius: 28, borderBottomRightRadius: 28, padding: "16px 20px 24px" }}>
        <div className="flex items-center gap-3">
          <img src={CODY_IMG} alt="Cody" style={{ width: 52, height: 58, objectFit: "contain" }} />
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: "#1E3A5F" }}>{tx("Learn Phonics", "learn_phonics", lang)}</h1>
            <p style={{ fontSize: 14, color: "#3A6080" }}>{tx("Pick a folder to start!", "pick_folder_start", lang)}</p>
          </div>
        </div>
      </div>

      <div className="px-4 pt-6">
        <div className="flex flex-col gap-3">
          {mainFolders.map((f, i) => (
            <motion.button
              key={f.id}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.07 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => enterMain(f.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                padding: "18px 18px",
                borderRadius: 20,
                background: "white",
                border: "2px solid #A8D0E6",
                boxShadow: "0 6px 24px rgba(30,58,95,0.10)",
                cursor: "pointer",
                textAlign: "left",
                width: "100%",
              }}
            >
              <div
                style={{
                  width: 56, height: 56, borderRadius: 16, background: "#D6EEFF",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 28, flexShrink: 0,
                }}
              >
                {f.emoji}
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 21, fontWeight: 700, color: "#1E3A5F" }}>{f.label}</p>
                <p style={{ fontSize: 13, color: "#7BACC8" }}>{f.desc}</p>
              </div>
              <div
                style={{
                  width: 32, height: 32, borderRadius: 16, background: "#4A90C4",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}
              >
                <span style={{ color: "white", fontSize: 18, lineHeight: 1 }}>›</span>
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}