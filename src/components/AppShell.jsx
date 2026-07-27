import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useBuildGuard, BUILD_ID } from "../lib/useBuildGuard";
import TabBar from "./TabBar";
import LanguageToggle from "./LanguageToggle";
import Home from "../pages/Home";
import LearnPhonics from "../pages/LearnPhonics";
import Games from "../pages/Games";
import CampaignHome from "./campaign/CampaignHome.jsx";
import ShortALevels from "./campaign/ShortALevels.jsx";
import ShortOLevels from "./campaign/ShortOLevels.jsx";
import ShortILevels from "./campaign/ShortILevels.jsx";
import ShortELevels from "./campaign/ShortELevels.jsx";
import ShortULevels from "./campaign/ShortULevels.jsx";
import CVCChampionLevels from "./campaign/CVCChampionLevels.jsx";
import ShortOLevel1 from "./campaign/ShortOLevel1.jsx";
import ShortOLevel2 from "./campaign/ShortOLevel2.jsx";
import ShortOLevel3 from "./campaign/ShortOLevel3.jsx";
import ShortOLevel4 from "./campaign/ShortOLevel4.jsx";
import ShortOLevel5 from "./campaign/ShortOLevel5.jsx";
import ShortOLevel6 from "./campaign/ShortOLevel6.jsx";
import ShortOLevel7 from "./campaign/ShortOLevel7.jsx";
import ShortOLevel8 from "./campaign/ShortOLevel8.jsx";
import ShortOLevel9 from "./campaign/ShortOLevel9.jsx";
import ShortOLevel10 from "./campaign/ShortOLevel10.jsx";
import ShortOLevel11 from "./campaign/ShortOLevel11.jsx";
import ShortOLevel12 from "./campaign/ShortOLevel12.jsx";
import ShortOLevel13 from "./campaign/ShortOLevel13.jsx";
import ShortOLevel14 from "./campaign/ShortOLevel14.jsx";
import ShortOLevel15 from "./campaign/ShortOLevel15.jsx";
import ShortOLevel16 from "./campaign/ShortOLevel16.jsx";
import ShortOLevel17 from "./campaign/ShortOLevel17.jsx";
import ShortOLevel18 from "./campaign/ShortOLevel18.jsx";
import ShortOLevel19 from "./campaign/ShortOLevel19.jsx";
import ShortOLevel20 from "./campaign/ShortOLevel20.jsx";
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
import Level21 from "./campaign/Level21.jsx";
import Level22 from "./campaign/Level22.jsx";
import Level23 from "./campaign/Level23.jsx";
import Level24 from "./campaign/Level24.jsx";
import Level25 from "./campaign/Level25.jsx";
import Level26 from "./campaign/Level26";
import Level27 from "./campaign/Level27";
import Level28 from "./campaign/Level28";
import Level29 from "./campaign/Level29";
import Level30 from "./campaign/Level30";
import Level31 from "./campaign/Level31";
import Level32 from "./campaign/Level32";
import Level33 from "./campaign/Level33";
import Level34 from "./campaign/Level34";
import Level35 from "./campaign/Level35";
import Level36 from "./campaign/Level36";
import Level37 from "./campaign/Level37";
import Level38 from "./campaign/Level38";
import Level39 from "./campaign/Level39";
import Level40 from "./campaign/Level40";
import Level41 from "./campaign/Level41";

