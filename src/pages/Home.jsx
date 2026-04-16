export default function Home({ lang = "en" }) {
  return (
    <div
      style={{
        fontFamily: "Fredoka, sans-serif",
        display: "flex",
        flexDirection: "column",
        height: "100%",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        boxSizing: "border-box",
        gap: 12,
        color: "#1E3A5F",
        textAlign: "center",
      }}
    >
      <span style={{ fontSize: 48 }}>🏠</span>
      <p style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>
        {lang === "zh" ? "主页" : "Home"}
      </p>
      <p style={{ fontSize: 15, color: "#7BACC8", margin: 0 }}>
        {lang === "zh" ? "内容即将推出" : "Content coming soon"}
      </p>
    </div>
  );
}