/**
 * PlacementHeader — campaign-style header for the Placement Test.
 * Back arrow + label only. NO hearts, NO hint button.
 */
import BackArrow from "../BackArrow";

export default function PlacementHeader({ onBack, lang = "en" }) {
  return (
    <div
      style={{
        flexShrink: 0,
        display: "flex",
        flexDirection: "column",
        padding: "calc(env(safe-area-inset-top, 0px) + 8px) 16px 6px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
        <BackArrow onPress={onBack} />
        <div style={{ flex: 1 }} />
      </div>
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
        {lang === "zh" ? "分班测试" : "Placement Test"}
      </p>
    </div>
  );
}