// Screens that hide the tab bar and language toggle
const SHORT_I_DEEP = Array.from({ length: 38 }, (_, i) => `campaign-short-i-level-${i + 1}`);
const SHORT_E_DEEP = Array.from({ length: 24 }, (_, i) => `campaign-short-e-level-${i + 1}`);
const SHORT_U_DEEP = Array.from({ length: 20 }, (_, i) => `campaign-short-u-level-${i + 1}`);
const DEEP_HOME_SCREENS = new Set(["campaign", "campaign-cvc-champion", "campaign-short-i", ...SHORT_I_DEEP, "campaign-short-e", ...SHORT_E_DEEP, "campaign-short-u", ...SHORT_U_DEEP, "campaign-short-a", "campaign-short-a-level-1", "campaign-short-a-level-2", "campaign-short-a-level-3", "campaign-short-a-level-4", "campaign-short-a-level-5", "campaign-short-a-level-6", "campaign-short-a-level-7", "campaign-short-a-level-8", "campaign-short-a-level-9", "campaign-short-a-level-10", "campaign-short-a-level-11", "campaign-short-a-level-12", "campaign-short-a-level-13", "campaign-short-a-level-14", "campaign-short-a-level-15", "campaign-short-a-level-16", "campaign-short-a-level-17", "campaign-short-a-level-18", "campaign-short-a-level-19", "campaign-short-a-level-20", "campaign-short-a-level-21", "campaign-short-a-level-22", "campaign-short-a-level-23", "campaign-short-a-level-24", "campaign-short-a-level-25", "campaign-short-a-level-26", "campaign-short-a-level-27", "campaign-short-a-level-28", "campaign-short-a-level-29", "campaign-short-a-level-30", "campaign-short-a-level-31", "campaign-short-a-level-32", "campaign-short-a-level-33", "campaign-short-a-level-34", "campaign-short-a-level-35", "campaign-short-a-level-36", "campaign-short-a-level-37", "campaign-short-a-level-38", "campaign-short-a-level-39", "campaign-short-a-level-40", "campaign-short-a-level-41", "campaign-short-o", "campaign-short-o-level-1", "campaign-short-o-level-2", "campaign-short-o-level-3", "campaign-short-o-level-4", "campaign-short-o-level-5", "campaign-short-o-level-6", "campaign-short-o-level-7", "campaign-short-o-level-8", "campaign-short-o-level-9", "campaign-short-o-level-10", "campaign-short-o-level-11", "campaign-short-o-level-12", "campaign-short-o-level-13", "campaign-short-o-level-14", "campaign-short-o-level-15", "campaign-short-o-level-16", "campaign-short-o-level-17", "campaign-short-o-level-18", "campaign-short-o-level-19", "campaign-short-o-level-20"]);

