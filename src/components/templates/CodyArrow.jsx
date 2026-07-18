/**
 * CodyArrow — renders the Cody-on-arrow mascot image with the background
 * "cut out" (removed) and the black arrow recolored to the world's color.
 * Processing happens once per (image, color) on a canvas and is cached.
 */
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const cache = new Map();

function processImage(img, hex) {
  const w = img.naturalWidth, h = img.naturalHeight;
  const c = document.createElement("canvas");
  c.width = w; c.height = h;
  const ctx = c.getContext("2d");
  ctx.drawImage(img, 0, 0);
  const imageData = ctx.getImageData(0, 0, w, h);
  const d = imageData.data;

  // 1) Cut out the background: flood-fill from the image borders, turning
  //    the connected near-white region transparent (white shoes etc. inside
  //    the subject are untouched).
  const isBg = (i) => d[i] > 225 && d[i + 1] > 225 && d[i + 2] > 225;
  const visited = new Uint8Array(w * h);
  const stack = [];
  for (let x = 0; x < w; x++) { stack.push(x, (h - 1) * w + x); }
  for (let y = 0; y < h; y++) { stack.push(y * w, y * w + w - 1); }
  while (stack.length) {
    const p = stack.pop();
    if (visited[p]) continue;
    visited[p] = 1;
    const i = p * 4;
    if (d[i + 3] !== 0) {
      if (!isBg(i)) continue;
      d[i + 3] = 0;
    }
    const x = p % w, y = (p / w) | 0;
    if (x > 0) stack.push(p - 1);
    if (x < w - 1) stack.push(p + 1);
    if (y > 0) stack.push(p - w);
    if (y < h - 1) stack.push(p + w);
  }

  // 2) Recolor the near-black arrow pixels to the world color
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  for (let i = 0; i < d.length; i += 4) {
    if (d[i + 3] > 0 && d[i] < 80 && d[i + 1] < 80 && d[i + 2] < 80) {
      d[i] = r; d[i + 1] = g; d[i + 2] = b;
    }
  }

  ctx.putImageData(imageData, 0, 0);
  return c.toDataURL("image/png");
}

export function useCodyArrow(src, color) {
  const key = `${src}|${color}`;
  const [url, setUrl] = useState(() => cache.get(key) || null);

  useEffect(() => {
    if (cache.has(key)) { setUrl(cache.get(key)); return; }
    let cancelled = false;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      let out = src;
      try { out = processImage(img, color); } catch { /* CORS fallback: raw image */ }
      cache.set(key, out);
      if (!cancelled) setUrl(out);
    };
    img.onerror = () => { if (!cancelled) setUrl(src); };
    img.src = src;
    return () => { cancelled = true; };
  }, [key]); // eslint-disable-line

  return url;
}

export default function CodyArrow({ src, color, style, ...motionProps }) {
  const url = useCodyArrow(src, color);
  return (
    <motion.img
      src={url || src}
      alt="Back"
      draggable={false}
      style={{ ...style, visibility: url ? "visible" : "hidden" }}
      {...motionProps}
    />
  );
}