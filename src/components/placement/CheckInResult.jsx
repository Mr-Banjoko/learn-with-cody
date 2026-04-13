import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";

const BADGE_CONFIG = {
  "Sound Explorer": {
    emoji: "🌱", color: "#4ECDC4", gradient: "linear-gradient(135deg, #4ECDC4, #44A08D)",
    bg: "#E0FAF8", descEn: "You're learning sounds!", descZh: "你在学习发音！",
  },
  "Word Builder": {
    emoji: "🏗️", color: "#FFD93D", gradient: "linear-gradient(135deg, #FFD93D, #F4B942)",
    bg: "#FFFDE7", descEn: "You know lots of letters!", descZh: "你认识很多字母！",
  },
  "Reading Star": {
    emoji: "⭐", color: "#C77DFF", gradient: "linear-gradient(135deg, #C77DFF, #9B59B6)",
    bg: "#F5F0FF", descEn: "You're a phonics star!", descZh: "你是拼音明星！",
  },
};

export default function CheckInResult({ result, onDone, lang = "en" }) {
  const firedRef = useRef(false);
  const badge = BADGE_CONFIG[result.childBadgeName] || BADGE_CONFIG["Sound Explorer"];

  useEffect(() => {
    if (firedRef.current) return;
    firedRef.current = true;

    const fire = (p, o) => confetti({ ...o, particleCount: p, spread: 70, origin: { y: 0.55 } });
    setTimeout(() => {
      fire(60, { colors: [badge.color, "#FFD93D", "#FF6B6B", "#6BCB77"] });
      setTimeout(() => fire(40, { colors: ["#FFD93D", badge.color], angle: 60, origin: { x: 0.1 } }), 250);
      setTimeout(() => fire(40, { colors: ["#FF6B6B", "#4ECDC4"], angle: 120, origin: { x: 0.9 } }), 400);
    }, 400);
  }, [badge.color]);

  return (
    <div
      style={{
        display: "flex", flexDirection: "column", height: "100%",
        fontFamily: "Fredoka, sans-serif",
        background: "linear-gradient(160deg, #E8FFFE 0%, #FFF9E6 60%, #F5F0FF 100%)",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          flex: 1, display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          padding: "0 24px", gap: 22,
          overflow: "auto",
        }}
      >
        {/* Cody celebrating */}
        <motion.div
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 16, delay: 0.1 }}
          style={{ fontSize: 72 }}
        >
          🦊
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          style={{ fontSize: 20, color: "#7BACC8", fontWeight: 600, margin: 0, textAlign: "center" }}
        >
          {lang === "zh" ? "科迪找到了你的学习路径！" : "Cody found your learning path!"}
        </motion.p>

        {/* Badge */}
        <motion.div
          initial={{ scale: 0.4, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 280, damping: 16, delay: 0.5 }}
          style={{
            width: 190, height: 190, borderRadius: 56,
            background: badge.bg,
            border: `4px solid ${badge.color}`,
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            boxShadow: `0 18px 56px ${badge.color}44`,
            gap: 6,
          }}
        >
          <span style={{ fontSize: 82, lineHeight: 1 }}>{badge.emoji}</span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.75, type: "spring", stiffness: 300 }}
          style={{ textAlign: "center" }}
        >
          <h2 style={{ fontSize: 38, fontWeight: 700, color: "#1E3A5F", margin: "0 0 6px" }}>
            {result.childBadgeName}
          </h2>
          <p style={{ fontSize: 18, color: badge.color, margin: 0, fontWeight: 600 }}>
            {lang === "zh" ? badge.descZh : badge.descEn}
          </p>
        </motion.div>

        {/* All 4 paws lit */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          style={{ display: "flex", gap: 12 }}
        >
          {[0, 1, 2, 3].map((i) => (
            <motion.span
              key={i}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 1 + i * 0.08, type: "spring", stiffness: 400 }}
              style={{ fontSize: 28 }}
            >
              🐾
            </motion.span>
          ))}
        </motion.div>

        {/* Parent info card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1 }}
          style={{
            background: "rgba(255,255,255,0.8)", borderRadius: 20,
            padding: "14px 20px", width: "100%", boxSizing: "border-box",
            border: "1.5px solid rgba(168,208,230,0.3)",
          }}
        >
          <p style={{ margin: 0, fontSize: 13, color: "#7BACC8", fontWeight: 600 }}>
            {lang === "zh" ? "📋 家长信息" : "📋 For Parents"}
          </p>
          <p style={{ margin: "4px 0 0", fontSize: 15, color: "#1E3A5F" }}>
            {lang === "zh" ? "程度：" : "Level: "}<strong>{result.placementLevel}</strong>
          </p>
          <p style={{ margin: "2px 0 0", fontSize: 15, color: "#1E3A5F" }}>
            {lang === "zh" ? "每日目标：" : "Daily target: "}
            <strong>{result.recommendedDailyWordsMin}–{result.recommendedDailyWordsMax} {lang === "zh" ? "个单词" : "words"}</strong>
          </p>
        </motion.div>
      </div>

      {/* Done button */}
      <div style={{ padding: "0 24px calc(28px + env(safe-area-inset-bottom, 0px))", flexShrink: 0 }}>
        <motion.button
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.3 }}
          onClick={onDone}
          whileTap={{ scale: 0.95 }}
          style={{
            width: "100%",
            background: badge.gradient,
            color: "white", border: "none", borderRadius: 999,
            padding: "18px", fontSize: 22, fontWeight: 700,
            cursor: "pointer", fontFamily: "Fredoka, sans-serif",
            boxShadow: `0 10px 32px ${badge.color}44`,
            WebkitTapHighlightColor: "transparent",
          }}
        >
          {lang === "zh" ? "太棒了！🎉" : "Awesome! 🎉"}
        </motion.button>
      </div>
    </div>
  );
}