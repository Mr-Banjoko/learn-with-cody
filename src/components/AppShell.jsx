import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import TabBar from "./TabBar";
import LanguageToggle from "./LanguageToggle";
import Home from "../pages/Home";
import CodyCheckIn from "./placement/CodyCheckIn";
import LearnPhonics from "../pages/LearnPhonics";
import Games from "../pages/Games";
import Album from "../pages/Album";
import CampaignHome from "./campaign/CampaignHome";
import ShortALevels from "./campaign/ShortALevels";

export default function AppShell() {
  const [activeTab, setActiveTab] = useState("home");
  const [isDeepScreen, setIsDeepScreen] = useState(false);
  const [language, setLanguage] = useState(() => localStorage.getItem("lang") || "en");

  const [homeSubScreen, setHomeSubScreen] = useState(null);

  const handleTabChange = (tab) => {
    setIsDeepScreen(false);
    setHomeSubScreen(null);
    setActiveTab(tab);
  };

  const handleHomeNavigate = (screen) => {
    setHomeSubScreen(screen);
    if (screen === "campaign" || screen === "campaign-short-a") {
      setIsDeepScreen(true);
    }
  };

  const handleLanguageChange = (lang) => {
    setLanguage(lang);
    localStorage.setItem("lang", lang);
  };

  const renderPage = () => {
    switch (activeTab) {
      case "home":
        if (homeSubScreen === "checkin") {
          return (
            <CodyCheckIn
              onBack={() => setHomeSubScreen(null)}
              onDeepScreen={setIsDeepScreen}
              lang={language}
            />
          );
        }
        if (homeSubScreen === "campaign-short-a") {
          return (
            <ShortALevels
              onBack={() => setHomeSubScreen("campaign")}
              onSelectLevel={(lvl) => {
                // placeholder: level content not built yet
                console.log("Selected level", lvl);
              }}
              lang={language}
            />
          );
        }
        if (homeSubScreen === "campaign") {
          return (
            <CampaignHome
              onBack={() => { setHomeSubScreen(null); setIsDeepScreen(false); }}
              onSelectVowel={(id) => {
                if (id === "short-a") setHomeSubScreen("campaign-short-a");
              }}
              lang={language}
            />
          );
        }
        return <Home onNavigate={handleHomeNavigate} lang={language} />;
      case "learn":
        return <LearnPhonics onDeepScreen={setIsDeepScreen} lang={language} />;
      case "games":
        return <Games onDeepScreen={setIsDeepScreen} lang={language} />;
      case "album":
        return <Album lang={language} />;
      default:
        return <LearnPhonics onDeepScreen={setIsDeepScreen} lang={language} />;
    }
  };

  return (
    <div
      className="fixed inset-0 overflow-hidden"
      style={{
        background: "linear-gradient(160deg, #E8FFFE 0%, #FFF9E6 60%, #F5F0FF 100%)",
      }}
    >
      {/* Header bar with language toggle — only on top-level screens */}
      {!isDeepScreen && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            zIndex: 30,
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            padding: "calc(env(safe-area-inset-top, 8px) + 8px) 14px 8px",
            pointerEvents: "none",
          }}
        >
          <div style={{ pointerEvents: "auto" }}>
            <LanguageToggle language={language} onLanguageChange={handleLanguageChange} />
          </div>
        </div>
      )}

      {/* Page content */}
      <div
        className="absolute inset-0"
        style={{
          paddingTop: isDeepScreen
            ? "env(safe-area-inset-top, 0px)"
            : "calc(env(safe-area-inset-top, 0px) + 60px)",
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