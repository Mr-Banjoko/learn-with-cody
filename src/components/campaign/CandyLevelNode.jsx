import { motion } from "framer-motion";
import { Check, Lock, Trophy } from "lucide-react";
import WavingCody from "./WavingCody";

function Rating({ stars }) {
  return <div style={{ display: "flex", alignItems: "center", gap: 2, padding: "2px 7px", border: "2px solid #A45A00", borderRadius: 8, background: "#FFD34D", color: "#A45A00", boxShadow: "0 3px 0 #C87500", fontSize: 13 }}><Trophy size={13} fill="#FFF2A8" />{[1, 2, 3].map((star) => <span key={star} style={{ color: stars >= star ? "#FFF4A3" : "#D68A12", textShadow: "0 1px 0 #A45A00" }}>★</span>)}</div>;
}

export default function CandyLevelNode({ num, onTap, stars, isActive, isCompleted, isMilestone, isFinal, lang = "en" }) {
  const isLocked = !isActive && !isCompleted;
  const size = isActive ? 112 : isFinal ? 108 : isMilestone ? 104 : isCompleted ? 88 : 74;
  const top = isActive ? "#35C9C2" : isCompleted || isFinal ? "#FFD33D" : isMilestone ? "#F47A2A" : "#CBEFEB";
  const side = isActive ? "#137F86" : isCompleted || isFinal ? "#F47A2A" : isMilestone ? "#C84C22" : "#6CBAB6";
  const border = isActive ? "#0E6E73" : isCompleted || isFinal ? "#A94B1F" : isMilestone ? "#923316" : "#3B8989";

  return (
    <div style={{ width: size + 24, height: size + 42, display: "flex", flexDirection: "column", alignItems: "center", position: "relative" }}>
      <motion.button whileTap={{ scale: 0.9 }} onClick={() => onTap(num)} style={{ position: "relative", width: size, height: size * 0.63, marginTop: 8, border: `3px solid ${border}`, borderRadius: "50%", background: top, boxShadow: `0 ${size * 0.18}px 0 ${side}, 0 ${size * 0.24}px 0 rgba(72,62,100,0.24)`, cursor: "pointer", WebkitTapHighlightColor: "transparent", zIndex: 2 }}>
        <span style={{ position: "absolute", inset: 7, border: `3px solid ${isCompleted || isFinal ? "#FFF2A1" : isActive ? "#A8F3EE" : "#ECFFFC"}`, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: isCompleted || isFinal ? "#A94B1F" : "#256F73", fontWeight: 800, fontSize: isMilestone ? 17 : 22 }}>
          {isMilestone && !isCompleted ? "BOSS" : isFinal && isCompleted ? <Trophy size={32} /> : isCompleted ? <Check size={34} strokeWidth={4} /> : isLocked ? <Lock size={24} fill="#6CBAB6" /> : num}
        </span>
        {isActive && <WavingCody level={num} onSelect={onTap} />}
      </motion.button>
      <div style={{ marginTop: size * 0.18 + 8, minHeight: 25, display: "flex", alignItems: "center", justifyContent: "center" }}>
        {isCompleted ? <Rating stars={stars} /> : <span style={{ color: isLocked ? "#FFFFFF" : "#9A5A00", fontSize: 15, fontWeight: 800, textShadow: isLocked ? "0 1px 2px #55598F" : "none" }}>{isFinal ? (lang === "zh" ? "完成！" : "Complete!") : num}</span>}
      </div>
    </div>
  );
}