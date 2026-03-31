import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

const LETTER_COLORS = ["#FFAFC5", "#A8D8EA", "#FFE57A", "#B5EAD7", "#FFDAC1"];

// Inject rainbow keyframes once
let injected = false;
function injectStyles() {
  if (injected || typeof document === "undefined") return;
  injected = true;
  const style = document.createElement("style");
  style.textContent = `
    @keyframes rainbowGlow {
      0%   { box-shadow: 0 0 18px 6px #ff4e50cc, 0 0 32px 10px #ff4e5044; background: #ff8a8a; }
      14%  { box-shadow: 0 0 18px 6px #fc913acc, 0 0 32px 10px #fc913a44; background: #ffc47a; }
      28%  { box-shadow: 0 0 18px 6px #f9ca24cc, 0 0 32px 10px #f9ca2444; background: #ffe87a; }
      42%  { box-shadow: 0 0 18px 6px #6ab04ccc, 0 0 32px 10px #6ab04c44; background: #9fea7a; }
      57%  { box-shadow: 0 0 18px 6px #22a6b3cc, 0 0 32px 10px #22a6b344; background: #7adff0; }
      71%  { box-shadow: 0 0 18px 6px #4834d4cc, 0 0 32px 10px #4834d444; background: #9b8ffc; }
      85%  { box-shadow: 0 0 18px 6px #be2eddcc, 0 0 32px 10px #be2edd44; background: #e88afc; }
      100% { box-shadow: 0 0 18px 6px #ff4e50cc, 0 0 32px 10px #ff4e5044; background: #ff8a8a; }
    }
  `;
  document.head.appendChild(style);
}

export default function RainbowLetterBlock({ letter, index, isActive, onClick }) {
  useEffect(() => { injectStyles(); }, []);

  return (
    <motion.div
      onClick={onClick}
      animate={isActive ? { y: [-4, -12, -4] } : { y: 0 }}
      transition={isActive ? { duration: 0.6, repeat: Infinity, ease: "easeInOut" } : { duration: 0.2 }}
      style={{
        width: 72,
        height: 72,
        borderRadius: 18,
        background: isActive ? undefined : LETTER_COLORS[index % LETTER_COLORS.length],
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 42,
        fontWeight: 700,
        color: "#1E3A5F",
        fontFamily: "Fredoka, sans-serif",
        boxShadow: isActive ? undefined : "0 4px 12px rgba(0,0,0,0.10)",
        cursor: "pointer",
        userSelect: "none",
        animation: isActive ? "rainbowGlow 0.8s linear infinite" : "none",
        transition: "box-shadow 0.2s",
        position: "relative",
        zIndex: isActive ? 2 : 1,
      }}
    >
      {letter}
    </motion.div>
  );
}