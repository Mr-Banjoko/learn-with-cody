/**
 * Shared header used inside every campaign level.
 *
 * Layout:
 *   [ BackArrow ]       [ HeartDisplay ] [ HintButton ]
 *   [ Label            ]
 *
 * The hint stays in the far-right corner, with hearts immediately before it.
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
      }}
    >
      {/* Row: back arrow | flexible space | hearts | hint */}
      <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
        <BackArrow onPress={onBack} />
        <div style={{ flex: 1 }} />
        <HeartDisplay mistakes={mistakes} size={46} />
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