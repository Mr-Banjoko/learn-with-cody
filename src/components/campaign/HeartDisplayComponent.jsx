import { useRef, useState, useEffect } from "react";
import Lottie from "lottie-react";
import bouncingHeartData from "../../lib/BouncingHeart.json";
import heartOutlineData from "../../lib/HeartOutline.json";
import brokenHeartData from "../../lib/BrokenHeart.json";

/**
 * HeartDisplay — shows 3 hearts that degrade as mistakes accumulate.
 *
 * Heart 1: full at 0, outline at 1, broken at 2+
 * Heart 2: full at 0-2, outline at 3, broken at 4+
 * Heart 3: full at 0-4, outline at 5, broken at 6+
 */

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

  if (!isBroken && !isOutline) {
    return <Lottie animationData={bouncingHeartData} loop style={{ width: size, height: size }} />;
  }

  if (isOutline) {
    return <Lottie animationData={heartOutlineData} loop style={{ width: size, height: size }} />;
  }

  return (
    <Lottie
      lottieRef={brokenRef}
      animationData={brokenHeartData}
      loop={false}
      autoplay={!brokenDone}
      onComplete={() => setBrokenDone(true)}
      style={{ width: size, height: size }}
    />
  );
}

export default function HeartDisplay({ mistakes = 0, size = 28 }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
      {[0, 1, 2].map((i) => (
        <HeartSlot key={i} slotIndex={i} mistakes={mistakes} size={size} />
      ))}
    </div>
  );
}