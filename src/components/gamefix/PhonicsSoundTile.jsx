import { motion } from "framer-motion";

const TILE_CLASSES = ["sound-tile-pink", "sound-tile-blue", "sound-tile-yellow"];

export default function PhonicsSoundTile({ letter, index, active, onPress }) {
  return (
    <motion.button
      type="button"
      aria-label={`Play ${letter} sound`}
      className={`sound-tile ${TILE_CLASSES[index % TILE_CLASSES.length]} ${active ? "sound-tile-active" : ""}`}
      animate={active ? { y: [0, -12, 0], rotate: [0, -4, 4, 0] } : { y: 0 }}
      transition={active ? { duration: 0.55, repeat: Infinity } : { duration: 0.2 }}
      whileTap={{ scale: 0.9 }}
      onPointerDown={(event) => { event.preventDefault(); onPress(); }}
    >
      <span>{letter}</span>
    </motion.button>
  );
}