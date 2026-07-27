import PhonicsPictureCard from "@/components/gamefix/PhonicsPictureCard";
import PhonicsSoundBoard from "@/components/gamefix/PhonicsSoundBoard";
import usePhonicsWorkshop from "@/components/gamefix/usePhonicsWorkshop";
import "@/components/gamefix/phonicsWorkshop.css";

const CODY_IMAGE = "https://media.base44.com/images/public/69c4ec00726384fdef1ab181/6b8f13599_cody.png";

export default function GameFixPhonics({ card, onNext, lang = "en" }) {
  const activity = usePhonicsWorkshop(card);
  return (
    <div className="phonics-workshop">
      <div className="workshop-window"><span>☁</span><span>☀</span></div>
      <div className="workshop-shelf"><span>ABC</span><span>♫</span><span>★</span></div>
      <main className="workshop-stage">
        <div className="workshop-guide">
          <img src={CODY_IMAGE} alt="Cody" />
          <div className="workshop-speech">{lang === "zh" ? "让我们把声音组合起来！" : "Let’s build the word sounds!"}</div>
        </div>
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