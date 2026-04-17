/**
 * SpotlightOverlay — 5-step onboarding spotlight.
 *
 * FIX NOTES (both issues resolved here):
 *
 * Issue 1 — Misalignment on Safari / preview iframe:
 *   Root cause: `window.innerWidth/innerHeight` diverges from the actual visual
 *   viewport on Safari (address bar, bottom bar) and inside preview iframes.
 *   The SVG was sized to those values while `getBoundingClientRect()` returns
 *   coordinates relative to the TRUE visual viewport. When they differ the
 *   spotlight rect is offset from the target.
 *   Fix: size the SVG to 100% of its fixed container (via width="100%" height="100%")
 *   and use a `viewBox` derived from the container's own `getBoundingClientRect`
 *   so coords are always self-consistent.
 *
 * Issue 2 — Inside spotlight still dimmed:
 *   Root cause: SVG `<clipPath>` keeps pixels that are INSIDE the clip region.
 *   The even-odd compound path technique requires `clipPathUnits` and
 *   `clip-rule="evenodd"` set on the *clipPath element*, not just the child path.
 *   Browser support for this combination is inconsistent.
 *   Fix: use an SVG `<mask>` instead. White = show, black = hide. The full screen
 *   is white (visible = dimmed overlay shows). The spotlight rect is black
 *   (hidden = overlay NOT drawn there = target fully clear). This is universally
 *   supported, deterministic, and has no clipping ambiguity.
 */
import { useEffect, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

const PAD = 14;
const RADIUS = 18;

function getRect(ref) {
  if (!ref?.current) return null;
  return ref.current.getBoundingClientRect();
}

export default function SpotlightOverlay({ targets, onDone }) {
  const [step, setStep] = useState(0);
  const [spotlight, setSpotlight] = useState(null);
  const containerRef = useRef(null);

  const measure = useCallback(() => {
    const t = targets[step];
    if (!t) return;
    const targetRect = getRect(t.ref);
    if (!targetRect) return;

    // Use the overlay container's own bounding rect as the coordinate origin.
    // This stays correct inside iframes and on Safari where window dimensions
    // can diverge from the visual viewport.
    const container = containerRef.current;
    const origin = container
      ? container.getBoundingClientRect()
      : { left: 0, top: 0, width: window.innerWidth, height: window.innerHeight };

    setSpotlight({
      // Spotlight position relative to the overlay container
      x: targetRect.left - origin.left - PAD,
      y: targetRect.top  - origin.top  - PAD,
      w: targetRect.width  + PAD * 2,
      h: targetRect.height + PAD * 2,
      // Container dimensions for the SVG viewBox
      vw: origin.width,
      vh: origin.height,
    });
  }, [step, targets]);

  useEffect(() => {
    // Small rAF delay so layout is settled before measuring (fixes Safari timing)
    const id = requestAnimationFrame(measure);
    window.addEventListener("resize", measure);
    return () => {
      cancelAnimationFrame(id);
      window.removeEventListener("resize", measure);
    };
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

  return (
    <div
      ref={containerRef}
      onClick={advance}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        cursor: "pointer",
        touchAction: "manipulation",
      }}
    >
      <AnimatePresence mode="wait">
        {spotlight && (
          <motion.svg
            key={step}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            width="100%"
            height="100%"
            viewBox={`0 0 ${spotlight.vw} ${spotlight.vh}`}
            preserveAspectRatio="none"
            style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
          >
            <defs>
              {/*
                Mask approach:
                - white rect = overlay IS drawn (dimmed)
                - black rounded rect = overlay is NOT drawn (spotlight = fully clear)
                This is the only reliable cross-browser "punch-hole" technique.
              */}
              <mask id={`sm-${step}`}>
                {/* Everything dimmed by default */}
                <rect x={0} y={0} width={spotlight.vw} height={spotlight.vh} fill="white" />
                {/* Spotlight hole — black means transparent / not drawn */}
                <rect
                  x={spotlight.x} y={spotlight.y}
                  width={spotlight.w} height={spotlight.h}
                  rx={RADIUS} ry={RADIUS}
                  fill="black"
                />
              </mask>
            </defs>

            {/* Dim layer — only shows where mask is white */}
            <rect
              x={0} y={0}
              width={spotlight.vw} height={spotlight.vh}
              fill="rgba(0,0,0,0.55)"
              mask={`url(#sm-${step})`}
            />

            {/* White border ring around the spotlight */}
            <rect
              x={spotlight.x} y={spotlight.y}
              width={spotlight.w} height={spotlight.h}
              rx={RADIUS} ry={RADIUS}
              fill="none"
              stroke="rgba(255,255,255,0.75)"
              strokeWidth={3}
            />
          </motion.svg>
        )}
      </AnimatePresence>
    </div>
  );
}