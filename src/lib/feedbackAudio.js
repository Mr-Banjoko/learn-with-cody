/**
 * feedbackAudio.js — Centralized feedback audio controller for Campaign Mode.
 *
 * Provides:
 *   - playCorrectFeedback(levelNum, roundIndex, onDone) → plays assigned audio, calls onDone when finished
 *   - playIncorrectFeedback() → always plays "Try again.mp3"
 *   - playLevelComplete() → plays level_completion_sound.mp3
 *
 * Audio hosted on GitHub main branch at letter_sound/feedback/
 */

const GH_FEEDBACK = "https://raw.githubusercontent.com/Mr-Banjoko/learn-with-cody/main/letter_sound/feedback";

// Encode filenames with spaces correctly
function furl(filename) {
  return `${GH_FEEDBACK}/${encodeURIComponent(filename)}`;
}

export const FEEDBACK_URLS = {
  Amazing:        furl("Amazing.mp3"),
  awesome:        furl("awesome.mp3"),
  brilliant:      furl("brilliant.mp3"),
  Cool:           furl("Cool.mp3"),
  "Fantastic job":furl("Fantastic job.mp3"),
  goodJob:        furl("goodJob.mp3"),
  Great:          furl("Great.mp3"),
  keepItUp:       furl("keepItUp.mp3"),
  Nice:           furl("Nice.mp3"),
  outstanding:    furl("outstanding.mp3"),
  Super:          furl("Super.mp3"),
  veryGood:       furl("veryGood.mp3"),
  tryAgain:       furl("Try again.mp3"),
  levelComplete:  furl("level_completion_sound.mp3"),
};

// Hardcoded per-level, per-round feedback sequence.
// Index 0 = Round 1, index 1 = Round 2, etc.
const LEVEL_SEQUENCE = {
  1:  ["Great", "awesome", "Nice", "brilliant", "Cool"],
  2:  ["goodJob", "Amazing", "Super", "outstanding", "keepItUp"],
  3:  ["veryGood", "Fantastic job", "Great", "awesome", "Nice"],
  4:  ["brilliant", "Cool", "goodJob", "Amazing", "Super"],
  5:  ["outstanding", "keepItUp", "veryGood", "Fantastic job", "Great"],
  6:  ["awesome", "Nice", "brilliant", "Cool", "goodJob"],
  7:  ["Amazing", "Super", "outstanding", "keepItUp", "veryGood"],
  8:  ["Fantastic job", "Great", "awesome", "Nice", "brilliant"],
  9:  ["Cool", "goodJob", "Amazing", "Super", "outstanding"],
  10: ["keepItUp", "veryGood", "Fantastic job", "Great", "awesome"],
  11: ["Nice", "brilliant", "Cool", "goodJob", "Amazing"],
  12: ["Super", "outstanding", "keepItUp", "veryGood", "Fantastic job"],
  13: ["Great", "Nice", "awesome", "brilliant", "Cool"],
  14: ["goodJob", "Super", "Amazing", "outstanding", "keepItUp"],
  15: ["veryGood", "Great", "Fantastic job", "awesome", "Nice"],
  16: ["brilliant", "goodJob", "Cool", "Amazing", "Super"],
  17: ["outstanding", "veryGood", "keepItUp", "Fantastic job", "Great"],
  18: ["awesome", "outstanding", "Nice", "brilliant", "Cool"],
  19: ["goodJob", "Amazing", "veryGood", "Super", "keepItUp"],
  20: ["veryGood", "Fantastic job", "Great", "awesome", "Nice"],
  21: ["brilliant", "Cool", "goodJob", "Amazing", "Super"],
  22: ["outstanding", "keepItUp", "veryGood", "Fantastic job", "Great"],
  23: ["awesome", "Nice", "brilliant", "Cool", "goodJob"],
  24: ["Amazing", "Super", "outstanding", "keepItUp", "veryGood"],
  25: ["Fantastic job", "Great", "awesome", "Nice", "brilliant"],
  26: ["Cool", "goodJob", "Amazing", "Super", "outstanding"],
  27: ["keepItUp", "veryGood", "Fantastic job", "Great", "awesome"],
  28: ["Nice", "brilliant", "Cool", "goodJob", "Amazing"],
  29: ["Super", "outstanding", "keepItUp", "veryGood", "Fantastic job"],
  30: ["Great", "awesome", "Nice", "brilliant", "Cool"],
  31: ["goodJob", "Amazing", "Super", "outstanding", "keepItUp"],
  32: ["veryGood", "Fantastic job", "Great", "awesome", "Nice"],
  33: ["brilliant", "Cool", "goodJob", "Amazing", "Super"],
  34: ["outstanding", "keepItUp", "veryGood", "Fantastic job", "Great"],
  35: ["awesome", "Nice", "brilliant", "Cool", "goodJob"],
  36: ["Amazing", "Super", "outstanding", "keepItUp", "veryGood"],
  37: ["Fantastic job", "Great", "awesome", "Nice", "brilliant"],
  38: ["Cool", "goodJob", "Amazing", "Super", "outstanding"],
  39: ["keepItUp", "veryGood", "Fantastic job", "Great", "awesome"],
  40: ["Nice", "brilliant", "Cool", "goodJob", "Amazing"],
};

