import { motion } from "framer-motion";
import { Home, BookOpen, Gamepad2 } from "lucide-react";

const tabs = [
  { id: "home", label: "Home", icon: Home, labelZh: "首页" },
  { id: "learn", label: "Learn", icon: BookOpen, labelZh: "学习" },
  { id: "games", label: "Games", icon: Gamepad2, labelZh: "游戏" },
];

export default function TabBar({ activeTab, onTabChange, language = "en", showCodyInBar = false }) {
  return (
    <motion.div
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30, delay: 0.1 }}
      className="fixed bottom-0 left-0 right-0 z-40"
      style={{
        background: "rgba(255,255,255,0.95)",
        backdropFilter: "blur(16px)",
        borderTop: "1.5px solid rgba(78,205,196,0.18)",
        paddingBottom: "env(safe-area-inset-bottom, 8px)",
        boxShadow: "0 -4px 32px rgba(78,205,196,0.10)",
      }}
    >
      <div className="flex items-end justify-around px-2 pt-2 pb-2 max-w-lg mx-auto">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          const isLearnTab = tab.id === "learn";

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className="flex flex-col items-center gap-1 min-w-[72px] py-1 px-3 rounded-2xl transition-all duration-200 relative"
              style={{
                background: isActive ? "rgba(78,205,196,0.12)" : "transparent",
                border: "none",
                outline: "none",
                WebkitTapHighlightColor: "transparent",
              }}
            >
              {/* Cody mini icon in Learn tab slot */}
              {isLearnTab && showCodyInBar ? (
                <motion.div
                  initial={{ scale: 0, y: 20, opacity: 0 }}
                  animate={{ scale: 1, y: 0, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 22 }}
                  className="relative"
                  style={{ width: 44, height: 44 }}
                >
                  <img
                    src="https://media.base44.com/images/public/69c4ec00726384fdef1ab181/93a5cd462_transparent_cody.png"
                    alt="Cody"
                    style={{
                      width: 44,
                      height: 44,
                      objectFit: "contain",
                      filter: isActive
                        ? "drop-shadow(0 2px 8px rgba(78,205,196,0.5))"
                        : "drop-shadow(0 1px 4px rgba(0,0,0,0.15))",
                    }}
                  />
                  {isActive && (
                    <motion.div
                      className="absolute -bottom-1 left-1/2 -translate-x-1/2"
                      style={{ width: 6, height: 6, borderRadius: "50%", background: "#4ECDC4" }}
                      layoutId="tabIndicator"
                    />
                  )}
                </motion.div>
              ) : (
                <motion.div
                  animate={{ scale: isActive ? 1.15 : 1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 14,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: isActive ? "linear-gradient(135deg, #4ECDC4, #44A08D)" : "transparent",
                  }}
                >
                  <Icon
                    size={24}
                    style={{ color: isActive ? "#ffffff" : "#94A3B8", strokeWidth: isActive ? 2.5 : 1.8 }}
                  />
                  {isActive && !isLearnTab && (
                    <motion.div
                      className="absolute -bottom-1 left-1/2 -translate-x-1/2"
                      style={{ width: 6, height: 6, borderRadius: "50%", background: "#4ECDC4" }}
                      layoutId="tabIndicatorOther"
                    />
                  )}
                </motion.div>
              )}

              <span
                style={{
                  fontFamily: "Fredoka, sans-serif",
                  fontSize: 12,
                  fontWeight: isActive ? 600 : 400,
                  color: isActive ? "#4ECDC4" : "#94A3B8",
                  lineHeight: 1.2,
                }}
              >
                {language === "zh" ? tab.labelZh : tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </motion.div>
  );
}