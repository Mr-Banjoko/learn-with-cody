import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { GAME_DATA } from "../../lib/picSliceData";

const VOWEL_ORDER = ["short-a", "short-e", "short-i", "short-o", "short-u"];

export default function VowelSelect({ onSelect, onBack }) {
  return (
    <div style={{ background: "#D6EEFF", minHeight: "100%", fontFamily: "Fredoka, sans-serif", paddingBottom: 100 }}>
      {/* Header */}
      <div style={{ background: "#A8D0E6", borderBottomLeftRadius: 28, borderBottomRightRadius: 28, padding: "16px 20px 20px", display: "flex", alignItems: "center", gap: 12 }}>
        <button
          onClick={onBack}
          style={{ width: 40, height: 40, borderRadius: 20, background: "rgba(255,255,255,0.7)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
        >
          <ArrowLeft size={22} color="#1E3A5F" />
        </button>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: "#1E3A5F" }}>Rearrange the Pictures</h1>
      </div>

      {/* Vowel folders */}
      <div style={{ padding: "24px 16px", display: "flex", flexDirection: "column", gap: 12 }}>
        <p style={{ fontSize: 15, fontWeight: 600, color: "#4A90C4", marginBottom: 4 }}>📂 Choose a Word Group</p>
        {VOWEL_ORDER.map((id, i) => {
          const data = GAME_DATA[id];
          const isReady = id === "short-a";
          return (
            <motion.button
              key={id}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.07 }}
              whileTap={isReady ? { scale: 0.97 } : {}}
              onClick={() => isReady && onSelect(id)}
              style={{
                display: "flex", alignItems: "center", gap: 14,
                padding: "16px 18px", borderRadius: 20,
                background: isReady ? "white" : "rgba(255,255,255,0.55)",
                border: isReady ? "2px solid #A8D0E6" : "2px solid rgba(168,208,230,0.3)",
                boxShadow: isReady ? "0 6px 24px rgba(30,58,95,0.10)" : "none",
                cursor: isReady ? "pointer" : "not-allowed",
                opacity: isReady ? 1 : 0.6,
                width: "100%",
                textAlign: "left",
              }}
            >
              <div style={{ width: 52, height: 52, borderRadius: 16, background: "#D6EEFF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, flexShrink: 0 }}>
                {data.emoji}
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 20, fontWeight: 700, color: "#1E3A5F" }}>{data.label}</p>
                <p style={{ fontSize: 13, color: "#7BACC8" }}>{isReady ? "Tap to open!" : "Coming soon"}</p>
              </div>
              {isReady ? (
                <div style={{ width: 32, height: 32, borderRadius: 16, background: "#4A90C4", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ color: "white", fontSize: 18, lineHeight: 1 }}>›</span>
                </div>
              ) : (
                <span style={{ fontSize: 11, fontWeight: 600, color: "#7BACC8", background: "#EEF6FF", padding: "3px 10px", borderRadius: 99 }}>Soon</span>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}