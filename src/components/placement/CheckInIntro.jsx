import { motion } from "framer-motion";

const SAVED_KEY = "cody_placement_result";

const bounceCss = `
@keyframes codyBounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}
`;

const BADGE_EMOJI = {
  "Sound Explorer": "🌱",
  "Word Builder": "🏗️",
  "Reading Star": "⭐",
};
const BADGE_COLORS = {
  "Sound Explorer": "#4ECDC4",
  "Word Builder": "#FFD93D",
  "Reading Star": "#C77DFF",
};

export default function CheckInIntro({ onStart, onBack, lang = "en" }) {
  const saved = (() => {
    try { return JSON.parse(localStorage.getItem(SAVED_KEY)); } catch { return null; }
  })();

  const handleRetake = () => {
    localStorage.removeItem(SAVED_KEY);
    onStart();
  };

  return (
    <div
      style={{
        display: "flex", flexDirection: "column", height: "100%",
        fontFamily: "Fredoka, sans-serif",
        background: "linear-gradient(160deg, #E8FFFE 0%, #FFF9E6 60%, #F5F0FF 100%)",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        style={{
          background: "#A8D0E6",
          borderBottomLeftRadius: 28, borderBottomRightRadius: 28,
          padding: "10px 20px 18px",
          display: "flex", alignItems: "center", gap: 10, flexShrink: 0,
        }}
      >
        <button
          onClick={onBack}
          style={{
            background: "none", border: "none", cursor: "pointer",
            fontSize: 22, padding: 4,
            WebkitTapHighlightColor: "transparent", opacity: 0.7,
          }}
        >
          ←
        </button>
        <h1 style={{ flex: 1, textAlign: "center", fontSize: 22, fontWeight: 700, color: "#1E3A5F", margin: 0, marginRight: 32 }}>
          {lang === "zh" ? "科迪的声音冒险 🎵" : "Cody's Sound Adventure 🎵"}
        </h1>
      </div>

      <style>{bounceCss}</style>
      <div style={{ flex: 1, overflow: "auto", padding: "28px 24px 0" }}>
        {saved ? (
          /* Already completed — show result */
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}
          >
            <div
              style={{
                width: 160, height: 160, borderRadius: 48,
                background: `linear-gradient(135deg, ${BADGE_COLORS[saved.childBadgeName]}33, ${BADGE_COLORS[saved.childBadgeName]}88)`,
                border: `3px solid ${BADGE_COLORS[saved.childBadgeName]}`,
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                boxShadow: `0 12px 40px ${BADGE_COLORS[saved.childBadgeName]}44`,
              }}
            >
              <span style={{ fontSize: 72 }}>{BADGE_EMOJI[saved.childBadgeName] || "🌟"}</span>
            </div>
            <h2 style={{ fontSize: 32, fontWeight: 700, color: "#1E3A5F", margin: 0, textAlign: "center" }}>
              {saved.childBadgeName}
            </h2>
            <p style={{ fontSize: 16, color: "#7BACC8", margin: 0, textAlign: "center" }}>
              {lang === "zh"
                ? `每天 ${saved.recommendedDailyWordsMin}–${saved.recommendedDailyWordsMax} 个单词`
                : `${saved.recommendedDailyWordsMin}–${saved.recommendedDailyWordsMax} words a day`}
            </p>

            {/* Parent info */}
            <div
              style={{
                background: "rgba(255,255,255,0.75)", borderRadius: 20,
                padding: "14px 18px", width: "100%", boxSizing: "border-box",
                border: "1.5px solid rgba(168,208,230,0.3)",
              }}
            >
              <p style={{ margin: 0, fontSize: 13, color: "#7BACC8", fontWeight: 600 }}>
                {lang === "zh" ? "📋 家长信息" : "📋 For Parents"}
              </p>
              <p style={{ margin: "4px 0 0", fontSize: 14, color: "#1E3A5F" }}>
                {lang === "zh" ? "程度：" : "Level: "}<strong>{saved.placementLevel}</strong>
              </p>
              <p style={{ margin: "2px 0 0", fontSize: 12, color: "#9CB8CC" }}>
                {new Date(saved.placementCompletedAt).toLocaleDateString()}
              </p>
            </div>

            <button
              onClick={handleRetake}
              style={{
                background: "linear-gradient(135deg, #4ECDC4, #44A08D)",
                color: "white", border: "none", borderRadius: 999,
                padding: "14px 40px", fontSize: 18, fontWeight: 700,
                cursor: "pointer", fontFamily: "Fredoka, sans-serif",
                boxShadow: "0 8px 28px rgba(78,205,196,0.35)",
                WebkitTapHighlightColor: "transparent",
              }}
            >
              {lang === "zh" ? "重新游玩 🔄" : "Play Again 🔄"}
            </button>
          </motion.div>
        ) : (
          /* Not yet completed — show invite */
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 24 }}
          >
            {/* Cody */}
            <div
              style={{
                width: 140, height: 140, borderRadius: 48,
                background: "linear-gradient(135deg, #FFD93D, #FFAFC5)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 80, boxShadow: "0 12px 40px rgba(255,217,61,0.35)",
                animation: "codyBounce 2.2s ease-in-out infinite",
              }}
            >
              🦊
            </div>

            <div style={{ textAlign: "center" }}>
              <h2 style={{ fontSize: 28, fontWeight: 700, color: "#1E3A5F", margin: "0 0 8px" }}>
                {lang === "zh" ? "科迪想和你玩！" : "Cody wants to play!"}
              </h2>
              <p style={{ fontSize: 17, color: "#7BACC8", margin: 0, lineHeight: 1.5 }}>
                {lang === "zh"
                  ? "4 个快速小游戏 · 只需几分钟"
                  : "4 quick mini-games · just a few minutes"}
              </p>
            </div>

            {/* 4 game preview dots */}
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              {["🅰️", "🔊", "🔤", "🧠"].map((icon, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.6 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 + i * 0.08, type: "spring", stiffness: 300 }}
                  style={{
                    width: 56, height: 56, borderRadius: 18,
                    background: ["#F5F0FF", "#E0FAF8", "#EFF6FF", "#FFFDE7"][i],
                    border: `2px solid ${["#C77DFF", "#4ECDC4", "#4D96FF", "#FFD93D"][i]}44`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 28,
                    boxShadow: `0 4px 14px ${["#C77DFF", "#4ECDC4", "#4D96FF", "#FFD93D"][i]}22`,
                  }}
                >
                  {icon}
                </motion.div>
              ))}
            </div>

            <button
              onClick={onStart}
              style={{
                background: "linear-gradient(135deg, #4ECDC4, #44A08D)",
                color: "white", border: "none", borderRadius: 999,
                padding: "18px 60px", fontSize: 22, fontWeight: 700,
                cursor: "pointer", fontFamily: "Fredoka, sans-serif",
                boxShadow: "0 10px 32px rgba(78,205,196,0.45)",
                WebkitTapHighlightColor: "transparent",
                marginTop: 4,
              }}
            >
              {lang === "zh" ? "出发！🚀" : "Let's Go! 🚀"}
            </button>
          </motion.div>
        )}
      </div>

      <div style={{ height: "calc(28px + env(safe-area-inset-bottom, 0px))" }} />
    </div>
  );
}