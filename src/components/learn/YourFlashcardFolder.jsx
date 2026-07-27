/**
 * YourFlashcardFolder — displays the user's camera-captured flashcards for one
 * short-vowel group, using the same FlashcardScreen (with the same download
 * button) as the CVC flashcards.
 */
import { useState, useEffect } from "react";
import { getFlashcardsByVowel } from "../../lib/userFlashcardVault";
import FlashcardScreen from "../FlashcardScreen";
import BackArrow from "../BackArrow";

export default function YourFlashcardFolder({ vowel, title, onBack, lang = "en" }) {
  const [words, setWords] = useState(null); // null = loading

  useEffect(() => {
    let cancelled = false;
    setWords(null);
    getFlashcardsByVowel(vowel).then((entries) => {
      if (cancelled) return;
      // Map vault entries to the FlashcardScreen words shape.
      // audio is intentionally omitted — letter sounds still work.
      setWords(entries.map((e) => ({ word: e.word, image: e.photo, audio: undefined })));
    });
    return () => {
      cancelled = true;
    };
  }, [vowel]);

  if (words === null) {
    return (
      <div style={{ display: "flex", flexDirection: "column", flex: 1, height: "100%", fontFamily: "Fredoka, sans-serif", background: "linear-gradient(160deg, #E8FFFE 0%, #FFF9E6 60%, #F5F0FF 100%)" }}>
        <div style={{ background: "rgba(255,255,255,0.75)", backdropFilter: "blur(10px)", borderBottom: "1.5px solid rgba(0,0,0,0.06)", padding: "10px 20px 14px", display: "flex", alignItems: "center", gap: 8 }}>
          <BackArrow onPress={onBack} />
          <h1 style={{ flex: 1, textAlign: "center", fontSize: 24, fontWeight: 700, color: "#1E293B", marginRight: 40 }}>{title}</h1>
        </div>
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (words.length === 0) {
    return (
      <div style={{ display: "flex", flexDirection: "column", flex: 1, height: "100%", fontFamily: "Fredoka, sans-serif", background: "linear-gradient(160deg, #E8FFFE 0%, #FFF9E6 60%, #F5F0FF 100%)" }}>
        <div style={{ background: "rgba(255,255,255,0.75)", backdropFilter: "blur(10px)", borderBottom: "1.5px solid rgba(0,0,0,0.06)", padding: "10px 20px 14px", display: "flex", alignItems: "center", gap: 8 }}>
          <BackArrow onPress={onBack} />
          <h1 style={{ flex: 1, textAlign: "center", fontSize: 24, fontWeight: 700, color: "#1E293B", marginRight: 40 }}>{title}</h1>
        </div>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, padding: 32, textAlign: "center" }}>
          <div style={{ fontSize: 48 }}>📸</div>
          <p style={{ fontSize: 18, fontWeight: 600, color: "#1E3A5F" }}>
            {lang === "zh" ? "还没有卡片！" : "No flashcards yet!"}
          </p>
          <p style={{ fontSize: 15, color: "#7BACC8", maxWidth: 280 }}>
            {lang === "zh"
              ? "在闯关模式中用相机拍照，照片会自动保存在这里。"
              : "Take photos with the camera in campaign mode and they'll appear here."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1, height: "100%" }}>
      <FlashcardScreen onBack={onBack} words={words} title={title} enableLetterSounds lang={lang} />
    </div>
  );
}