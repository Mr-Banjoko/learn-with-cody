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