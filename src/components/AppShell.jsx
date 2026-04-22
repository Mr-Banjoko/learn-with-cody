import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import TabBar from "./TabBar";
import LanguageToggle from "./LanguageToggle";
import Home from "../pages/Home";
import LearnPhonics from "../pages/LearnPhonics";
import Games from "../pages/Games";
import CampaignHome from "./campaign/CampaignHome.jsx";
import ShortALevels from "./campaign/ShortALevels.jsx";
import Level1 from "./campaign/Level1.jsx";
import Level2 from "./campaign/Level2.jsx";
import Level3 from "./campaign/Level3.jsx";
import Level4 from "./campaign/Level4.jsx";
import Level5 from "./campaign/Level5.jsx";

// Screens that hide the tab bar and language toggle
const DEEP_HOME_SCREENS = new Set(["campaign", "campaign-short-a", "campaign-short-a-level-1", "campaign-short-a-level-2", "campaign-short-a-level-3", "campaign-short-a-level-4", "campaign-short-a-level-5"]);

export default function AppShell() {
  const [activeTab, setActiveTab] = useState("home");
  const [homeSubScreen, setHomeSubScreen] = useState(null); // null | "campaign" | "campaign-short-a"
  const [childDeepScreen, setChildDeepScreen] = useState(false);
  const [language, setLanguage] = useState(
    () => localStorage.getItem("lang") || "en"
  );

  const isCampaignFlow = activeTab === "home" && DEEP_HOME_SCREENS.has(homeSubScreen);
  const isDeepScreen = isCampaignFlow || childDeepScreen;

  // Key drives AnimatePresence transitions
  const pageKey = `${activeTab}:${homeSubScreen ?? "root"}`;

  const handleTabChange = (tab) => {
    setHomeSubScreen(null);
    setChildDeepScreen(false);
    setActiveTab(tab);
  };

  const handleLanguageChange = (lang) => {
    setLanguage(lang);
    localStorage.setItem("lang", lang);
  };

  const renderHomeScreen = () => {
    switch (homeSubScreen) {
      case "campaign-short-a-level-5":
        return (
          <Level5
            onBack={() => setHomeSubScreen("campaign-short-a")}
            lang={language}
          />
        );

      case "campaign-short-a-level-4":
        return (
          <Level4
            onBack={() => setHomeSubScreen("campaign-short-a")}
            lang={language}
          />
        );

      case "campaign-short-a-level-3":
        return (
          <Level3
            onBack={() => setHomeSubScreen("campaign-short-a")}
            lang={language}
          />
        );

      case "campaign-short-a-level-2":
        return (
          <Level2
            onBack={() => setHomeSubScreen("campaign-short-a")}
            lang={language}
          />
        );

      case "campaign-short-a-level-1":
        return (
          <Level1
            onBack={() => setHomeSubScreen("campaign-short-a")}
            lang={language}
          />
        );

      case "campaign-short-a":
        return (
          <ShortALevels
            onBack={() => setHomeSubScreen("campaign")}
            onSelectLevel={(lvl) => {
              if (lvl === 1) setHomeSubScreen("campaign-short-a-level-1");
              if (lvl === 2) setHomeSubScreen("campaign-short-a-level-2");
              if (lvl === 3) setHomeSubScreen("campaign-short-a-level-3");
              if (lvl === 4) setHomeSubScreen("campaign-short-a-level-4");
              if (lvl === 5) setHomeSubScreen("campaign-short-a-level-5");
            }}
            lang={language}
          />
        );

      case "campaign":
        return (
          <CampaignHome
            onBack={() => setHomeSubScreen(null)}
            onSelectVowel={(id) => {
              if (id === "short-a") setHomeSubScreen("campaign-short-a");
            }}
            lang={language}
          />
        );

      default:
        return (
          <Home
            onNavigate={(screen) => {
              setChildDeepScreen(false);
              setHomeSubScreen(screen);
            }}
            lang={language}
          />
        );
    }
  };

  const renderPage = () => {
    switch (activeTab) {
      case "home":
        return renderHomeScreen();

      case "learn":
        return <LearnPhonics onDeepScreen={setChildDeepScreen} lang={language} />;

      case "games":
        return <Games onDeepScreen={setChildDeepScreen} lang={language} />;

      default:
        return <LearnPhonics onDeepScreen={setChildDeepScreen} lang={language} />;
    }
  };

  return (
    <div
      className="fixed inset-0 overflow-hidden"
      style={{
        background: "linear-gradient(160deg, #E8FFFE 0%, #FFF9E6 60%, #F5F0FF 100%)",
      }}
    >
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

      <div
        className="absolute inset-0"
        style={{
          paddingTop: isDeepScreen
            ? "env(safe-area-inset-top, 0px)"
            : "calc(env(safe-area-inset-top, 0px) + 60px)",
          paddingBottom: isDeepScreen
            ? "0"
            : "calc(80px + env(safe-area-inset-bottom, 0px))",
          overflow: isDeepScreen ? "hidden" : "auto",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={pageKey}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.2 }}
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              minHeight: 0,
            }}
          >
            {renderPage()}
          </motion.div>
        </AnimatePresence>
      </div>

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