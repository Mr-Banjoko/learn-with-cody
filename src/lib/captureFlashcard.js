/**
 * captureFlashcard — composites a clean flashcard image on a canvas.
 *
 * Produces a screenshot of the flashcard content area ONLY:
 *   - gradient background
 *   - decorative blobs
 *   - white card frame + photo
 *   - letter blocks row
 *
 * Deliberately EXCLUDES: header, back arrow, camera icon, save icon,
 * previous/next buttons, progress count.
 *
 * Works on iOS Safari / mobile because it never touches the DOM tree —
 * all rendering is done imperatively on an OffscreenCanvas (or regular
 * Canvas), so there are zero html2canvas / cross-origin restrictions.
 *
 * @param {object} opts
 * @param {string}   opts.word          – e.g. "cat"
 * @param {string}   opts.photoDataUrl  – user-taken photo data URL (or null)
 * @param {string}   opts.cardImageUrl  – original card image URL
 * @param {string[]} opts.letterColors  – array of per-letter background colours
 * @returns {Promise<string>}           – data URL (PNG)
 */

const LETTER_COLORS = ["#FFAFC5", "#A8D8EA", "#FFE57A", "#B5EAD7", "#FFDAC1"];
const FONT_FAMILY = "Fredoka, Arial Rounded MT Bold, Arial, sans-serif";

function waitForFont(timeout = 2000) {
  return new Promise((resolve) => {
    if (typeof document === "undefined") { resolve(); return; }
    if (document.fonts && document.fonts.ready) {
      Promise.race([
        document.fonts.ready,
        new Promise((r) => setTimeout(r, timeout)),
      ]).then(resolve);
    } else {
      setTimeout(resolve, 200);
    }
  });
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => {
      // If cross-origin fails, try without the flag
      const img2 = new Image();
      img2.onload = () => resolve(img2);
      img2.onerror = reject;
      img2.src = src;
    };
    img.src = src;
  });
}

/**
 * Draw a rounded rectangle path (no fill/stroke — caller decides).
 */
function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

