import { useState } from "react";
import { motion } from "framer-motion";
import AppShell from "../components/AppShell";
import IntroVideo from "../components/IntroVideo";

const SESSION_KEY = "cody_intro_played";
const hasPlayed = () => {
  try { return sessionStorage.getItem(SESSION_KEY) === "1"; } catch { return false; }
};
const markPlayed = () => {
  try { sessionStorage.setItem(SESSION_KEY, "1"); } catch {}
};

export default function Launch() {
  const [introDone, setIntroDone] = useState(hasPlayed());

  const handleIntroComplete = () => {
    markPlayed();
    setIntroDone(true);
  };

  return (
    <div className="fixed inset-0">
      {/* AppShell is always mounted so it's ready underneath */}
      <AppShell />

      {/* Intro video overlays on top, disappears when done */}
      {!introDone && (
        <IntroVideo onComplete={handleIntroComplete} />
      )}
    </div>
  );
}