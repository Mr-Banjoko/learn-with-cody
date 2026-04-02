import { useState } from "react";
import { motion } from "framer-motion";
import { games } from "../lib/content";
import { Lock } from "lucide-react";
import PicSliceGame from "./PicSliceGame";
import WordMatch from "../components/games/WordMatch";
import DragTheLetters from "../components/games/DragTheLetters";
import MissingSound from "../components/games/MissingSound";
import LetterCatch from "../components/games/LetterCatch";

const CODY_IMG = "https://media.base44.com/images/public/69c4ec00726384fdef1ab181/93a5cd462_transparent_cody.png";

const gameColors = ["#FF6B6B", "#4D96FF", "#6BCB77", "#FFD93D", "#C77DFF"];
const gameBgs = ["#FFF0F0", "#EFF6FF", "#F0FFF4"];

export default function Games({ onDeepScreen }) {
  const [activeGame, setActiveGame] = useState(null);

  const enterGame = (id) => {
    setActiveGame(id);
    onDeepScreen && onDeepScreen(true);
  };

  const exitGame = () => {
    setActiveGame(null);
    onDeepScreen && onDeepScreen(false);
  };

  if (activeGame === "pic-slice") {
    return <PicSliceGame onBack={exitGame} />;
  }
  if (activeGame === "word-match") {
    return <WordMatch onBack={exitGame} />;
  }
  if (activeGame === "drag-letters") {
    return <DragTheLetters onBack={exitGame} />;
  }
  if (activeGame === "missing-sound") {
    return <MissingSound onBack={exitGame} />;
  }
  if (activeGame === "letter-catch") {
    return <LetterCatch onBack={exitGame} />;
  }

  return (
    <div
      className="min-h-full pb-32 pt-4"
      style={{ fontFamily: "Fredoka, sans-serif" }}
    >
      {/* Header */}
      <div className="px-4 mb-6 flex items-center gap-3">
        <img src={CODY_IMG} alt="Cody" style={{ width: 56, height: 62, objectFit: "contain" }} />
        <div>
          <h1 className="text-2xl font-semibold" style={{ color: "#1E293B" }}>Games</h1>
          <p className="text-sm" style={{ color: "#64748B" }}>Fun ways to practice!</p>
        </div>
      </div>

      {/* Game Cards */}
      <div className="px-4 flex flex-col gap-4">
        {games.map((game, i) => {
          const isPlayable = game.available === true;
          return (
            <motion.div
              key={game.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              onClick={() => isPlayable && enterGame(game.id)}
              className="relative rounded-3xl overflow-hidden p-5"
              style={{
                background: gameBgs[i % gameBgs.length],
                border: `2px solid ${gameColors[i % gameColors.length]}25`,
                boxShadow: `0 8px 32px ${gameColors[i % gameColors.length]}15`,
                cursor: isPlayable ? "pointer" : "default",
              }}
            >
              {!isPlayable && (
                <div className="absolute inset-0 flex items-center justify-end p-5" style={{ pointerEvents: "none" }}>
                  <div className="rounded-full p-2" style={{ background: `${gameColors[i % gameColors.length]}18` }}>
                    <Lock size={20} style={{ color: gameColors[i % gameColors.length], opacity: 0.5 }} />
                  </div>
                </div>
              )}

              <div className="flex items-center gap-4">
                <div
                  className="rounded-2xl text-3xl flex items-center justify-center"
                  style={{ width: 64, height: 64, background: "white", boxShadow: `0 4px 16px ${gameColors[i % gameColors.length]}25`, flexShrink: 0 }}
                >
                  {game.emoji}
                </div>
                <div>
                  <h3 className="text-xl font-semibold" style={{ color: "#1E293B" }}>{game.label}</h3>
                  <p className="text-sm" style={{ color: "#64748B", marginTop: 2 }}>{game.description}</p>
                  <div
                    className="inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold"
                    style={{ background: `${gameColors[i % gameColors.length]}18`, color: gameColors[i % gameColors.length] }}
                  >
                    {isPlayable ? "Play Now! 🎮" : "Coming Soon ✨"}
                  </div>
                </div>
              </div>

              <div className="absolute top-3 right-12 text-lg opacity-30">✨</div>
            </motion.div>
          );
        })}
      </div>

      {/* Cody encouragement */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="px-4 mt-8 flex flex-col items-center gap-2 text-center"
      >
        <motion.div
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          style={{ fontSize: 36 }}
        >
          🎮
        </motion.div>
        <p className="text-base font-semibold" style={{ color: "#4ECDC4" }}>
          More games coming soon!
        </p>
        <p className="text-sm" style={{ color: "#94A3B8" }}>
          Cody is working hard to bring you more fun activities!
        </p>
      </motion.div>
    </div>
  );
}