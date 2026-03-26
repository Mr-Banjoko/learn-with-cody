import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Settings } from "lucide-react";

export default function ParentSettings({ language, onLanguageChange }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Gear button */}
      <button
        onClick={() => setOpen(true)}
        className="absolute top-4 right-4 z-30 rounded-full p-2"
        style={{
          background: "rgba(255,255,255,0.7)",
          backdropFilter: "blur(8px)",
          border: "1.5px solid rgba(78,205,196,0.2)",
          WebkitTapHighlightColor: "transparent",
        }}
      >
        <Settings size={22} style={{ color: "#4ECDC4" }} />
      </button>

      {/* Modal */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50"
              style={{ background: "rgba(0,0,0,0.35)", backdropFilter: "blur(4px)" }}
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", stiffness: 400, damping: 28 }}
              className="fixed inset-x-6 top-1/3 z-50 rounded-3xl p-6"
              style={{
                background: "rgba(255,255,255,0.98)",
                boxShadow: "0 24px 64px rgba(78,205,196,0.18)",
                border: "1.5px solid rgba(78,205,196,0.15)",
                maxWidth: 360,
                margin: "0 auto",
                fontFamily: "Fredoka, sans-serif",
              }}
            >
              <button
                className="absolute top-4 right-4 rounded-full p-1"
                onClick={() => setOpen(false)}
                style={{ background: "#F1F5F9" }}
              >
                <X size={18} style={{ color: "#64748B" }} />
              </button>

              <h2 className="text-xl font-semibold mb-1" style={{ color: "#1E293B" }}>
                {language === "zh" ? "家长设置" : "Parent Settings"}
              </h2>
              <p className="text-sm mb-6" style={{ color: "#64748B" }}>
                {language === "zh" ? "应用语言 / App Language" : "Language / 语言"}
              </p>

              {/* Language Toggle */}
              <div className="flex gap-3 mb-6">
                <button
                  onClick={() => onLanguageChange("en")}
                  className="flex-1 py-3 rounded-2xl font-semibold text-base transition-all"
                  style={{
                    background: language === "en" ? "linear-gradient(135deg, #4ECDC4, #44A08D)" : "#F8FAFC",
                    color: language === "en" ? "#fff" : "#64748B",
                    border: language === "en" ? "none" : "1.5px solid #E2E8F0",
                  }}
                >
                  English
                </button>
                <button
                  onClick={() => onLanguageChange("zh")}
                  className="flex-1 py-3 rounded-2xl font-semibold text-base transition-all"
                  style={{
                    background: language === "zh" ? "linear-gradient(135deg, #4ECDC4, #44A08D)" : "#F8FAFC",
                    color: language === "zh" ? "#fff" : "#64748B",
                    border: language === "zh" ? "none" : "1.5px solid #E2E8F0",
                  }}
                >
                  简体中文
                </button>
              </div>

              <div
                className="rounded-2xl p-4"
                style={{ background: "#F8FAFC", border: "1.5px solid #E2E8F0" }}
              >
                <p className="text-sm" style={{ color: "#64748B" }}>
                  {language === "zh"
                    ? "ℹ️ 英语教学内容不受此设置影响。"
                    : "ℹ️ English phonics content is not affected by this setting."}
                </p>
              </div>

              <div className="mt-4 text-center">
                <p className="text-xs" style={{ color: "#CBD5E1" }}>
                  Cody's Phonics • v0.1.0
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}