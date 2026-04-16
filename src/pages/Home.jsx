import { motion } from "framer-motion";

const SAVED_KEY = "cody_placement_result";

function getPlacementData() {
  try {
    return JSON.parse(localStorage.getItem(SAVED_KEY));
  } catch {
    return null;
  }
}

const BADGE_COLORS = {
  "Sound Explorer": "#4ECDC4",
  "Word Builder": "#FFD93D",
  "Reading Star": "#C77DFF",
};

const BADGE_EMOJI = {
  "Sound Explorer": "🌱",
  "Word Builder": "🏗️",
  "Reading Star": "⭐",
};

const BOX_COLORS = [
  "#4ECDC4",
  "#FF6B6B",
  "#FFD93D",
  "#6BCB77",
  "#A78BFA",
];

const buttonReset = {
  appearance: "none",
  border: "none",
  outline: "none",
  padding: 0,
  margin: 0,
  fontFamily: "inherit",
  color: "inherit",
};

export default function Home({ onNavigate, lang = "en" }) {
  const placement = getPlacementData();

  return (
    <div
      style={{
        fontFamily: "Fredoka, sans-serif",
        display: "flex",
        flexDirection: "column",
        height: "100%",
        padding: "16px 16px calc(16px + env(safe-area-inset-bottom, 0px)) 16px",
        gap: 14,
        boxSizing: "border-box",
        overflow: "hidden",
      }}
    >
      <div style={{ display: "flex", gap: 14, flex: "0 0 auto" }}>
        <motion.div
          key={0}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0, type: "spring", stiffness: 280, damping: 22 }}
          style={{
            flex: 1,
            height: 130,
            borderRadius: 22,
            background: BOX_COLORS[0],
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: `0 6px 20px ${BOX_COLORS[0]}55`,
          }}
        >
          <span style={{ fontSize: 40, fontWeight: 700, color: "white", opacity: 0.9 }}>
            1
          </span>
        </motion.div>

        <motion.div
          key={1}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08, type: "spring", stiffness: 280, damping: 22 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => onNavigate?.("checkin")}
          style={{
            flex: 1,
            height: 130,
            borderRadius: 22,
            background: placement
              ? `linear-gradient(135deg, ${BADGE_COLORS[placement.childBadgeName] || BOX_COLORS[1]}, ${BOX_COLORS[1]})`
              : "linear-gradient(135deg, #FF8C69, #FF6B6B)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: `0 6px 20px ${BOX_COLORS[1]}55`,
            cursor: "pointer",
            position: "relative",
            overflow: "hidden",
            WebkitTapHighlightColor: "transparent",
          }}
        >
          {placement ? (
            <>
              <span style={{ fontSize: 38 }}>
                {BADGE_EMOJI[placement.childBadgeName] || "🌟"}
              </span>
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: "white",
                  opacity: 0.9,
                  marginTop: 4,
                }}
              >
                {placement.childBadgeName}
              </span>
            </>
          ) : (
            <>
              <span style={{ fontSize: 32 }}>🦊</span>
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: "white",
                  opacity: 0.9,
                  marginTop: 4,
                  textAlign: "center",
                  padding: "0 6px",
                }}
              >
                {lang === "zh" ? "声音冒险" : "Sound Adventure"}
              </span>
            </>
          )}

          {!placement && (
            <motion.div
              animate={{ scale: [1, 1.4, 1], opacity: [0.7, 1, 0.7] }}
              transition={{ repeat: Infinity, duration: 1.8 }}
              style={{
                position: "absolute",
                top: 10,
                right: 12,
                width: 10,
                height: 10,
                borderRadius: 5,
                background: "rgba(255,255,255,0.9)",
              }}
            />
          )}
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.16, type: "spring", stiffness: 280, damping: 22 }}
        style={{
          flex: "0 0 auto",
          height: 100,
          borderRadius: 22,
          background: BOX_COLORS[2],
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: `0 6px 20px ${BOX_COLORS[2]}55`,
        }}
      >
        <span style={{ fontSize: 40, fontWeight: 700, color: "white", opacity: 0.9 }}>
          3
        </span>
      </motion.div>

      <div style={{ display: "flex", justifyContent: "center", flex: "0 0 auto" }}>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.24, type: "spring", stiffness: 280, damping: 22 }}
          whileTap={{ scale: 0.96 }}
          onClick={() => onNavigate?.("campaign")}
          style={{
            width: "58%",
            height: 110,
            borderRadius: 22,
            background: "linear-gradient(135deg, #6BCB77, #4ECDC4)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 6px 20px rgba(107,203,119,0.45)",
            cursor: "pointer",
            position: "relative",
            overflow: "hidden",
            WebkitTapHighlightColor: "transparent",
          }}
          aria-label={lang === "zh" ? "学习征程" : "Campaign"}
        >
          <motion.div
            animate={{ scale: [1, 1.5, 1], opacity: [0.35, 0, 0.35] }}
            transition={{ repeat: Infinity, duration: 2.2 }}
            style={{
              position: "absolute",
              width: 70,
              height: 70,
              borderRadius: 35,
              border: "3px solid rgba(255,255,255,0.5)",
            }}
          />
          <span style={{ fontSize: 28, zIndex: 1 }}>🗺️</span>
          <span
            style={{
              fontSize: 14,
              fontWeight: 700,
              color: "white",
              zIndex: 1,
              marginTop: 3,
            }}
          >
            {lang === "zh" ? "学习征程" : "Campaign"}
          </span>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.32, type: "spring", stiffness: 280, damping: 22 }}
        style={{
          flex: 1,
          minHeight: 130,
          borderRadius: 22,
          background: BOX_COLORS[4],
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: `0 6px 20px ${BOX_COLORS[4]}55`,
        }}
      >
        <span style={{ fontSize: 40, fontWeight: 700, color: "white", opacity: 0.9 }}>
          5
        </span>
      </motion.div>
    </div>
  );
}