import { motion } from "framer-motion";

const LETTER_COLORS = ["#FFAFC5", "#A8D8EA", "#FFE57A", "#B5EAD7", "#FFDAC1"];

export default function RainbowLetterBlock({ letter, index, isActive, onClick }) {
  return (
    <motion.div
      // onPointerDown fires at the very first frame of contact — no iOS 300ms click delay.
      // We still accept `onClick` prop name for backward compat but wire to onPointerDown.
      onPointerDown={(e) => { e.preventDefault(); onClick && onClick(); }}
      animate={isActive ? { y: [-4, -14, -4] } : { y: 0 }}
      transition={isActive ? { duration: 0.55, repeat: Infinity, ease: "easeInOut" } : { duration: 0.25, ease: "easeOut" }}
      style={{
        width: 72,
        height: 72,
        borderRadius: 18,
        background: LETTER_COLORS[index % LETTER_COLORS.length],
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 42,
        fontWeight: 700,
        color: "#1E3A5F",
        fontFamily: "Fredoka, sans-serif",
        boxShadow: isActive
          ? "0 8px 24px rgba(30,58,95,0.22)"
          : "0 4px 12px rgba(0,0,0,0.10)",
        cursor: "pointer",
        userSelect: "none",
        position: "relative",
        zIndex: isActive ? 2 : 1,
      }}
    >
      {letter}
    </motion.div>
  );
}