export async function captureFlashcard({ word, photoDataUrl, cardImageUrl }) {
  await waitForFont();

  // ── Canvas dimensions ────────────────────────────────────────────────────
  // We target a square-ish card (like the actual flashcard area on screen).
  // 600px wide, enough for crisp rendering on retina without huge file sizes.
  const W = 600;
  const CARD_PADDING = 14 * 2;            // 14px card internal padding × scale
  const CARD_W = W - 48 * 2;             // card leaves 48px margin on each side
  const CARD_IMG_SIZE = CARD_W - CARD_PADDING; // inner image fits the card
  const CARD_FRAME_H = CARD_IMG_SIZE + CARD_PADDING + 14; // frame = img + top/bottom padding
  const CARD_Y = 60;                      // card top position
  const LETTER_BLOCK_SIZE = 72;
  const LETTER_GAP = 10;
  const PLAY_BTN_SIZE = 56;
  const LETTERS = word.split("");
  const N_LETTERS = LETTERS.length;
  // Total width of letter row: N blocks + gaps + play button + margin
  const LETTER_ROW_W =
    N_LETTERS * LETTER_BLOCK_SIZE +
    (N_LETTERS - 1) * LETTER_GAP +
    LETTER_GAP + 6 + PLAY_BTN_SIZE;
  const LETTER_ROW_X = (W - LETTER_ROW_W) / 2;
  const LETTER_ROW_Y = CARD_Y + CARD_FRAME_H + 40;
  const PLAY_BTN_Y = LETTER_ROW_Y;
  const PLAY_BTN_X = LETTER_ROW_X + N_LETTERS * (LETTER_BLOCK_SIZE + LETTER_GAP) + 6;

  const H = LETTER_ROW_Y + LETTER_BLOCK_SIZE + 60; // bottom padding

  // ── Create canvas ────────────────────────────────────────────────────────
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");

  // ── Background gradient ──────────────────────────────────────────────────
  const grad = ctx.createLinearGradient(0, 0, W * 0.7, H);
  grad.addColorStop(0, "#E8FFFE");
  grad.addColorStop(0.6, "#FFF9E6");
  grad.addColorStop(1, "#F5F0FF");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  // ── Decorative blobs ─────────────────────────────────────────────────────
  // Pink blob (top-right of card)
  ctx.save();
  ctx.translate(W - 48 + CARD_W - 10 + 10, CARD_Y - 20);
  ctx.rotate((8 * Math.PI) / 180);
  ctx.beginPath();
  roundRect(ctx, 0, 0, 160, 140, 40);
  ctx.fillStyle = "#FFCDD2";
  ctx.fill();
  ctx.restore();

  // Yellow circle (bottom-left of card)
  ctx.save();
  ctx.beginPath();
  ctx.arc(48 - 10, CARD_Y + CARD_FRAME_H + 20, 70, 0, Math.PI * 2);
  ctx.fillStyle = "#FFF59D";
  ctx.fill();
  ctx.restore();

  // ── White card frame ─────────────────────────────────────────────────────
  const CARD_X = (W - CARD_W) / 2;
  ctx.save();
  // Shadow
  ctx.shadowColor = "rgba(30,58,95,0.15)";
  ctx.shadowBlur = 48;
  ctx.shadowOffsetY = 12;
  roundRect(ctx, CARD_X, CARD_Y, CARD_W, CARD_FRAME_H, 28);
  ctx.fillStyle = "white";
  ctx.fill();
  ctx.restore();

  // ── Card image ───────────────────────────────────────────────────────────
  const imgSrc = photoDataUrl || cardImageUrl;
  try {
    const img = await loadImage(imgSrc);
    // Clip to rounded rect for the image
    const imgX = CARD_X + 14;
    const imgY = CARD_Y + 14;
    const imgSize = CARD_IMG_SIZE;
    ctx.save();
    roundRect(ctx, imgX, imgY, imgSize, imgSize, 18);
    ctx.clip();
    // Draw image centred/cropped (object-fit: cover)
    const scale = Math.max(imgSize / img.naturalWidth, imgSize / img.naturalHeight);
    const dw = img.naturalWidth * scale;
    const dh = img.naturalHeight * scale;
    ctx.drawImage(img, imgX + (imgSize - dw) / 2, imgY + (imgSize - dh) / 2, dw, dh);
    ctx.restore();
  } catch {
    // Fallback: grey placeholder
    ctx.save();
    roundRect(ctx, CARD_X + 14, CARD_Y + 14, CARD_IMG_SIZE, CARD_IMG_SIZE, 18);
    ctx.fillStyle = "#E0E0E0";
    ctx.fill();
    ctx.restore();
  }

  // ── Letter blocks ─────────────────────────────────────────────────────────
  LETTERS.forEach((letter, i) => {
    const bx = LETTER_ROW_X + i * (LETTER_BLOCK_SIZE + LETTER_GAP);
    const by = LETTER_ROW_Y;
    // Shadow
    ctx.save();
    ctx.shadowColor = "rgba(0,0,0,0.10)";
    ctx.shadowBlur = 12;
    ctx.shadowOffsetY = 4;
    roundRect(ctx, bx, by, LETTER_BLOCK_SIZE, LETTER_BLOCK_SIZE, 18);
    ctx.fillStyle = LETTER_COLORS[i % LETTER_COLORS.length];
    ctx.fill();
    ctx.restore();
    // Letter text
    ctx.save();
    ctx.font = `700 42px ${FONT_FAMILY}`;
    ctx.fillStyle = "#1E3A5F";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(letter, bx + LETTER_BLOCK_SIZE / 2, by + LETTER_BLOCK_SIZE / 2 + 2);
    ctx.restore();
  });

  // ── Play button ───────────────────────────────────────────────────────────
  // Shadow
  ctx.save();
  ctx.shadowColor = "rgba(255,193,7,0.45)";
  ctx.shadowBlur = 16;
  ctx.shadowOffsetY = 4;
  ctx.beginPath();
  ctx.arc(
    PLAY_BTN_X + PLAY_BTN_SIZE / 2,
    PLAY_BTN_Y + PLAY_BTN_SIZE / 2,
    PLAY_BTN_SIZE / 2,
    0,
    Math.PI * 2
  );
  ctx.fillStyle = "#FFD93D";
  ctx.fill();
  ctx.restore();

  // Border ring
  ctx.save();
  ctx.beginPath();
  ctx.arc(
    PLAY_BTN_X + PLAY_BTN_SIZE / 2,
    PLAY_BTN_Y + PLAY_BTN_SIZE / 2,
    PLAY_BTN_SIZE / 2,
    0,
    Math.PI * 2
  );
  ctx.strokeStyle = "#F4B942";
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.restore();

  // Play triangle
  ctx.save();
  ctx.translate(PLAY_BTN_X + PLAY_BTN_SIZE / 2, PLAY_BTN_Y + PLAY_BTN_SIZE / 2);
  ctx.fillStyle = "#1E3A5F";
  ctx.beginPath();
  ctx.moveTo(-7, -10);
  ctx.lineTo(10, 0);
  ctx.lineTo(-7, 10);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  return canvas.toDataURL("image/png");
}