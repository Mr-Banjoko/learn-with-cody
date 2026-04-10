/**
 * Centralized Chinese (Simplified) translations for Learn With Cody.
 * Usage: import { t } from '../lib/i18n';
 *        t('key', lang)  →  Chinese string if lang==='zh', else null (caller uses English fallback)
 */

const zh = {
  // ── Tab Bar ──────────────────────────────────────────────────────────────
  home: "首页",
  learn: "学习",
  games: "游戏",
  album: "相册",

  // ── Home Page ────────────────────────────────────────────────────────────
  home_greeting: "你好！准备好学习了吗？🌟",
  home_subtitle: "你的拼读之旅从这里开始！",
  start_learning: "🚀 开始学习！",
  adventure_coming: "你的探险路线即将开放！",

  // ── Learn Phonics ────────────────────────────────────────────────────────
  learn_phonics: "学习拼读",
  pick_group_start: "选择一个单词组开始！",
  word_groups_label: "📂 单词组",
  tap_to_open: "点击打开",
  coming_soon: "即将推出",
  soon_badge: "即将",
  flashcard_count_a: "41 张卡片 · 点击打开",
  flashcard_count_e: "23 张卡片 · 点击打开",
  flashcard_count_i: "36 张卡片 · 点击打开",
  flashcard_count_o: "25 张卡片 · 点击打开",
  flashcard_count_u: "23 张卡片 · 点击打开",

  // ── Flashcard Screen ─────────────────────────────────────────────────────
  previous: "上一张",
  next: "下一张",

  // ── Games Page ───────────────────────────────────────────────────────────
  games_title: "游戏",
  games_subtitle: "用有趣的方式来练习！",
  play_now: "立即游玩！🎮",
  coming_soon_badge: "即将推出 ✨",
  more_games_soon: "更多游戏即将推出！",
  cody_working: "可迪正在努力为你带来更多有趣的活动！",

  // Game names & descriptions
  game_pic_slice_label: "重排图片",
  game_pic_slice_desc: "把图片碎片拖到正确的位置",
  game_word_match_label: "单词配对",
  game_word_match_desc: "把单词和图片配对",
  game_drag_letters_label: "拖拽字母",
  game_drag_letters_desc: "把字母拖到对应的格子里拼出单词",
  game_missing_sound_label: "缺失的音",
  game_missing_sound_desc: "找到缺失的字母来补全单词",
  game_letter_catch_label: "接字母",
  game_letter_catch_desc: "接住正确的字母来组成单词",
  game_sound_safari_label: "声音探险",
  game_sound_safari_desc: "找出以这个音开头的动物名字",

  // ── Album Page ───────────────────────────────────────────────────────────
  my_album: "我的相册 📸",
  saved_flashcards: "你保存的闪卡",
  no_flashcards: "还没有保存闪卡！",
  no_flashcards_hint: "去「学习拼读」拍照，然后把你的第一张闪卡保存在这里。",
  delete_btn: "删除",
  cancel_btn: "取消",
  yes_delete: "确认删除",
  of_label: "共",

  // ── Game Wrappers (vowel selector) ───────────────────────────────────────
  pick_word_group: "📂 选择单词组",
  tap_to_play: "点击游玩！",
  back_to_games: "返回游戏",

  // ── Rearrange Pictures ───────────────────────────────────────────────────
  rearrange_pictures: "重排图片",
  choose_difficulty: "🎮 选择难度",
  easy: "简单",
  difficult: "困难",
  one_word_round: "每关1个单词",
  two_words_round: "每关2个单词",
  good_job: "太棒了！",
  matched_all: "你拼对了所有图片！🌟",
  next_round: "下一关 →",
  drag_piece_hint: "👆 拖动图片 · 点击听声音",
  ordinal_1: "第1片",
  ordinal_2: "第2片",
  ordinal_3: "第3片",
  easy_label: "简单",
  difficult_label: "困难",

  // ── Letter Catch Game ────────────────────────────────────────────────────
  letter_catch: "接字母 🧩",
  pick_word_group_play: "选择一个单词组！",
  move_cody: "移动可迪！",
  amazing_catch: "🌟 接住了！",
  catch_the_letter: "接住字母",
  amazing: "太厉害了！",
  caught_all_letters: "你接住了所有字母！",
  round_of: "第",
  round_suffix: "关 / 共",
  round_num: "第",
  of_rounds: "关，共",

  // ── Drag The Letters Game ────────────────────────────────────────────────
  drag_letters_title: "拖拽字母 ✋",
  drag_to_spell: "拖动字母来拼写单词！",
  placed_of_prefix: "已放置",
  placed_of_suffix: "个字母，共",
  great_job_listen: "🎉 好极了！听一听……",

  // ── Missing Sound Game ───────────────────────────────────────────────────
  missing_sound_title: "缺失的音 ❓",
  hear_the_word: "听单词",
  submit_btn: "提交 ✓",
  try_again: "再试一次！🔄",
  great_feedback: "🎉 太好了！",

  // ── Word Match Game ──────────────────────────────────────────────────────
  word_match_title: "单词配对 🎯",
  hear_the_word_btn: "听单词",
  which_word_matches: "哪个单词和图片匹配？",
  no_images_available: "目前没有可用图片。",

  // ── Difficulty Selectors (ShortX) ────────────────────────────────────────
  difficulty_easy: "简单",
  difficulty_moderate: "中等",
  difficulty_difficult: "困难",
  speed_slow: "慢慢来 — 非常适合初学者！",
  speed_medium: "快一点 — 睁大眼睛看！",
  speed_fast: "超级快 — 你能全部接住吗？",
  choose_speed: "选择速度",
  pick_a_speed: "选择一个速度！",

  // ── FlashcardScreen ───────────────────────────────────────────────────────
  short_a_words: "短元音 a 单词",
  short_e_words: "短元音 e 单词",
  short_i_words: "短元音 i 单词",
  short_o_words: "短元音 o 单词",
  short_u_words: "短元音 u 单词",

  // ── ActivityShell ─────────────────────────────────────────────────────────
  activity_coming_soon: "🚧 活动内容即将推出！",
  cody_getting_ready: "可迪正在为你准备单词！",

  // ── WordMatch ─────────────────────────────────────────────────────────────
  hear_the_word_btn2: "听单词",
  which_matches: "哪个单词和图片匹配？",
  no_images: "目前没有可用图片。",

  // ── MissingSoundGame ──────────────────────────────────────────────────────
  hear_word_label: "听单词",

  // ── LetterCatchGame ───────────────────────────────────────────────────────
  round_label: "第",
  round_of_label: "关，共",
  rounds_suffix: "关",
  move_cody: "移动可迪！",
  amazing_catch: "🌟 接住了！",
  back_to_games: "返回游戏",
  amazing_title: "太厉害了！",
  caught_all: "你接住了所有字母！",
};

/**
 * Translate a key. Returns the Chinese string if lang==='zh', otherwise null.
 * Components should fall back to their English string when null is returned.
 */
export function t(key, lang) {
  if (lang !== "zh") return null;
  return zh[key] ?? null;
}

/** Convenience: returns either the zh translation or the English fallback string. */
export function tx(en, key, lang) {
  if (lang !== "zh") return en;
  return zh[key] ?? en;
}