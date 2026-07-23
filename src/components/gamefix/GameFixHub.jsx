import { useState } from "react";
import GameFixList from "@/components/gamefix/GameFixList";
import GameFixRunner from "@/components/gamefix/GameFixRunner";

export default function GameFixHub({ onBack, lang = "en" }) {
  const [selectedGame, setSelectedGame] = useState(null);

  if (selectedGame) {
    return <GameFixRunner game={selectedGame} onBack={() => setSelectedGame(null)} lang={lang} />;
  }

  return <GameFixList onBack={onBack} onSelect={setSelectedGame} />;
}