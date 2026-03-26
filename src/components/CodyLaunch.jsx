import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useAnimation } from "framer-motion";
import confetti from "canvas-confetti";

const CODY_IMG = "https://media.base44.com/images/public/69c4ec00726384fdef1ab181/6b8f13599_cody.png";

// Phase order: entrance → wave → wink → confetti → runaway → done
const BG_GRADIENTS = {
  entrance: ["#0ABFBC", "#2563EB"],
  wave:     ["#06B6D4", "#3B82F6"],
  wink:     ["#F59E0B", "#EF4444"],
  confetti: ["#8B5CF6", "#EC4899"],
  runaway:  ["#10B981", "#06B6D4"],
};

const SPEECH = {
  wave:     { emoji: "👋", text: "Hi! I'm Cody!" },
  wink:     { emoji: "😉", text: "Nice to meet you!" },
  confetti: { emoji: "🎉", text: "Let's have fun learning!" },
  runaway:  { emoji: "🏃", text: "Let's go!" },
};

/* ─── Floating letter decoration ─── */
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

/* ─── Wink eye overlay ─── */
function WinkEye({ show }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="wink"
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          exit={{ scaleY: 0 }}
          transition={{ duration: 0.15, ease: "easeOut" }}
          style={{
            position: "absolute",
            /* Tuned to Cody's right eye in the image */
            top: "29%",
            right: "24%",
            width: "12%",
            height: "5.5%",
            background: "rgba(6,182,212,0.85)",
            borderRadius: "0 0 50% 50% / 0 0 80% 80%",
            transformOrigin: "top center",
            zIndex: 20,
          }}
        />
      )}
    </AnimatePresence>
  );
}

/* ─── Sparkle burst around Cody ─── */
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

/* ─── Pulse ring (tap hint) ─── */
function PulseRing() {
  return (
    <motion.div
      animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
      transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut" }}
      style={{
        position: "absolute",
        inset: -24,
        borderRadius: "50%",
        border: "4px solid rgba(255,255,255,0.45)",
        pointerEvents: "none",
        zIndex: 5,
      }}
    />
  );
}

/* ─── Background gradient blobs ─── */
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

