/**
 * Shared header used inside every campaign level.
 *
 * Layout:
 *   [ BackArrow ]   [ HeartDisplay ]  [ HintButton ]
 *   [ Label        ]
 *
 * Hearts sit on the right, with Hint button to their right.
 * The label sits directly below the back arrow.
 */
import BackArrow from "../BackArrow";
import HeartDisplay from "./HeartDisplay";
import HintButton from "./HintButton";
import { getLevelLabel } from "../../lib/levelLabel";

export default function LevelHeader({ levelNum, mistakes, onBack, lang = "en", gameType, vowelKey = "short-a" }) {
  const label = getLevelLabel(levelNum, lang, vowelKey);

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
      {/* Row: back arrow | spacer | hearts | hint button */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <BackArrow onPress={onBack} />
        <div style={{ flex: 1 }} />
        <HeartDisplay mistakes={mistakes} size={76} />
        <HintButton gameType={gameType} lang={lang} />
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