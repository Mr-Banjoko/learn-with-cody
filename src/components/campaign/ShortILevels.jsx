/**
 * ShortILevels — Level map for the Short I campaign (31 levels)
 * Level 1 at top, level 31 at bottom. All levels visible; completed ones shown with stars.
 */
import { useState } from "react";
import CampaignLevelMap from "@/components/campaign/CampaignLevelMap";
import ShortILevel1 from "./ShortILevel1";
import ShortILevel2 from "./ShortILevel2";
import ShortILevel3 from "./ShortILevel3";
import ShortILevel4 from "./ShortILevel4";
import ShortILevel5 from "./ShortILevel5";
import ShortILevel6 from "./ShortILevel6";
import ShortILevel7 from "./ShortILevel7";
import ShortILevel8 from "./ShortILevel8";
import ShortILevel9 from "./ShortILevel9";
import ShortILevel10 from "./ShortILevel10";
import ShortILevel11 from "./ShortILevel11";
import ShortILevel12 from "./ShortILevel12";
import ShortILevel13 from "./ShortILevel13";
import ShortILevel14 from "./ShortILevel14";
import ShortILevel15 from "./ShortILevel15";
import ShortILevel16 from "./ShortILevel16";
import ShortILevel17 from "./ShortILevel17";
import ShortILevel18 from "./ShortILevel18";
import ShortILevel19 from "./ShortILevel19";
import ShortILevel20 from "./ShortILevel20";
import ShortILevel21 from "./ShortILevel21";
import ShortILevel22 from "./ShortILevel22";
import ShortILevel23 from "./ShortILevel23";
import ShortILevel24 from "./ShortILevel24";
import ShortILevel25 from "./ShortILevel25";
import ShortILevel26 from "./ShortILevel26";
import ShortILevel27 from "./ShortILevel27";
import ShortILevel28 from "./ShortILevel28";
import ShortILevel29 from "./ShortILevel29";
import ShortILevel30 from "./ShortILevel30";
import ShortILevel31 from "./ShortILevel31";
import ShortILevel32 from "./ShortILevel32";
import ShortILevel33 from "./ShortILevel33";
import ShortILevel34 from "./ShortILevel34";
import ShortILevel35 from "./ShortILevel35";
import ShortILevel36 from "./ShortILevel36";
import ShortILevel37 from "./ShortILevel37";
import ShortILevel38 from "./ShortILevel38";

const VOWEL_KEY = "short-i";
const TOTAL_LEVELS = 38;

const LEVEL_COMPONENTS = {
  1: ShortILevel1, 2: ShortILevel2, 3: ShortILevel3, 4: ShortILevel4,
  5: ShortILevel5, 6: ShortILevel6, 7: ShortILevel7, 8: ShortILevel8,
  9: ShortILevel9, 10: ShortILevel10, 11: ShortILevel11, 12: ShortILevel12,
  13: ShortILevel13, 14: ShortILevel14, 15: ShortILevel15, 16: ShortILevel16,
  17: ShortILevel17, 18: ShortILevel18, 19: ShortILevel19, 20: ShortILevel20,
  21: ShortILevel21, 22: ShortILevel22, 23: ShortILevel23, 24: ShortILevel24,
  25: ShortILevel25, 26: ShortILevel26, 27: ShortILevel27, 28: ShortILevel28,
  29: ShortILevel29, 30: ShortILevel30, 31: ShortILevel31,
  32: ShortILevel32, 33: ShortILevel33, 34: ShortILevel34, 35: ShortILevel35,
  36: ShortILevel36, 37: ShortILevel37, 38: ShortILevel38,
};

export default function ShortILevels({ onBack, lang = "en" }) {
  const [activeLevel, setActiveLevel] = useState(null);
  if (activeLevel) {
    const LevelComponent = LEVEL_COMPONENTS[activeLevel];
    return <LevelComponent onBack={() => setActiveLevel(null)} lang={lang} />;
  }
  return <CampaignLevelMap totalLevels={TOTAL_LEVELS} vowelKey={VOWEL_KEY} onBack={onBack} onSelectLevel={setActiveLevel} lang={lang} />;
}