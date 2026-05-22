/**
 * IntroVideo
 * Full-screen branded opening video.
 * Plays once per session, then calls onComplete().
 * Falls back to onComplete() on error or timeout.
 */
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const VIDEO_URL = "https://media.base44.com/videos/public/69c4ec00726384fdef1ab181/e78a47838_ElevenLabs_video_seedance-2-0_thecharacte_2026-05-22T02_21_191.mp4";
const FALLBACK_TIMEOUT = 8000; // ms — give up if video won't start

export default function IntroVideo({ onComplete }) {
  const videoRef = useRef(null);
  const fallbackRef = useRef(null);
  const doneRef = useRef(false);
  const [visible, setVisible] = useState(true);

  const finish = () => {
    if (doneRef.current) return;
    doneRef.current = true;
    clearTimeout(fallbackRef.current);
    setVisible(false);
  };

  // After fade-out animation finishes, notify parent
  const handleExitComplete = () => {
    onComplete();
  };

  useEffect(() => {
    const vid = videoRef.current;
    if (!vid) return;

    // Fallback: proceed if video never starts within timeout
    fallbackRef.current = setTimeout(finish, FALLBACK_TIMEOUT);

    const handleEnded = () => finish();
    const handleError = () => finish();

    vid.addEventListener("ended", handleEnded);
    vid.addEventListener("error", handleError);

    // Attempt autoplay; if blocked, still proceed via fallback
    const playPromise = vid.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        // Autoplay blocked — clear long fallback and use short one
        clearTimeout(fallbackRef.current);
        fallbackRef.current = setTimeout(finish, 1500);
      });
    }

    return () => {
      clearTimeout(fallbackRef.current);
      vid.removeEventListener("ended", handleEnded);
      vid.removeEventListener("error", handleError);
    };
  }, []);

  return (
    <AnimatePresence onExitComplete={handleExitComplete}>
      {visible && (
        <motion.div
          key="intro"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7, ease: "easeInOut" }}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            background: "#000",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
          }}
        >
          <video
            ref={videoRef}
            src={VIDEO_URL}
            autoPlay
            playsInline
            muted={false}
            preload="auto"
            controls={false}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
              // hardware acceleration hint
              transform: "translateZ(0)",
              willChange: "transform",
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}