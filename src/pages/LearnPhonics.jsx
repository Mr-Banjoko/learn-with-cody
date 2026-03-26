import { useState } from "react";
import { motion } from "framer-motion";
import { activityTypes, lessonContent } from "../lib/content";
import ActivityShell from "../components/ActivityShell";

const CODY_IMG = "https://media.base44.com/images/public/69c4ec00726384fdef1ab181/6b8f13599_cody.png";

export default function LearnPhonics() {
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);

  if (selectedActivity) {
    return (
      <ActivityShell
        activity={selectedActivity}
        group={selectedGroup}
        onBack={() => { setSelectedActivity(null); setSelectedGroup(null); }}
      />
    );
  }

  return (
    <div
      className="min-h-full pb-32 pt-4"
      style={{ fontFamily: "Fredoka, sans-serif" }}
    >
      {/* Header */}
      <div className="px-4 mb-4 flex items-center gap-3">
        <img src={CODY_IMG} alt="Cody" style={{ width: 56, height: 62, objectFit: "contain" }} />
        <div>
          <h1 className="text-2xl font-semibold" style={{ color: "#1E293B" }}>Learn Phonics</h1>
          <p className="text-sm" style={{ color: "#64748B" }}>Pick an activity to practice!</p>
        </div>
      </div>

      {/* Vowel Group Selector — future-ready slot */}
      <div className="px-4 mb-6">
        <div
          className="rounded-2xl p-4"
          style={{ background: "rgba(78,205,196,0.08)", border: "1.5px dashed rgba(78,205,196,0.3)" }}
        >
          <p className="text-sm font-semibold mb-2" style={{ color: "#4ECDC4" }}>🔤 Word Groups</p>
          <div className="flex gap-2 flex-wrap">
            {lessonContent.vowelGroups.map((group) => (
              <div
                key={group.id}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl"
                style={{
                  background: "rgba(255,255,255,0.7)",
                  border: "1.5px solid rgba(78,205,196,0.2)",
                  opacity: 0.6,
                  cursor: "not-allowed",
                }}
              >
                <span style={{ fontSize: 16 }}>{group.emoji}</span>
                <span className="text-sm font-semibold" style={{ color: "#64748B" }}>
                  {group.label}
                </span>
                <span style={{ fontSize: 10, background: "#E2E8F0", color: "#94A3B8", padding: "1px 6px", borderRadius: 8 }}>
                  Soon
                </span>
              </div>
            ))}
          </div>
          <p className="text-xs mt-2" style={{ color: "#94A3B8" }}>
            Word groups unlock as you learn more sounds!
          </p>
        </div>
      </div>

      {/* Activity Type Cards */}
      <div className="px-4">
        <p className="text-sm font-semibold mb-3" style={{ color: "#64748B" }}>
          🎯 Choose an Activity
        </p>
        <div className="flex flex-col gap-3">
          {activityTypes.map((activity, i) => (
            <motion.button
              key={activity.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.07 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setSelectedActivity(activity)}
              className="w-full flex items-center gap-4 p-4 rounded-2xl text-left"
              style={{
                background: activity.bgColor,
                border: `2px solid ${activity.color}28`,
                boxShadow: `0 4px 16px ${activity.color}18`,
                WebkitTapHighlightColor: "transparent",
              }}
            >
              <div
                className="flex items-center justify-center rounded-2xl text-2xl"
                style={{
                  width: 52,
                  height: 52,
                  background: "white",
                  boxShadow: `0 4px 12px ${activity.color}30`,
                  flexShrink: 0,
                }}
              >
                {activity.emoji}
              </div>
              <div className="flex-1">
                <p className="text-lg font-semibold" style={{ color: "#1E293B" }}>
                  {activity.label}
                </p>
                <p className="text-sm" style={{ color: "#64748B" }}>
                  {activity.description}
                </p>
              </div>
              <div
                className="rounded-full flex items-center justify-center"
                style={{ width: 32, height: 32, background: activity.color }}
              >
                <span style={{ color: "white", fontSize: 16 }}>›</span>
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}