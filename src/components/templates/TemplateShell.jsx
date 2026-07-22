/**
 * TemplateShell — themed wrapper used by the template test batch.
 * Renders: themed header (mascot back arrow, hearts, hint), round label,
 * progress bar, and a decorated background behind the game content.
 */
import { useEffect } from "react";
import { motion } from "framer-motion";
import HeartDisplay from "../campaign/HeartDisplay";
import HintButton from "../campaign/HintButton";
import CodyArrow from "./CodyArrow";
import TopScene from "./TopScene";

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

// Silhouette horizon strip pinned to the bottom edge — sets the world scene
// below the play area, in a barely-contrasting shade.
function Horizon({ h }) {
  if (!h) return null;
  const style = { position: "absolute", bottom: 0, left: 0, width: "100%", pointerEvents: "none", display: "block" };
  if (h.type === "ocean") {
    return (
      <svg style={style} height="72" viewBox="0 0 375 72" preserveAspectRatio="none">
        <path d="M0 42 Q 45 26 95 40 T 190 38 T 285 42 T 375 36 L375 72 L0 72 Z" fill={h.color} />
        <path d="M46 44 C 40 32 50 28 44 16 C 41 10 47 8 46 2" stroke={h.color} strokeWidth="7" fill="none" strokeLinecap="round" />
        <path d="M320 46 C 326 34 316 30 322 18" stroke={h.color} strokeWidth="6" fill="none" strokeLinecap="round" />
        <circle cx="120" cy="24" r="5" fill={h.color} />
        <circle cx="136" cy="12" r="3.5" fill={h.color} />
        <circle cx="255" cy="20" r="4" fill={h.color} />
      </svg>
    );
  }
  if (h.type === "candy") {
    return (
      <svg style={style} height="72" viewBox="0 0 375 72" preserveAspectRatio="none">
        <path d="M0 46 Q 90 18 188 44 Q 280 66 375 40 L375 72 L0 72 Z" fill={h.color} />
        <line x1="70" y1="44" x2="70" y2="20" stroke={h.color} strokeWidth="5" strokeLinecap="round" />
        <circle cx="70" cy="14" r="11" fill={h.color} />
        <line x1="300" y1="48" x2="300" y2="28" stroke={h.color} strokeWidth="5" strokeLinecap="round" />
        <circle cx="300" cy="21" r="9" fill={h.color} />
      </svg>
    );
  }
  if (h.type === "sunshine") {
    return (
      <svg style={style} height="72" viewBox="0 0 375 72" preserveAspectRatio="none">
        <path d="M0 48 Q 40 22 85 40 Q 120 12 170 36 Q 215 10 260 38 Q 305 18 345 42 Q 362 34 375 40 L375 72 L0 72 Z" fill={h.color} />
      </svg>
    );
  }
  if (h.type === "jungle") {
    return (
      <svg style={style} height="72" viewBox="0 0 375 72" preserveAspectRatio="none">
        <path d="M0 44 Q 30 20 62 40 Q 95 14 130 38 Q 165 18 200 42 Q 240 16 278 40 Q 315 20 345 42 Q 362 32 375 38 L375 72 L0 72 Z" fill={h.color} />
        <path d="M48 42 C 42 30 52 26 46 14 C 43 8 49 6 48 0" stroke={h.color} strokeWidth="7" fill="none" strokeLinecap="round" />
        <path d="M318 44 C 324 32 314 28 320 16" stroke={h.color} strokeWidth="6" fill="none" strokeLinecap="round" />
      </svg>
    );
  }
  if (h.type === "space") {
    return (
      <svg style={style} height="72" viewBox="0 0 375 72" preserveAspectRatio="none">
        <path d="M0 40 Q 60 26 120 38 Q 190 48 250 36 Q 315 26 375 38 L375 72 L0 72 Z" fill={h.color} />
        <circle cx="90" cy="52" r="8" fill={h.color} stroke="rgba(255,255,255,0.10)" strokeWidth="2" />
        <circle cx="270" cy="56" r="6" fill={h.color} stroke="rgba(255,255,255,0.10)" strokeWidth="2" />
        <circle cx="46" cy="16" r="2" fill="rgba(255,255,255,0.25)" />
        <circle cx="200" cy="10" r="2.5" fill="rgba(255,255,255,0.22)" />
        <circle cx="330" cy="18" r="2" fill="rgba(255,255,255,0.25)" />
      </svg>
    );
  }
  if (h.type === "snow") {
    return (
      <svg style={style} height="72" viewBox="0 0 375 72" preserveAspectRatio="none">
        <path d="M0 52 L 55 18 L 110 48 L 165 12 L 225 46 L 285 20 L 340 46 L 375 34 L375 72 L0 72 Z" fill={h.color} />
        <path d="M0 60 Q 90 44 188 58 Q 280 68 375 54 L375 72 L0 72 Z" fill={h.color} opacity="0.8" />
      </svg>
    );
  }
  return null;
}

