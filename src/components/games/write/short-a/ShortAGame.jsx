import { useState } from "react";
import LetterTrace from "./LetterTrace";
import BackArrow from "../../../BackArrow";

const SHORT_A_WORDS = [
  "cat", "dad", "rat", "hat", "bat", "can", "pan", "jam",
  "map", "mat", "sad", "sat", "pat", "mad", "ham", "gas",
  "jar", "tag", "tap", "bag", "gap", "wax", "tan", "tax",
  "dam", "cab", "fan", "lab", "lad", "lap", "nap", "rag",
  "ram", "ran", "rap", "sap", "van", "yam", "zap", "cap", "had",
];

function ProgressBar({ value, max }) {
  return (
    <div style={{ width: "100%", height: 12, background: "#1e293b", borderRadius: 99, overflow: "hidden" }}>
      <div style={{ height: "100%", width: `${(value / max) * 100}%`, background: "linear-gradient(90deg,#4ade80,#22c55e)", borderRadius: 99, transition: "width 0.4s ease" }} />
    </div>
  );
}

function WordDisplay({ word, currentLetterIdx, completedLetters }) {
  return (
    <div style={{ display: "flex", gap: 6, alignItems: "flex-end" }}>
      {word.split("").map((ch, i) => {
        const isDone = completedLetters.includes(i);
        const isCurrent = i === currentLetterIdx;
        return (
          <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
            <span style={{ fontSize: 36, fontFamily: "'Noto Serif', serif", color: isDone ? "#22c55e" : isCurrent ? "#38bdf8" : "#475569", fontWeight: isCurrent ? "bold" : "normal", transition: "color 0.3s" }}>
              {ch}
            </span>
            <div style={{ width: 28, height: 3, borderRadius: 99, background: isDone ? "#22c55e" : isCurrent ? "#38bdf8" : "#1e293b", transition: "background 0.3s" }} />
          </div>
        );
      })}
    </div>
  );
}

function CelebrationScreen({ word, onNext }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 24, padding: 32 }}>
      <div style={{ fontSize: 64 }}>🎉</div>
      <div style={{ fontSize: 28, color: "#22c55e", fontWeight: "bold" }}>Excellent!</div>
      <div style={{ fontSize: 48, fontFamily: "'Noto Serif', serif", color: "#ffffff", letterSpacing: 4 }}>{word}</div>
      <button onClick={onNext} style={{ marginTop: 16, padding: "14px 48px", background: "#22c55e", color: "#000", border: "none", borderRadius: 14, fontSize: 18, fontWeight: "bold", cursor: "pointer", boxShadow: "0 4px 16px rgba(34,197,94,0.4)" }}>
        CONTINUE
      </button>
    </div>
  );
}

function AllDoneScreen({ onRestart }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 24, padding: 32 }}>
      <div style={{ fontSize: 72 }}>⭐</div>
      <div style={{ fontSize: 28, color: "#fbbf24", fontWeight: "bold" }}>Amazing! All done!</div>
      <div style={{ color: "#94a3b8", fontSize: 16, textAlign: "center" }}>You traced all the short-a words!</div>
      <button onClick={onRestart} style={{ marginTop: 16, padding: "14px 48px", background: "#38bdf8", color: "#000", border: "none", borderRadius: 14, fontSize: 18, fontWeight: "bold", cursor: "pointer" }}>
        PLAY AGAIN
      </button>
    </div>
  );
}

export default function ShortAGame({ onBack }) {
  const [wordIdx, setWordIdx] = useState(0);
  const [letterIdx, setLetterIdx] = useState(0);
  const [completedLetters, setCompletedLetters] = useState([]);
  const [wordDone, setWordDone] = useState(false);
  const [allDone, setAllDone] = useState(false);

  const word = SHORT_A_WORDS[wordIdx];

  const handleLetterComplete = () => {
    const newCompleted = [...completedLetters, letterIdx];
    setCompletedLetters(newCompleted);
    if (letterIdx + 1 >= word.length) {
      setWordDone(true);
    } else {
      setLetterIdx(letterIdx + 1);
    }
  };

  const handleNextWord = () => {
    if (wordIdx + 1 >= SHORT_A_WORDS.length) {
      setAllDone(true);
    } else {
      setWordIdx(wordIdx + 1);
      setLetterIdx(0);
      setCompletedLetters([]);
      setWordDone(false);
    }
  };

  const handleRestart = () => {
    setWordIdx(0);
    setLetterIdx(0);
    setCompletedLetters([]);
    setWordDone(false);
    setAllDone(false);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0f172a", display: "flex", flexDirection: "column", alignItems: "center", padding: "24px 16px", fontFamily: "system-ui, sans-serif", color: "#ffffff" }}>
      {/* Back button */}
      <div style={{ width: "100%", maxWidth: 400, marginBottom: 8 }}>
        <BackArrow onPress={onBack} />
      </div>

      {/* Header */}
      <div style={{ width: "100%", maxWidth: 400, marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <span style={{ color: "#94a3b8", fontSize: 14 }}>Word {wordIdx + 1} / {SHORT_A_WORDS.length}</span>
          <span style={{ background: "#1e293b", padding: "4px 12px", borderRadius: 99, fontSize: 13, color: "#38bdf8" }}>Short A</span>
        </div>
        <ProgressBar value={wordIdx} max={SHORT_A_WORDS.length} />
      </div>

      {allDone ? (
        <AllDoneScreen onRestart={handleRestart} />
      ) : wordDone ? (
        <CelebrationScreen word={word} onNext={handleNextWord} />
      ) : (
        <>
          <div style={{ fontSize: 16, color: "#94a3b8", marginBottom: 12 }}>Trace the letter</div>
          <div style={{ marginBottom: 24 }}>
            <WordDisplay word={word} currentLetterIdx={letterIdx} completedLetters={completedLetters} />
          </div>
          <LetterTrace key={`${wordIdx}-${letterIdx}`} letter={word[letterIdx]} onComplete={handleLetterComplete} />
        </>
      )}
    </div>
  );
}