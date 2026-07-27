import PhonicsPictureCard from "@/components/gamefix/PhonicsPictureCard";
import PhonicsSoundBoard from "@/components/gamefix/PhonicsSoundBoard";
import usePhonicsWorkshop from "@/components/gamefix/usePhonicsWorkshop";
import "@/components/gamefix/phonicsWorkshop.css";

export default function GameFixPhonics({ card, onNext, lang = "en" }) {
  const activity = usePhonicsWorkshop(card);
  return (
    <div className="phonics-workshop">
      <main className="workshop-stage">
        <div className="workshop-activity">
          <PhonicsPictureCard image={activity.image} word={card.word} hasPhoto={activity.hasPhoto} onPlay={activity.playWord} onCamera={activity.openCamera} onReset={activity.clearPhoto} />
          <PhonicsSoundBoard letters={activity.letters} activeIndex={activity.activeIndex} onLetter={activity.playLetter} onPlayAll={activity.playSequence} lang={lang} />
        </div>
        <button type="button" className="workshop-next" onClick={onNext}>{lang === "zh" ? "完成 →" : "All done →"}</button>
      </main>
      <input ref={activity.fileInputRef} type="file" accept="image/*" capture="environment" hidden onChange={activity.handleFile} />
    </div>
  );
}