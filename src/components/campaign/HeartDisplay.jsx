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

export default function HeartDisplay({ mistakes = 0, size = 54 }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: Math.round(size * -0.15) }}>
      {[0, 1, 2].map((i) => (
        <HeartSlot key={i} slotIndex={i} mistakes={mistakes} size={size} />
      ))}
    </div>
  );
}