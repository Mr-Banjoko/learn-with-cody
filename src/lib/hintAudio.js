/**
 * Hint audio utilities for Campaign Mode.
 *
 * Maps game types to GitHub raw audio URLs.
 * All hint audio files are `hint.mp3` inside lang-specific subfolders.
 *
 * Confirmed folder names from GitHub main branch:
 *  - rearrange_the_picture_hint  → english subfolder has trailing space: "english "
 *  - letter_to_sound_hint        → english subfolder has trailing space: "english "
 *  - write_hint                  → folder name has trailing space: "write_hint "
 *  - word match                  → folder name has space: "word match"
 */

const GH = "https://cdn.jsdelivr.net/gh/Mr-Banjoko/learn-with-cody@main/letter_sound/levels";

// Game type constants (matches what LevelHeader receives from each level)
export const GAME_TYPES = {
  REARRANGE:        "rearrange",
  DRAG:             "drag",
  MISSING_SOUND:    "missing",       // inline missing sound (Levels 3/8)
  MISSING_SOUND_01: "missing01",     // CampaignMissingSound01Round
  CATCH:            "catch",
  DRAWLINE:         "drawline",
  WRITE:            "write",
  WRITE_V2:         "write_v2",
  CONNECTION:       "connection",
  IDENTIFYING:      "identifying",
  WORD_TO_AUDIO:    "word_to_audio",
  DICTATION:        "dictation",
  WORD_MATCH:       "word_match",
  PHONICS:          "phonics",       // no hint audio (instruction slides)
};

/**
 * Returns the hint audio URL for the given game type and language.
 * Returns null if no audio is defined (silently — button still shows).
 */
export function getHintAudioForGameType(gameType, lang) {
  const zh = lang === "zh";

  switch (gameType) {
    case GAME_TYPES.REARRANGE: {
      const folder = zh ? "chinese" : "english%20";
      return `${GH}/rearrange_the_picture_hint/${folder}/hint.mp3`;
    }
    case GAME_TYPES.DRAG: {
      const folder = zh ? "chinese" : "english";
      return `${GH}/letter_drag_hint/${folder}/hint%201.mp3`;
    }
    case GAME_TYPES.MISSING_SOUND:
    case GAME_TYPES.MISSING_SOUND_01:
    case "missing01": {
      const folder = zh ? "chinese" : "english";
      return `${GH}/missing_sound_hint/${folder}/hint.mp3`;
    }
    case GAME_TYPES.CATCH: {
      const folder = zh ? "chinese" : "english";
      return `${GH}/catch_the_letter_hint/${folder}/hint.mp3`;
    }
    case GAME_TYPES.DRAWLINE: {
      const folder = zh ? "chinese" : "english";
      return `${GH}/draw_a_line_hint/${folder}/hint.mp3`;
    }
    case GAME_TYPES.WRITE: {
      const folder = zh ? "chinese" : "english";
      return `${GH}/write_hint%20/${folder}/hint.mp3`;
    }
    case GAME_TYPES.WRITE_V2:
    case "writev2": {
      const folder = zh ? "chinese" : "english";
      return `${GH}/write_v2_hint/${folder}/hint.mp3`;
    }
    case GAME_TYPES.CONNECTION: {
      const folder = zh ? "chinese" : "english%20";
      return `${GH}/letter_to_sound_hint/${folder}/hint.mp3`;
    }
    case GAME_TYPES.IDENTIFYING: {
      const folder = zh ? "chinese" : "english";
      return `${GH}/identifying_hint/${folder}/hint.mp3`;
    }
    case GAME_TYPES.WORD_TO_AUDIO:
    case "word_to_audio": {
      const folder = zh ? "chinese" : "english";
      return `${GH}/word%20match/${folder}/hint.mp3`;
    }
    case GAME_TYPES.DICTATION: {
      const folder = zh ? "chinese" : "english";
      return `${GH}/dictation_hint/${folder}/hint.mp3`;
    }
    case GAME_TYPES.WORD_MATCH:
    case GAME_TYPES.PHONICS:
    default:
      return null; // no audio — button visible but silent
  }
}