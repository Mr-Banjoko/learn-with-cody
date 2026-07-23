import BackArrow from "@/components/BackArrow";
import { GAME_FIX_TYPES } from "@/components/gamefix/gameFixCatalog";

export default function GameFixList({ onBack, onSelect }) {
  return (
    <div className="h-full overflow-y-auto pb-8" style={{ background: "linear-gradient(160deg, #E8FFFE 0%, #FFF9E6 60%, #F5F0FF 100%)" }}>
      <div className="flex items-center px-2 pt-2">
        <BackArrow onPress={onBack} />
        <div>
          <h1 className="text-2xl font-bold text-foreground">Game Fix</h1>
          <p className="text-sm text-muted-foreground">Campaign game type list</p>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-3 px-4 sm:grid-cols-2">
        {GAME_FIX_TYPES.map((game) => (
          <button
            key={game.id}
            onClick={() => onSelect(game)}
            className="flex items-center gap-4 rounded-3xl border bg-card p-4 text-left shadow-sm active:scale-[0.98]"
          >
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-secondary text-3xl">{game.emoji}</span>
            <span className="font-semibold text-card-foreground">{game.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}