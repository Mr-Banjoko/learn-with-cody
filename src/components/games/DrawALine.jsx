/**
 * DrawALine — top-level entry point shown in the Games tab.
 * Shows a vowel-group selector (Short a / e / i / o / u subfolders).
 */
import { useState } from "react";
import { motion } from "framer-motion";
import BackArrow from "../BackArrow";
import DrawALineShortA from "./drawALine/DrawALineShortA";
import DrawALineShortE from "./drawALine/DrawALineShortE";
import DrawALineShortI from "./drawALine/DrawALineShortI";
import DrawALineShortO from "./drawALine/DrawALineShortO";
import DrawALineShortU from "./drawALine/DrawALineShortU";

const VOWEL_GROUPS = [
  { id: "short-a", label: "Short A", labelZh: "短音 A", emoji: "🍎", color: "#FF6B6B", bg: "#FFF0F0", available: true },
  { id: "short-e", label: "Short E", labelZh: "短音 E", emoji: "🥚", color: "#FFD93D", bg: "#FFFDE7", available: false },
  { id: "short-i", label: "Short I", labelZh: "短音 I", emoji: "🐛", color: "#6BCB77", bg: "#F0FFF4", available: false },
  { id: "short-o", label: "Short O", labelZh: "短音 O", emoji: "🐙", color: "#4D96FF", bg: "#EFF6FF", available: false },
  { id: "short-u", label: "Short U", labelZh: "短音 U", emoji: "☂️", color: "#C77DFF", bg: "#FAF0FF", available: false },
];

export default function DrawALine({ onBack, lang = "en" }) {
  const [selected, setSelected] = useState(null);

  const exit = () => setSelected(null);

  if (selected === "short-a") return <DrawALineShortA onBack={exit} lang={lang} />;
  if (selected === "short-e") return <DrawALineShortE onBack={exit} lang={lang} />;
  if (selected === "short-i") return <DrawALineShortI onBack={exit} lang={lang} />;
  if (selected === "short-o") return <DrawALineShortO onBack={exit} lang={lang} />;
  if (selected === "short-u") return <DrawALineShortU onBack={exit} lang={lang} />;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        fontFamily: "Fredoka, sans-serif",
        background: "linear-gradient(160deg, #E8FFFE 0%, #FFF9E6 60%, #F5F0FF 100%)",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        style={{
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "calc(env(safe-area-inset-top,0px) + 10px) 16px 14px",
          background: "rgba(255,255,255,0.85)",
          backdropFilter: "blur(10px)",
          borderBottom: "1.5px solid rgba(0,0,0,0.06)",
        }}
      >
        <BackArrow onPress={onBack} />
        <div style={{ flex: 1, textAlign: "center", marginRight: 32 }}>
          <p style={{ margin: 0, fontSize: 21, fontWeight: 700, color: "#1E293B" }}>
            {lang === "zh" ? "🖊️ 连线游戏" : "🖊️ Draw a Line"}
          </p>
          <p style={{ margin: "2px 0 0", fontSize: 13, color: "#64748B" }}>
            {lang === "zh" ? "听音，把单词和声音连起来" : "Listen and match words to sounds"}
          </p>
        </div>
      </div>

      {/* Vowel group cards */}
      <div style={{ flex: 1, overflowY: "auto", padding: "20px 16px 32px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {VOWEL_GROUPS.map((vg, i) => (
            <motion.div
              key={vg.id}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              onClick={() => setSelected(vg.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
                padding: "16px 18px",
                borderRadius: 22,
                background: vg.bg,
                border: `2px solid ${vg.color}30`,
                boxShadow: `0 6px 24px ${vg.color}15`,
                cursor: "pointer",
              }}
            >
              <div
                style={{
                  width: 60,
                  height: 60,
                  borderRadius: 18,
                  background: "white",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 32,
                  boxShadow: `0 4px 14px ${vg.color}25`,
                  flexShrink: 0,
                }}
              >
                {vg.emoji}
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "#1E293B" }}>
                  {lang === "zh" ? vg.labelZh : vg.label}
                </p>
                <p style={{ margin: "2px 0 0", fontSize: 13, color: "#64748B" }}>
                  {vg.available
                    ? (lang === "zh" ? "点击开始游戏" : "Tap to play")
                    : (lang === "zh" ? "即将上线" : "Coming soon")}
                </p>
              </div>
              <div
                style={{
                  padding: "4px 12px",
                  borderRadius: 999,
                  background: `${vg.color}20`,
                  color: vg.color,
                  fontSize: 12,
                  fontWeight: 700,
                }}
              >
                {vg.available ? (lang === "zh" ? "开始 🎮" : "Play 🎮") : (lang === "zh" ? "即将开始 ✨" : "Soon ✨")}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}