// Single shared incorrect audio instance (restart if already playing)
let incorrectAudio = null;
let correctAudio = null;
let completionAudio = null;

/**
 * Play the assigned correct-answer feedback audio for the given level+round.
 * Calls onDone() immediately after the audio finishes (real completion event).
 * If no URL found, calls onDone() synchronously so game never gets stuck.
 *
 * @param {number} levelNum  — 1-based level number
 * @param {number} roundIndex — 0-based round index
 * @param {function} onDone — callback to fire after audio ends
 */
export function playCorrectFeedback(levelNum, roundIndex, onDone) {
  // Stop any in-flight correct audio
  if (correctAudio) {
    correctAudio.pause();
    correctAudio.onended = null;
    correctAudio.onerror = null;
    correctAudio = null;
  }

  const seq = LEVEL_SEQUENCE[levelNum];
  const key = seq ? seq[Math.min(roundIndex, seq.length - 1)] : null;
  const url = key ? FEEDBACK_URLS[key] : null;

  if (!url) {
    if (onDone) onDone();
    return;
  }

  const audio = new Audio(url);
  correctAudio = audio;

  const finish = () => {
    if (correctAudio === audio) correctAudio = null;
    if (onDone) onDone();
  };

  audio.onended = finish;
  audio.onerror = (err) => {
    console.warn("[feedbackAudio] correct audio load error:", url, err);
    if (correctAudio === audio) correctAudio = null;
    if (onDone) onDone();
  };

  audio.play().catch((err) => {
    console.warn("[feedbackAudio] correct audio play() rejected:", err);
    if (correctAudio === audio) correctAudio = null;
    if (onDone) onDone();
  });
}

/**
 * Play "Try again.mp3" for incorrect answers.
 * Restarts from beginning if already playing.
 */
export function playIncorrectFeedback() {
  if (incorrectAudio) {
    incorrectAudio.pause();
    incorrectAudio.currentTime = 0;
    incorrectAudio.onended = null;
    incorrectAudio.onerror = null;
    incorrectAudio = null;
  }

  const audio = new Audio(FEEDBACK_URLS.tryAgain);
  incorrectAudio = audio;

  audio.onended = () => { if (incorrectAudio === audio) incorrectAudio = null; };
  audio.onerror = (err) => {
    console.warn("[feedbackAudio] try-again audio error:", err);
    if (incorrectAudio === audio) incorrectAudio = null;
  };

  audio.play().catch((err) => {
    console.warn("[feedbackAudio] try-again play() rejected:", err);
    if (incorrectAudio === audio) incorrectAudio = null;
  });
}

/**
 * Play level completion sound.
 * Call this exactly when the trophy animation begins.
 */
export function playLevelCompleteFeedback() {
  if (completionAudio) {
    completionAudio.pause();
    completionAudio.onended = null;
    completionAudio.onerror = null;
    completionAudio = null;
  }

  const audio = new Audio(FEEDBACK_URLS.levelComplete);
  completionAudio = audio;

  audio.onended = () => { if (completionAudio === audio) completionAudio = null; };
  audio.onerror = (err) => {
    console.warn("[feedbackAudio] level-complete audio error:", err);
    if (completionAudio === audio) completionAudio = null;
  };

  audio.play().catch((err) => {
    console.warn("[feedbackAudio] level-complete play() rejected:", err);
    if (completionAudio === audio) completionAudio = null;
  });
}