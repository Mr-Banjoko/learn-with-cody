import { motion } from "framer-motion";
import BackArrow from "../BackArrow";

const TOTAL_LEVELS = 50;
// Winding path: 5 columns across the screen, offset left%
// Values chosen so nothing goes off-screen on a 375px phone
const PATH_OFFSETS = [-34, -17, 0, 17, 34, 17, 0, -17]; // relative to 50%

function getLeftPct(idx) {
  return 50 + PATH_OFFSETS[idx % PATH_OFFSETS.length];
}

const NODE_COLORS = [
  "#FF6B6B",
  "#FF9F43",
  "#FFD93D",
  "#6BCB77",
  "#4ECDC4",
  "#4D96FF",
  "#C77DFF",
];

function nodeColor(n) {
  return NODE_COLORS[(n - 1) % NODE_COLORS.length];
}

function LevelNode({ num, color, onTap, isMilestone }) {
  const size = isMilestone ? 76 : 68;
  return (
    <motion.div
      whileTap={{ scale: 0.85 }}
      onClick={() => onTap(num)}
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: `linear-gradient(145deg, ${color} 0%, ${color}CC 100%)`,
        border: "3px solid white",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        boxShadow: `0 6px 0 ${color}99, 0 10px 22px ${color}44`,
        WebkitTapHighlightColor: "transparent",
        position: "relative",
        flexShrink: 0,
      }}
    >
      {isMilestone && (
        <span
          style={{
            position: "absolute",
            top: -18,
            fontSize: 18,
            pointerEvents: "none",
            filter: "drop-shadow(0 1px 3px rgba(0,0,0,0.15))",
          }}
        >
          ⭐
        </span>
      )}
      <span
        style={{
          fontSize: num >= 10 ? 20 : 24,
          fontWeight: 700,
          color: "white",
          textShadow: "0 1px 4px rgba(0,0,0,0.20)",
          userSelect: "none",
          lineHeight: 1,
          pointerEvents: "none",
        }}
      >
        {num}
      </span>
      {isMilestone && (
        <span
          style={{
            fontSize: 9,
            color: "rgba(255,255,255,0.9)",
            pointerEvents: "none",
            lineHeight: 1,
            marginTop: 2,
            letterSpacing: 0.5,
          }}
        >
          BOSS
        </span>
      )}
    </motion.div>
  );
}

export default function ShortALevels({ onBack, onSelectLevel, lang = "en" }) {
  const levels = Array.from({ length: TOTAL_LEVELS }, (_, i) => i + 1);
  // NODE_SPACING controls vertical gap between nodes — keep it comfortable
  const NODE_SPACING = 100;
  const TOP_OFFSET = 36;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        fontFamily: "Fredoka, sans-serif",
        background: "linear-gradient(160deg, #E8FFFE 0%, #FFF9E6 60%, #F5F0FF 100%)",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        style={{
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          gap: 4,
          padding: "calc(env(safe-area-inset-top, 0px) + 8px) 16px 8px",
          borderBottom: "1.5px solid rgba(0,0,0,0.06)",
          background: "rgba(255,255,255,0.75)",
          backdropFilter: "blur(10px)",
        }}
      >
        <BackArrow onPress={onBack} />

        <div style={{ flex: 1 }}>
          <p style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "#1E293B" }}>
            🍎 {lang === "zh" ? "短元音 A" : "Short a"}
          </p>
          <p style={{ margin: 0, fontSize: 12, color: "#64748B" }}>
            {lang === "zh" ? "50 关卡冒险" : "50-level adventure"}
          </p>
        </div>

        {/* XP pill */}
        <div
          style={{
            background: "#FFF9E6",
            border: "1.5px solid #FFD93D",
            borderRadius: 99,
            padding: "5px 13px",
            display: "flex",
            alignItems: "center",
            gap: 4,
            flexShrink: 0,
          }}
        >
          <span style={{ fontSize: 13 }}>⚡</span>
          <span style={{ color: "#B45309", fontWeight: 700, fontSize: 13 }}>0 XP</span>
        </div>
      </div>

      {/* Scrollable level map */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          overflowX: "hidden",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "relative",
            width: "100%",
            height: TOP_OFFSET + TOTAL_LEVELS * NODE_SPACING + 160,
          }}
        >
          {levels.map((lvl, idx) => {
            const leftPct = getLeftPct(idx);
            const topPx = TOP_OFFSET + idx * NODE_SPACING;
            const color = nodeColor(lvl);
            const isMilestone = lvl % 10 === 0;

            return (
              <div
                key={lvl}
                style={{
                  position: "absolute",
                  top: topPx,
                  left: `${leftPct}%`,
                  transform: "translateX(-50%)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <LevelNode
                  num={lvl}
                  color={color}
                  isMilestone={isMilestone}
                  onTap={onSelectLevel || (() => {})}
                />
              </div>
            );
          })}

          {/* Trophy finish */}
          <div
            style={{
              position: "absolute",
              top: TOP_OFFSET + TOTAL_LEVELS * NODE_SPACING + 20,
              left: `${getLeftPct(TOTAL_LEVELS)}%`,
              transform: "translateX(-50%)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 6,
            }}
          >
            <div
              style={{
                width: 76,
                height: 76,
                borderRadius: "50%",
                background: "linear-gradient(145deg, #FFD700, #FFA500)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 36,
                boxShadow: "0 7px 0 #cc8800, 0 12px 28px rgba(255,165,0,0.45)",
                border: "3px solid white",
              }}
            >
              🏆
            </div>
            <span style={{ color: "#64748B", fontSize: 13, fontWeight: 600 }}>
              {lang === "zh" ? "完成！" : "Complete!"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}