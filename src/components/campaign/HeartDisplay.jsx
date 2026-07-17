import { useRef, useState, useEffect } from "react";
import Lottie from "lottie-react";
import bouncingHeartData from "../../lib/BouncingHeart.json";
import heartOutlineData from "../../lib/HeartOutline.json";
import brokenHeartData from "../../lib/BrokenHeart.json";

const HEART_PATH = "M50 85 C50 85 5 55 5 28 C5 14 16 5 28 5 C36 5 44 10 50 18 C56 10 64 5 72 5 C84 5 95 14 95 28 C95 55 50 85 50 85Z";

// Static heart used in template mode: "full" | "outline" | "grey"
function StaticHeart({ art, variant, color = "#FF4444" }) {
  const fill = variant === "full" ? color : variant === "grey" ? "#C3CAD4" : "none";
  const stroke = variant === "grey" ? "#AAB2BE" : color;
  return (
    <svg width={art} height={art * 0.9} viewBox="0 0 100 90" fill="none">
      <path d={HEART_PATH} fill={fill} stroke={stroke} strokeWidth="7" strokeLinejoin="round" />
    </svg>
  );
}

function HeartSlot({ slotIndex, mistakes, size, isStatic = false, heartColor }) {
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

  if (isStatic) {
    // 20% bigger than the previous visual heart size (0.38 × size), snug so hearts sit next to each other
    const art = size * 0.46;
    const wrap = { width: art + 4, height: art + 6, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "visible" };
    if (isBroken && !brokenDone) {
      return (
        <div style={wrap}>
          <div style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%, -50%)", width: art * 2.6, height: art * 2.6, pointerEvents: "none" }}>
            <Lottie
              lottieRef={brokenRef}
              animationData={brokenHeartData}
              loop={false}
              onComplete={() => setBrokenDone(true)}
              style={{ width: "100%", height: "100%" }}
            />
          </div>
        </div>
      );
    }
    const variant = isBroken ? "grey" : isOutline ? "outline" : "full";
    return <div style={wrap}><StaticHeart art={art} variant={variant} color={heartColor || "#FF4444"} /></div>;
  }

  if (!isBroken && !isOutline) {
    return (
      <div style={wrapStyle}>
        <Lottie animationData={bouncingHeartData} loop style={{ width: size, height: size }} />
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

export default function HeartDisplay({ mistakes = 0, size = 105, staticHearts = false, heartColor }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: staticHearts ? 4 : 0 }}>
      {[0, 1, 2].map((i) => (
        <HeartSlot key={i} slotIndex={i} mistakes={mistakes} size={size} isStatic={staticHearts} heartColor={heartColor} />
      ))}
    </div>
  );
}