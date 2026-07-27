import { Volume2 } from "lucide-react";
import { motion } from "framer-motion";
import PhonicsSoundTile from "@/components/gamefix/PhonicsSoundTile";

export default function PhonicsSoundBoard({ letters, activeIndex, onLetter, onPlayAll, lang }) {
  return (
    <div className="workshop-sound-board">
      <p>{lang === "zh" ? "点击每个字母的声音" : "Tap each sound"}</p>
      <div className="workshop-sound-row">
        {letters.map((letter, index) => <PhonicsSoundTile key={`${letter}-${index}`} letter={letter} index={index} active={activeIndex === index} onPress={() => onLetter(letter, index)} />)}
        <motion.button type="button" className="workshop-play-all" whileTap={{ scale: 0.88 }} onClick={onPlayAll} aria-label="Play the whole word">
          <Volume2 size={29} strokeWidth={3} />
        </motion.button>
      </div>
      <div className="sound-track">•••</div>
    </div>
  );
}