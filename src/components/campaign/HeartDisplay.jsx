import { useRef, useState, useEffect } from "react";
import Lottie from "lottie-react";
import brokenHeartData from "../../lib/BrokenHeart.json";

function HeartSlot({ slotIndex, mistakes, size }) {
  const brokenRef = useRef(null);
  const [brokenDone, setBrokenDone] = useState(false);

  const outlineThreshold = slotIndex * 2 + 1;
  const brokenThreshold = slotIndex * 2 + 2;

  const isBroken = mistakes >= brokenThreshold;
  const isOutline = !isBroken && mistakes >= outlineThreshold;

  useEffect(() => {
    if (!isBroken) setBrokenDone(false);
  }, [isBroken]);

  // Each animation has a different canvas size, so we correct with transform:scale
  // BouncingHeart: 512×512 canvas — baseline, no scaling needed
  // HeartOutline:  150×150 canvas but art is drawn at ~210% internal scale → appears ~3.4× too large → scale down to ~0.29
  // BrokenHeart:  1000×1000 canvas → appears smaller relative to bouncing → scale up slightly to ~0.60
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
        <svg width={size * 0.38} height={size * 0.38} viewBox="0 0 100 90" fill="none">
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

  return (
    <div style={wrapStyle}>
      <Lottie
        lottieRef={brokenRef}
        animationData={brokenHeartData}
        loop={false}
        autoplay={!brokenDone}
        onComplete={() => setBrokenDone(true)}
        style={{ width: size * 1.67, height: size * 1.67, transform: "scale(0.60)", transformOrigin: "center" }}
      />
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