import { useState, useRef } from "react";
import { motion } from "framer-motion";
import RearrangePictures from "../components/games/RearrangePictures";

const INTRO_VIDEO_URL =
  "https://media.base44.com/videos/public/69c4ec00726384fdef1ab181/df23e431f_ElevenLabs_video_veo-3-1-lite_thecharacte_2026-05-21T09_14_48.mp4";

export default function PicSliceGame({ onBack, lang = "en" }) {
  const [videoPlayed, setVideoPlayed] = useState(false);
  const videoRef = useRef(null);

  if (videoPlayed) {
    return <RearrangePictures onBack={onBack} lang={lang} />;
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "#000",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
      }}
    >
      <video
        ref={videoRef}
        src={INTRO_VIDEO_URL}
        autoPlay
        playsInline
        style={{ width: "100%", height: "100%", objectFit: "contain" }}
        onEnded={() => setVideoPlayed(true)}
      />
      {/* Skip button */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        onClick={() => setVideoPlayed(true)}
        style={{
          position: "absolute",
          bottom: 40,
          right: 24,
          background: "rgba(255,255,255,0.2)",
          border: "2px solid rgba(255,255,255,0.5)",
          borderRadius: 99,
          color: "white",
          fontSize: 16,
          fontWeight: 700,
          padding: "10px 22px",
          cursor: "pointer",
          fontFamily: "Fredoka, sans-serif",
          backdropFilter: "blur(4px)",
        }}
      >
        Skip ›
      </motion.button>
    </div>
  );
}