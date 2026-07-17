/**
 * templateTheme — context carrying the active template world's letter palette.
 * Provided by TemplateIdeaLevel; null everywhere else (campaign keeps defaults).
 */
import { createContext, useContext } from "react";

export const TemplateThemeContext = createContext(null);

/** Returns { colors: string[], textColor: string } or null outside a template. */
export function useTemplateLetters() {
  return useContext(TemplateThemeContext);
}

const DEFAULT_RAINBOW = ["#FF6B6B", "#FFD93D", "#4ECDC4", "#9B59B6"];

/**
 * Builds the "rainbow" selection border gradient from the world's letter
 * palette (falls back to the classic rainbow outside template worlds).
 */
export function rainbowGradient(colors) {
  const c = colors && colors.length ? colors : DEFAULT_RAINBOW;
  return `linear-gradient(white, white) padding-box, linear-gradient(135deg, ${c.join(", ")}) border-box`;
}