import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import Lottie from "lottie-react";
import { prepareWinnerLottie, themeLottie } from "@/lib/shortAThemedLottie";

const UNLOCK_URL = "https://media.base44.com/files/public/69c4ec00726384fdef1ab181/51a21d825_Unlock.json";
const WINNER_URL = "https://media.base44.com/files/public/69c4ec00726384fdef1ab181/951d864a9_Goldwinnernumberoneolivebranchwith3steps.json";
const CODY_URL = "https://media.base44.com/files/public/69c4ec00726384fdef1ab181/c16f889ac_ipcopy.json";

export default function ShortAActiveStage({ playUnlock, onSequenceStart }) {
  const [assets, setAssets] = useState(null);
  const [showStage, setShowStage] = useState(!playUnlock);
  const [showCody, setShowCody] = useState(!playUnlock);
  const started = useRef(false);
  const stageRef = useRef(null);

  useEffect(() => {
    Promise.all([UNLOCK_URL, WINNER_URL, CODY_URL].map((url) => fetch(url).then((r) => r.json())))
      .then(([unlock, winner, cody]) => setAssets({ unlock: themeLottie(unlock), winner: prepareWinnerLottie(winner), cody }));
  }, []);

  useEffect(() => {
    if (assets && playUnlock && !started.current) { started.current = true; onSequenceStart(); }
  }, [assets, playUnlock, onSequenceStart]);

  if (!assets) return null;
  const finishStage = () => {
    stageRef.current?.goToAndStop(356, true);
    setShowCody(true);
  };

  return (
    <div style={{ position: "absolute", inset: -10, pointerEvents: "none" }}>
      {!showStage ? (
        <Lottie animationData={assets.unlock} loop={false} autoplay onComplete={() => setShowStage(true)} style={{ width: "100%", height: "100%" }} />
      ) : (
        <Lottie lottieRef={stageRef} animationData={assets.winner} loop={false} autoplay={playUnlock} initialSegment={playUnlock ? undefined : [356, 357]} onComplete={finishStage} style={{ width: "100%", height: "100%" }} />
      )}
      {showCody && <motion.div initial={playUnlock ? { opacity: 0, scale: 0, y: 35 } : false} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ type: "spring", stiffness: 220, damping: 15 }} style={{ position: "absolute", left: "33%", top: "18%", width: "34%", height: "34%" }}><Lottie animationData={assets.cody} loop autoplay /></motion.div>}
    </div>
  );
}