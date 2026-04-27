/**
 * WriteHub
 * ========
 * Top-level router for the Write game.
 * Manages which sub-view is active:
 *   - "select"   → WriteVowelSelect (pick a vowel group)
 *   - "short-a"  → WriteGame with shortAWords
 *   - (future)   → short-e/i/o/u when implemented
 */
import { useState } from "react";
import WriteVowelSelect from "./WriteVowelSelect";
import WriteGame from "./WriteGame";
import { shortAWords } from "../../lib/shortAWords";

export default function WriteHub({ onBack, lang = "en" }) {
  const [activeVowel, setActiveVowel] = useState(null);

  if (activeVowel === "short-a") {
    return (
      <WriteGame
        wordList={shortAWords}
        onBack={() => setActiveVowel(null)}
        lang={lang}
      />
    );
  }

  // Future vowels — show vowel select either way
  return (
    <WriteVowelSelect
      onSelectVowel={setActiveVowel}
      onBack={onBack}
      lang={lang}
    />
  );
}