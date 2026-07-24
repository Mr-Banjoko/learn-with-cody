import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import Lottie from "lottie-react";

const WINNER_URL = "https://media.base44.com/files/public/69c4ec00726384fdef1ab181/951d864a9_Goldwinnernumberoneolivebranchwith3steps.json";
const CODY_URL = "https://media.base44.com/files/public/69c4ec00726384fdef1ab181/c16f889ac_ipcopy.json";

function cleanWinnerAnimation(data) {
  const cleaned = JSON.parse(JSON.stringify(data));
  cleaned.layers = cleaned.layers.filter((layer) => layer.nm !== "winner text Outlines");
  const unit = cleaned.assets.find((asset) => asset.id === "comp_0");
  if (unit) unit.layers = unit.layers.filter((layer) => /^(Stere_|Firecracker)/.test(layer.nm));
  return cleaned;
}

export default function ShortALevelUnlockCelebration({ onStart, onComplete }) {
  const [winner, setWinner] = useState(null);
  const [cody, setCody] = useState(null);
  const started = useRef(false);

  useEffect(() => {
    Promise.all([fetch(WINNER_URL).then((r) => r.json()), fetch(CODY_URL).then((r) => r.json())])
      .then(([winnerData, codyData]) => { setWinner(cleanWinnerAnimation(winnerData)); setCody(codyData); });
  }, []);

  useEffect(() => {
    if (winner && cody && !started.current) { started.current = true; onStart(); }
  }, [winner, cody, onStart]);

  if (!winner || !cody) return null;
  return (
    <div aria-hidden="true" style={{ position: "absolute", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none", overflow: "hidden" }}>
      <div style={{ position: "relative", width: "min(100vw, 520px)", aspectRatio: "1 / 1" }}>
        <Lottie animationData={winner} loop={false} autoplay onComplete={onComplete} style={{ width: "100%", height: "100%" }} />
        <motion.div initial={{ opacity: 0, scale: 0, x: "-50%", y: 90 }} animate={{ opacity: 1, scale: 1, x: "-50%", y: 0 }} transition={{ delay: 0.72, type: "spring", stiffness: 220, damping: 15 }} style={{ position: "absolute", left: "50%", top: "21%", width: "34%", height: "34%" }}>
          <Lottie animationData={cody} loop autoplay style={{ width: "100%", height: "100%" }} />
        </motion.div>
      </div>
    </div>
  );
}