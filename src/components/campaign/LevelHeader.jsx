/**
 * Shared header used inside every campaign level.
 *
 * Layout:
 *   [ BackArrow ]   [ HeartDisplay ]
 *   [ Label        ]
 *
 * The label sits directly below the back arrow, not beside it.
 */
import BackArrow from "../BackArrow";
import HeartDisplay from "./HeartDisplay";
import { getLevelLabel } from "../../lib/levelLabel";

export default function LevelHeader({ levelNum, mistakes, onBack, lang = "en" }) {
  const label = getLevelLabel(levelNum, lang);

  return (
    <div
      style={{
        flexShrink: 0,
        display: "flex",
        flexDirection: "column",
        padding: "calc(env(safe-area-inset-top, 0px) + 8px) 16px 6px",
        borderBottom: "1.5px solid rgba(0,0,0,0.06)",
        background: "rgba(255,255,255,0.75)",
        backdropFilter: "blur(10px)",
      }}
    >
      {/* Row: back arrow + heart */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <BackArrow onPress={onBack} />
        <HeartDisplay mistakes={mistakes} size={54} />
      </div>

      {/* Label directly below back arrow */}
      <p
        style={{
          margin: "2px 0 0 2px",
          fontSize: 16,
          fontWeight: 700,
          color: "#1E293B",
          lineHeight: 1.2,
          letterSpacing: "0.01em",
        }}
      >
        {label}
      </p>
    </div>
  );
}