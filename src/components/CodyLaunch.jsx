import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useAnimation } from "framer-motion";
import confetti from "canvas-confetti";

const CODY_IMG = "https://media.base44.com/images/public/69c4ec00726384fdef1ab181/6b8f13599_cody.png";

const PHASES = ["entrance", "wave", "wink", "confetti", "runaway", "done"];

const BG_COLORS = {
  entrance: "linear-gradient(160deg, #0ABFBC 0%, #FC354C 100%)",
  wave:     "linear-gradient(160deg, #4ECDC4 0%, #44A08D 100%)",
  wink:     "linear-gradient(160deg, #F7971E 0%, #FFD200 100%)",
  confetti: "linear-gradient(160deg, #C77DFF 0%, #4D96FF 100%)",
  runaway:  "linear-gradient(160deg, #4ECDC4 0%, #44A08D 100%)",
  done:     "linear-gradient(160deg, #4ECDC4 0%, #44A08D 100%)",
};

const PHASE_LABELS = {
  wave:     { emoji: "👋", text: "Hi! I'm Cody!" },
  wink:     { emoji: "😉", text: "Nice to meet you!" },
  confetti: { emoji: "🎉", text: "Let's have fun!" },
  runaway:  { emoji: "🏃", text: "Let's go learn!" },
};

// Sparkle particle
const Sparkle = ({ x, y, delay, color }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0, x, y }}
    animate={{ opacity: [0, 1, 0], scale: [0, 1.5, 0], y: y - 60 }}
    transition={{ duration: 1.2, delay, ease: "easeOut" }}
    style={{
      position: "absolute",
      width: 12,
      height: 12,
      borderRadius: "50%",
      background: color,
      pointerEvents: "none",
    }}
  />
);

// Wink overlay — covers right eye
const WinkOverlay = ({ show }) => (
  <AnimatePresence>
    {show && (
      <motion.div
        initial={{ scaleY: 0, opacity: 0 }}
        animate={{ scaleY: 1, opacity: 1 }}
        exit={{ scaleY: 0, opacity: 0 }}
        transition={{ duration: 0.18, ease: "easeOut" }}
        style={{
          position: "absolute",
          // Tuned for Cody's right eye position in the image
          top: "28%",
          right: "26%",
          width: "13%",
          height: "5%",
          background: "#5EEAD4",
          borderRadius: "0 0 50% 50%",
          zIndex: 10,
          transformOrigin: "top center",
        }}
      />
    )}
  </AnimatePresence>
);

// Both-hands-up overlay for confetti phase
const HandsUpOverlay = ({ show }) => (
  <AnimatePresence>
    {show && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 5 }}
      >
        {/* Left sparkle burst */}
        {[...Array(6)].map((_, i) => (
          <Sparkle
            key={`l${i}`}
            x={-30 + (i % 3) * 20}
            y={-20 - (i % 2) * 20}
            delay={i * 0.08}
            color={["#FFD93D","#FF6B6B","#4ECDC4","#C77DFF","#6BCB77","#4D96FF"][i]}
          />
        ))}
        {/* Right sparkle burst */}
        {[...Array(6)].map((_, i) => (
          <Sparkle
            key={`r${i}`}
            x={30 + (i % 3) * 20}
            y={-20 - (i % 2) * 20}
            delay={0.05 + i * 0.08}
            color={["#4D96FF","#6BCB77","#C77DFF","#FF6B6B","#FFD93D","#4ECDC4"][i]}
          />
        ))}
      </motion.div>
    )}
  </AnimatePresence>
);

