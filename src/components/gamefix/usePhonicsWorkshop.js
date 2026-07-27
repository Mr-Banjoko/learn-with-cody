import { useCallback, useEffect, useRef, useState } from "react";
import { getLetterGain, getLetterSoundUrl } from "@/lib/letterSounds";
import { playAudio, playAudioSequence, preloadAudio, warmupAudio } from "@/lib/useAudio";
import { useUserPhoto } from "@/lib/useUserPhoto";
import { saveFlashcardToVault } from "@/lib/userFlashcardVault";

export default function usePhonicsWorkshop(card) {
  const { photoUrl, savePhoto, clearPhoto } = useUserPhoto(card.word);
  const [activeIndex, setActiveIndex] = useState(null);
  const sequenceRef = useRef(null);
  const timerRef = useRef(null);
  const fileInputRef = useRef(null);
  const cancel = useCallback(() => {
    sequenceRef.current?.(); sequenceRef.current = null;
    clearTimeout(timerRef.current); timerRef.current = null;
  }, []);

  useEffect(() => {
    const image = new Image(); image.src = card.image;
    if (card.audio) preloadAudio([card.audio]);
    warmupAudio([...new Set(card.word)].map(getLetterSoundUrl).filter(Boolean));
    return cancel;
  }, [card, cancel]);

  const playLetter = useCallback((letter, index) => {
    cancel();
    const url = getLetterSoundUrl(letter); if (!url) return;
    setActiveIndex(index); playAudio(url, getLetterGain(letter));
    timerRef.current = setTimeout(() => setActiveIndex(null), 900);
  }, [cancel]);

  const playSequence = useCallback(() => {
    cancel(); setActiveIndex(null);
    const steps = card.word.split("").map((letter, index) => ({ url: getLetterSoundUrl(letter), gain: getLetterGain(letter), onStart: () => setActiveIndex(index) })).filter((step) => step.url);
    if (card.audio) steps.push({ url: card.audio, onStart: () => setActiveIndex(null) });
    sequenceRef.current = playAudioSequence(steps, () => { setActiveIndex(null); sequenceRef.current = null; });
  }, [card, cancel]);

  const handleFile = (event) => {
    const file = event.target.files[0]; if (!file) return;
    const reader = new FileReader(); reader.onload = ({ target }) => {
      savePhoto(target.result);
      saveFlashcardToVault(card.word, target.result);
    }; reader.readAsDataURL(file);
  };

  return { letters: card.word.split(""), image: photoUrl || card.image, hasPhoto: Boolean(photoUrl), activeIndex, fileInputRef, playLetter, playSequence, playWord: () => card.audio && playAudio(card.audio), openCamera: () => fileInputRef.current?.click(), handleFile, clearPhoto };
}