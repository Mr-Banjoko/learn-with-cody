/**
 * CVCChampionLevels — Level map for the CVC Champion campaign (88 levels).
 * Final world mixing all short-vowel CVC words. Design/colors mirror Short E.
 * Only implemented levels are tappable — others are visibly locked for now.
 */
import { useState } from "react";
import CampaignLevelMap from "@/components/campaign/CampaignLevelMap";
import CVCChampionLevel1 from "./CVCChampionLevel1";
import CVCChampionLevel2 from "./CVCChampionLevel2";
import CVCChampionLevel3 from "./CVCChampionLevel3";
import CVCChampionLevel4 from "./CVCChampionLevel4";
import CVCChampionLevel5 from "./CVCChampionLevel5";
import CVCChampionLevel6 from "./CVCChampionLevel6";
import CVCChampionLevel7 from "./CVCChampionLevel7";
import CVCChampionLevel8 from "./CVCChampionLevel8";
import CVCChampionLevel9 from "./CVCChampionLevel9";
import CVCChampionLevel10 from "./CVCChampionLevel10";
import CVCChampionLevel11 from "./CVCChampionLevel11";
import CVCChampionLevel12 from "./CVCChampionLevel12";
import CVCChampionLevel13 from "./CVCChampionLevel13";
import CVCChampionLevel14 from "./CVCChampionLevel14";
import CVCChampionLevel15 from "./CVCChampionLevel15";
import CVCChampionLevel16 from "./CVCChampionLevel16";
import CVCChampionLevel17 from "./CVCChampionLevel17";
import CVCChampionLevel18 from "./CVCChampionLevel18";
import CVCChampionLevel19 from "./CVCChampionLevel19";
import CVCChampionLevel20 from "./CVCChampionLevel20";
import CVCChampionLevel21 from "./CVCChampionLevel21";
import CVCChampionLevel22 from "./CVCChampionLevel22";
import CVCChampionLevel23 from "./CVCChampionLevel23";
import CVCChampionLevel24 from "./CVCChampionLevel24";
import CVCChampionLevel25 from "./CVCChampionLevel25";
import CVCChampionLevel26 from "./CVCChampionLevel26";
import CVCChampionLevel27 from "./CVCChampionLevel27";
import CVCChampionLevel28 from "./CVCChampionLevel28";
import CVCChampionLevel29 from "./CVCChampionLevel29";
import CVCChampionLevel30 from "./CVCChampionLevel30";
import CVCChampionLevel31 from "./CVCChampionLevel31";
import CVCChampionLevel32 from "./CVCChampionLevel32";
import CVCChampionLevel33 from "./CVCChampionLevel33";
import CVCChampionLevel34 from "./CVCChampionLevel34";
import CVCChampionLevel35 from "./CVCChampionLevel35";
import CVCChampionLevel36 from "./CVCChampionLevel36";
import CVCChampionLevel37 from "./CVCChampionLevel37";
import CVCChampionLevel38 from "./CVCChampionLevel38";
import CVCChampionLevel39 from "./CVCChampionLevel39";
import CVCChampionLevel40 from "./CVCChampionLevel40";
import CVCChampionLevel41 from "./CVCChampionLevel41";
import CVCChampionLevel42 from "./CVCChampionLevel42";
import CVCChampionLevel43 from "./CVCChampionLevel43";
import CVCChampionLevel44 from "./CVCChampionLevel44";
import CVCChampionLevel45 from "./CVCChampionLevel45";
import CVCChampionLevel46 from "./CVCChampionLevel46";
import CVCChampionLevel47 from "./CVCChampionLevel47";
import CVCChampionLevel48 from "./CVCChampionLevel48";
import CVCChampionLevel49 from "./CVCChampionLevel49";
import CVCChampionLevel50 from "./CVCChampionLevel50";
import CVCChampionLevel51 from "./CVCChampionLevel51";
import CVCChampionLevel52 from "./CVCChampionLevel52";
import CVCChampionLevel53 from "./CVCChampionLevel53";
import CVCChampionLevel54 from "./CVCChampionLevel54";
import CVCChampionLevel55 from "./CVCChampionLevel55";
import CVCChampionLevel56 from "./CVCChampionLevel56";
import CVCChampionLevel57 from "./CVCChampionLevel57";
import CVCChampionLevel58 from "./CVCChampionLevel58";
import CVCChampionLevel59 from "./CVCChampionLevel59";
import CVCChampionLevel60 from "./CVCChampionLevel60";
import CVCChampionLevel61 from "./CVCChampionLevel61";
import CVCChampionLevel62 from "./CVCChampionLevel62";
import CVCChampionLevel63 from "./CVCChampionLevel63";
import CVCChampionLevel64 from "./CVCChampionLevel64";
import CVCChampionLevel65 from "./CVCChampionLevel65";
import CVCChampionLevel66 from "./CVCChampionLevel66";
import CVCChampionLevel67 from "./CVCChampionLevel67";
import CVCChampionLevel68 from "./CVCChampionLevel68";
import CVCChampionLevel69 from "./CVCChampionLevel69";
import CVCChampionLevel70 from "./CVCChampionLevel70";
import CVCChampionLevel71 from "./CVCChampionLevel71";
import CVCChampionLevel72 from "./CVCChampionLevel72";
import CVCChampionLevel73 from "./CVCChampionLevel73";
import CVCChampionLevel74 from "./CVCChampionLevel74";
import CVCChampionLevel75 from "./CVCChampionLevel75";
import CVCChampionLevel76 from "./CVCChampionLevel76";
import CVCChampionLevel77 from "./CVCChampionLevel77";
import CVCChampionLevel78 from "./CVCChampionLevel78";
import CVCChampionLevel79 from "./CVCChampionLevel79";
import CVCChampionLevel80 from "./CVCChampionLevel80";
import CVCChampionLevel81 from "./CVCChampionLevel81";
import CVCChampionLevel82 from "./CVCChampionLevel82";
import CVCChampionLevel83 from "./CVCChampionLevel83";
import CVCChampionLevel84 from "./CVCChampionLevel84";
import CVCChampionLevel85 from "./CVCChampionLevel85";
import CVCChampionLevel86 from "./CVCChampionLevel86";
import CVCChampionLevel87 from "./CVCChampionLevel87";
import CVCChampionLevel88 from "./CVCChampionLevel88";

