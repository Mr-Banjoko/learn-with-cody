import { useState, useEffect } from "react";
import { motion } from "framer-motion";

function BrokenHeartAnim({ size, onDone }) {
  const dim = size * 0.78;
  const heartPath =
    "M50 85 C50 85 5 55 5 28 C5 14 16 5 28 5 C36 5 44 10 50 18 C56 10 64 5 72 5 C84 5 95 14 95 28 C95 55 50 85 50 85Z";
  return (
    <svg width={dim} height={dim} viewBox="0 0 100 90" aria-hidden="true">
      <defs>
        <clipPath id="bh-left"><rect x="0" y="0" width="50" height="90" /></clipPath>
        <clipPath id="bh-right"><rect x="50" y="0" width="50" height="90" /></clipPath>
      </defs>
      <motion.g
        clipPath="url(#bh-left)"
        style={{ transformBox: "fill-box", transformOrigin: "center" }}
        initial={{ rotate: 0, x: 0, y: 0, opacity: 1 }}
        animate={{ rotate: [0, 0, -28], x: [0, 0, -8], y: [0, 0, 12], opacity: [1, 1, 0.4] }}
        transition={{ duration: 1.1, ease: "easeIn", times: [0, 0.3, 1] }}
        onAnimationComplete={onDone}
      >
        <path d={heartPath} fill="#FF4444" />
      </motion.g>
      <motion.g
        clipPath="url(#bh-right)"
        style={{ transformBox: "fill-box", transformOrigin: "center" }}
        initial={{ rotate: 0, x: 0, y: 0, opacity: 1 }}
        animate={{ rotate: [0, 0, 28], x: [0, 0, 8], y: [0, 0, 12], opacity: [1, 1, 0.4] }}
        transition={{ duration: 1.1, ease: "easeIn", times: [0, 0.3, 1] }}
      >
        <path d={heartPath} fill="#FF4444" />
      </motion.g>
    </svg>
  );
}

function HeartSlot({ slotIndex, mistakes, size }) {
  const [brokenDone, setBrokenDone] = useState(false);

  const outlineThreshold = slotIndex * 2 + 1;
  const brokenThreshold = slotIndex * 2 + 2;

  const isBroken = mistakes >= brokenThreshold;
  const isOutline = !isBroken && mistakes >= outlineThreshold;

  useEffect(() => {
    if (!isBroken) setBrokenDone(false);
  }, [isBroken]);

  const dim = size * 0.78;

  // Each animation has a different canvas size, so we correct with transform:scale
  // BouncingHeart: 512×512 canvas — baseline, no scaling needed
  // HeartOutline:  150×150 canvas but art is drawn at ~210% internal scale → appears ~3.4× too large → scale down to ~0.29
  // BrokenHeart: 1000×1000 canvas with inset artwork → scale it up to match the static hearts
  const wrapStyle = {
    width: size, height: size, flexShrink: 0,
    display: "flex", alignItems: "center", justifyContent: "center",
    overflow: "hidden",
  };

  if (!isBroken && !isOutline) {
    return (
      <div style={wrapStyle}>
        <svg width={size * 0.78} height={size * 0.78} viewBox="0 0 100 90" aria-hidden="true">
          <path
            d="M50 85 C50 85 5 55 5 28 C5 14 16 5 28 5 C36 5 44 10 50 18 C56 10 64 5 72 5 C84 5 95 14 95 28 C95 55 50 85 50 85Z"
            fill="#FF4444"
          />
        </svg>
      </div>
    );
  }

  if (isOutline) {
    return (
      <div style={wrapStyle}>
        <svg width={size * 0.78} height={size * 0.78} viewBox="0 0 100 90" fill="none">
          <path
            d="M50 85 C50 85 5 55 5 28 C5 14 16 5 28 5 C36 5 44 10 50 18 C56 10 64 5 72 5 C84 5 95 14 95 28 C95 55 50 85 50 85Z"
            fill="none"
            stroke="#FF4444"
            strokeWidth="7"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    );
  }

  if (brokenDone) {
    return (
      <div style={wrapStyle}>
        <svg width={dim} height={dim} viewBox="0 0 100 90" aria-hidden="true">
          <path d="M50 85 C50 85 5 55 5 28 C5 14 16 5 28 5 C36 5 44 10 50 18 C56 10 64 5 72 5 C84 5 95 14 95 28 C95 55 50 85 50 85Z" fill="#AEB8C4" />
          <path d="M52 18 L43 39 L55 48 L45 69" fill="none" stroke="#7B8794" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    );
  }

  return (
    <div style={wrapStyle}>
      <BrokenHeartAnim size={size} onDone={() => setBrokenDone(true)} />
    </div>
  );
}

export default function HeartDisplay({ mistakes = 0, size = 105 }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
      {[0, 1, 2].map((i) => (
        <HeartSlot key={i} slotIndex={i} mistakes={mistakes} size={size} />
      ))}
    </div>
  );
}