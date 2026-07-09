/**
 * activityStreak — tracks which days the child was active (completed at least
 * one level / game round). Stored in localStorage as:
 *   { "2026-07": [1, 2, 9], ... }  (month key → array of active day numbers)
 */
const KEY = "activity_days";

function load() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "{}");
  } catch {
    return {};
  }
}

function save(data) {
  try {
    localStorage.setItem(KEY, JSON.stringify(data));
  } catch {}
}

function monthKey(year, monthIdx) {
  return `${year}-${String(monthIdx + 1).padStart(2, "0")}`;
}

/** Record today as an active day (idempotent). */
export function markActiveToday() {
  const now = new Date();
  const mk = monthKey(now.getFullYear(), now.getMonth());
  const data = load();
  const days = data[mk] || [];
  if (!days.includes(now.getDate())) {
    days.push(now.getDate());
    data[mk] = days;
    save(data);
  }
}

/** Set of active day numbers for a given month. */
export function getActiveDays(year, monthIdx) {
  return new Set(load()[monthKey(year, monthIdx)] || []);
}

function isActive(data, d) {
  const days = data[monthKey(d.getFullYear(), d.getMonth())];
  return !!days && days.includes(d.getDate());
}

/**
 * Current streak (consecutive active days ending today, or ending yesterday
 * if today hasn't been earned yet — Duolingo style).
 */
export function getCurrentStreak() {
  const data = load();
  const d = new Date();
  let streak = 0;
  if (!isActive(data, d)) d.setDate(d.getDate() - 1); // streak may still be alive from yesterday
  while (isActive(data, d)) {
    streak++;
    d.setDate(d.getDate() - 1);
  }
  return streak;
}