/**
 * WordsLearntCard — homepage box 3: playful "Words I Know" counter.
 * Counts words from completed learn levels (see lib/activityStreak & wordsLearnt).
 */
import { motion } from "framer-motion";
import { getWordsLearnt } from "../../lib/wordsLearnt";

export default function WordsLearntCard({ lang = "en" }) {
  const { learnt, total } = getWordsLearnt();
  const pct = total > 0 ? Math.min(100, (learnt / total) * 100) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.16, type: "spring", stiffness: 280, damping: 22 }}
      style={{
        flex: "0 0 auto",
        height: 100,
        borderRadius: 22,
        background: "linear-gradient(135deg, #6BCB77 0%, #4ECDC4 100%)",
        display: "flex",
        alignItems: "center",
        gap: 14,
        padding: "0 18px",
        boxShadow: "0 6px 20px rgba(107,203,119,0.40)",
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* Bouncing book mascot */}
      <motion.div
        animate={{ y: [0, -5, 0], rotate: [0, -5, 5, 0] }}
        transition={{ repeat: Infinity, duration: 2.2 }}
        style={{
          width: 58, height: 58, borderRadius: 18, flexShrink: 0,
          background: "rgba(255,255,255,0.25)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 30,
        }}
      >
        📚
      </motion.div>

      {/* Count + label + progress */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
          <span style={{ fontSize: 32, fontWeight: 700, color: "white", lineHeight: 1, textShadow: "0 2px 8px rgba(0,0,0,0.15)" }}>
            {learnt}
          </span>
          <span style={{ fontSize: 14, fontWeight: 600, color: "rgba(255,255,255,0.92)" }}>
            {lang === "zh" ? "个单词学会啦！" : learnt === 1 ? "word learnt!" : "words learnt!"}
          </span>
        </div>
        {/* Progress bar toward all words */}
        <div style={{ marginTop: 8, height: 8, borderRadius: 99, background: "rgba(255,255,255,0.30)", overflow: "hidden" }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.9, ease: "easeOut", delay: 0.3 }}
            style={{ height: "100%", borderRadius: 99, background: "white" }}
          />
        </div>
        <span style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.85)" }}>
          {lang === "zh" ? `目标 ${total} 个单词` : `${total - learnt > 0 ? total - learnt : 0} more to collect them all!`}
        </span>
      </div>

      {/* Sparkle */}
      <motion.span
        animate={{ scale: [1, 1.25, 1], opacity: [0.8, 1, 0.8] }}
        transition={{ repeat: Infinity, duration: 1.8 }}
        style={{ fontSize: 22, flexShrink: 0 }}
      >
        ✨
      </motion.span>
    </motion.div>
  );
}