/* ══════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════ */
export default function CodyLaunch({ onComplete }) {
  const [phase, setPhase] = useState("entrance");
  const [wink, setWink] = useState(false);
  const [sparkle, setSparkle] = useState(false);
  const [tapped, setTapped] = useState(false);
  const [bgColors, setBgColors] = useState(BG_GRADIENTS.entrance);

  const bodyCtrls = useAnimation(); // whole container fade
  const codyCtrls = useAnimation(); // Cody movement
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

  // ── Wave ──────────────────────────────────────
  useEffect(() => {
    if (phase !== "wave") return;
    codyCtrls.start({
      rotate: [0, 14, -5, 14, -5, 10, 0],
      y: [0, -14, 2, -10, 2, -6, 0],
      scale: [1, 1.04, 1, 1.04, 1, 1.02, 1],
      transition: {
        duration: 1.6,
        ease: "easeInOut",
        repeat: Infinity,
        repeatDelay: 0.5,
      },
    });
  }, [phase]);

  // ── Wink ──────────────────────────────────────
  useEffect(() => {
    if (phase !== "wink") return;
    setBgColors(BG_GRADIENTS.wink);
    codyCtrls.stop();
    codyCtrls.start({
      scale: [1, 1.1, 0.95, 1.07, 1],
      rotate: [0, -8, 5, -3, 0],
      y: [0, -18, 8, -6, 0],
      transition: { duration: 0.6, ease: "easeInOut" },
    });
    setWink(true);
    later(() => setWink(false), 650);
    later(() => {
      setPhase("confetti");
      setBgColors(BG_GRADIENTS.confetti);
    }, 1300);
  }, [phase]);

  // ── Confetti ──────────────────────────────────
  useEffect(() => {
    if (phase !== "confetti") return;
    // Dramatic jump
    codyCtrls.start({
      y: [0, -55, 12, -32, 6, -18, 0],
      scale: [1, 1.22, 0.94, 1.14, 0.98, 1.06, 1],
      rotate: [0, -10, 10, -7, 5, -3, 0],
      transition: { duration: 1.1, ease: "easeInOut", repeat: 2, repeatDelay: 0.15 },
    });
    setSparkle(true);
    later(() => setSparkle(false), 1000);
    fireConfetti(0);
    later(() => { setSparkle(true); fireConfetti(1); }, 1200);
    later(() => setSparkle(false), 2200);
    later(() => { setSparkle(true); fireConfetti(2); }, 2400);
    later(() => setSparkle(false), 3200);
    later(() => {
      setPhase("runaway");
      setBgColors(BG_GRADIENTS.runaway);
    }, 3400);
  }, [phase]);

  // ── Run away ──────────────────────────────────
  useEffect(() => {
    if (phase !== "runaway") return;
    codyCtrls.stop();
    codyCtrls.start({
      x: [0, -20, 40, 120, window.innerWidth * 0.6 + 300],
      y: [0, -30, -10, 20, 60],
      rotate: [0, -18, -22, -28, -35],
      scaleX: [1, 1.15, 1.1, 0.9, 0.7],
      opacity: [1, 1, 1, 0.7, 0],
      transition: { duration: 0.85, ease: [0.4, 0, 0.9, 0.7] },
    });
    later(() => {
      setPhase("done");
      onComplete?.();
    }, 1000);
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

  const handleTap = () => {
    if (tapped || phase !== "wave") return;
    setTapped(true);
    codyCtrls.stop();
    setPhase("wink");
  };

  if (phase === "done") return null;

  const bg = `linear-gradient(155deg, ${bgColors[0]} 0%, ${bgColors[1]} 100%)`;
  const label = SPEECH[phase];
  const isWaving = phase === "wave";

  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: phase === "runaway" ? 0 : 1 }}
      transition={{ duration: 0.45, delay: phase === "runaway" ? 0.6 : 0 }}
      className="fixed inset-0 z-50 flex flex-col overflow-hidden"
      style={{ background: bg, transition: "background 0.75s ease" }}
    >
      <BgBlobs />

      {/* Floating alphabet letters */}
      <FloatingLetter letter="A" style={{ top: "8%",  left: "6%",  fontSize: "clamp(28px,7vw,52px)" }} delay={0} />
      <FloatingLetter letter="B" style={{ top: "12%", right: "7%", fontSize: "clamp(24px,6vw,44px)" }} delay={0.7} />
      <FloatingLetter letter="C" style={{ bottom: "22%", right: "5%", fontSize: "clamp(20px,5vw,38px)" }} delay={1.4} />
      <FloatingLetter letter="Z" style={{ bottom: "30%", left: "4%", fontSize: "clamp(18px,4.5vw,34px)" }} delay={0.4} />
      <FloatingLetter letter="★" style={{ top: "35%", left: "3%",  fontSize: "clamp(16px,4vw,28px)" }} delay={1.8} />
      <FloatingLetter letter="♪" style={{ top: "28%", right: "4%", fontSize: "clamp(16px,4vw,28px)" }} delay={1.1} />

      {/* ── App title ── */}
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

      {/* ── CODY — hero, fills most of the screen ── */}
      <div
        className="relative z-10 flex items-center justify-center"
        style={{ flex: "1 1 0%", minHeight: 0 }}
        onClick={isWaving ? handleTap : undefined}
      >
        <motion.div
          animate={codyCtrls}
          style={{ position: "relative", cursor: isWaving ? "pointer" : "default" }}
        >
          {/* Sparkle ring on confetti phase */}
          <SparkleRing active={sparkle} />

          {/* Shadow under Cody */}
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

          <div style={{ position: "relative" }}>
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
            {/* Wink overlay */}
            <WinkEye show={wink} />
          </div>

          {/* Tap pulse ring */}
          <AnimatePresence>
            {isWaving && !tapped && <PulseRing />}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* ── Bottom area ── */}
      <div
        className="relative z-10 flex flex-col items-center gap-3 flex-shrink-0"
        style={{
          paddingBottom: "max(2.5rem, env(safe-area-inset-bottom, 2.5rem))",
          paddingLeft: 24,
          paddingRight: 24,
          minHeight: 120,
        }}
      >
        {/* Speech bubble */}
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

        {/* Tap button — wave phase only */}
        <AnimatePresence>
          {isWaving && !tapped && (
            <motion.button
              initial={{ opacity: 0, y: 16 }}
              animate={{
                opacity: [0.9, 1, 0.9],
                y: [0, -5, 0],
                scale: [1, 1.04, 1],
              }}
              exit={{ opacity: 0, y: 10, scale: 0.92 }}
              transition={{
                opacity: { duration: 1.6, repeat: Infinity },
                y:       { duration: 1.6, repeat: Infinity },
                scale:   { duration: 1.6, repeat: Infinity },
              }}
              onClick={handleTap}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "14px 36px",
                borderRadius: 999,
                background: "rgba(255,255,255,0.97)",
                boxShadow: "0 16px 48px rgba(0,0,0,0.22)",
                border: "none",
                cursor: "pointer",
                WebkitTapHighlightColor: "transparent",
                outline: "none",
              }}
            >
              <span style={{ fontSize: "clamp(1.2rem, 4.5vw, 1.7rem)" }}>👆</span>
              <span
                style={{
                  fontFamily: "Fredoka, sans-serif",
                  fontSize: "clamp(1.1rem, 4.2vw, 1.5rem)",
                  fontWeight: 700,
                  color: "#06B6D4",
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