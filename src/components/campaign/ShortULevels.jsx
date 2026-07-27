/**
 * ShortULevels — Level map for the Short U campaign (20 levels)
 */
import { useState } from "react";
import CampaignLevelMap from "@/components/campaign/CampaignLevelMap";
import ShortULevel1 from "./ShortULevel1";
import ShortULevel2 from "./ShortULevel2";
import ShortULevel3 from "./ShortULevel3";
import ShortULevel4 from "./ShortULevel4";
import ShortULevel5 from "./ShortULevel5";
import ShortULevel6 from "./ShortULevel6";
import ShortULevel7 from "./ShortULevel7";
import ShortULevel8 from "./ShortULevel8";
import ShortULevel9 from "./ShortULevel9";
import ShortULevel10 from "./ShortULevel10";
import ShortULevel11 from "./ShortULevel11";
import ShortULevel12 from "./ShortULevel12";
import ShortULevel13 from "./ShortULevel13";
import ShortULevel14 from "./ShortULevel14";
import ShortULevel15 from "./ShortULevel15";
import ShortULevel16 from "./ShortULevel16";
import ShortULevel17 from "./ShortULevel17";
import ShortULevel18 from "./ShortULevel18";
import ShortULevel19 from "./ShortULevel19";
import ShortULevel20 from "./ShortULevel20";

const VOWEL_KEY = "short-u";
const TOTAL_LEVELS = 20;

const LEVEL_COMPONENTS = {
  1: ShortULevel1, 2: ShortULevel2, 3: ShortULevel3, 4: ShortULevel4,
  5: ShortULevel5, 6: ShortULevel6, 7: ShortULevel7, 8: ShortULevel8,
  9: ShortULevel9, 10: ShortULevel10, 11: ShortULevel11, 12: ShortULevel12,
  13: ShortULevel13, 14: ShortULevel14, 15: ShortULevel15, 16: ShortULevel16,
  17: ShortULevel17, 18: ShortULevel18, 19: ShortULevel19, 20: ShortULevel20,
};

export default function ShortULevels({ onBack, lang = "en" }) {
  const [activeLevel, setActiveLevel] = useState(null);
  if (activeLevel) {
    const LevelComponent = LEVEL_COMPONENTS[activeLevel];
    return <LevelComponent onBack={() => setActiveLevel(null)} lang={lang} />;
  }
  return <CampaignLevelMap totalLevels={TOTAL_LEVELS} vowelKey={VOWEL_KEY} onBack={onBack} onSelectLevel={setActiveLevel} lang={lang} />;
}