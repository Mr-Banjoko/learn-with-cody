import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import TabBar from "./TabBar";
import ParentSettings from "./ParentSettings";
import Home from "../pages/Home";
import LearnPhonics from "../pages/LearnPhonics";
import Games from "../pages/Games";
import Album from "../pages/Album";

export default function AppShell() {
  const [activeTab, setActiveTab] = useState("learn");
  const [isDeepScreen, setIsDeepScreen] = useState(false);
  const [language, setLanguage] = useState(() => localStorage.getItem("lang") || "en");

  const handleTabChange = (tab) => {
    setIsDeepScreen(false);
    setActiveTab(tab);
  };

  const handleLanguageChange = (lang) => {
    setLanguage(lang);
    localStorage.setItem("lang", lang);
  };

  const renderPage = () => {
    switch (activeTab) {
      case "home":
        return <Home onNavigate={handleTabChange} />;
      case "learn":
        return <LearnPhonics onDeepScreen={setIsDeepScreen} />;
      case "games":
        return <Games onDeepScreen={setIsDeepScreen} />;
      case "album":
        return <Album />;
      default:
        return <LearnPhonics onDeepScreen={setIsDeepScreen} />;
    }
  };

  return (
    <div
      className="fixed inset-0 overflow-hidden"
      style={{
        background: "linear-gradient(160deg, #E8FFFE 0%, #FFF9E6 60%, #F5F0FF 100%)",
      }}
    >
      {/* Settings gear */}
      <ParentSettings language={language} onLanguageChange={handleLanguageChange} />

      {/* Page content */}
      <div
        className="absolute inset-0"
        style={{
          paddingTop: "env(safe-area-inset-top, 0px)",
          paddingBottom: isDeepScreen ? "0" : "calc(80px + env(safe-area-inset-bottom, 0px))",
          overflow: isDeepScreen ? "hidden" : "auto",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}
          >
            {renderPage()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Tab Bar */}
      {!isDeepScreen && (
        <TabBar
          activeTab={activeTab}
          onTabChange={handleTabChange}
          language={language}
          showCodyInBar={true}
        />
      )}
    </div>
  );
}
