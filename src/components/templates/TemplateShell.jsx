/**
 * TemplateShell — themed wrapper used by the template test batch.
 * Renders: themed header (mascot back arrow, hearts, hint), round label,
 * progress bar, and a decorated background behind the game content.
 */
import { motion } from "framer-motion";
import HeartDisplay from "../campaign/HeartDisplay";
import HintButton from "../campaign/HintButton";

function Decoration({ d }) {
  const base = {
    position: "absolute",
    top: d.top,
    left: d.left,
    opacity: d.opacity ?? 1,
    pointerEvents: "none",
    transform: d.rotate ? `rotate(${d.rotate}deg)` : undefined,
  };
  if (d.shape === "blob") {
    return (
      <div style={{ ...base, width: d.size, height: d.size * 0.86, background: d.color, borderRadius: "42% 58% 55% 45% / 55% 44% 56% 45%" }} />
    );
  }
  if (d.shape === "dot") {
    return <div style={{ ...base, width: d.size, height: d.size, background: d.color, borderRadius: "50%" }} />;
  }
  if (d.shape === "star") {
    return (
      <svg style={base} width={d.size} height={d.size} viewBox="0 0 24 24" fill={d.color}>
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    );
  }
  return null;
}

export default function TemplateShell({ theme, label, gameType, mistakes, progressPct, onBack, lang = "en", children }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", fontFamily: "Fredoka, sans-serif", background: theme.bg, overflow: "hidden" }}>
      {/* Themed header */}
      <div
        style={{
          flexShrink: 0,
          display: "flex",
          flexDirection: "column",
          padding: "calc(env(safe-area-inset-top, 0px) + 8px) 16px 6px",
          borderBottom: `2px solid ${theme.headerBorder}`,
          background: theme.headerBg,
          backdropFilter: "blur(10px)",
          zIndex: 2,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <motion.img
            src={theme.arrowImg}
            alt="Back"
            whileTap={{ scale: 0.85 }}
            onClick={onBack}
            style={{ width: 86, height: 54, objectFit: "cover", borderRadius: 14, cursor: "pointer", WebkitTapHighlightColor: "transparent", flexShrink: 0 }}
          />
          <div style={{ flex: 1 }} />
          <HeartDisplay mistakes={mistakes} size={76} />
          <HintButton gameType={gameType} lang={lang} />
        </div>
        <p style={{ margin: "2px 0 0 2px", fontSize: 16, fontWeight: 700, color: theme.labelColor, lineHeight: 1.2, letterSpacing: "0.01em" }}>
          {label}
        </p>
      </div>

      {/* Progress bar */}
      {progressPct != null && (
        <div style={{ height: 6, background: theme.progressTrack, flexShrink: 0, zIndex: 2 }}>
          <motion.div animate={{ width: `${progressPct}%` }} transition={{ duration: 0.4 }} style={{ height: "100%", borderRadius: 99, background: theme.progressFill }} />
        </div>
      )}

      {/* Decorated body */}
      <div style={{ flex: 1, position: "relative", overflow: "hidden", display: "flex", flexDirection: "column" }}>
        <div style={{ position: "absolute", inset: 0, zIndex: 0, pointerEvents: "none" }}>
          {theme.decorations.map((d, i) => (
            <Decoration key={i} d={d} />
          ))}
        </div>
        <div style={{ position: "relative", zIndex: 1, flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          {children}
        </div>
      </div>
    </div>
  );
}