import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AppShell from "../components/AppShell";
import IntroVideo from "../components/IntroVideo";

// Play intro once per browser session
const SESSION_KEY = "cody_intro_played";
const hasPlayed = () => {
  try { return sessionStorage.getItem(SESSION_KEY) === "1"; } catch { return false; }
};
const markPlayed = () => {
  try { sessionStorage.setItem(SESSION_KEY, "1"); } catch {}
};

export default function Launch() {
  const [showIntro, setShowIntro] = useState(!hasPlayed());
  const [showHome, setShowHome] = useState(hasPlayed());

  const handleIntroComplete = () => {
    markPlayed();
    setShowHome(true);
    // IntroVideo handles its own fade-out; home fades in
  };

  return (
    <div className="fixed inset-0">
      {/* Home screen fades in after intro */}
      <AnimatePresence>
        {showHome && (
          <motion.div
            key="home"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
            style={{ position: "absolute", inset: 0 }}
          >
            <AppShell />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Intro video sits on top, fades out on complete */}
      {showIntro && (
        <IntroVideo
          onComplete={() => {
            setShowIntro(false);
          }}
        />
      )}
    </div>
  );
}