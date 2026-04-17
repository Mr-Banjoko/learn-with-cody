/**
 * SpotlightOverlay — a simple 5-step onboarding guide.
 *
 * Dims the whole screen and cuts a rounded rect "spotlight" around a target.
 * Tap anywhere → advance to next step → ends after step 5.
 *
 * Props:
 *   targets  – array of { ref, label } in step order
 *   onDone   – called when tour ends
 */
import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

function getRect(ref) {
  if (!ref?.current) return null;
  return ref.current.getBoundingClientRect();
}

const PAD = 14; // extra space around the spotlight

export default function SpotlightOverlay({ targets, onDone }) {
  const [step, setStep] = useState(0);
  const [rect, setRect] = useState(null);

  const measure = useCallback(() => {
    const t = targets[step];
    if (!t) return;
    const r = getRect(t.ref);
    if (r) setRect(r);
  }, [step, targets]);

  // Measure on step change and on any resize/scroll
  useEffect(() => {
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [measure]);

  const advance = useCallback((e) => {
    e.stopPropagation();
    const next = step + 1;
    if (next >= targets.length) {
      onDone();
    } else {
      setStep(next);
    }
  }, [step, targets.length, onDone]);

  if (!rect) return null;

  const sx = rect.left - PAD;
  const sy = rect.top - PAD;
  const sw = rect.width + PAD * 2;
  const sh = rect.height + PAD * 2;

  const W = window.innerWidth;
  const H = window.innerHeight;

  // Build SVG clip path: full screen with a rounded-rect hole
  const r = 18; // corner radius of spotlight
  const clipPath = `
    M0 0 L${W} 0 L${W} ${H} L0 ${H} Z
    M${sx + r} ${sy}
    L${sx + sw - r} ${sy}
    Q${sx + sw} ${sy} ${sx + sw} ${sy + r}
    L${sx + sw} ${sy + sh - r}
    Q${sx + sw} ${sy + sh} ${sx + sw - r} ${sy + sh}
    L${sx + r} ${sy + sh}
    Q${sx} ${sy + sh} ${sx} ${sy + sh - r}
    L${sx} ${sy + r}
    Q${sx} ${sy} ${sx + r} ${sy}
    Z
  `;

  return (
    <AnimatePresence>
      <motion.div
        key={step}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={advance}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 9999,
          cursor: "pointer",
          touchAction: "manipulation",
        }}
      >
        {/* Dimmed overlay with spotlight cutout */}
        <svg
          width={W}
          height={H}
          style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
        >
          <defs>
            <clipPath id="spotlight-clip">
              <path d={clipPath} fillRule="evenodd" />
            </clipPath>
          </defs>
          {/* Dark overlay, clipped so the spotlight hole is transparent */}
          <rect
            x={0} y={0} width={W} height={H}
            fill="rgba(0,0,0,0.55)"
            clipPath="url(#spotlight-clip)"
          />
          {/* Glowing border around the spotlight */}
          <rect
            x={sx} y={sy} width={sw} height={sh}
            rx={r} ry={r}
            fill="none"
            stroke="rgba(255,255,255,0.7)"
            strokeWidth={3}
          />
        </svg>
      </motion.div>
    </AnimatePresence>
  );
}