const VOWEL_KEY = "cvc-champion";
const TOTAL_LEVELS = 88;

const LEVEL_COMPONENTS = {
  1: CVCChampionLevel1,
  2: CVCChampionLevel2,
  3: CVCChampionLevel3,
  4: CVCChampionLevel4,
  5: CVCChampionLevel5,
  6: CVCChampionLevel6,
  7: CVCChampionLevel7,
  8: CVCChampionLevel8,
  9: CVCChampionLevel9,
  10: CVCChampionLevel10,
  11: CVCChampionLevel11,
  12: CVCChampionLevel12,
  13: CVCChampionLevel13,
  14: CVCChampionLevel14,
  15: CVCChampionLevel15,
  16: CVCChampionLevel16,
  17: CVCChampionLevel17,
  18: CVCChampionLevel18,
  19: CVCChampionLevel19,
  20: CVCChampionLevel20,
  21: CVCChampionLevel21,
  22: CVCChampionLevel22,
  23: CVCChampionLevel23,
  24: CVCChampionLevel24,
  25: CVCChampionLevel25,
  26: CVCChampionLevel26,
  27: CVCChampionLevel27,
  28: CVCChampionLevel28,
  29: CVCChampionLevel29,
  30: CVCChampionLevel30,
  31: CVCChampionLevel31,
  32: CVCChampionLevel32,
  33: CVCChampionLevel33,
  34: CVCChampionLevel34,
  35: CVCChampionLevel35,
  36: CVCChampionLevel36,
  37: CVCChampionLevel37,
  38: CVCChampionLevel38,
  39: CVCChampionLevel39,
  40: CVCChampionLevel40,
  41: CVCChampionLevel41,
  42: CVCChampionLevel42,
  43: CVCChampionLevel43,
  44: CVCChampionLevel44,
  45: CVCChampionLevel45,
  46: CVCChampionLevel46,
  47: CVCChampionLevel47,
  48: CVCChampionLevel48,
  49: CVCChampionLevel49,
  50: CVCChampionLevel50,
  51: CVCChampionLevel51,
  52: CVCChampionLevel52,
  53: CVCChampionLevel53,
  54: CVCChampionLevel54,
  55: CVCChampionLevel55,
  56: CVCChampionLevel56,
  57: CVCChampionLevel57,
  58: CVCChampionLevel58,
  59: CVCChampionLevel59,
  60: CVCChampionLevel60,
  61: CVCChampionLevel61,
  62: CVCChampionLevel62,
  63: CVCChampionLevel63,
  64: CVCChampionLevel64,
  65: CVCChampionLevel65,
  66: CVCChampionLevel66,
  67: CVCChampionLevel67,
  68: CVCChampionLevel68,
  69: CVCChampionLevel69,
  70: CVCChampionLevel70,
  71: CVCChampionLevel71,
  72: CVCChampionLevel72,
  73: CVCChampionLevel73,
  74: CVCChampionLevel74,
  75: CVCChampionLevel75,
  76: CVCChampionLevel76,
  77: CVCChampionLevel77,
  78: CVCChampionLevel78,
  79: CVCChampionLevel79,
  80: CVCChampionLevel80,
  81: CVCChampionLevel81,
  82: CVCChampionLevel82,
  83: CVCChampionLevel83,
  84: CVCChampionLevel84,
  85: CVCChampionLevel85,
  86: CVCChampionLevel86,
  87: CVCChampionLevel87,
  88: CVCChampionLevel88,
};

export default function CVCChampionLevels({ onBack, lang = "en" }) {
  const [activeLevel, setActiveLevel] = useState(null);
  if (activeLevel) {
    const LevelComponent = LEVEL_COMPONENTS[activeLevel];
    return <LevelComponent onBack={() => setActiveLevel(null)} lang={lang} />;
  }
  return <CampaignLevelMap totalLevels={TOTAL_LEVELS} vowelKey={VOWEL_KEY} onBack={onBack} onSelectLevel={setActiveLevel} lang={lang} />;
}