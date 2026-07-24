import { useEffect, useState } from "react";
import Lottie from "lottie-react";

const ANIMATION_URL = "https://media.base44.com/files/public/69c4ec00726384fdef1ab181/c16f889ac_ipcopy.json";

export default function WavingCody({ onSelect, level }) {
  const [animationData, setAnimationData] = useState(null);

  useEffect(() => {
    fetch(ANIMATION_URL).then((response) => response.json()).then(setAnimationData);
  }, []);

  if (!animationData) return null;

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`Play level ${level}`}
      onClick={(event) => { event.stopPropagation(); onSelect(level); }}
      onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); onSelect(level); } }}
      style={{ position: "absolute", left: "50%", bottom: -3, zIndex: 5, width: 76, height: 74, transform: "translateX(-50%)", cursor: "pointer", WebkitTapHighlightColor: "transparent" }}
    >
      <Lottie animationData={animationData} loop autoplay style={{ width: "100%", height: "100%" }} />
    </div>
  );
}