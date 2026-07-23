import BackArrow from "@/components/BackArrow";
import Level6Phonics from "@/components/campaign/Level6Phonics";
import Level1DragV2 from "@/components/campaign/Level1DragV2";
import CampaignMissingSound01Round from "@/components/campaign/CampaignMissingSound01Round";
import CampaignLetterCatchRound from "@/components/campaign/CampaignLetterCatchRound";
import CampaignConnectionRound from "@/components/campaign/CampaignConnectionRound";
import CampaignWordMatchRound from "@/components/campaign/CampaignWordMatchRound";
import CampaignWordToAudioRound from "@/components/campaign/CampaignWordToAudioRound";
import DictationCampaignRound from "@/components/campaign/DictationCampaignRound";
import WriteV2CampaignRound from "@/components/campaign/WriteV2CampaignRound";
import CampaignOneLetter3Sounds from "@/components/campaign/CampaignOneLetter3Sounds";
import FinalMixedChallengeRound from "@/components/campaign/FinalMixedChallengeRound";
import IdentifyingRound from "@/components/games/IdentifyingRound";
import PicSliceBoard from "@/components/games/PicSliceBoard";
import PicSliceBoardEasy from "@/components/games/PicSliceBoardEasy";
import DrawLineBoard from "@/components/games/drawline/DrawLineBoard";
import { shortAWords } from "@/lib/shortAWords";
import { buildWordData } from "@/lib/picSliceGameData";

const card = (word) => shortAWords.find((item) => item.word === word);
const choices = ["cat", "map", "bag", "hat"].map(card);
const drawCards = ["map", "can", "hat"].map((word, index) => ({ ...card(word), id: `fix-${word}`, targetLetter: word[2], positionType: "final", index }));
const drawRound = { topCards: drawCards, bottomLetters: drawCards.map((item, botIdx) => ({ letter: item.targetLetter, topCardId: item.id, botIdx })) };

export default function GameFixRunner({ game, onBack, lang = "en" }) {
  const done = onBack;
  const mistake = () => {};
  const props = { onComplete: done, onMistake: mistake, lang };
  let activity = null;

  if (game.id === "phonics") activity = <Level6Phonics card={card("cat")} onNext={done} lang={lang} />;
  if (game.id === "drag_v2") activity = <Level1DragV2 card={card("map")} {...props} />;
  if (game.id === "identifying") activity = <IdentifyingRound round={{ target: card("cat"), choices }} {...props} />;
  if (game.id === "missing01") activity = <CampaignMissingSound01Round card={card("pan")} forcedMissingPos={1} forcedDistractors={["e", "i", "o"]} {...props} />;
  if (game.id === "catch") activity = <CampaignLetterCatchRound word="cat" missingLetter="t" image={card("cat").image} audio={card("cat").audio} forcedDistractorLetters={["p", "n", "d"]} {...props} />;
  if (game.id === "connection") activity = <CampaignConnectionRound card={buildWordData("jam")} {...props} />;
  if (game.id === "rearrange_easy") activity = <PicSliceBoardEasy wordPair={[buildWordData("jar")]} onRoundComplete={done} onMistake={mistake} lang={lang} />;
  if (game.id === "rearrange_hard") activity = <PicSliceBoard wordPair={[buildWordData("cat"), buildWordData("map")]} onRoundComplete={done} onMistake={mistake} lang={lang} />;
  if (game.id === "drawline") activity = <DrawLineBoard round={drawRound} onRoundComplete={done} onMistake={mistake} lang={lang} />;
  if (game.id === "word_match") activity = <CampaignWordMatchRound card={card("cat")} overrideChoices={choices} {...props} />;
  if (game.id === "word_to_audio") activity = <CampaignWordToAudioRound card={card("cat")} overrideChoices={choices} {...props} />;
  if (game.id === "dictation") activity = <DictationCampaignRound card={card("hat")} {...props} />;
  if (game.id === "writev2") activity = <WriteV2CampaignRound card={card("map")} {...props} />;
  if (game.id === "one_letter_3_sounds") activity = <CampaignOneLetter3Sounds speakers={["a", "e", "i"]} targetLetter="i" onComplete={done} onMistake={mistake} />;
  if (game.id === "final_challenge") activity = <FinalMixedChallengeRound cards={choices} {...props} />;

  return <div className="flex h-full flex-col overflow-hidden" style={{ background: "linear-gradient(160deg, #E8FFFE 0%, #FFF9E6 60%, #F5F0FF 100%)" }}><div className="flex shrink-0 items-center px-2"><BackArrow onPress={onBack} /><h1 className="text-xl font-bold text-foreground">{game.label}</h1></div><div className="flex min-h-0 flex-1 flex-col overflow-hidden">{activity}</div></div>;
}