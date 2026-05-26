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

  const wrapStyle = {
    width: size, height: size, flexShrink: 0,
    display: "flex", alignItems: "center", justifyContent: "center",
    overflow: "hidden",
  };
  const lottiStyle = { width: size, height: size, flexShrink: 0 };

  if (!isBroken && !isOutline) {
    return <div style={wrapStyle}><Lottie animationData={bouncingHeartData} loop style={lottiStyle} /></div>;
  }

  if (isOutline) {
    return <div style={wrapStyle}><Lottie animationData={heartOutlineData} loop style={lottiStyle} /></div>;
  }

  return (
    <div style={wrapStyle}>
      <Lottie
        lottieRef={brokenRef}
        animationData={brokenHeartData}
        loop={false}
        autoplay={!brokenDone}
        onComplete={() => setBrokenDone(true)}
        style={lottiStyle}
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