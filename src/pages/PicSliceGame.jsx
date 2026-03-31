import { useState } from "react";
import VowelSelect from "../components/picslice/VowelSelect";
import DifficultySelect from "../components/picslice/DifficultySelect";
import EasyGame from "../components/picslice/EasyGame";
import { GAME_DATA } from "../lib/picSliceData";

export default function PicSliceGame({ onBack }) {
  const [screen, setScreen] = useState("vowel"); // "vowel" | "difficulty" | "game"
  const [selectedVowel, setSelectedVowel] = useState(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState(null);

  if (screen === "game") {
    const rounds = GAME_DATA[selectedVowel]?.[selectedDifficulty] || [];
    return (
      <EasyGame
        rounds={rounds}
        onBack={() => setScreen("difficulty")}
      />
    );
  }

  if (screen === "difficulty") {
    return (
      <DifficultySelect
        vowelId={selectedVowel}
        onSelect={(diff) => {
          setSelectedDifficulty(diff);
          setScreen("game");
        }}
        onBack={() => setScreen("vowel")}
      />
    );
  }

  return (
    <VowelSelect
      onSelect={(vowelId) => {
        setSelectedVowel(vowelId);
        setScreen("difficulty");
      }}
      onBack={onBack}
    />
  );
}