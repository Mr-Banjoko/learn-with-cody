/**
 * Draw a Line — Short A
 * BUILD_FINGERPRINT: DAL-SHORT-A-v7 | 2026-04-25
 */
import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import BackArrow from "../../BackArrow";
import DrawALineGame from "./DrawALineGame";
import { shortARounds } from "../../../lib/drawALineData";

const BUILD_ID = "DAL-SHORT-A-v7";
const BUILD_DATE = "2026-04-25";

function DebugPanel() {
  const [swInfo, setSwInfo] = useState({ controller: "checking...", scriptURL: "—" });

  useEffect(() => {
    if (!("serviceWorker" in navigator)) {
      setSwInfo({ controller: "SW not supported", scriptURL: "—" });
      return;
    }
    const ctrl = navigator.serviceWorker.controller;
    if (ctrl) {
      setSwInfo({ controller: "ACTIVE", scriptURL: ctrl.scriptURL });
    } else {
      setSwInfo({ controller: "NONE (no SW controlling)", scriptURL: "—" });
    }
  }, []);

  return (
    <div style={{ margin: "6px 10px 0", padding: "7px 10px", background: "#1E293B", borderRadius: 10, fontSize: 11, fontFamily: "monospace", color: "#A3E635", lineHeight: 1.7, flexShrink: 0 }}>
      <div>🔬 BUILD: <b style={{color:"#FFF"}}>{ BUILD_ID }</b> | { BUILD_DATE }</div>
      <div>📦 ROUNDS: <b style={{color:"#FFF"}}>{ shortARounds.length }</b> | R1: <b style={{color:"#FFF"}}>{ shortARounds[0]?.map(e=>e.word).join(", ") }</b></div>
      <div>🌐 SW: <b style={{color: swInfo.controller === "ACTIVE" ? "#A3E635" : "#F87171"}}>{ swInfo.controller }</b></div>
      <div style={{wordBreak:"break-all"}}>🔗 SW URL: <span style={{color:"#93C5FD"}}>{ swInfo.scriptURL }</span></div>
    </div>
  );
}

export default function DrawALineShortA({ onBack, lang = "en" }) {
  const [phase, setPhase] = useState("playing");
  const [key, setKey] = useState(0);

  const handleComplete = useCallback(() => setPhase("complete"), []);
  const handleRestart = useCallback(() => { setKey((k) => k + 1); setPhase("playing"); }, []);

  const total = shortARounds.length;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", fontFamily: "Fredoka, sans-serif", background: "linear-gradient(160deg, #E8FFFE 0%, #FFF9E6 60%, #F5F0FF 100%)", overflow: "hidden" }}>
      <div style={{ flexShrink: 0, display: "flex", alignItems: "center", gap: 8, padding: "calc(env(safe-area-inset-top,0px) + 10px) 16px 10px", background: "rgba(255,255,255,0.82)", backdropFilter: "blur(10px)", borderBottom: "1.5px solid rgba(0,0,0,0.06)" }}>
        <BackArrow onPress={onBack} />
        <div style={{ flex: 1, textAlign: "center", marginRight: 32 }}>
          <p style={{ margin: 0, fontSize: 19, fontWeight: 700, color: "#1E293B" }}>
            {lang === "zh" ? "连线 — 短音 A 🍎" : "Draw a Line · Short A 🍎"}
          </p>
        </div>
      </div>

      {/* ── TEMPORARY DEBUG PANEL — remove once Safari parity confirmed ── */}
      <DebugPanel />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <AnimatePresence mode="wait">
          {phase === "playing" ? (
            <motion.div key={`game-${key}`} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.22 }} style={{ flex: 1, display: "flex", flexDirection: "column" }}>
              <DrawALineGame key={key} rounds={shortARounds} onComplete={handleComplete} lang={lang} />
            </motion.div>
          ) : (
            <motion.div key="complete" initial={{ opacity: 0, scale: 0.88 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: "spring", stiffness: 260, damping: 18 }} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 18, padding: "32px 24px" }}>
              <div style={{ fontSize: 76 }}>🎉</div>
              <p style={{ fontSize: 28, fontWeight: 700, color: "#1E293B", margin: 0, textAlign: "center" }}>{lang === "zh" ? "太棒了！" : "Amazing job!"}</p>
              <p style={{ fontSize: 16, color: "#64748B", margin: 0, textAlign: "center" }}>{lang === "zh" ? `你完成了全部 ${total} 关连线！` : `You matched all ${total} rounds!`}</p>
              <motion.button whileTap={{ scale: 0.95 }} onClick={handleRestart} style={{ marginTop: 10, padding: "14px 44px", borderRadius: 999, background: "linear-gradient(135deg, #4ECDC4, #44A08D)", color: "white", border: "none", fontSize: 20, fontWeight: 700, fontFamily: "Fredoka, sans-serif", cursor: "pointer", boxShadow: "0 8px 28px rgba(78,205,196,0.4)", WebkitTapHighlightColor: "transparent" }}>
                {lang === "zh" ? "再玩一次 🔄" : "Play Again 🔄"}
              </motion.button>
              <motion.button whileTap={{ scale: 0.95 }} onClick={onBack} style={{ padding: "11px 32px", borderRadius: 999, background: "white", color: "#4ECDC4", border: "2px solid #4ECDC4", fontSize: 17, fontWeight: 600, fontFamily: "Fredoka, sans-serif", cursor: "pointer", WebkitTapHighlightColor: "transparent" }}>
                {lang === "zh" ? "返回" : "Back"}
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
