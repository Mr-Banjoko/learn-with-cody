import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";

const CODY_IMG = "https://media.base44.com/images/public/69c4ec00726384fdef1ab181/6b8f13599_cody.png";

// Animation phases: wave → wink → confetti → runaway → done
const PHASE_WAVE = "wave";
const PHASE_WINK = "wink";
const PHASE_CONFETTI = "confetti";
const PHASE_RUNAWAY = "runaway";
const PHASE_DONE = "done";

export default function CodyLaunch({ onComplete }) {
  const [phase, setPhase] = useState(PHASE_WAVE);
  const [audioUnlocked, setAudioUnlocked] = useState(false);
  const [tapped, setTapped] = useState(false);
  const [showTapHint, setShowTapHint] = useState(true);
  const confettiFired = useRef(false);
  const phaseTimer = useRef(null);

  // Show wave, then auto-progress through phases on tap
  useEffect(() => {
    // Pulse tap hint after 1.5s
    const hintTimer = setTimeout(() => setShowTapHint(true), 1500);
    return () => clearTimeout(hintTimer);
  }, []);

  useEffect(() => {
    if (phase === PHASE_WINK) {
      phaseTimer.current = setTimeout(() => setPhase(PHASE_CONFETTI), 1200);
    }
    if (phase === PHASE_CONFETTI) {
      if (!confettiFired.current) {
        confettiFired.current = true;
        fireConfetti();
      }
      phaseTimer.current = setTimeout(() => setPhase(PHASE_RUNAWAY), 2200);
    }
    if (phase === PHASE_RUNAWAY) {
      phaseTimer.current = setTimeout(() => {
        setPhase(PHASE_DONE);
        onComplete?.();
      }, 1000);
    }
    return () => clearTimeout(phaseTimer.current);
  }, [phase, onComplete]);

  const fireConfetti = () => {
    const count = 180;
    const defaults = { startVelocity: 30, spread: 360, ticks: 80, zIndex: 9999 };
    const colors = ["#4ECDC4", "#FFD93D", "#FF6B6B", "#6BCB77", "#4D96FF", "#C77DFF", "#FF9F43"];
    confetti({ ...defaults, particleCount: Math.floor(count * 0.25), origin: { x: 0.35, y: 0.5 }, colors });
    confetti({ ...defaults, particleCount: Math.floor(count * 0.25), origin: { x: 0.65, y: 0.5 }, colors });
    setTimeout(() => {
      confetti({ ...defaults, particleCount: Math.floor(count * 0.25), origin: { x: 0.35, y: 0.45 }, colors });
      confetti({ ...defaults, particleCount: Math.floor(count * 0.25), origin: { x: 0.65, y: 0.45 }, colors });
    }, 300);
  };

  const handleTap = () => {
    if (tapped || phase === PHASE_RUNAWAY || phase === PHASE_DONE) return;
    setTapped(true);
    setShowTapHint(false);
    setAudioUnlocked(true);

    // Unlock audio context with a silent buffer
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const buf = ctx.createBuffer(1, 1, 22050);
      const src = ctx.createBufferSource();
      src.buffer = buf;
      src.connect(ctx.destination);
      src.start(0);
    } catch (e) {}

    setPhase(PHASE_WINK);
  };

  // Cody animations per phase
  const getCodyVariants = () => {
    if (phase === PHASE_WAVE) {
      return {
        animate: {
          rotate: [0, 8, -4, 8, 0],
          y: [0, -8, 0],
          transition: { duration: 1.2, repeat: Infinity, repeatDelay: 0.8 },
        },
      };
    }
    if (phase === PHASE_WINK) {
      return {
        animate: {
          scale: [1, 1.08, 1],
          rotate: [0, -5, 5, 0],
          transition: { duration: 0.6, repeat: 1 },
        },
      };
    }
    if (phase === PHASE_CONFETTI) {
      return {
        animate: {
          y: [0, -24, 0, -16, 0],
          scale: [1, 1.15, 1, 1.1, 1],
          rotate: [0, -8, 8, -5, 0],
          transition: { duration: 0.9, repeat: 2 },
        },
      };
    }
    if (phase === PHASE_RUNAWAY) {
      return {
        animate: {
          x: [0, -20, 600],
          rotate: [0, -10, -20],
          opacity: [1, 1, 0],
          transition: { duration: 0.9, ease: "easeIn" },
        },
      };
    }
    return {};
  };

  // Wink overlay — covers one eye with a closed eye
  const WinkEye = () => (
    <motion.div
      className="absolute"
      style={{ top: "30%", right: "28%", width: 22, height: 12, background: "#5EEAD4", borderRadius: "0 0 16px 16px", zIndex: 10 }}
      initial={{ scaleY: 0 }}
      animate={{ scaleY: [0, 1, 1, 0], transition: { duration: 0.9, times: [0, 0.2, 0.7, 1] } }}
    />
  );

  const variants = getCodyVariants();

  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-center z-50 overflow-hidden"
      style={{
        background: "linear-gradient(160deg, #E0FAF8 0%, #FFF9E6 50%, #F0E6FF 100%)",
      }}
    >
      {/* Title */}
      <AnimatePresence>
        {phase !== PHASE_RUNAWAY && phase !== PHASE_DONE && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="text-center mb-4"
          >
            <h1 className="text-4xl font-semibold text-primary tracking-wide" style={{ fontFamily: "Fredoka, sans-serif" }}>
              Cody's Phonics
            </h1>
            <p className="text-muted-foreground text-lg mt-1" style={{ fontFamily: "Fredoka, sans-serif" }}>
              Let's learn to read!
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cody */}
      <div className="relative flex items-center justify-center" style={{ width: 280, height: 320 }}>
        <motion.div
          className="cursor-pointer select-none relative"
          {...variants}
          onClick={handleTap}
          whileTap={!tapped ? { scale: 0.93 } : {}}
        >
          <img
            src={CODY_IMG}
            alt="Cody"
            style={{ width: 260, height: 300, objectFit: "contain", filter: "drop-shadow(0 12px 32px rgba(78,205,196,0.25))" }}
            draggable={false}
          />
          {phase === PHASE_WINK && <WinkEye />}
        </motion.div>
      </div>

      {/* Tap hint */}
      <AnimatePresence>
        {showTapHint && phase === PHASE_WAVE && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: [0.7, 1, 0.7], scale: [1, 1.05, 1], transition: { duration: 1.5, repeat: Infinity } }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="mt-6 flex flex-col items-center gap-2"
          >
            <div
              className="px-7 py-3 rounded-full text-xl font-semibold text-white shadow-lg"
              style={{ background: "linear-gradient(135deg, #4ECDC4, #44A08D)", fontFamily: "Fredoka, sans-serif" }}
            >
              👆 Tap Cody!
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Phase labels */}
      <AnimatePresence mode="wait">
        {phase === PHASE_WINK && (
          <motion.p
            key="wink"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-4 text-2xl"
            style={{ fontFamily: "Fredoka, sans-serif", color: "#4ECDC4" }}
          >
            😉 Hi there!
          </motion.p>
        )}
        {phase === PHASE_CONFETTI && (
          <motion.p
            key="confetti"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="mt-4 text-2xl"
            style={{ fontFamily: "Fredoka, sans-serif", color: "#FFD93D" }}
          >
            🎉 Let's have fun!
          </motion.p>
        )}
      </AnimatePresence>

      {/* Decorative blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div style={{ position: "absolute", top: -60, right: -60, width: 200, height: 200, background: "radial-gradient(circle, rgba(78,205,196,0.15) 0%, transparent 70%)", borderRadius: "50%" }} />
        <div style={{ position: "absolute", bottom: -80, left: -40, width: 240, height: 240, background: "radial-gradient(circle, rgba(255,217,61,0.15) 0%, transparent 70%)", borderRadius: "50%" }} />
        <div style={{ position: "absolute", top: "40%", right: -30, width: 160, height: 160, background: "radial-gradient(circle, rgba(199,125,255,0.12) 0%, transparent 70%)", borderRadius: "50%" }} />
      </div>
    </div>
  );
}