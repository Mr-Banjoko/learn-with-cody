import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useAnimation } from "framer-motion";
import confetti from "canvas-confetti";

const CODY_IMG = "https://media.base44.com/images/public/69c4ec00726384fdef1ab181/6b8f13599_cody.png";

// Phase order: entrance → wave → surprise → clap → confetti → bow → done
const BG_GRADIENTS = {
  entrance: ["#0ABFBC", "#2563EB"],
  wave:     ["#06B6D4", "#3B82F6"],
  surprise: ["#F59E0B", "#EF4444"],
  clap:     ["#8B5CF6", "#EC4899"],
  confetti: ["#10B981", "#06B6D4"],
  bow:      ["#F97316", "#EF4444"],
};

const SPEECH = {
  wave:     { emoji: "👋", text: "Hi! I'm Cody!" },
  surprise: { emoji: "😮", text: "Oh wow, it's you!" },
  clap:     { emoji: "👏", text: "So happy you're here!" },
  confetti: { emoji: "🎉", text: "Let's have fun learning!" },
  bow:      { emoji: "🏃", text: "Let's go!" },
};

function FloatingLetter({ letter, style, delay }) {
  return (
    <motion.div
      animate={{ y: [0, -18, 0], rotate: [0, 8, -8, 0] }}
      transition={{ duration: 3 + Math.random(), repeat: Infinity, delay, ease: "easeInOut" }}
      style={{
        position: "absolute",
        fontFamily: "Fredoka, sans-serif",
        fontWeight: 700,
        color: "rgba(255,255,255,0.28)",
        pointerEvents: "none",
        userSelect: "none",
        ...style,
      }}
    >
      {letter}
    </motion.div>
  );
}

function SparkleRing({ active }) {
  if (!active) return null;
  const sparks = Array.from({ length: 12 });
  return (
    <>
      {sparks.map((_, i) => {
        const angle = (i / sparks.length) * 360;
        const rad = (angle * Math.PI) / 180;
        const dist = 160 + Math.random() * 60;
        return (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
            animate={{
              opacity: [0, 1, 1, 0],
              scale: [0, 1.4, 1.2, 0],
              x: Math.cos(rad) * dist,
              y: Math.sin(rad) * dist,
            }}
            transition={{ duration: 0.9, delay: i * 0.04, ease: "easeOut" }}
            style={{
              position: "absolute",
              width: 14,
              height: 14,
              borderRadius: "50%",
              background: ["#FFD93D","#FF6B6B","#4ECDC4","#C77DFF","#6BCB77","#4D96FF",
                           "#FF9F43","#FF6B6B","#FFD93D","#4ECDC4","#C77DFF","#6BCB77"][i],
              pointerEvents: "none",
              top: "50%",
              left: "50%",
              marginLeft: -7,
              marginTop: -7,
              zIndex: 30,
            }}
          />
        );
      })}
    </>
  );
}

function BgBlobs() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <motion.div
        animate={{ scale: [1, 1.2, 1], opacity: [0.15, 0.25, 0.15] }}
        transition={{ duration: 4, repeat: Infinity }}
        style={{
          position: "absolute", top: "-20%", right: "-20%",
          width: "65vw", height: "65vw", borderRadius: "50%",
          background: "rgba(255,255,255,0.18)",
        }}
      />
      <motion.div
        animate={{ scale: [1, 1.3, 1], opacity: [0.08, 0.18, 0.08] }}
        transition={{ duration: 5, repeat: Infinity, delay: 1.5 }}
        style={{
          position: "absolute", bottom: "0%", left: "-25%",
          width: "75vw", height: "75vw", borderRadius: "50%",
          background: "rgba(255,255,255,0.12)",
        }}
      />
    </div>
  );
}