export default function AppShell() {
  useBuildGuard();
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
      case "campaign-short-a-level-41":
        return <Level41 onBack={() => setHomeSubScreen("campaign-short-a")} lang={language} />;
      case "campaign-short-a-level-40":
        return <Level40 onBack={() => setHomeSubScreen("campaign-short-a")} lang={language} />;
      case "campaign-short-a-level-39":
        return <Level39 onBack={() => setHomeSubScreen("campaign-short-a")} lang={language} />;
      case "campaign-short-a-level-38":
        return <Level38 onBack={() => setHomeSubScreen("campaign-short-a")} lang={language} />;
      case "campaign-short-a-level-37":
        return <Level37 onBack={() => setHomeSubScreen("campaign-short-a")} lang={language} />;
      case "campaign-short-a-level-36":
        return <Level36 onBack={() => setHomeSubScreen("campaign-short-a")} lang={language} />;
      case "campaign-short-a-level-35":
        return <Level35 onBack={() => setHomeSubScreen("campaign-short-a")} lang={language} />;
      case "campaign-short-a-level-34":
        return <Level34 onBack={() => setHomeSubScreen("campaign-short-a")} lang={language} />;
      case "campaign-short-a-level-33":
        return <Level33 onBack={() => setHomeSubScreen("campaign-short-a")} lang={language} />;
      case "campaign-short-a-level-32":
        return <Level32 onBack={() => setHomeSubScreen("campaign-short-a")} lang={language} />;
      case "campaign-short-a-level-31":
        return <Level31 onBack={() => setHomeSubScreen("campaign-short-a")} lang={language} />;
      case "campaign-short-a-level-30":
        return <Level30 onBack={() => setHomeSubScreen("campaign-short-a")} lang={language} />;
      case "campaign-short-a-level-29":
        return <Level29 onBack={() => setHomeSubScreen("campaign-short-a")} lang={language} />;
      case "campaign-short-a-level-28":
        return <Level28 onBack={() => setHomeSubScreen("campaign-short-a")} lang={language} />;
      case "campaign-short-a-level-27":
        return <Level27 onBack={() => setHomeSubScreen("campaign-short-a")} lang={language} />;
      case "campaign-short-a-level-26":
        return <Level26 onBack={() => setHomeSubScreen("campaign-short-a")} lang={language} />;
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

      case "campaign-short-o-level-20": return <ShortOLevel20 onBack={() => setHomeSubScreen("campaign-short-o")} lang={language} />;
      case "campaign-short-o-level-19": return <ShortOLevel19 onBack={() => setHomeSubScreen("campaign-short-o")} lang={language} />;
      case "campaign-short-o-level-18": return <ShortOLevel18 onBack={() => setHomeSubScreen("campaign-short-o")} lang={language} />;
      case "campaign-short-o-level-17": return <ShortOLevel17 onBack={() => setHomeSubScreen("campaign-short-o")} lang={language} />;
      case "campaign-short-o-level-16": return <ShortOLevel16 onBack={() => setHomeSubScreen("campaign-short-o")} lang={language} />;
      case "campaign-short-o-level-15": return <ShortOLevel15 onBack={() => setHomeSubScreen("campaign-short-o")} lang={language} />;
      case "campaign-short-o-level-14": return <ShortOLevel14 onBack={() => setHomeSubScreen("campaign-short-o")} lang={language} />;
      case "campaign-short-o-level-13": return <ShortOLevel13 onBack={() => setHomeSubScreen("campaign-short-o")} lang={language} />;
      case "campaign-short-o-level-12": return <ShortOLevel12 onBack={() => setHomeSubScreen("campaign-short-o")} lang={language} />;
      case "campaign-short-o-level-11": return <ShortOLevel11 onBack={() => setHomeSubScreen("campaign-short-o")} lang={language} />;
      case "campaign-short-o-level-10": return <ShortOLevel10 onBack={() => setHomeSubScreen("campaign-short-o")} lang={language} />;
      case "campaign-short-o-level-9":  return <ShortOLevel9  onBack={() => setHomeSubScreen("campaign-short-o")} lang={language} />;
      case "campaign-short-o-level-8":  return <ShortOLevel8  onBack={() => setHomeSubScreen("campaign-short-o")} lang={language} />;
      case "campaign-short-o-level-7":  return <ShortOLevel7  onBack={() => setHomeSubScreen("campaign-short-o")} lang={language} />;
      case "campaign-short-o-level-6":  return <ShortOLevel6  onBack={() => setHomeSubScreen("campaign-short-o")} lang={language} />;
      case "campaign-short-o-level-5":  return <ShortOLevel5  onBack={() => setHomeSubScreen("campaign-short-o")} lang={language} />;
      case "campaign-short-o-level-4":  return <ShortOLevel4  onBack={() => setHomeSubScreen("campaign-short-o")} lang={language} />;
      case "campaign-short-o-level-3":  return <ShortOLevel3  onBack={() => setHomeSubScreen("campaign-short-o")} lang={language} />;
      case "campaign-short-o-level-2":  return <ShortOLevel2  onBack={() => setHomeSubScreen("campaign-short-o")} lang={language} />;
      case "campaign-short-o-level-1":  return <ShortOLevel1  onBack={() => setHomeSubScreen("campaign-short-o")} lang={language} />;

      case "campaign-cvc-champion":
        return (
          <CVCChampionLevels
            onBack={() => setHomeSubScreen("campaign")}
            lang={language}
          />
        );

      case "campaign-short-u":
        return (
          <ShortULevels
            onBack={() => setHomeSubScreen("campaign")}
            lang={language}
          />
        );

      case "campaign-short-e":
        return (
          <ShortELevels
            onBack={() => setHomeSubScreen("campaign")}
            lang={language}
          />
        );

      case "campaign-short-i":
        return (
          <ShortILevels
            onBack={() => setHomeSubScreen("campaign")}
            lang={language}
          />
        );

      case "campaign-short-o":
        return (
          <ShortOLevels
            onBack={() => setHomeSubScreen("campaign")}
            onSelectLevel={(lvl) => setHomeSubScreen(`campaign-short-o-level-${lvl}`)}
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
              if (lvl === 26) setHomeSubScreen("campaign-short-a-level-26");
              if (lvl === 27) setHomeSubScreen("campaign-short-a-level-27");
              if (lvl === 28) setHomeSubScreen("campaign-short-a-level-28");
              if (lvl === 29) setHomeSubScreen("campaign-short-a-level-29");
              if (lvl === 30) setHomeSubScreen("campaign-short-a-level-30");
              if (lvl === 31) setHomeSubScreen("campaign-short-a-level-31");
              if (lvl === 32) setHomeSubScreen("campaign-short-a-level-32");
              if (lvl === 33) setHomeSubScreen("campaign-short-a-level-33");
              if (lvl === 34) setHomeSubScreen("campaign-short-a-level-34");
              if (lvl === 35) setHomeSubScreen("campaign-short-a-level-35");
              if (lvl === 36) setHomeSubScreen("campaign-short-a-level-36");
              if (lvl === 37) setHomeSubScreen("campaign-short-a-level-37");
              if (lvl === 38) setHomeSubScreen("campaign-short-a-level-38");
              if (lvl === 39) setHomeSubScreen("campaign-short-a-level-39");
              if (lvl === 40) setHomeSubScreen("campaign-short-a-level-40");
              if (lvl === 41) setHomeSubScreen("campaign-short-a-level-41");
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
              if (id === "short-o") setHomeSubScreen("campaign-short-o");
              if (id === "short-i") setHomeSubScreen("campaign-short-i");
              if (id === "short-e") setHomeSubScreen("campaign-short-e");
              if (id === "short-u") setHomeSubScreen("campaign-short-u");
              if (id === "cvc-champion") setHomeSubScreen("campaign-cvc-champion");
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
      className="fixed top-0 left-0 right-0 overflow-hidden"
      data-build-id={BUILD_ID}
      style={{
        height: "100dvh",
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