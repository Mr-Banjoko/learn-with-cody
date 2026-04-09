import { motion } from "framer-motion";

const CODY_IMG = "https://media.base44.com/images/public/69c4ec00726384fdef1ab181/93a5cd462_transparent_cody.png";

export default function Home({ onNavigate }) {
  return (
    <div
      className="flex flex-col items-center justify-center min-h-full px-6 pb-32 pt-16 relative"
      style={{ fontFamily: "Fredoka, sans-serif" }}
    >
      {/* Background path hint */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <svg width="100%" height="100%" viewBox="0 0 400 700" preserveAspectRatio="xMidYMid slice" opacity={0.06}>
          <path
            d="M 200 650 Q 300 550 200 450 Q 100 350 200 250 Q 300 150 200 50"
            stroke="#4ECDC4"
            strokeWidth="40"
            fill="none"
            strokeLinecap="round"
            strokeDasharray="1 0"
          />
        </svg>
        {/* Future lesson nodes hinted */}
        {[600, 480, 360, 240, 120].map((y, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: i % 2 === 0 ? "55%" : "35%",
              top: `${y / 7}%`,
              width: 48,
              height: 48,
              borderRadius: "50%",
              background: "rgba(78,205,196,0.08)",
              border: "2px dashed rgba(78,205,196,0.15)",
            }}
          />
        ))}
      </div>

      {/* Cody illustration */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 22 }}
      >
        <img
          src={CODY_IMG}
          alt="Cody"
          style={{
            width: 220,
            height: 240,
            objectFit: "contain",
            filter: "drop-shadow(0 12px 32px rgba(78,205,196,0.2))",
          }}
        />
      </motion.div>

      {/* Speech bubble */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="relative mt-2 mb-8 px-6 py-4 rounded-3xl text-center"
        style={{
          background: "white",
          border: "2px solid rgba(78,205,196,0.3)",
          boxShadow: "0 8px 32px rgba(78,205,196,0.12)",
          maxWidth: 280,
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -12,
            left: "50%",
            transform: "translateX(-50%)",
            width: 0,
            height: 0,
            borderLeft: "12px solid transparent",
            borderRight: "12px solid transparent",
            borderBottom: "12px solid white",
          }}
        />
        <p className="text-xl font-semibold" style={{ color: "#1E293B" }}>
          Hi! Ready to learn? 🌟
        </p>
        <p className="text-sm mt-1" style={{ color: "#64748B" }}>
          Your phonics adventure starts here!
        </p>
      </motion.div>

      {/* Start Learning CTA */}
      <motion.button
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        whileTap={{ scale: 0.96 }}
        onClick={() => onNavigate("learn")}
        className="px-10 py-4 rounded-full text-xl font-semibold text-white shadow-lg"
        style={{
          background: "linear-gradient(135deg, #4ECDC4, #44A08D)",
          boxShadow: "0 8px 24px rgba(78,205,196,0.4)",
          WebkitTapHighlightColor: "transparent",
        }}
      >
        🚀 Start Learning!
      </motion.button>

      {/* Coming soon hint */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="mt-10 flex flex-col items-center gap-2"
      >
        <div className="flex gap-2">
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              animate={{ opacity: [0.3, 0.7, 0.3], scale: [1, 1.15, 1] }}
              transition={{ duration: 1.8, repeat: Infinity, delay: i * 0.2 }}
              style={{ fontSize: 22 }}
            >
              ⭐
            </motion.div>
          ))}
        </div>
        <p className="text-sm" style={{ color: "#94A3B8" }}>
          Your adventure path is coming soon!
        </p>
      </motion.div>
    </div>
  );
}