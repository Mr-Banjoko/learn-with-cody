/**
 * TutorialOverlay — spotlight-style visual guide overlay.
 *
 * Renders a full-screen dim with a transparent "hole" punched around the target element.
 * The target ref is measured via getBoundingClientRect() so it works regardless of layout.
 *
 * Props:
 *   targetRef   — React ref pointing at the DOM node to spotlight
 *   padding     — extra px around the target bounding box (default 12)
 *   borderRadius — px radius of the spotlight cutout (default 24)
 *   visible     — boolean, hides the overlay when false (for AnimatePresence)
 *
 * Audio guidance can be added later by accepting an `audioUrl` prop and playing it
 * when `visible` changes to true. The step prop from the parent tells you which step.
 */
import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function TutorialOverlay({ targetRef, padding = 14, borderRadius = 24, visible }) {
  const [box, setBox] = useState(null);

  const measure = useCallback(() => {
    if (!targetRef?.current) return;
    const r = targetRef.current.getBoundingClientRect();
    setBox({
      x: r.left - padding,
      y: r.top - padding,
      w: r.width + padding * 2,
      h: r.height + padding * 2,
    });
  }, [targetRef, padding]);

  // Measure on mount / ref change / visibility change
  useEffect(() => {
    if (!visible) return;
    measure();
    // Re-measure on resize / scroll
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, true);
    return () => {
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure, true);
    };
  }, [visible, measure]);

  // Also re-measure when targetRef itself changes identity
  useEffect(() => {
    if (visible) measure();
  }, [targetRef]);

  if (!box) return null;

  const vw = window.innerWidth;
  const vh = window.innerHeight;

  // Build an SVG clip-path with a rectangular hole for the spotlight
  const clipId = "tutorial-clip";
  const svgPath = `
    M 0 0 L ${vw} 0 L ${vw} ${vh} L 0 ${vh} Z
    M ${box.x + borderRadius} ${box.y}
    Q ${box.x} ${box.y} ${box.x} ${box.y + borderRadius}
    L ${box.x} ${box.y + box.h - borderRadius}
    Q ${box.x} ${box.y + box.h} ${box.x + borderRadius} ${box.y + box.h}
    L ${box.x + box.w - borderRadius} ${box.y + box.h}
    Q ${box.x + box.w} ${box.y + box.h} ${box.x + box.w} ${box.y + box.h - borderRadius}
    L ${box.x + box.w} ${box.y + borderRadius}
    Q ${box.x + box.w} ${box.y} ${box.x + box.w - borderRadius} ${box.y}
    Z
  `;

  // 4 blocking rects around the hole: top, bottom, left-middle, right-middle
  const blocks = [
    { left: 0, top: 0, width: vw, height: box.y },                                      // top
    { left: 0, top: box.y + box.h, width: vw, height: vh - (box.y + box.h) },           // bottom
    { left: 0, top: box.y, width: box.x, height: box.h },                               // left
    { left: box.x + box.w, top: box.y, width: vw - (box.x + box.w), height: box.h },   // right
  ];

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="tutorial-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          style={{ position: "fixed", inset: 0, zIndex: 1000, pointerEvents: "none" }}
        >
          {/* SVG dim layer — visual only, no pointer events */}
          <svg
            width={vw}
            height={vh}
            style={{ position: "absolute", inset: 0, display: "block", pointerEvents: "none" }}
          >
            <defs>
              <clipPath id={clipId} clipRule="evenodd">
                <path d={svgPath} fillRule="evenodd" />
              </clipPath>
            </defs>
            <rect x={0} y={0} width={vw} height={vh} fill="rgba(0,0,0,0.58)" clipPath={`url(#${clipId})`} />
          </svg>

          {/* 4 invisible blocking divs around the hole — intercept taps outside spotlight */}
          {blocks.map((b, i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                left: b.left, top: b.top, width: b.width, height: b.height,
                pointerEvents: "all",
              }}
            />
          ))}

          {/* Glow ring */}
          <motion.div
            animate={{ boxShadow: ["0 0 0 0px rgba(255,255,255,0.15)", "0 0 0 8px rgba(255,255,255,0.10)", "0 0 0 0px rgba(255,255,255,0.15)"] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            style={{
              position: "absolute",
              left: box.x, top: box.y, width: box.w, height: box.h,
              borderRadius, border: "2.5px solid rgba(255,255,255,0.45)",
              boxSizing: "border-box", pointerEvents: "none",
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}