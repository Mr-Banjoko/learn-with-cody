import BackArrow from "@/components/BackArrow";
import HeartDisplay from "@/components/campaign/HeartDisplay";
import HintButton from "@/components/campaign/HintButton";

const HINT_TYPES = {
  drag_v2: "drag",
  rearrange_easy: "rearrange",
  rearrange_hard: "rearrange",
  writev2: "write_v2",
};

export default function GameFixHeader({ game, mistakes, onBack, lang }) {
  return (
    <div className="shrink-0 px-4 pb-1 pt-2">
      <div className="flex items-center">
        <BackArrow onPress={onBack} />
        <HintButton gameType={HINT_TYPES[game.id] || game.id} lang={lang} />
        <HeartDisplay mistakes={mistakes} size={46} />
      </div>
      <h1 className="ml-1 text-xl font-bold text-foreground">{game.label}</h1>
    </div>
  );
}