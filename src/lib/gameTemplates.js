/**
 * gameTemplates — the 3 visual template ideas being tested for campaign mode.
 * Design principle: "static and tone-on-tone during play" —
 *  - decorations are few, large, tone-on-tone and pinned to corners/edges
 *  - each world gets a silhouette horizon strip along the bottom edge
 *  - the world identity lives in the frame (header, mascot arrow, horizon),
 *    the play area stays clean.
 */

export const TEMPLATES = {
  idea1: {
    id: "idea1",
    name: "Idea 1",
    tagline: "Deep Ocean",
    worldName: "The Deep Ocean",
    worldNameZh: "深海世界",
    arrowImg: "https://media.base44.com/images/public/69c4ec00726384fdef1ab181/3db53a9cc_generated_image.png",
    bg: "#33618D",
    headerBg: "rgba(255,255,255,0.10)",
    headerBorder: "rgba(255,255,255,0.18)",
    labelColor: "#FFFFFF",
    progressTrack: "rgba(255,255,255,0.18)",
    progressFill: "linear-gradient(90deg, #4ECDC4, #2BA89F)",
    accent: "#4ECDC4",
    horizon: { type: "ocean", color: "#2B5378" },
    decorations: [
      { shape: "blob", color: "#3E71A1", size: 320, top: "-10%", left: "62%", opacity: 0.45 },
      { shape: "blob", color: "#3E71A1", size: 260, top: "68%", left: "-28%", opacity: 0.4 },
    ],
  },
  idea2: {
    id: "idea2",
    name: "Idea 2",
    tagline: "Candy Pink",
    worldName: "Candy Land",
    worldNameZh: "糖果世界",
    arrowImg: "https://media.base44.com/images/public/69c4ec00726384fdef1ab181/a5ace7e16_generated_image.png",
    bg: "#FBE9F0",
    headerBg: "rgba(255,255,255,0.65)",
    headerBorder: "rgba(0,0,0,0.05)",
    labelColor: "#3D2B4F",
    progressTrack: "rgba(0,0,0,0.06)",
    progressFill: "linear-gradient(90deg, #F27BAA, #B79CE4)",
    accent: "#E8639B",
    horizon: { type: "candy", color: "#F2CBDA" },
    decorations: [
      { shape: "blob", color: "#F3D0DF", size: 300, top: "-12%", left: "-25%", opacity: 0.7 },
      { shape: "blob", color: "#EBDBF2", size: 260, top: "70%", left: "68%", opacity: 0.7 },
    ],
  },
  idea3: {
    id: "idea3",
    name: "Idea 3",
    tagline: "Sunny Cream",
    worldName: "Sunny Island",
    worldNameZh: "阳光岛",
    arrowImg: "https://media.base44.com/images/public/69c4ec00726384fdef1ab181/8365ecabe_generated_image.png",
    bg: "#FBF6E3",
    headerBg: "rgba(255,255,255,0.80)",
    headerBorder: "#FFD93D",
    labelColor: "#1E293B",
    progressTrack: "rgba(0,0,0,0.06)",
    progressFill: "linear-gradient(90deg, #2E9E8F, #F5A623)",
    accent: "#2E9E8F",
    horizon: { type: "sunshine", color: "#EFE4C2" },
    decorations: [
      { shape: "blob", color: "#F2EACA", size: 320, top: "-12%", left: "58%", opacity: 0.9 },
      { shape: "blob", color: "#EFE6C5", size: 280, top: "72%", left: "-24%", opacity: 0.9 },
    ],
  },
};