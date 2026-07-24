import { motion } from "framer-motion";
import { Check, Lock, Trophy } from "lucide-react";
import WavingCody from "./WavingCody";

function Rating({ stars }) {
  return <div style={{ display: "flex", alignItems: "center", gap: 2, padding: "2px 7px", border: "2px solid #A45A00", borderRadius: 8, background: "#FFD34D", color: "#A45A00", boxShadow: "0 3px 0 #C87500", fontSize: 13 }}><Trophy size={13} fill="#FFF2A8" />{[1, 2, 3].map((star) => <span key={star} style={{ color: stars >= star ? "#FFF4A3" : "#D68A12", textShadow: "0 1px 0 #A45A00" }}>★</span>)}</div>;
}

export default function CandyLevelNode({ num, onTap, stars, isActive, isCompleted, isMilestone, isFinal, lang = "en" }) {
  const isLocked = !isActive && !isCompleted;
  const size = isActive ? 116 : isFinal ? 104 : isMilestone ? 96 : isCompleted ? 88 : 74;
  const height = isActive ? 44 : size;
  const depth = isActive ? 12 : 9;
  const marginTop = Math.max(0, 52 - height / 2);
  const top = isActive ? "#35C9C2" : isCompleted || isFinal ? "#FFD33D" : isMilestone ? "#F47A2A" : "#CBEFEB";
  const side = isActive ? "#137F86" : isCompleted || isFinal ? "#F47A2A" : isMilestone ? "#C84C22" : "#6CBAB6";
  const border = isActive ? "#0E6E73" : isCompleted || isFinal ? "#A94B1F" : isMilestone ? "#923316" : "#3B8989";

  return (
    <div style={{ width: size + 30, minHeight: 126, display: "flex", flexDirection: "column", alignItems: "center", position: "relative" }}>
      <motion.button aria-label={`Play level ${num}`} whileTap={{ scale: 0.9 }} onClick={() => onTap(num)} style={{ position: "relative", width: size, height, marginTop, border: `3px solid ${border}`, borderRadius: "50%", background: top, boxShadow: `0 ${depth}px 0 ${side}, 0 ${depth + 6}px 0 rgba(45,75,75,0.2)`, cursor: "pointer", WebkitTapHighlightColor: "transparent", zIndex: 2 }}>
        {!isActive && <span style={{ position: "absolute", inset: isCompleted || isFinal ? 9 : 7, border: `3px solid ${isCompleted || isFinal ? "#FFF2A1" : "#ECFFFC"}`, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: isCompleted || isFinal ? "#A94B1F" : "#256F73", fontWeight: 800, fontSize: isMilestone ? 16 : 22 }}>
          {isMilestone && !isCompleted ? "BOSS" : isFinal && isCompleted ? <Trophy size={32} /> : isCompleted ? <Check size={34} strokeWidth={4} /> : isLocked ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 0 }}>
              <Lock size={18} fill="#6CBAB6" />
              <span style={{ fontSize: 13, lineHeight: 1, fontWeight: 800, color: "#256F73", marginTop: 1 }}>{num}</span>
            </div>
          ) : <Lock size={24} fill="#6CBAB6" />}
        </span>}
        {isActive && <WavingCody level={num} onSelect={onTap} />}
      </motion.button>
      <div style={{ marginTop: depth + 10, minHeight: 25, display: "flex", alignItems: "center", justifyContent: "center" }}>
        {isCompleted && <Rating stars={stars} />}
      </div>
    </div>
  );
}