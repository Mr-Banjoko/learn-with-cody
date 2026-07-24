const DARK_TEAL = [0.075, 0.498, 0.525, 1];
const AQUA = [0.208, 0.788, 0.761, 1];
const ORANGE = [0.957, 0.478, 0.165, 1];

function themedColor(color) {
  if (!Array.isArray(color) || color.length < 3) return color;
  const [r, g, b, alpha = 1] = color;
  if (r > 0.9 && g > 0.9 && b > 0.9) return color;
  const light = r * 0.21 + g * 0.72 + b * 0.07;
  const palette = light < 0.3 ? DARK_TEAL : r > g * 1.12 ? ORANGE : AQUA;
  return [palette[0], palette[1], palette[2], alpha];
}

function recolor(node) {
  if (!node || typeof node !== "object") return;
  if (node.c?.a === 0 && Array.isArray(node.c.k)) node.c.k = themedColor(node.c.k);
  const gradient = node.g?.k?.k;
  if (node.g?.p && Array.isArray(gradient)) {
    for (let i = 0; i < node.g.p; i++) {
      const start = i * 4 + 1;
      gradient.splice(start, 3, ...themedColor(gradient.slice(start, start + 3)).slice(0, 3));
    }
  }
  Object.values(node).forEach(recolor);
}

export function themeLottie(data) {
  const themed = JSON.parse(JSON.stringify(data));
  recolor(themed);
  return themed;
}

export function prepareWinnerLottie(data) {
  const cleaned = JSON.parse(JSON.stringify(data));
  cleaned.layers = cleaned.layers.filter((layer) => layer.nm !== "winner text Outlines");
  const unit = cleaned.assets.find((asset) => asset.id === "comp_0");
  if (unit) unit.layers = unit.layers.filter((layer) => /^(Stere_|Firecracker)/.test(layer.nm));
  return themeLottie(cleaned);
}