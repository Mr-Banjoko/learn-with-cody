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
    <button
      type="button"
      aria-label={`Play level ${level}`}
      onClick={(event) => { event.stopPropagation(); onSelect(level); }}
      style={{ position: "absolute", left: "50%", bottom: "calc(100% - 9px)", zIndex: 5, width: 92, height: 88, padding: 0, border: 0, background: "transparent", transform: "translateX(-50%)", cursor: "pointer", WebkitTapHighlightColor: "transparent" }}
    >
      <Lottie animationData={animationData} loop autoplay style={{ width: "100%", height: "100%" }} />
    </button>
  );
}