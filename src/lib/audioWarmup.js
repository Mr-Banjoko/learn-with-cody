/**
 * audioWarmup — preloads every game audio file into the in-memory blob cache
 * at app startup so every speaker/picture tap plays instantly.
 * Warms word audio first (most tapped), then letter sounds and feedback,
 * in small sequential batches so it never floods the network.
 */
import { warmupAudio } from "./useAudio";
import { getLetterSoundUrl } from "./letterSounds";
import { shortAWords } from "./shortAWords";
import { shortEWords } from "./shortEWords";
import { shortIWords } from "./shortIWords";
import { shortOWords } from "./shortOWords";
import { shortUWords } from "./shortUWords";

const FEEDBACK_URLS = [
  "https://cdn.jsdelivr.net/gh/Mr-Banjoko/learn-with-cody@main/letter_sound/feedback/match-end.mp3",
];

export function warmAllAudio() {
  const wordUrls = [...shortAWords, ...shortEWords, ...shortIWords, ...shortOWords, ...shortUWords]
    .map((w) => w.audio)
    .filter(Boolean);
  const letterUrls = "abcdefghijklmnopqrstuvwxyz"
    .split("")
    .map((l) => getLetterSoundUrl(l))
    .filter(Boolean);

  const urls = [...new Set([...wordUrls, ...letterUrls, ...FEEDBACK_URLS])];

  (async () => {
    for (let i = 0; i < urls.length; i += 10) {
      await warmupAudio(urls.slice(i, i + 10));
    }
  })().catch(() => {});
}