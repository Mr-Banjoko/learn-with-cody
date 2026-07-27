/**
 * ShortELevels — Level map for the Short E campaign (24 levels)
 */
import { useState } from "react";
import CampaignLevelMap from "@/components/campaign/CampaignLevelMap";
import ShortELevel1 from "./ShortELevel1";
import ShortELevel2 from "./ShortELevel2";
import ShortELevel3 from "./ShortELevel3";
import ShortELevel4 from "./ShortELevel4";
import ShortELevel5 from "./ShortELevel5";
import ShortELevel6 from "./ShortELevel6";
import ShortELevel7 from "./ShortELevel7";
import ShortELevel8 from "./ShortELevel8";
import ShortELevel9 from "./ShortELevel9";
import ShortELevel10 from "./ShortELevel10";
import ShortELevel11 from "./ShortELevel11";
import ShortELevel12 from "./ShortELevel12";
import ShortELevel13 from "./ShortELevel13";
import ShortELevel14 from "./ShortELevel14";
import ShortELevel15 from "./ShortELevel15";
import ShortELevel16 from "./ShortELevel16";
import ShortELevel17 from "./ShortELevel17";
import ShortELevel18 from "./ShortELevel18";
import ShortELevel19 from "./ShortELevel19";
import ShortELevel20 from "./ShortELevel20";
import ShortELevel21 from "./ShortELevel21";
import ShortELevel22 from "./ShortELevel22";
import ShortELevel23 from "./ShortELevel23";
import ShortELevel24 from "./ShortELevel24";

const VOWEL_KEY = "short-e";
const TOTAL_LEVELS = 24;

const LEVEL_COMPONENTS = {
  1: ShortELevel1, 2: ShortELevel2, 3: ShortELevel3, 4: ShortELevel4,
  5: ShortELevel5, 6: ShortELevel6, 7: ShortELevel7, 8: ShortELevel8,
  9: ShortELevel9, 10: ShortELevel10, 11: ShortELevel11, 12: ShortELevel12,
  13: ShortELevel13, 14: ShortELevel14, 15: ShortELevel15, 16: ShortELevel16,
  17: ShortELevel17, 18: ShortELevel18, 19: ShortELevel19, 20: ShortELevel20,
  21: ShortELevel21, 22: ShortELevel22, 23: ShortELevel23, 24: ShortELevel24,
};

export default function ShortELevels({ onBack, lang = "en" }) {
  const [activeLevel, setActiveLevel] = useState(null);
  if (activeLevel) {
    const LevelComponent = LEVEL_COMPONENTS[activeLevel];
    return <LevelComponent onBack={() => setActiveLevel(null)} lang={lang} />;
  }
  return <CampaignLevelMap totalLevels={TOTAL_LEVELS} vowelKey={VOWEL_KEY} onBack={onBack} onSelectLevel={setActiveLevel} lang={lang} />;
}