export default function CodyLaunch({ onComplete }) {
  const [phase, setPhase] = useState("entrance");
  const [sparkle, setSparkle] = useState(false);
  const [bgColors, setBgColors] = useState(BG_GRADIENTS.entrance);

  const codyCtrls = useAnimation();
  const timers = useRef([]);

  const later = (fn, ms) => {
    const t = setTimeout(fn, ms);
    timers.current.push(t);
    return t;
  };

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  // ── Entrance ──────────────────────────────────
  useEffect(() => {
    setBgColors(BG_GRADIENTS.entrance);
    codyCtrls.start({
      scale: [0, 1.2, 0.92, 1.05, 1],
      y: [120, -30, 12, -8, 0],
      opacity: [0, 1, 1, 1, 1],
      transition: { duration: 0.9, times: [0, 0.5, 0.72, 0.88, 1], ease: "easeOut" },
    });
    later(() => {
      setPhase("wave");
      setBgColors(BG_GRADIENTS.wave);
    }, 950);
  }, []);

  // ── Wave (auto, 2 seconds) ────────────────────
  useEffect(() => {
    if (phase !== "wave") return;
    codyCtrls.start({
      rotate: [0, 14, -5, 14, -5, 10, 0],
      y: [0, -14, 2, -10, 2, -6, 0],
      scale: [1, 1.04, 1, 1.04, 1, 1.02, 1],
      transition: { duration: 1.6, ease: "easeInOut" },
    });
    later(() => {
      setPhase("surprise");
      setBgColors(BG_GRADIENTS.surprise);
    }, 2000);
  }, [phase]);

  // ── Surprise ──────────────────────────────────
  useEffect(() => {
    if (phase !== "surprise") return;
    codyCtrls.start({
      scale: [1, 1.18, 0.9, 1.12, 1],
      rotate: [0, -10, 8, -5, 0],
      y: [0, -25, 10, -10, 0],
      transition: { duration: 0.7, ease: "easeInOut" },
    });
    later(() => {
      setPhase("clap");
      setBgColors(BG_GRADIENTS.clap);
    }, 1500);
  }, [phase]);

  // ── Clap ──────────────────────────────────────
  useEffect(() => {
    if (phase !== "clap") return;
    // Rapid bounce to simulate clapping
    codyCtrls.start({
      y: [0, -20, 0, -20, 0, -20, 0],
      scale: [1, 1.08, 0.96, 1.08, 0.96, 1.08, 1],
      rotate: [0, 5, -5, 5, -5, 3, 0],
      transition: { duration: 1.2, ease: "easeInOut" },
    });
    later(() => {
      setPhase("confetti");
      setBgColors(BG_GRADIENTS.confetti);
    }, 1400);
  }, [phase]);

  // ── Confetti ──────────────────────────────────
  useEffect(() => {
    if (phase !== "confetti") return;
    // Arms-wide jump
    codyCtrls.start({
      y: [0, -55, 12, -32, 6, -18, 0],
      scale: [1, 1.28, 0.94, 1.18, 0.98, 1.08, 1],
      rotate: [0, -8, 8, -5, 4, -2, 0],
      transition: { duration: 1.2, ease: "easeInOut" },
    });
    setSparkle(true);
    later(() => setSparkle(false), 1000);
    fireConfetti(0);
    later(() => { setSparkle(true); fireConfetti(1); }, 1200);
    later(() => setSparkle(false), 2200);
    later(() => { setSparkle(true); fireConfetti(2); }, 2400);
    later(() => setSparkle(false), 3200);
    later(() => {
      setPhase("bow");
      setBgColors(BG_GRADIENTS.bow);
    }, 3400);
  }, [phase]);

  // ── Bow then run away ─────────────────────────
  useEffect(() => {
    if (phase !== "bow") return;
    // First bow/curtsy
    codyCtrls.start({
      y: [0, 30, 0],
      rotate: [0, 20, 0],
      scale: [1, 0.9, 1],
      transition: { duration: 0.7, ease: "easeInOut" },
    }).then(() => {
      // Then run off screen to the right
      codyCtrls.start({
        x: [0, -20, 40, 120, window.innerWidth * 0.6 + 300],
        y: [0, -30, -10, 20, 60],
        rotate: [0, -18, -22, -28, -35],
        scaleX: [1, 1.15, 1.1, 0.9, 0.7],
        opacity: [1, 1, 1, 0.7, 0],
        transition: { duration: 0.85, ease: [0.4, 0, 0.9, 0.7] },
      });
    });
    later(() => {
      setPhase("done");
      onComplete?.();
    }, 1700);
  }, [phase]);

  const fireConfetti = (burst) => {
    const colors = ["#4ECDC4","#FFD93D","#FF6B6B","#6BCB77","#4D96FF","#C77DFF","#FF9F43","#ffffff","#FFC3A0"];
    const base = { startVelocity: 50, spread: 110, ticks: 130, zIndex: 9999, colors };

    if (burst === 0) {
      confetti({ ...base, particleCount: 90, angle: 55, origin: { x: 0.22, y: 0.42 } });
      confetti({ ...base, particleCount: 90, angle: 125, origin: { x: 0.78, y: 0.42 } });
      setTimeout(() => {
        confetti({ ...base, particleCount: 60, angle: 58, origin: { x: 0.18, y: 0.5 }, startVelocity: 38 });
        confetti({ ...base, particleCount: 60, angle: 122, origin: { x: 0.82, y: 0.5 }, startVelocity: 38 });
      }, 300);
    }
    if (burst === 1) {
      confetti({ particleCount: 120, spread: 360, startVelocity: 28, decay: 0.91,
        origin: { x: 0.5, y: 0.38 }, colors, zIndex: 9999, ticks: 150 });
      confetti({ ...base, particleCount: 80, angle: 60, origin: { x: 0.25, y: 0.44 } });
      confetti({ ...base, particleCount: 80, angle: 120, origin: { x: 0.75, y: 0.44 } });
    }
    if (burst === 2) {
      confetti({ particleCount: 160, spread: 360, startVelocity: 35, decay: 0.9,
        origin: { x: 0.5, y: 0.3 }, colors, zIndex: 9999, ticks: 180 });
      setTimeout(() => {
        confetti({ ...base, particleCount: 100, angle: 50, origin: { x: 0.15, y: 0.4 } });
        confetti({ ...base, particleCount: 100, angle: 130, origin: { x: 0.85, y: 0.4 } });
      }, 250);
    }
  };

  if (phase === "done") return null;

  const bg = `linear-gradient(155deg, ${bgColors[0]} 0%, ${bgColors[1]} 100%)`;
  const label = SPEECH[phase];

  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: phase === "bow" ? 0 : 1 }}
      transition={{ duration: 0.45, delay: phase === "bow" ? 1.3 : 0 }}
      className="fixed inset-0 z-50 flex flex-col overflow-hidden"
      style={{ background: bg, transition: "background 0.75s ease" }}
    >
      <BgBlobs />

      <FloatingLetter letter="A" style={{ top: "8%",  left: "6%",  fontSize: "clamp(28px,7vw,52px)" }} delay={0} />
      <FloatingLetter letter="B" style={{ top: "12%", right: "7%", fontSize: "clamp(24px,6vw,44px)" }} delay={0.7} />
      <FloatingLetter letter="C" style={{ bottom: "22%", right: "5%", fontSize: "clamp(20px,5vw,38px)" }} delay={1.4} />
      <FloatingLetter letter="Z" style={{ bottom: "30%", left: "4%", fontSize: "clamp(18px,4.5vw,34px)" }} delay={0.4} />
      <FloatingLetter letter="★" style={{ top: "35%", left: "3%",  fontSize: "clamp(16px,4vw,28px)" }} delay={1.8} />
      <FloatingLetter letter="♪" style={{ top: "28%", right: "4%", fontSize: "clamp(16px,4vw,28px)" }} delay={1.1} />

      {/* App title */}
      <motion.div
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.55, duration: 0.6, ease: "easeOut" }}
        className="relative z-10 text-center flex-shrink-0"
        style={{ paddingTop: "max(3.5rem, env(safe-area-inset-top, 3.5rem))", paddingLeft: 24, paddingRight: 24 }}
      >
        <h1
          style={{
            fontFamily: "Fredoka, sans-serif",
            fontSize: "clamp(2.2rem, 9vw, 4rem)",
            fontWeight: 700,
            color: "white",
            textShadow: "0 4px 28px rgba(0,0,0,0.25), 0 2px 0 rgba(0,0,0,0.08)",
            letterSpacing: "0.02em",
            lineHeight: 1.1,
          }}
        >
          Cody's Phonics
        </h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          style={{
            fontFamily: "Fredoka, sans-serif",
            fontSize: "clamp(1rem, 4vw, 1.6rem)",
            color: "rgba(255,255,255,0.88)",
            marginTop: "0.3em",
          }}
        >
          Let's learn to read! 📖
        </motion.p>
      </motion.div>

      {/* Cody */}
      <div
        className="relative z-10 flex items-center justify-center"
        style={{ flex: "1 1 0%", minHeight: 0 }}
      >
        <motion.div
          animate={codyCtrls}
          style={{ position: "relative" }}
        >
          <SparkleRing active={sparkle} />

          <motion.div
            animate={phase === "confetti" ? { scaleX: [1, 1.3, 0.8, 1.2, 1], opacity: [0.18, 0.1, 0.22, 0.12, 0.18] } : {}}
            transition={{ duration: 1.1, repeat: phase === "confetti" ? 2 : 0 }}
            style={{
              position: "absolute",
              bottom: -8,
              left: "10%",
              width: "80%",
              height: 28,
              borderRadius: "50%",
              background: "rgba(0,0,0,0.18)",
              filter: "blur(10px)",
            }}
          />

          <motion.img
            src={CODY_IMG}
            alt="Cody the learning mascot"
            draggable={false}
            style={{
              width:  "clamp(240px, 68vw, 420px)",
              height: "clamp(270px, 75vw, 470px)",
              objectFit: "contain",
              filter: "drop-shadow(0 28px 56px rgba(0,0,0,0.28))",
              userSelect: "none",
              WebkitUserSelect: "none",
              pointerEvents: "none",
              display: "block",
            }}
          />
        </motion.div>
      </div>

      {/* Bottom speech bubble */}
      <div
        className="relative z-10 flex flex-col items-center gap-3 flex-shrink-0"
        style={{
          paddingBottom: "max(2.5rem, env(safe-area-inset-bottom, 2.5rem))",
          paddingLeft: 24,
          paddingRight: 24,
          minHeight: 100,
        }}
      >
        <AnimatePresence mode="wait">
          {label && (
            <motion.div
              key={phase}
              initial={{ opacity: 0, scale: 0.75, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: -12 }}
              transition={{ type: "spring", stiffness: 420, damping: 28 }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "14px 28px",
                borderRadius: 999,
                background: "rgba(255,255,255,0.22)",
                backdropFilter: "blur(14px)",
                WebkitBackdropFilter: "blur(14px)",
                border: "2px solid rgba(255,255,255,0.45)",
                boxShadow: "0 10px 40px rgba(0,0,0,0.15)",
              }}
            >
              <span style={{ fontSize: "clamp(1.5rem, 5.5vw, 2.2rem)" }}>{label.emoji}</span>
              <span
                style={{
                  fontFamily: "Fredoka, sans-serif",
                  fontSize: "clamp(1.1rem, 4.5vw, 1.7rem)",
                  fontWeight: 600,
                  color: "white",
                  textShadow: "0 2px 10px rgba(0,0,0,0.18)",
                  whiteSpace: "nowrap",
                }}
              >
                {label.text}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}