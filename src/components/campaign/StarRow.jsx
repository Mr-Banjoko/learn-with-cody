/**
 * StarRow — renders 1–3 star icons.
 *
 * Props:
 *   stars   {0|1|2|3}  — how many are filled (rest are empty outlines)
 *   size    {number}   — star SVG size in px (default 20)
 *   gap     {number}   — gap between stars in px (default 2)
 *   animate {boolean}  — whether to play pop-in animation (default false)
 */
import { motion } from "framer-motion";

function StarIcon({ filled, size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path
        d="M12 2L14.9 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L9.1 8.26L12 2Z"
        fill={filled ? "#FFD93D" : "none"}
        stroke={filled ? "#F4B942" : "rgba(200,200,200,0.8)"}
        strokeWidth={filled ? "1.5" : "1.5"}
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function StarRow({ stars = 0, size = 20, gap = 2, animate = false }) {
  return (
    <div style={{ display: "flex", gap, alignItems: "center", justifyContent: "center" }}>
      {[0, 1, 2].map((i) => {
        const filled = i < stars;
        if (animate && filled) {
          return (
            <motion.div
              key={i}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 320, damping: 18, delay: 0.1 + i * 0.12 }}
            >
              <StarIcon filled={filled} size={size} />
            </motion.div>
          );
        }
        return <StarIcon key={i} filled={filled} size={size} />;
      })}
    </div>
  );
}