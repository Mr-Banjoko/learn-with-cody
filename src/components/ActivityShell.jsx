import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";

const CODY_IMG = "https://media.base44.com/images/public/69c4ec00726384fdef1ab181/6b8f13599_cody.png";

export default function ActivityShell({ activity, onBack }) {
  return (
    <div
      className="min-h-full flex flex-col pb-32"
      style={{ fontFamily: "Fredoka, sans-serif", background: activity.bgColor }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-4 pb-4">
        <button
          onClick={onBack}
          className="rounded-full p-2"
          style={{ background: "rgba(255,255,255,0.8)", border: `2px solid ${activity.color}30` }}
        >
          <ArrowLeft size={22} style={{ color: activity.color }} />
        </button>
        <div
          className="flex items-center gap-2 px-4 py-2 rounded-full"
          style={{ background: "rgba(255,255,255,0.8)" }}
        >
          <span style={{ fontSize: 20 }}>{activity.emoji}</span>
          <span className="text-lg font-semibold" style={{ color: "#1E293B" }}>
            {activity.label}
          </span>
        </div>
      </div>

      {/* Coming soon placeholder */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 gap-6">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 22 }}
        >
          <img
            src={CODY_IMG}
            alt="Cody"
            style={{
              width: 180,
              height: 200,
              objectFit: "contain",
              filter: `drop-shadow(0 12px 24px ${activity.color}40)`,
            }}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center px-6 py-6 rounded-3xl"
          style={{
            background: "rgba(255,255,255,0.9)",
            border: `2px solid ${activity.color}30`,
            boxShadow: `0 12px 40px ${activity.color}20`,
            maxWidth: 320,
            width: "100%",
          }}
        >
          <div style={{ fontSize: 52, marginBottom: 8 }}>{activity.emoji}</div>
          <h2 className="text-2xl font-semibold mb-2" style={{ color: "#1E293B" }}>
            {activity.label}
          </h2>
          <p className="text-base mb-4" style={{ color: "#64748B" }}>
            {activity.description}
          </p>
          <div
            className="px-4 py-2 rounded-full text-sm font-semibold"
            style={{ background: `${activity.color}20`, color: activity.color, display: "inline-block" }}
          >
            🚧 Activity content coming soon!
          </div>
          <p className="text-xs mt-3" style={{ color: "#94A3B8" }}>
            Cody is getting the words ready for you!
          </p>
        </motion.div>
      </div>
    </div>
  );
}