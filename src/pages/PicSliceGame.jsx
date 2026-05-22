import RearrangePictures from "../components/games/RearrangePictures";

export default function PicSliceGame({ onBack, lang = "en" }) {
  return <RearrangePictures onBack={onBack} lang={lang} />;
}