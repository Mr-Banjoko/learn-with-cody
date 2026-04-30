/**
 * HeartDisplay — shows 3 bouncing Lottie hearts.
 * Each heart plays in a constant loop.
 * (Half/empty states to be added later.)
 */
import Lottie from "lottie-react";
import bouncingHeartData from "../../lib/BouncingHeart.json";

export default function HeartDisplay({ mistakes = 0, size = 22 }) {
  return (
    <div style={{ display: "flex", gap: 0, alignItems: "center", flexShrink: 0 }}>
      {[0, 1, 2].map((i) => (
        <div key={i} style={{ width: size + 4, height: size + 4 }}>
          <Lottie
            animationData={bouncingHeartData}
            loop={true}
            autoplay={true}
            style={{ width: "100%", height: "100%" }}
          />
        </div>
      ))}
    </div>
  );
}