/**
 * WriteVowelSelect
 * =================
 * Entry screen for the Write game.
 * Shows the 5 vowel group cards:
 *   Short a (active), Short e/i/o/u (coming soon)
 */
import { motion } from "framer-motion";
import BackArrow from "../BackArrow";

const VOWEL_GROUPS = [
  { id: "short-a", label: "Short a", emoji: "🍎", color: "#FF6B6B", bg: "#FFF0F0", available: true },
  { id: "short-e", label: "Short e", emoji: "🥚", color: "#FFD93D", bg: "#FFFDE7", available: false },
  { id: "short-i", label: "Short i", emoji: "🐛", color: "#6BCB77", bg: "#F0FFF4", available: false },
  { id: "short-o", label: "Short o", emoji: "🐙", color: "#4D96FF", bg: "#EFF6FF", available: false },
  { id: "short-u", label: "Short u", emoji: "☂️", color: "#C77DFF", bg: "#FAF0FF", available: false },
];

export default function WriteVowelSelect({ onSelectVowel, onBack }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        fontFamily: "Fredoka, sans-serif",
        background: "linear-gradient(160deg, #E8FFFE 0%, #FFF9E6 60%, #F5F0FF 100%)",
      }}
    >
      {/* Header */}
      <div style={{
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "calc(env(safe-area-inset-top, 0px) + 10px) 16px 10px",
        borderBottom: "1.5px solid rgba(0,0,0,0.06)",
        background: "rgba(255,255,255,0.80)",
        backdropFilter: "blur(10px)",
      }}>
        <BackArrow onPress={onBack} />
        <div style={{ flex: 1 }}>
          <p style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "#1E293B" }}>
            ✏️ Write
          </p>
          <p style={{ margin: 0, fontSize: 12, color: "#64748B" }}>
            Trace letters with your finger
          </p>
        </div>
      </div>

      {/* Vowel group cards */}
      <div style={{
        flex: 1,
        overflowY: "auto",
        padding: "20px 16px 32px",
        display: "flex",
        flexDirection: "column",
        gap: 14,
      }}>
        <p style={{
          margin: "0 0 4px",
          fontSize: 15,
          color: "#64748B",
          fontWeight: 500,
          textAlign: "center",
        }}>
          Choose a vowel group to practice
        </p>

        {VOWEL_GROUPS.map((group, i) => (
          <motion.div
            key={group.id}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            onClick={() => group.available && onSelectVowel(group.id)}
            style={{
              background: group.bg,
              border: `2px solid ${group.color}${group.available ? "44" : "22"}`,
              borderRadius: 22,
              padding: "18px 20px",
              display: "flex",
              alignItems: "center",
              gap: 16,
              cursor: group.available ? "pointer" : "default",
              opacity: group.available ? 1 : 0.55,
              boxShadow: group.available ? `0 6px 24px ${group.color}18` : "none",
              WebkitTapHighlightColor: "transparent",
            }}
          >
            <div style={{
              width: 58,
              height: 58,
              borderRadius: 18,
              background: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 30,
              boxShadow: `0 4px 14px ${group.color}22`,
              flexShrink: 0,
            }}>
              {group.emoji}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{
                fontSize: 20,
                fontWeight: 700,
                color: "#1E293B",
                marginBottom: 2,
              }}>
                {group.label}
              </div>
              <div style={{
                fontSize: 13,
                color: "#64748B",
              }}>
                {group.available ? "Trace CVC words by swiping" : "Coming soon ✨"}
              </div>
            </div>
            {group.available && (
              <div style={{
                background: `${group.color}22`,
                color: group.color,
                borderRadius: 10,
                padding: "6px 12px",
                fontSize: 13,
                fontWeight: 700,
                flexShrink: 0,
              }}>
                Play ✏️
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}