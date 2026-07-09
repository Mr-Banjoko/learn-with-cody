/**
 * StreakCalendarOverlay — pop-up monthly activity calendar (Duolingo style).
 * Shows every day of the month; active days get a flame chip. Arrows navigate
 * between months. Header shows current streak + active-day count.
 */
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { getActiveDays, getCurrentStreak } from "../../lib/activityStreak";

const MONTHS_EN = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const MONTHS_ZH = ["一月","二月","三月","四月","五月","六月","七月","八月","九月","十月","十一月","十二月"];
const WEEKDAYS_EN = ["S","M","T","W","T","F","S"];
const WEEKDAYS_ZH = ["日","一","二","三","四","五","六"];

export default function StreakCalendarOverlay({ open, onClose, lang = "en" }) {
  const now = new Date();
  const [view, setView] = useState({ year: now.getFullYear(), month: now.getMonth() });

  const activeDays = getActiveDays(view.year, view.month);
  const streak = getCurrentStreak();
  const daysInMonth = new Date(view.year, view.month + 1, 0).getDate();
  const firstWeekday = new Date(view.year, view.month, 1).getDay();
  const isCurrentMonth = view.year === now.getFullYear() && view.month === now.getMonth();

  const shift = (delta) => {
    setView(({ year, month }) => {
      const d = new Date(year, month + delta, 1);
      return { year: d.getFullYear(), month: d.getMonth() };
    });
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          style={{
            position: "fixed", inset: 0, zIndex: 100,
            background: "rgba(30,58,95,0.45)", backdropFilter: "blur(4px)",
            display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
          }}
        >
          <motion.div
            initial={{ scale: 0.85, y: 30, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 20, opacity: 0 }}
            transition={{ type: "spring", stiffness: 320, damping: 26 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%", maxWidth: 380, borderRadius: 28, background: "white",
              boxShadow: "0 24px 80px rgba(30,58,95,0.35)", padding: "20px 18px 22px",
              fontFamily: "Fredoka, sans-serif", position: "relative",
            }}
          >
            <button
              onClick={onClose}
              style={{
                position: "absolute", top: 14, right: 14, width: 34, height: 34, borderRadius: 17,
                border: "none", background: "rgba(30,58,95,0.07)", display: "flex",
                alignItems: "center", justifyContent: "center", cursor: "pointer",
              }}
              aria-label="Close"
            >
              <X size={18} color="#1E3A5F" />
            </button>

            {/* Streak header */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
              <div style={{
                width: 58, height: 58, borderRadius: 18,
                background: streak > 0 ? "linear-gradient(150deg,#FF9F43,#FF6B6B)" : "#E2E8F0",
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30,
                boxShadow: streak > 0 ? "0 6px 18px rgba(255,120,80,0.35)" : "none",
              }}>
                🔥
              </div>
              <div>
                <div style={{ fontSize: 26, fontWeight: 700, color: "#1E3A5F", lineHeight: 1.1 }}>
                  {streak} {lang === "zh" ? "天连胜" : streak === 1 ? "day streak" : "day streak"}
                </div>
                <div style={{ fontSize: 13, color: "#64748B" }}>
                  {activeDays.size} {lang === "zh" ? "个活跃日（本月）" : `active ${activeDays.size === 1 ? "day" : "days"} this month`}
                </div>
              </div>
            </div>

            {/* Month navigation */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
              <button onClick={() => shift(-1)} style={{ width: 36, height: 36, borderRadius: 18, border: "none", background: "rgba(78,205,196,0.15)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }} aria-label="Previous month">
                <ChevronLeft size={20} color="#1E3A5F" />
              </button>
              <span style={{ fontSize: 18, fontWeight: 700, color: "#1E3A5F" }}>
                {(lang === "zh" ? MONTHS_ZH : MONTHS_EN)[view.month]} {view.year}
              </span>
              <button
                onClick={() => !isCurrentMonth && shift(1)}
                style={{ width: 36, height: 36, borderRadius: 18, border: "none", background: "rgba(78,205,196,0.15)", display: "flex", alignItems: "center", justifyContent: "center", cursor: isCurrentMonth ? "default" : "pointer", opacity: isCurrentMonth ? 0.35 : 1 }}
                aria-label="Next month"
              >
                <ChevronRight size={20} color="#1E3A5F" />
              </button>
            </div>

            {/* Weekday header */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", marginBottom: 4 }}>
              {(lang === "zh" ? WEEKDAYS_ZH : WEEKDAYS_EN).map((d, i) => (
                <div key={i} style={{ textAlign: "center", fontSize: 12, fontWeight: 600, color: "#94A3B8", padding: "4px 0" }}>{d}</div>
              ))}
            </div>

            {/* Day grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4 }}>
              {Array.from({ length: firstWeekday }).map((_, i) => <div key={`e-${i}`} />)}
              {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
                const active = activeDays.has(day);
                const isToday = isCurrentMonth && day === now.getDate();
                return (
                  <div
                    key={day}
                    style={{
                      aspectRatio: "1/1", borderRadius: 12,
                      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                      background: active ? "linear-gradient(150deg,#FF9F43,#FF6B6B)" : "rgba(30,58,95,0.04)",
                      border: isToday ? "2px solid #4ECDC4" : "2px solid transparent",
                      boxShadow: active ? "0 3px 10px rgba(255,120,80,0.30)" : "none",
                    }}
                  >
                    {active ? (
                      <span style={{ fontSize: 15, lineHeight: 1 }}>🔥</span>
                    ) : (
                      <span style={{ fontSize: 13, fontWeight: 600, color: isToday ? "#1E3A5F" : "#94A3B8" }}>{day}</span>
                    )}
                  </div>
                );
              })}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}