/**
 * imageWarmup — preloads every game picture into the browser cache at app
 * startup so games render images instantly. Word photos load first
 * (highest priority), then puzzle slices, with limited concurrency.
 */
import { shortAWords } from "./shortAWords";
import { shortEWords } from "./shortEWords";
import { shortIWords } from "./shortIWords";
import { shortOWords } from "./shortOWords";
import { shortUWords } from "./shortUWords";
import { shortASlices } from "./shortASlices";
import { shortESlices } from "./shortESlices";
import { shortISlices } from "./shortISlices";
import { shortOSlices } from "./shortOSlices";
import { shortUSlices } from "./shortUSlices";

const IMG_RE = /\.(webp|png|jpe?g|gif)(\?.*)?$/i;

// Recursively collect every image URL string from any data structure
function collectImageUrls(value, out) {
  if (typeof value === "string") {
    if (IMG_RE.test(value)) out.add(value);
  } else if (Array.isArray(value)) {
    for (const v of value) collectImageUrls(v, out);
  } else if (value && typeof value === "object") {
    for (const v of Object.values(value)) collectImageUrls(v, out);
  }
}

function loadOne(url) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = () => resolve();
    img.src = url;
  });
}

// Load a list of URLs with limited parallelism
async function warmList(urls, concurrency = 12) {
  const queue = [...urls];
  const workers = Array.from({ length: concurrency }, async () => {
    while (queue.length > 0) {
      const url = queue.shift();
      if (url) await loadOne(url);
    }
  });
  await Promise.all(workers);
}

export function warmAllImages() {
  const wordUrls = new Set();
  collectImageUrls([shortAWords, shortEWords, shortIWords, shortOWords, shortUWords], wordUrls);

  const sliceUrls = new Set();
  collectImageUrls([shortASlices, shortESlices, shortISlices, shortOSlices, shortUSlices], sliceUrls);

  // Words first (used by most games), then slices — never block the UI
  warmList([...wordUrls]).then(() => warmList([...sliceUrls])).catch(() => {});
}