export default function CodyLaunch({ onComplete }) {
  const [phase, setPhase] = useState("entrance");
  const [winkActive, setWinkActive] = useState(false);
  const [tapped, setTapped] = useState(false);
  const [audioUnlocked, setAudioUnlocked] = useState(false);
  const codyCtrls = useAnimation();
  const timers = useRef([]);

  const addTimer = (fn, ms) => {
    const t = setTimeout(fn, ms);
    timers.current.push(t);
    return t;
  };

  // Clear all timers on unmount
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  // Entrance animation
  useEffect(() => {
    codyCtrls.start({
      scale: [0.3, 1.1, 0.97, 1],
      y: [80, -24, 8, 0],
      opacity: [0, 1, 1, 1],
      transition: { duration: 0.85, times: [0, 0.55, 0.8, 1], ease: "easeOut" },
    });
    addTimer(() => setPhase("wave"), 900);
  }, []);

  // Phase sequencer
  useEffect(() => {
    if (phase === "wave") {
      // Looping wave — arm-raise-like tilt
      codyCtrls.start({
        rotate: [0, 12, -4, 12, -4, 8, 0],
        y: [0, -10, 0, -8, 0],
        transition: { duration: 1.8, ease: "easeInOut", repeat: Infinity, repeatDelay: 0.4 },
      });
    }

    if (phase === "wink") {
      codyCtrls.stop();
      codyCtrls.start({
        scale: [1, 1.06, 1],
        rotate: [0, -6, 4, 0],
        y: [0, -12, 0],
        transition: { duration: 0.55, ease: "easeInOut" },
      });
      setWinkActive(true);
      addTimer(() => setWinkActive(false), 600);
      addTimer(() => setPhase("confetti"), 1400);
    }

    if (phase === "confetti") {
      // Big jump + bounce
      codyCtrls.start({
        y: [0, -40, 10, -24, 0],
        scale: [1, 1.18, 0.96, 1.1, 1],
        rotate: [0, -8, 8, -5, 0],
        transition: { duration: 1.0, ease: "easeInOut", repeat: 2, repeatDelay: 0.1 },
      });
      fireConfetti();
      addTimer(() => setPhase("runaway"), 3000);
    }

    if (phase === "runaway") {
      codyCtrls.start({
        x: [0, -30, 80, window.innerWidth + 200],
        rotate: [0, -15, -20, -25],
        scaleX: [1, 1.1, 1.05, 0.85],
        y: [0, -20, 10, 30],
        opacity: [1, 1, 1, 0],
        transition: { duration: 0.95, ease: [0.4, 0, 1, 1] },
      });
      addTimer(() => {
        setPhase("done");
        onComplete?.();
      }, 1050);
    }
  }, [phase]);

  const fireConfetti = () => {
    const colors = ["#4ECDC4","#FFD93D","#FF6B6B","#6BCB77","#4D96FF","#C77DFF","#FF9F43","#ffffff"];
    const base = { startVelocity: 45, spread: 100, ticks: 100, zIndex: 9999, colors };

    // Left hand
    confetti({ ...base, particleCount: 80, angle: 60, origin: { x: 0.25, y: 0.45 } });
    // Right hand
    confetti({ ...base, particleCount: 80, angle: 120, origin: { x: 0.75, y: 0.45 } });

    // Second burst
    setTimeout(() => {
      confetti({ ...base, particleCount: 60, angle: 60, origin: { x: 0.2, y: 0.5 }, startVelocity: 35 });
      confetti({ ...base, particleCount: 60, angle: 120, origin: { x: 0.8, y: 0.5 }, startVelocity: 35 });
    }, 350);

    // Third burst — top arc
    setTimeout(() => {
      confetti({
        particleCount: 100, spread: 360, startVelocity: 25, decay: 0.92,
        origin: { x: 0.5, y: 0.35 }, colors, zIndex: 9999, ticks: 120,
      });
    }, 700);
  };

  const handleTap = () => {
    if (tapped) return;
    setTapped(true);

    // Unlock audio context
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const buf = ctx.createBuffer(1, 1, 22050);
      const src = ctx.createBufferSource();
      src.buffer = buf;
      src.connect(ctx.destination);
      src.start(0);
      setAudioUnlocked(true);
    } catch {}

    codyCtrls.stop();
    setPhase("wink");
  };

  // Don't render after done
  if (phase === "done") return null;

  const currentBg = BG_COLORS[phase] || BG_COLORS.wave;
  const label = PHASE_LABELS[phase];
  const isWaving = phase === "wave";

  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: phase === "runaway" ? 0 : 1 }}
      transition={{ duration: 0.4, delay: phase === "runaway" ? 0.7 : 0 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-between overflow-hidden"
      style={{ background: currentBg, transition: "background 0.8s ease" }}
    >
      {/* Animated background circles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          animate={{ scale: [1, 1.15, 1], opacity: [0.12, 0.2, 0.12] }}
          transition={{ duration: 3, repeat: Infinity }}
          style={{
            position: "absolute", top: "-15%", right: "-15%",
            width: "60vw", height: "60vw", borderRadius: "50%",
            background: "rgba(255,255,255,0.15)",
          }}
        />
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.08, 0.15, 0.08] }}
          transition={{ duration: 4, repeat: Infinity, delay: 1 }}
          style={{
            position: "absolute", bottom: "5%", left: "-20%",
            width: "70vw", height: "70vw", borderRadius: "50%",
            background: "rgba(255,255,255,0.1)",
          }}
        />
        <motion.div
          animate={{ y: [0, -20, 0] }}
          transition={{ duration: 2.5, repeat: Infinity }}
          style={{
            position: "absolute", top: "10%", left: "5%",
            fontSize: "clamp(24px, 6vw, 40px)", opacity: 0.3,
          }}
        >A</motion.div>
        <motion.div
          animate={{ y: [0, 15, 0] }}
          transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
          style={{
            position: "absolute", top: "15%", right: "8%",
            fontSize: "clamp(24px, 6vw, 40px)", opacity: 0.3,
          }}
        >B</motion.div>
        <motion.div
          animate={{ y: [0, -12, 0] }}
          transition={{ duration: 3, repeat: Infinity, delay: 1 }}
          style={{
            position: "absolute", bottom: "20%", right: "6%",
            fontSize: "clamp(20px, 5vw, 36px)", opacity: 0.25,
          }}
        >C</motion.div>
      </div>

      {/* App title */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="relative z-10 text-center pt-16 px-6"
        style={{ paddingTop: "max(4rem, env(safe-area-inset-top, 4rem))" }}
      >
        <h1
          style={{
            fontFamily: "Fredoka, sans-serif",
            fontSize: "clamp(2rem, 8vw, 3.5rem)",
            fontWeight: 700,
            color: "white",
            textShadow: "0 4px 24px rgba(0,0,0,0.2)",
            letterSpacing: "0.02em",
            lineHeight: 1.1,
          }}
        >
          Cody's Phonics
        </h1>
        <p
          style={{
            fontFamily: "Fredoka, sans-serif",
            fontSize: "clamp(1rem, 4vw, 1.5rem)",
            color: "rgba(255,255,255,0.85)",
            marginTop: "0.4em",
          }}
        >
          Let's learn to read! 📖
        </p>
      </motion.div>

      {/* CODY — large, dominant, centered */}
      <div
        className="relative z-10 flex items-center justify-center flex-1"
        style={{ width: "100%", maxWidth: 500 }}
        onClick={isWaving ? handleTap : undefined}
      >
        <motion.div
          animate={codyCtrls}
          style={{ cursor: isWaving ? "pointer" : "default", position: "relative" }}
        >
          <motion.img
            src={CODY_IMG}
            alt="Cody"
            style={{
              width: "clamp(220px, 60vw, 360px)",
              height: "clamp(240px, 65vw, 400px)",
              objectFit: "contain",
              filter: "drop-shadow(0 24px 48px rgba(0,0,0,0.22))",
              userSelect: "none",
              WebkitUserSelect: "none",
              pointerEvents: "none",
            }}
            draggable={false}
          />

          {/* Wink overlay */}
          <WinkOverlay show={winkActive} />

          {/* Confetti hand sparkles */}
          <HandsUpOverlay show={phase === "confetti"} />

          {/* Pulse ring when tappable */}
          <AnimatePresence>
            {isWaving && !tapped && (
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ duration: 1.6, repeat: Infinity }}
                style={{
                  position: "absolute", inset: -20,
                  borderRadius: "50%",
                  border: "4px solid rgba(255,255,255,0.4)",
                  pointerEvents: "none",
                }}
              />
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Bottom area: phase label + tap hint */}
      <div
        className="relative z-10 flex flex-col items-center gap-4 px-6"
        style={{ paddingBottom: "max(3rem, env(safe-area-inset-bottom, 3rem))", width: "100%" }}
      >
        {/* Phase speech bubble */}
        <AnimatePresence mode="wait">
          {label && (
            <motion.div
              key={phase}
              initial={{ opacity: 0, scale: 0.8, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.85, y: -10 }}
              transition={{ type: "spring", stiffness: 400, damping: 26 }}
              className="flex items-center gap-3 px-7 py-4 rounded-full"
              style={{
                background: "rgba(255,255,255,0.25)",
                backdropFilter: "blur(12px)",
                border: "2px solid rgba(255,255,255,0.4)",
                boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
              }}
            >
              <span style={{ fontSize: "clamp(1.4rem, 5vw, 2rem)" }}>{label.emoji}</span>
              <span
                style={{
                  fontFamily: "Fredoka, sans-serif",
                  fontSize: "clamp(1.1rem, 4vw, 1.6rem)",
                  fontWeight: 600,
                  color: "white",
                  textShadow: "0 2px 8px rgba(0,0,0,0.15)",
                }}
              >
                {label.text}
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tap hint — only during wave phase */}
        <AnimatePresence>
          {isWaving && !tapped && (
            <motion.button
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: [0.85, 1, 0.85], y: [0, -4, 0], scale: [1, 1.04, 1] }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ opacity: { duration: 1.8, repeat: Infinity }, y: { duration: 1.8, repeat: Infinity }, scale: { duration: 1.8, repeat: Infinity } }}
              onClick={handleTap}
              className="flex items-center gap-2 px-8 py-4 rounded-full"
              style={{
                background: "rgba(255,255,255,0.95)",
                boxShadow: "0 12px 40px rgba(0,0,0,0.2)",
                border: "none",
                cursor: "pointer",
                WebkitTapHighlightColor: "transparent",
              }}
            >
              <span style={{ fontSize: "clamp(1.2rem, 4vw, 1.6rem)" }}>👆</span>
              <span
                style={{
                  fontFamily: "Fredoka, sans-serif",
                  fontSize: "clamp(1.1rem, 4vw, 1.5rem)",
                  fontWeight: 700,
                  color: "#4ECDC4",
                }}
              >
                Tap Cody to say hi!
              </span>
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}