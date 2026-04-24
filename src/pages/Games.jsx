import { useState } from "react";
import { motion } from "framer-motion";
import { games } from "../lib/content";
import { tx } from "../lib/i18n";
import TestHub from "../components/test/TestHub";

const gameLabels = {
  "pic-slice":     { labelZh: "重排图片",   descZh: "把图片碎片拖到正确的位置" },
  "word-match":    { labelZh: "单词配对",   descZh: "把单词和图片配对" },
  "drag-letters":  { labelZh: "拖拽字母",   descZh: "把字母拖到对应的格子里拼出单词" },
  "missing-sound": { labelZh: "缺失的音",   descZh: "找到缺失的字母来补全单词" },
  "letter-catch":  { labelZh: "接字母",     descZh: "接住正确的字母来组成单词" },
  "sound-safari":    { labelZh: "声音探险",   descZh: "找出以这个音开头的动物名字" },
  "drag-letters-v2": { labelZh: "拖拽字母 V2", descZh: "放好所有字母后点击提交来检查答案" },
  "missing-sound-01": { labelZh: "缺失的音 0.1", descZh: "点击字母听音，拖动字母填空" },
  "draw-a-line":      { labelZh: "连线游戏",     descZh: "听单词和音，画线连接对应的声音" },
};
import { Lock } from "lucide-react";
import PicSliceGame from "./PicSliceGame";
import WordMatch from "../components/games/WordMatch";
import DragTheLetters from "../components/games/DragTheLetters";
import DragTheLettersV2 from "../components/games/DragTheLettersV2";
import MissingSound from "../components/games/MissingSound";
import MissingSound01 from "../components/games/MissingSound01";
import LetterCatch from "../components/games/LetterCatch";
import DrawALine from "../components/games/DrawALine";

const CODY_IMG = "https://media.base44.com/images/public/69c4ec00726384fdef1ab181/93a5cd462_transparent_cody.png";

const gameColors = ["#FF6B6B", "#4D96FF", "#6BCB77", "#FFD93D", "#C77DFF"];
const gameBgs = ["#FFF0F0", "#EFF6FF", "#F0FFF4"];

export default function Games({ onDeepScreen, lang = "en" }) {
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
    return <PicSliceGame onBack={exitGame} lang={lang} />;
  }
  if (activeGame === "word-match") {
    return <WordMatch onBack={exitGame} lang={lang} />;
  }
  if (activeGame === "drag-letters") {
    return <DragTheLetters onBack={exitGame} lang={lang} />;
  }
  if (activeGame === "missing-sound") {
    return <MissingSound onBack={exitGame} lang={lang} />;
  }
  if (activeGame === "letter-catch") {
    return <LetterCatch onBack={exitGame} lang={lang} />;
  }
  if (activeGame === "drag-letters-v2") {
    return <DragTheLettersV2 onBack={exitGame} lang={lang} />;
  }
  if (activeGame === "missing-sound-01") {
    return <MissingSound01 onBack={exitGame} lang={lang} />;
  }
  if (activeGame === "draw-a-line") {
    return <DrawALine onBack={exitGame} lang={lang} />;
  }
  if (activeGame === "test") {
    return <TestHub onBack={exitGame} onDeepScreen={onDeepScreen} lang={lang} />;
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
          <h1 className="text-2xl font-semibold" style={{ color: "#1E293B" }}>{tx("Games", "games_title", lang)}</h1>
          <p className="text-sm" style={{ color: "#64748B" }}>{tx("Fun ways to practice!", "games_subtitle", lang)}</p>
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
                  <h3 className="text-xl font-semibold" style={{ color: "#1E293B" }}>{lang === "zh" ? (gameLabels[game.id]?.labelZh || game.label) : game.label}</h3>
                  <p className="text-sm" style={{ color: "#64748B", marginTop: 2 }}>{lang === "zh" ? (gameLabels[game.id]?.descZh || game.description) : game.description}</p>
                  <div
                    className="inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold"
                    style={{ background: `${gameColors[i % gameColors.length]}18`, color: gameColors[i % gameColors.length] }}
                  >
                    {isPlayable ? tx("Play Now! 🎮", "play_now", lang) : tx("Coming Soon ✨", "coming_soon_badge", lang)}
                  </div>
                </div>
              </div>

              <div className="absolute top-3 right-12 text-lg opacity-30">✨</div>
            </motion.div>
          );
        })}
      </div>

      {/* Test Zone card */}
      <div className="px-4 mt-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: games.length * 0.1 }}
        onClick={() => enterGame("test")}
        className="relative rounded-3xl overflow-hidden p-5"
        style={{
          background: "#E0FAF8",
          border: "2px solid #4ECDC444",
          boxShadow: "0 8px 32px #4ECDC415",
          cursor: "pointer",
        }}
      >
        <div className="flex items-center gap-4">
          <div
            className="rounded-2xl text-3xl flex items-center justify-center"
            style={{ width: 64, height: 64, background: "white", boxShadow: "0 4px 16px #4ECDC425", flexShrink: 0 }}
          >
            🧪
          </div>
          <div>
            <h3 className="text-xl font-semibold" style={{ color: "#1E293B" }}>{tx("Test Zone", "test_zone_title", lang)}</h3>
            <p className="text-sm" style={{ color: "#64748B", marginTop: 2 }}>{tx("New sound matching activities", "test_zone_desc", lang)}</p>
            <div
              className="inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold"
              style={{ background: "#4ECDC418", color: "#4ECDC4" }}
            >
              {tx("Play Now! 🎮", "play_now", lang)}
            </div>
          </div>
        </div>
      </motion.div>
      </div>

      {/* Cody encouragement */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="px-0 mt-4 flex flex-col items-center gap-2 text-center"
      >
        <motion.div
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          style={{ fontSize: 36 }}
        >
          🎮
        </motion.div>
        <p className="text-base font-semibold" style={{ color: "#4ECDC4" }}>
          {tx("More games coming soon!", "more_games_soon", lang)}
        </p>
        <p className="text-sm" style={{ color: "#94A3B8" }}>
          {tx("Cody is working hard to bring you more fun activities!", "cody_working", lang)}
        </p>
      </motion.div>
    </div>
  );
}