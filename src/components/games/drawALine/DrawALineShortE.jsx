import BackArrow from "../../BackArrow";

export default function DrawALineShortE({ onBack, lang = "en" }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", fontFamily: "Fredoka, sans-serif", background: "linear-gradient(160deg,#E8FFFE,#FFF9E6,#F5F0FF)", overflow: "hidden" }}>
      <div style={{ flexShrink: 0, display: "flex", alignItems: "center", gap: 8, padding: "calc(env(safe-area-inset-top,0px)+10px) 16px 10px", background: "rgba(255,255,255,0.80)", borderBottom: "1.5px solid rgba(0,0,0,0.06)" }}>
        <BackArrow onPress={onBack} />
        <div style={{ flex: 1, textAlign: "center", marginRight: 32 }}>
          <p style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "#1E293B" }}>Draw a Line · Short E 🥚</p>
        </div>
      </div>
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 12, padding: 32 }}>
        <div style={{ fontSize: 56 }}>🥚</div>
        <p style={{ fontSize: 22, fontWeight: 700, color: "#1E293B", margin: 0 }}>Short E — Coming Soon!</p>
        <p style={{ fontSize: 15, color: "#64748B", margin: 0, textAlign: "center" }}>This vowel group is being prepared. Check back soon!</p>
      </div>
    </div>
  );
}