import { useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { HOME_PATHS } from "../../lib/homePaths";

const NODE_SIZE = 68;

function NodeBubble({ node, status, isNext, nodeRef, onTap, color }) {
  const locked = status === "locked";
  const done = status === "done";

  return (
    <motion.button
      ref={nodeRef}
      whileTap={locked ? {} : { scale: 0.92 }}
      onClick={() => !locked && onTap(node)}
      style={{
        width: NODE_SIZE,
        height: NODE_SIZE,
        borderRadius: "50%",
        border: "none",
        background: locked
          ? "rgba(200,210,220,0.55)"
          : done
          ? color
          : isNext
          ? "#fff"
          : "#fff",
        boxShadow: isNext
          ? `0 0 0 5px ${color}44, 0 8px 28px ${color}44`
          : done
          ? `0 4px 16px ${color}66`
          : "0 2px 10px rgba(0,0,0,0.08)",
        border: locked
          ? "3px solid rgba(180,195,210,0.4)"
          : isNext
          ? `4px solid ${color}`
          : done
          ? `3px solid ${color}cc`
          : `3px solid rgba(180,195,210,0.35)`,
        cursor: locked ? "not-allowed" : "pointer",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 1,
        position: "relative",
        flexShrink: 0,
        touchAction: "manipulation",
        fontFamily: "Fredoka, sans-serif",
      }}
    >
      <span style={{ fontSize: 26, lineHeight: 1 }}>
        {locked ? "🔒" : node.emoji}
      </span>
      {done && (
        <span style={{ fontSize: 10, color: "white", fontWeight: 700 }}>
          ✓
        </span>
      )}
      {isNext && !done && (
        <motion.div
          animate={{ scale: [1, 1.18, 1] }}
          transition={{ repeat: Infinity, duration: 1.4 }}
          style={{
            position: "absolute",
            bottom: -22,
            fontSize: 14,
          }}
        >
          👇
        </motion.div>
      )}
    </motion.button>
  );
}

export default function PathView({ vowelId, progress, onNodeTap, onBack }) {
  // ALL hooks declared unconditionally at the top
  const nextRef = useRef(null);

  useEffect(() => {
    if (nextRef.current) {
      setTimeout(() => {
        nextRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 300);
    }
  }, []);

  const path = HOME_PATHS[vowelId];
  if (!path) return null;

  const { nodes, color, bgGradient, pathStroke, label, emoji } = path;

  const completedCount = nodes.filter(
    (n) => (progress[vowelId]?.[n.id]?.stars || 0) > 0
  ).length;

  const totalStars = nodes.reduce(
    (sum, n) => sum + (progress[vowelId]?.[n.id]?.stars || 0),
    0
  );

  const isFullyComplete = completedCount === nodes.length && nodes.length > 0;

  let foundNext = false;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        background: bgGradient || "#FFF5F5",
        fontFamily: "Fredoka, sans-serif",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        style={{
          background: "rgba(255,255,255,0.85)",
          borderBottom: `3px solid ${color}22`,
          padding: "10px 20px 14px",
          display: "flex",
          alignItems: "center",
          gap: 10,
          flexShrink: 0,
        }}
      >
        <button
          onClick={onBack}
          style={{
            width: 42,
            height: 42,
            borderRadius: 21,
            background: `${color}18`,
            border: `2px solid ${color}44`,
            cursor: "pointer",
            fontSize: 20,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          ←
        </button>
        <div style={{ flex: 1 }}>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: "#1E3A5F", margin: 0 }}>
            {emoji} {label}
          </h2>
          <p style={{ fontSize: 13, color: "#7BACC8", margin: 0 }}>
            {completedCount}/{nodes.length} levels · ⭐ {totalStars} stars
          </p>
        </div>
        {isFullyComplete && (
          <span style={{ fontSize: 28 }}>🏆</span>
        )}
      </div>

      {/* Scrollable path */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "40px 0 80px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 0,
        }}
      >
        {nodes.map((node, i) => {
          const stars = progress[vowelId]?.[node.id]?.stars || 0;
          const prevDone = i === 0 || (progress[vowelId]?.[nodes[i - 1].id]?.stars || 0) > 0;
          const done = stars > 0;
          const isNext = !done && prevDone && !foundNext;
          if (isNext) foundNext = true;
          const locked = !done && !isNext;
          const status = done ? "done" : locked ? "locked" : "unlocked";

          // Alternate left/right
          const isRight = i % 2 === 1;
          const OFFSET = 70;

          return (
            <div
              key={node.id}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: isRight ? "flex-end" : "flex-start",
                width: "100%",
                paddingLeft: isRight ? 0 : `calc(50% - ${NODE_SIZE / 2}px - ${OFFSET}px)`,
                paddingRight: isRight ? `calc(50% - ${NODE_SIZE / 2}px - ${OFFSET}px)` : 0,
                position: "relative",
                marginBottom: i < nodes.length - 1 ? 32 : 0,
              }}
            >
              {/* Connector line above (skip first) */}
              {i > 0 && (
                <div
                  style={{
                    position: "absolute",
                    top: -32,
                    left: isRight ? "auto" : `calc(50% - ${OFFSET}px)`,
                    right: isRight ? `calc(50% - ${OFFSET}px)` : "auto",
                    width: 4,
                    height: 32,
                    background: done
                      ? color
                      : "rgba(180,200,220,0.4)",
                    borderRadius: 2,
                    marginLeft: isRight ? 0 : NODE_SIZE / 2 - 2,
                    marginRight: isRight ? NODE_SIZE / 2 - 2 : 0,
                  }}
                />
              )}

              <NodeBubble
                node={node}
                status={status}
                isNext={isNext}
                nodeRef={isNext ? nextRef : null}
                onTap={onNodeTap}
                color={color}
              />

              {/* Label */}
              <p
                style={{
                  margin: "8px 0 0",
                  fontSize: 13,
                  fontWeight: 600,
                  color: locked ? "#aaa" : "#1E3A5F",
                  textAlign: isRight ? "right" : "left",
                  paddingLeft: isRight ? 0 : 6,
                  paddingRight: isRight ? 6 : 0,
                }}
              >
                {node.label}
              </p>
              {/* Stars */}
              {stars > 0 && (
                <p style={{ margin: "2px 0 0", fontSize: 12, textAlign: isRight ? "right" : "left", paddingLeft: isRight ? 0 : 6, paddingRight: isRight ? 6 : 0 }}>
                  {"⭐".repeat(stars)}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}