import { useState } from "react";
import { motion } from "framer-motion";
import PathView from "../components/home/PathView";
import LevelRunner from "../components/home/LevelRunner";
import { HOME_PATHS } from "../lib/homePaths";

const CODY_IMG = "https://media.base44.com/images/public/69c4ec00726384fdef1ab181/93a5cd462_transparent_cody.png";

const VOWEL_GROUPS = [
  { id: "short-a", label: "Short a", emoji: "🍎", active: true },
  { id: "short-e", label: "Short e", emoji: "🥚", active: false },
  { id: "short-i", label: "Short i", emoji: "🐟", active: false },
  { id: "short-o", label: "Short o", emoji: "🐙", active: false },
  { id: "short-u", label: "Short u", emoji: "☂️", active: false },
];

function useProgress() {
  const [progress, setProgress] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("cody_path_progress") || "{}");
    } catch {
      return {};
    }
  });

  const saveProgress = (vowelId, nodeId, stars) => {
    setProgress((prev) => {
      const updated = {
        ...prev,
        [vowelId]: {
          ...prev[vowelId],
          [nodeId]: { stars: Math.max(stars, prev[vowelId]?.[nodeId]?.stars || 0) },
        },
      };
      localStorage.setItem("cody_path_progress", JSON.stringify(updated));
      return updated;
    });
  };

  return [progress, saveProgress];
}

export default function Home({ onNavigate }) {
  const [openVowel, setOpenVowel] = useState(null);
  const [activeNode, setActiveNode] = useState(null);
  const [progress, saveProgress] = useProgress();

  const handleNodeTap = (node) => {
    setActiveNode(node);
  };

  const handleLevelComplete = (stars) => {
    if (activeNode && openVowel) {
      saveProgress(openVowel, activeNode.id, stars);
    }
    setActiveNode(null);
  };

  const handleOpenVowel = (id) => {
    setOpenVowel(id);
  };

  const handleCloseVowel = () => {
    setOpenVowel(null);
    setActiveNode(null);
  };

  // Level running
  if (activeNode && openVowel) {
    return (
      <div style={{ display: "flex", flexDirection: "column", flex: 1, height: "100%" }}>
        <LevelRunner
          node={activeNode}
          onComplete={handleLevelComplete}
          onBack={() => setActiveNode(null)}
        />
      </div>
    );
  }

  // Path view
  if (openVowel) {
    return (
      <div style={{ display: "flex", flexDirection: "column", flex: 1, height: "100%" }}>
        <PathView
          vowelId={openVowel}
          progress={progress}
          onNodeTap={handleNodeTap}
          onBack={handleCloseVowel}
        />
      </div>
    );
  }

  // Home folder list
  return (
    <div
      className="min-h-full pb-32"
      style={{ background: "#D6EEFF", fontFamily: "Fredoka, sans-serif" }}
    >
      {/* Header */}
      <div
        style={{
          background: "#A8D0E6",
          borderBottomLeftRadius: 28,
          borderBottomRightRadius: 28,
          padding: "16px 20px 24px",
        }}
      >
        <div className="flex items-center gap-3">
          <img src={CODY_IMG} alt="Cody" style={{ width: 52, height: 58, objectFit: "contain" }} />
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: "#1E3A5F" }}>Your Phonics Adventure</h1>
            <p style={{ fontSize: 14, color: "#3A6080" }}>Pick a sound to start!</p>
          </div>
        </div>
      </div>

      {/* Folder list */}
      <div className="px-4 pt-6">
        <p style={{ fontSize: 15, fontWeight: 600, color: "#4A90C4", marginBottom: 14 }}>
          🗺 Your Phonics Adventure
        </p>
        <div className="flex flex-col gap-3">
          {VOWEL_GROUPS.map((group, i) => {
            const pathDef = HOME_PATHS[group.id];
            const nodes = pathDef?.nodes || [];
            const completed = nodes.filter(
              (n) => (progress[group.id]?.[n.id]?.stars || 0) > 0
            ).length;

            return (
              <motion.button
                key={group.id}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.07 }}
                whileTap={group.active ? { scale: 0.97 } : {}}
                onClick={() => group.active && handleOpenVowel(group.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  padding: "16px 18px",
                  borderRadius: 20,
                  background: group.active ? "white" : "rgba(255,255,255,0.55)",
                  border: group.active ? "2px solid #A8D0E6" : "2px solid rgba(168,208,230,0.3)",
                  boxShadow: group.active ? "0 6px 24px rgba(30,58,95,0.10)" : "none",
                  cursor: group.active ? "pointer" : "not-allowed",
                  opacity: group.active ? 1 : 0.6,
                  textAlign: "left",
                  width: "100%",
                }}
              >
                <div
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: 16,
                    background: group.active ? "#D6EEFF" : "#EEF6FF",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 26,
                    flexShrink: 0,
                  }}
                >
                  {group.emoji}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 20, fontWeight: 700, color: "#1E3A5F" }}>{group.label}</p>
                  <p style={{ fontSize: 13, color: "#7BACC8" }}>
                    {group.active
                      ? `${nodes.length} levels · ${completed}/${nodes.length} done`
                      : "Coming soon"}
                  </p>
                </div>
                {group.active ? (
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 16,
                      background: "#4A90C4",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <span style={{ color: "white", fontSize: 18, lineHeight: 1 }}>›</span>
                  </div>
                ) : (
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      color: "#7BACC8",
                      background: "#EEF6FF",
                      padding: "3px 10px",
                      borderRadius: 99,
                    }}
                  >
                    Soon
                  </span>
                )}
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}