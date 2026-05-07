/**
 * WriteShortA — Short A tracing game shell.
 * Uses a subset of Short A words for the initial testing batch.
 */
import { useState } from "react";
import WriteGame from "./WriteGame";
import { shortAWords } from "../../lib/shortAWords";
import { motion } from "framer-motion";
import BackArrow from "../BackArrow";

// Use first 8 words for testing batch
const BATCH = shortAWords.slice(0, 8);

export default function WriteShortA({ onBack, lang = "en" }) {
  const [done, setDone] = useState(false);

  if (done) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          padding: "32px 24px",
          textAlign: "center",
          fontFamily: "Fredoka, sans-serif",
          background: "linear-gradient(160deg, #E8FFFE 0%, #FFF9E6 60%, #F5F0FF 100%)",
          gap: 24,
        }}
      >
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 18 }}
          style={{ fontSize: 80 }}
        >
          ✏️
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          style={{ fontSize: 32, fontWeight: 700, color: "#1E293B", margin: 0 }}
        >
          {lang === "zh" ? "写完了！太棒了！" : "Amazing writing!"}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          style={{ fontSize: 16, color: "#64748B", margin: 0 }}
        >
          {lang === "zh" ? "你写完了所有的单词！" : "You traced all the Short a words!"}
        </motion.p>
        <motion.button
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65 }}
          whileTap={{ scale: 0.95 }}
          onClick={onBack}
          style={{
            padding: "16px 48px",
            borderRadius: 999,
            background: "linear-gradient(135deg, #C77DFF, #4D96FF)",
            color: "white",
            border: "none",
            fontSize: 18,
            fontWeight: 700,
            fontFamily: "Fredoka, sans-serif",
            cursor: "pointer",
            boxShadow: "0 6px 0 rgba(0,0,0,0.12)",
            touchAction: "manipulation",
          }}
        >
          {lang === "zh" ? "返回 ✨" : "Back ✨"}
        </motion.button>
      </div>
    );
  }

  return (
    <WriteGame
      words={BATCH}
      onBack={onBack}
      onComplete={() => setDone(true)}
      lang={lang}
    />
  );
}