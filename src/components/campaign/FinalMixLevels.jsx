/**
 * FinalMixLevels — level map for the Final Mixed Campaign (Levels 2-5 = Cycle 1).
 * Simple list layout consistent with the other vowel level screens.
 */
import { motion } from "framer-motion";
import BackArrow from "../BackArrow";
import { getBestStars } from "../../lib/campaignPerformance";

const LEVELS = [
  { num: 2, label: "Pack 1 — Learn",               emoji: "📖", tag: "Learn" },
  { num: 3, label: "Pack 1 — Guided Practice",      emoji: "🎯", tag: "Practice" },
  { num: 4, label: "Pack 1 — Intensive Practice",   emoji: "💪", tag: "Intensive" },
  { num: 5, label: "Pack 1 — Challenge",            emoji: "🏆", tag: "Challenge" },
];

const TAG_COLORS = {
  Learn:     { bg: "#E8F9F4", border: "#4ECDC4", text: "#0D9B82" },
  Practice:  { bg: "#EEF4FF", border: "#4D96FF", text: "#1D6FD8" },
  Intensive: { bg: "#FFF4E8", border: "#FF9F43", text: "#C47200" },
  Challenge: { bg: "#F5F0FF", border: "#C77DFF", text: "#8B3FC7" },
};

const STAR_COLOR = "#FFD700";

function StarRow({ count }) {
  return (
    <div style={{ display: "flex", gap: 2 }}>
      {[1, 2, 3].map((i) => (
        <span key={i} style={{ fontSize: 14, opacity: i <= count ? 1 : 0.25 }}>★</span>
      ))}
    </div>
  );
}

export default function FinalMixLevels({ onBack, onSelectLevel, lang = "en" }) {
  return (
    <div style={{
      display: "flex", flexDirection: "column", height: "100%",
      fontFamily: "Fredoka, sans-serif",
      background: "linear-gradient(160deg, #E8FFFE 0%, #FFF9E6 60%, #F5F0FF 100%)",
      overflow: "hidden",
    }}>
      {/* Header */}
      <div style={{
        flexShrink: 0,
        display: "flex", alignItems: "center", gap: 8,
        padding: "calc(env(safe-area-inset-top, 0px) + 8px) 16px 8px",
      }}>
        <BackArrow onPress={onBack} />
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "#1E293B", margin: 0, lineHeight: 1.1 }}>
            🌈 Final Mix
          </h1>
          <p style={{ fontSize: 12, color: "#64748B", margin: "2px 0 0" }}>
            {lang === "zh" ? "混合元音挑战！" : "Mixed vowels — a, o, i"}
          </p>
        </div>
      </div>

      {/* Level list */}
      <div style={{
        flex: 1, overflowY: "auto",
        padding: "8px 16px calc(24px + env(safe-area-inset-bottom, 0px))",
        display: "flex", flexDirection: "column", gap: 12,
      }}>
        {LEVELS.map((lvl, i) => {
          const stars = getBestStars("final-mix", lvl.num);
          const tagStyle = TAG_COLORS[lvl.tag];
          return (
            <motion.div
              key={lvl.num}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06, type: "spring", stiffness: 260, damping: 22 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onSelectLevel(lvl.num)}
              style={{
                display: "flex", alignItems: "center", gap: 14,
                padding: "14px 16px", borderRadius: 22,
                background: "white",
                border: `2px solid ${tagStyle.border}55`,
                boxShadow: `0 4px 18px ${tagStyle.border}20`,
                cursor: "pointer",
                WebkitTapHighlightColor: "transparent",
              }}
            >
              {/* Emoji badge */}
              <div style={{
                width: 56, height: 56, borderRadius: 16,
                background: `linear-gradient(145deg, ${tagStyle.border}, ${tagStyle.border}BB)`,
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0, fontSize: 26,
                boxShadow: `0 4px 0 ${tagStyle.border}55`,
              }}>
                {lvl.emoji}
              </div>

              {/* Text */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 16, fontWeight: 700, color: "#1E293B" }}>{lvl.label}</span>
                  <span style={{
                    fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 99,
                    background: tagStyle.bg, border: `1.5px solid ${tagStyle.border}`,
                    color: tagStyle.text,
                  }}>{lvl.tag}</span>
                </div>
                <div style={{ marginTop: 4 }}>
                  <StarRow count={stars} />
                </div>
              </div>

              {/* Arrow */}
              <div style={{
                width: 32, height: 32, borderRadius: 16,
                background: tagStyle.border,
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0, boxShadow: `0 3px 0 ${tagStyle.border}66`,
              }}>
                <span style={{ color: "white", fontSize: 20, lineHeight: 1 }}>›</span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}