export default function TemplateShell({ theme, label, gameType, mistakes, progressPct, onBack, lang = "en", children }) {
  const isStorybookReef = theme.variant === "storybook-reef";

  // Match the phone status bar (time / wifi / battery area) to the world's color
  useEffect(() => {
    let meta = document.querySelector('meta[name="theme-color"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute("name", "theme-color");
      document.head.appendChild(meta);
    }
    const previousMeta = meta.getAttribute("content");
    meta.setAttribute("content", theme.bg);
    // Safari/standalone also derive the status-bar tint from the page root color
    const html = document.documentElement;
    const previousHtmlBg = html.style.backgroundColor;
    const previousBodyBg = document.body.style.backgroundColor;
    html.style.backgroundColor = theme.bg;
    document.body.style.backgroundColor = theme.bg;
    return () => {
      meta.setAttribute("content", previousMeta || "");
      html.style.backgroundColor = previousHtmlBg;
      document.body.style.backgroundColor = previousBodyBg;
    };
  }, [theme.bg]);

  return (
    <div style={{ position: "relative", display: "flex", flexDirection: "column", height: isStorybookReef ? "100%" : "calc(100% + env(safe-area-inset-top, 0px))", marginTop: isStorybookReef ? 0 : "calc(-1 * env(safe-area-inset-top, 0px))", fontFamily: "Fredoka, sans-serif", background: theme.bg, overflow: "hidden" }}>
      {/* Full-screen world scene — spans behind header, progress and play area */}
      <div style={{ position: "absolute", inset: 0, zIndex: 0, pointerEvents: "none", overflow: "hidden" }}>
        {isStorybookReef ? (
          <img src={theme.sceneImg} alt="" style={{ position: "absolute", top: "-18%", left: 0, width: "100%", height: "118%", objectFit: "cover", display: "block" }} />
        ) : (
          <>
            {theme.decorations.map((d, i) => <Decoration key={i} d={d} />)}
            <TopScene s={theme.topScene} />
            <Horizon h={theme.horizon} />
          </>
        )}
      </div>

      {/* Floating header — no bar, no divider; controls sit directly on the scene */}
      <div
        style={{
          flexShrink: 0,
          display: "flex",
          flexDirection: "column",
          padding: isStorybookReef
            ? "12px 20px 8px"
            : "calc(env(safe-area-inset-top, 0px) + 8px) 16px 6px",
          justifyContent: isStorybookReef ? "flex-start" : undefined,
          position: "relative",
          zIndex: 2,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {isStorybookReef ? (
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={onBack}
              style={{ border: 0, padding: 0, background: "transparent", color: "#18315E", fontFamily: "Fredoka, sans-serif", fontSize: 25, fontWeight: 700, cursor: "pointer" }}
            >
              Back
            </motion.button>
          ) : (
            <CodyArrow
              src={theme.arrowImg}
              color={theme.arrowColor || theme.accent}
              whileTap={{ scale: 0.85 }}
              onClick={onBack}
              style={{ width: 103, height: 65, objectFit: "contain", cursor: "pointer", WebkitTapHighlightColor: "transparent", flexShrink: 0 }}
            />
          )}
          <div style={{ flex: 1 }} />
          <HeartDisplay mistakes={mistakes} size={isStorybookReef ? 62 : 76} staticHearts heartColor={theme.heartColor} outlineColor={isStorybookReef ? "#18315E" : undefined} />
          <div style={{ flex: 1 }} />
          <HintButton gameType={gameType} lang={lang} variant={isStorybookReef ? "storybook" : "image"} />
        </div>
        <p style={{ margin: isStorybookReef ? "24px 0 0" : "2px 0 0 2px", fontSize: isStorybookReef ? 27 : 16, fontWeight: 700, color: theme.labelColor, lineHeight: 1.2, letterSpacing: "0.01em", textAlign: isStorybookReef ? "center" : "left" }}>
          {label}
        </p>
      </div>

      {/* Themed floating progress pill with traveling world icon */}
      {progressPct != null && !isStorybookReef && (
        <div style={{ position: "relative", zIndex: 2, flexShrink: 0, margin: "2px 20px 4px", height: 12, borderRadius: 99, background: theme.progressTrack }}>
          <motion.div animate={{ width: `${progressPct}%` }} transition={{ duration: 0.4 }} style={{ height: "100%", borderRadius: 99, background: theme.progressFill }} />
          {theme.progressIcon && (
            <motion.div
              animate={{ left: `${progressPct}%` }}
              transition={{ duration: 0.4 }}
              style={{ position: "absolute", top: "50%", marginTop: -11, marginLeft: -11, fontSize: 18, lineHeight: "22px", width: 22, height: 22, textAlign: "center", filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.25))" }}
            >
              {theme.progressIcon}
            </motion.div>
          )}
        </div>
      )}

      {/* Play area — sits on top of the scene */}
      <div style={{ flex: 1, minHeight: 0, position: "relative", zIndex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {children}
      </div>
    </div>
  );
}