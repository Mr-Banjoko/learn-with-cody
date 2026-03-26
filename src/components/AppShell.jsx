import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import TabBar from "./TabBar";
import ParentSettings from "./ParentSettings";
import Home from "../pages/Home";
import LearnPhonics from "../pages/LearnPhonics";
import Games from "../pages/Games";

export default function AppShell() {
  const [activeTab, setActiveTab] = useState("learn");
  const [language, setLanguage] = useState(() => localStorage.getItem("lang") || "en");

  const handleLanguageChange = (lang) => {
    setLanguage(lang);
    localStorage.setItem("lang", lang);
  };

  const renderPage = () => {
    switch (activeTab) {
      case "home":
        return <Home onNavigate={setActiveTab} />;
      case "learn":
        return <LearnPhonics />;
      case "games":
        return <Games />;
      default:
        return <LearnPhonics />;
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
      <div className="absolute inset-0 overflow-y-auto" style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="min-h-full"
          >
            {renderPage()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Tab Bar */}
      <TabBar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        language={language}
        showCodyInBar={true}
      />
    </div>
  );
}