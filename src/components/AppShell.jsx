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
import Level6 from "./campaign/Level6.jsx";
import Level7 from "./campaign/Level7.jsx";
import Level8 from "./campaign/Level8.jsx";
import Level9 from "./campaign/Level9.jsx";
import Level10 from "./campaign/Level10.jsx";
import Level11 from "./campaign/Level11";
import Level12 from "./campaign/Level12";
import Level13 from "./campaign/Level13";
import Level14 from "./campaign/Level14";
import Level15 from "./campaign/Level15";
import Level16 from "./campaign/Level16";
import Level17 from "./campaign/Level17";
import Level18 from "./campaign/Level18";
import Level19 from "./campaign/Level19";
import Level20 from "./campaign/Level20";
import Level21 from "./campaign/Level21";
import Level22 from "./campaign/Level22";
import Level23 from "./campaign/Level23";
import Level24 from "./campaign/Level24";
import Level25 from "./campaign/Level25";

// Screens that hide the tab bar and language toggle
const DEEP_HOME_SCREENS = new Set(["campaign", "campaign-short-a", "campaign-short-a-level-1", "campaign-short-a-level-2", "campaign-short-a-level-3", "campaign-short-a-level-4", "campaign-short-a-level-5", "campaign-short-a-level-6", "campaign-short-a-level-7", "campaign-short-a-level-8", "campaign-short-a-level-9", "campaign-short-a-level-10", "campaign-short-a-level-11", "campaign-short-a-level-12", "campaign-short-a-level-13", "campaign-short-a-level-14", "campaign-short-a-level-15", "campaign-short-a-level-16", "campaign-short-a-level-17", "campaign-short-a-level-18", "campaign-short-a-level-19", "campaign-short-a-level-20", "campaign-short-a-level-21", "campaign-short-a-level-22", "campaign-short-a-level-23", "campaign-short-a-level-24", "campaign-short-a-level-25"]);

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
      case "campaign-short-a-level-25":
        return (
          <Level25
            onBack={() => setHomeSubScreen("campaign-short-a")}
            lang={language}
          />
        );

      case "campaign-short-a-level-24":
        return (
          <Level24
            onBack={() => setHomeSubScreen("campaign-short-a")}
            lang={language}
          />
        );

      case "campaign-short-a-level-23":
        return (
          <Level23
            onBack={() => setHomeSubScreen("campaign-short-a")}
            lang={language}
          />
        );

      case "campaign-short-a-level-22":
        return (
          <Level22
            onBack={() => setHomeSubScreen("campaign-short-a")}
            lang={language}
          />
        );

      case "campaign-short-a-level-21":
        return (
          <Level21
            onBack={() => setHomeSubScreen("campaign-short-a")}
            lang={language}
          />
        );

      case "campaign-short-a-level-20":
        return (
          <Level20
            onBack={() => setHomeSubScreen("campaign-short-a")}
            lang={language}
          />
        );

      case "campaign-short-a-level-19":
        return (
          <Level19
            onBack={() => setHomeSubScreen("campaign-short-a")}
            lang={language}
          />
        );

      case "campaign-short-a-level-18":
        return (
          <Level18
            onBack={() => setHomeSubScreen("campaign-short-a")}
            lang={language}
          />
        );

      case "campaign-short-a-level-17":
        return (
          <Level17
            onBack={() => setHomeSubScreen("campaign-short-a")}
            lang={language}
          />
        );

      case "campaign-short-a-level-16":
        return (
          <Level16
            onBack={() => setHomeSubScreen("campaign-short-a")}
            lang={language}
          />
        );

      case "campaign-short-a-level-15":
        return (
          <Level15
            onBack={() => setHomeSubScreen("campaign-short-a")}
            lang={language}
          />
        );

      case "campaign-short-a-level-14":
        return (
          <Level14
            onBack={() => setHomeSubScreen("campaign-short-a")}
            lang={language}
          />
        );

      case "campaign-short-a-level-13":
        return (
          <Level13
            onBack={() => setHomeSubScreen("campaign-short-a")}
            lang={language}
          />
        );

      case "campaign-short-a-level-12":
        return (
          <Level12
            onBack={() => setHomeSubScreen("campaign-short-a")}
            lang={language}
          />
        );

      case "campaign-short-a-level-11":
        return (
          <Level11
            onBack={() => setHomeSubScreen("campaign-short-a")}
            lang={language}
          />
        );

      case "campaign-short-a-level-10":
        return (
          <Level10
            onBack={() => setHomeSubScreen("campaign-short-a")}
            lang={language}
          />
        );

      case "campaign-short-a-level-9":
        return (
          <Level9
            onBack={() => setHomeSubScreen("campaign-short-a")}
            lang={language}
          />
        );

      case "campaign-short-a-level-8":
        return (
          <Level8
            onBack={() => setHomeSubScreen("campaign-short-a")}
            lang={language}
          />
        );

      case "campaign-short-a-level-7":
        return (
          <Level7
            onBack={() => setHomeSubScreen("campaign-short-a")}
            lang={language}
          />
        );

      case "campaign-short-a-level-6":
        return (
          <Level6
            onBack={() => setHomeSubScreen("campaign-short-a")}
            lang={language}
          />
        );

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
              if (lvl === 6) setHomeSubScreen("campaign-short-a-level-6");
              if (lvl === 7) setHomeSubScreen("campaign-short-a-level-7");
              if (lvl === 8) setHomeSubScreen("campaign-short-a-level-8");
              if (lvl === 9) setHomeSubScreen("campaign-short-a-level-9");
              if (lvl === 10) setHomeSubScreen("campaign-short-a-level-10");
              if (lvl === 11) setHomeSubScreen("campaign-short-a-level-11");
              if (lvl === 12) setHomeSubScreen("campaign-short-a-level-12");
              if (lvl === 13) setHomeSubScreen("campaign-short-a-level-13");
              if (lvl === 14) setHomeSubScreen("campaign-short-a-level-14");
              if (lvl === 15) setHomeSubScreen("campaign-short-a-level-15");
              if (lvl === 16) setHomeSubScreen("campaign-short-a-level-16");
              if (lvl === 17) setHomeSubScreen("campaign-short-a-level-17");
              if (lvl === 18) setHomeSubScreen("campaign-short-a-level-18");
              if (lvl === 19) setHomeSubScreen("campaign-short-a-level-19");
              if (lvl === 20) setHomeSubScreen("campaign-short-a-level-20");
              if (lvl === 21) setHomeSubScreen("campaign-short-a-level-21");
              if (lvl === 22) setHomeSubScreen("campaign-short-a-level-22");
              if (lvl === 23) setHomeSubScreen("campaign-short-a-level-23");
              if (lvl === 24) setHomeSubScreen("campaign-short-a-level-24");
              if (lvl === 25) setHomeSubScreen("campaign-short-a-level-25");
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