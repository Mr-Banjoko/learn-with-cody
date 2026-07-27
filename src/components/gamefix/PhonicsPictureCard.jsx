import { Camera, RotateCcw, Volume2 } from "lucide-react";

export default function PhonicsPictureCard({ image, word, hasPhoto, onPlay, onCamera, onReset }) {
  return (
    <div className="workshop-easel">
      <div className="workshop-easel-label">Sound picture</div>
      <button type="button" className="workshop-picture" onPointerDown={(event) => { event.preventDefault(); onPlay(); }} aria-label={`Hear ${word}`}>
        <img src={image} alt={word} />
        <span className="picture-sound"><Volume2 size={20} strokeWidth={3} /></span>
      </button>
      <div className="workshop-photo-tools">
        {hasPhoto && <button type="button" onClick={onReset} aria-label="Use original picture"><RotateCcw size={20} strokeWidth={3} /></button>}
        <button type="button" onClick={onCamera} aria-label="Take a picture"><Camera size={21} strokeWidth={3} /></button>
      </div>
      <div className="easel-leg easel-leg-left" />
      <div className="easel-leg easel-leg-right" />
    </div>
  );
}