import { motion } from "framer-motion";

export default function LanguageToggle({ language, onLanguageChange }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        background: "rgba(255,255,255,0.88)",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        border: "1.5px solid rgba(78,205,196,0.22)",
        borderRadius: 999,
        padding: 3,
        boxShadow: "0 2px 12px rgba(78,205,196,0.14)",
        gap: 2,
      }}
    >
      {[
        { id: "en", label: "En" },
        { id: "zh", label: "中文" },
      ].map((opt) => {
        const isActive = language === opt.id;
        return (
          <motion.button
            key={opt.id}
            onPointerDown={(e) => { e.preventDefault(); onLanguageChange(opt.id); }}
            whileTap={{ scale: 0.93 }}
            style={{
              padding: "6px 14px",
              borderRadius: 999,
              border: "none",
              cursor: "pointer",
              fontFamily: "Fredoka, sans-serif",
              fontSize: 15,
              fontWeight: isActive ? 700 : 500,
              color: isActive ? "#ffffff" : "#64748B",
              background: isActive
                ? "linear-gradient(135deg, #4ECDC4, #44A08D)"
                : "transparent",
              boxShadow: isActive ? "0 2px 8px rgba(78,205,196,0.35)" : "none",
              transition: "background 0.2s, color 0.2s, box-shadow 0.2s",
              WebkitTapHighlightColor: "transparent",
              minWidth: 44,
              minHeight: 34,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {opt.label}
          </motion.button>
        );
      })}
    </div>
  );
}