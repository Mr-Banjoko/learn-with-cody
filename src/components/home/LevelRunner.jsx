import FlashcardScreen from "../FlashcardScreen";
import WordMatchGame from "../games/WordMatchGame";
import DragTheLettersGame from "../games/DragTheLettersGame";
import MissingSoundGame from "../games/MissingSoundGame";

/**
 * LevelRunner wraps the existing game/learn components
 * and calls onComplete(stars) when the user is done.
 */
export default function LevelRunner({ node, onComplete, onBack }) {
  const { type, words, title, color } = node;

  const handleBack = () => onBack();

  // For learn nodes, show flashcards and let the back button = complete with 4 stars
  if (type === "learn") {
    return (
      <div style={{ display: "flex", flexDirection: "column", flex: 1, height: "100%" }}>
        <FlashcardScreen
          words={words}
          title={title}
          enableLetterSounds
          onBack={() => onComplete(4)}
        />
      </div>
    );
  }

  if (type === "wordmatch") {
    return (
      <div style={{ display: "flex", flexDirection: "column", flex: 1, height: "100%" }}>
        <WordMatchGame
          words={words}
          title={title}
          color={color || "#4A90C4"}
          onBack={() => onComplete(3)}
        />
      </div>
    );
  }

  if (type === "dragletters") {
    return (
      <div style={{ display: "flex", flexDirection: "column", flex: 1, height: "100%" }}>
        <DragTheLettersGame
          words={words}
          title={title}
          color={color || "#4A90C4"}
          onBack={() => onComplete(3)}
        />
      </div>
    );
  }

  if (type === "missingsound") {
    return (
      <div style={{ display: "flex", flexDirection: "column", flex: 1, height: "100%" }}>
        <MissingSoundGame
          words={words}
          title={title}
          color={color || "#4A90C4"}
          onBack={() => onComplete(3)}
        />
      </div>
    );
  }

  // fallback
  return (
    <div style={{ padding: 40, textAlign: "center", fontFamily: "Fredoka, sans-serif" }}>
      <p>Unknown level type: {type}</p>
      <button onClick={handleBack}>Back</button>
    </div>
  );
}