import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import TabBar from "./TabBar";
import LanguageToggle from "./LanguageToggle";
import Home from "../pages/Home";
import CodyCheckIn from "./placement/CodyCheckIn";
import LearnPhonics from "../pages/LearnPhonics";
import Games from "../pages/Games";
import Album from "../pages/Album";
import CampaignHome from "./campaign/CampaignHome.jsx";
import ShortALevels from "./campaign/ShortALevels";

const CAMPAIGN_SCREENS = new Set(["campaign", "campaign-short-a"]);

export default function AppShell() {
  const [activeTab, setActiveTab] = useState("home");
  const [homeSubScreen, setHomeSubScreen] = useState(null);
  const [childDeepScreen, setChildDeepScreen] = useState(false);
  const [language, setLanguage] = useState(
    () => localStorage.getItem("lang") || "en"
  );

  const isCampaignFlow =
    activeTab === "home" && CAMPAIGN_SCREENS.has(homeSubScreen);

  // Deep screen is now derived for campaign flow, with an optional child override
  const isDeepScreen = isCampaignFlow || childDeepScreen;

  // Important: include homeSubScreen so Home -> Campaign becomes a real route change
  const pageKey = `${activeTab}:${homeSubScreen ?? "root"}`;

  const resetHomeState = () => {
    setHomeSubScreen(null);
    setChildDeepScreen(false);
  };

  const handleTabChange = (tab) => {
    resetHomeState();
    setActiveTab(tab);
  };

  const handleHomeNavigate = (screen) => {
    // Let route determine deep screen for campaign flow
    setChildDeepScreen(false);
    setHomeSubScreen(screen);
  };

  const handleLanguageChange = (lang) => {
    setLanguage(lang);
    localStorage.setItem("lang", lang);
  };

  const renderHomeScreen = () => {
    switch (homeSubScreen) {
      case "checkin":
        return (
          <CodyCheckIn
            onBack={() => {
              setChildDeepScreen(false);
              setHomeSubScreen(null);
            }}
            onDeepScreen={setChildDeepScreen}
            lang={language}
          />
        );

      case "campaign-short-a":
        return (
          <ShortALevels
            onBack={() => setHomeSubScreen("campaign")}
            onSelectLevel={(lvl) => {
              console.log("Selected level", lvl);
            }}
            lang={language}
          />
        );

      case "campaign":
        return (
          <CampaignHome
            onBack={() => {
              setHomeSubScreen(null);
              setChildDeepScreen(false);
            }}
            onSelectVowel={(id) => {
              if (id === "short-a") {
                setHomeSubScreen("campaign-short-a");
              }
            }}
            lang={language}
          />
        );

      default:
        return <Home onNavigate={handleHomeNavigate} lang={language} />;
    }
  };

  const renderPage = () => {
    switch (activeTab) {
      case "home":
        return renderHomeScreen();

      case "learn":
        return (
          <LearnPhonics
            onDeepScreen={setChildDeepScreen}
            lang={language}
          />
        );

      case "games":
        return (
          <Games
            onDeepScreen={setChildDeepScreen}
            lang={language}
          />
        );

      case "album":
        return <Album lang={language} />;

      default:
        return (
          <LearnPhonics
            onDeepScreen={setChildDeepScreen}
            lang={language}
          />
        );
    }
  };

  return (
    <div
      className="fixed inset-0 overflow-hidden"
      style={{
        background:
          "linear-gradient(160deg, #E8FFFE 0%, #FFF9E6 60%, #F5F0FF 100%)",
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
            <LanguageToggle
              language={language}
              onLanguageChange={handleLanguageChange}
            />
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
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
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