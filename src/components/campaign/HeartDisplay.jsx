import { useRef, useState, useEffect } from "react";
import Lottie from "lottie-react";
import bouncingHeartData from "../../lib/BouncingHeart.json";
import heartOutlineData from "../../lib/HeartOutline.json";
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
        <Lottie animationData={bouncingHeartData} loop style={{ width: size, height: size }} />
      </div>
    );
  }

  if (isOutline) {
    return (
      <div style={wrapStyle}>
        <Lottie
          animationData={heartOutlineData}
          loop
          style={{ width: size * 3.4, height: size * 3.4, transform: "scale(0.29)", transformOrigin: "center" }}
        />
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