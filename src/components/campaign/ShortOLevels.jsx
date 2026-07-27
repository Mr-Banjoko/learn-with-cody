import CampaignLevelMap from "@/components/campaign/CampaignLevelMap";

export default function ShortOLevels({ onBack, onSelectLevel, lang = "en" }) {
  return <CampaignLevelMap totalLevels={20} vowelKey="short-o" onBack={onBack} onSelectLevel={onSelectLevel} lang={lang} />;
}