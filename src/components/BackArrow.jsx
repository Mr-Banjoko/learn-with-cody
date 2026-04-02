import { motion } from "framer-motion";

/**
 * BackArrow — universal kid-friendly back button.
 * Uses the same candy-arrow visual language as the Letter Catch left arrow.
 * Size is scaled down from the in-game version to fit activity headers.
 */
export default function BackArrow({ onPress }) {
  return (
    <button
      onPointerDown={(e) => { e.preventDefault(); onPress(); }}
      style={{
        background: "transparent",
        border: "none",
        padding: 0,
        cursor: "pointer",
        WebkitTapHighlightColor: "transparent",
        outline: "none",
        width: 84,
        height: 60,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        touchAction: "manipulation",
        flexShrink: 0,
      }}
    >
      <motion.div
        whileTap={{ scale: 0.86 }}
        transition={{ type: "spring", stiffness: 400, damping: 22 }}
        style={{
          position: "relative",
          width: 72,
          height: 50,
          filter: "drop-shadow(0 4px 8px rgba(78,200,240,0.40))",
        }}
      >
        <svg
          viewBox="0 0 104 72"
          width="72"
          height="50"
          style={{ display: "block", overflow: "visible" }}
        >
          <defs>
            <clipPath id="backArrowClip">
              <path d="M36,4 L4,36 L36,68 L36,52 L100,52 Q104,52 104,48 L104,24 Q104,20 100,20 L36,20 Z" />
            </clipPath>
          </defs>

          <g clipPath="url(#backArrowClip)">
            {/* Base sky-blue */}
            <path d="M36,4 L4,36 L36,68 L36,52 L100,52 Q104,52 104,48 L104,24 Q104,20 100,20 L36,20 Z" fill="#4EC8F0" />

            {/* Diagonal stripes */}
            <rect x="38" y="-10" width="14" height="100" fill="#FF5E5E" opacity="0.70" transform="rotate(-15 60 36)" />
            <rect x="58" y="-10" width="14" height="100" fill="#FFD93D" opacity="0.70" transform="rotate(-15 60 36)" />
            <rect x="78" y="-10" width="14" height="100" fill="#FF5E5E" opacity="0.55" transform="rotate(-15 60 36)" />

            {/* Polka dots */}
            <circle cx="76" cy="28" r="4" fill="white" opacity="0.55" />
            <circle cx="88" cy="42" r="3" fill="white" opacity="0.45" />
            <circle cx="64" cy="44" r="3.5" fill="white" opacity="0.50" />

            {/* Eyes */}
            <circle cx="50" cy="31" r="5.5" fill="white" />
            <circle cx="62" cy="31" r="5.5" fill="white" />
            <circle cx="51" cy="32" r="3" fill="#2D2D2D" />
            <circle cx="63" cy="32" r="3" fill="#2D2D2D" />
            <circle cx="52" cy="31" r="1.2" fill="white" />
            <circle cx="64" cy="31" r="1.2" fill="white" />
            {/* Smile */}
            <path d="M49,40 Q56,46 65,40" fill="none" stroke="#2D2D2D" strokeWidth="2" strokeLinecap="round" />
            {/* Cheeks */}
            <circle cx="47" cy="38" r="4" fill="#FF8FAB" opacity="0.5" />
            <circle cx="67" cy="38" r="4" fill="#FF8FAB" opacity="0.5" />

            {/* Outline */}
            <path d="M36,4 L4,36 L36,68 L36,52 L100,52 Q104,52 104,48 L104,24 Q104,20 100,20 L36,20 Z" fill="none" stroke="white" strokeWidth="2.5" opacity="0.5" />
          </g>
        </svg>
      </motion.div>
    </button>
  );
}