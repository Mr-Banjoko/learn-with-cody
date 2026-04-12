import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import BackArrow from "../BackArrow";
import { tx } from "../../lib/i18n";
import OneLetter3Sounds from "./OneLetter3Sounds";
import OneSound3Letters from "./OneSound3Letters";
import UpperAndLower from "./UpperAndLower";

const TEST_ACTIVITIES = [
  {
    id: "1-letter-3-sounds",
    label: "1 Letter · 3 Sounds",
    labelZh: "1 字母 · 3 声音",
    emoji: "🔊",
    description: "See a letter, pick the right sound",
    descZh: "看到字母，选择正确的发音",
    color: "#4ECDC4",
    bg: "#E0FAF8",
    available: true,
  },
  {
    id: "1-sound-3-letters",
    label: "1 Sound · 3 Letters",
    labelZh: "1 声音 · 3 字母",
    emoji: "🔤",
    description: "Hear a sound, pick the right letter",
    descZh: "听到声音，选择正确的字母",
    color: "#4D96FF",
    bg: "#EFF6FF",
    available: true,
  },
  {
    id: "upper-and-lower",
    label: "Upper & Lower",
    labelZh: "大小写",
    emoji: "🅰️",
    description: "Match uppercase and lowercase letters",
    descZh: "匹配大写和小写字母",
    color: "#C77DFF",
    bg: "#F5F0FF",
    available: true,
  },
  {
    id: "letter-is-sound-is",
    label: "Letter is… Sound is…",
    labelZh: "字母是…声音是…",
    emoji: "🧠",
    description: "Learn what a letter looks like and sounds like",
    descZh: "学习字母的样子和发音",
    color: "#FFD93D",
    bg: "#FFFDE7",
    available: false,
  },
];

export default function TestHub({ onBack, onDeepScreen, lang = "en" }) {
  const [activeActivity, setActiveActivity] = useState(null);

  const enterActivity = (id) => {
    setActiveActivity(id);
    onDeepScreen && onDeepScreen(true);
  };

  const exitActivity = () => {
    setActiveActivity(null);
    onDeepScreen && onDeepScreen(false);
  };

  if (activeActivity === "1-letter-3-sounds") {
    return <OneLetter3Sounds onBack={exitActivity} lang={lang} />;
  }
  if (activeActivity === "1-sound-3-letters") {
    return <OneSound3Letters onBack={exitActivity} lang={lang} />;
  }
  if (activeActivity === "upper-and-lower") {
    return <UpperAndLower onBack={exitActivity} lang={lang} />;
  }

  return (
    <div
      className="min-h-full pb-32"
      style={{
        background: "linear-gradient(160deg, #E8FFFE 0%, #FFF9E6 60%, #F5F0FF 100%)",
        fontFamily: "Fredoka, sans-serif",
      }}
    >
      {/* Header */}
      <div
        style={{
          background: "#A8D0E6",
          borderBottomLeftRadius: 28,
          borderBottomRightRadius: 28,
          padding: "10px 20px 18px",
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        <BackArrow onPress={onBack} />
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: "#1E3A5F", margin: 0 }}>
            {tx("🧪 Test Zone", "test_zone_title", lang)}
          </h1>
        </div>
      </div>

      {/* Activity List */}
      <div style={{ padding: "24px 16px 0", display: "flex", flexDirection: "column", gap: 14 }}>
        {TEST_ACTIVITIES.map((act, i) => (
          <motion.button
            key={act.id}
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.07 }}
            whileTap={act.available ? { scale: 0.97 } : {}}
            onClick={() => act.available && enterActivity(act.id)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              padding: "16px 18px",
              borderRadius: 22,
              background: act.available ? "white" : "rgba(255,255,255,0.55)",
              border: act.available ? `2px solid ${act.color}44` : "2px solid rgba(168,208,230,0.3)",
              boxShadow: act.available ? `0 6px 24px ${act.color}18` : "none",
              cursor: act.available ? "pointer" : "not-allowed",
              opacity: act.available ? 1 : 0.6,
              textAlign: "left",
              width: "100%",
              fontFamily: "Fredoka, sans-serif",
            }}
          >
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: 18,
                background: act.bg,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 28,
                flexShrink: 0,
              }}
            >
              {act.emoji}
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 19, fontWeight: 700, color: "#1E3A5F", margin: 0 }}>
                {lang === "zh" ? act.labelZh : act.label}
              </p>
              <p style={{ fontSize: 13, color: "#7BACC8", margin: "2px 0 0" }}>
                {lang === "zh" ? act.descZh : act.description}
              </p>
            </div>
            {act.available ? (
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  background: act.color,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <span style={{ color: "white", fontSize: 18, lineHeight: 1 }}>›</span>
              </div>
            ) : (
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: "#7BACC8",
                  background: "#EEF6FF",
                  padding: "3px 10px",
                  borderRadius: 99,
                }}
              >
                {tx("Soon", "soon_badge", lang)}
              </span>
            )}
          </motion.button>
        ))}
      </div>
    </div>
  );
}