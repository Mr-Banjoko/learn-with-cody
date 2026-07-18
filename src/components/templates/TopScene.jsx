/**
 * TopScene — tone-on-tone decorative strip pinned to the TOP edge of a
 * template world (mirror of the bottom Horizon). Sets the sky/canopy scene
 * behind the floating header controls.
 */
export default function TopScene({ s }) {
  if (!s) return null;
  const c = s.color;
  const style = { position: "absolute", top: 0, left: 0, width: "100%", pointerEvents: "none", display: "block" };

  if (s.type === "ocean") {
    return (
      <svg style={style} height="110" viewBox="0 0 375 110" preserveAspectRatio="none">
        <circle cx="28" cy="26" r="7" fill="none" stroke={c} strokeWidth="2.5" opacity="0.8" />
        <circle cx="48" cy="54" r="4" fill="none" stroke={c} strokeWidth="2" opacity="0.6" />
        <circle cx="196" cy="18" r="5" fill="none" stroke={c} strokeWidth="2" opacity="0.7" />
        <circle cx="330" cy="30" r="8" fill="none" stroke={c} strokeWidth="2.5" opacity="0.8" />
        <circle cx="352" cy="62" r="4.5" fill="none" stroke={c} strokeWidth="2" opacity="0.6" />
        <circle cx="150" cy="48" r="3" fill={c} opacity="0.45" />
        <circle cx="262" cy="52" r="3.5" fill={c} opacity="0.45" />
      </svg>
    );
  }
  if (s.type === "candy") {
    return (
      <svg style={style} height="100" viewBox="0 0 375 100" preserveAspectRatio="none">
        <ellipse cx="46" cy="16" rx="42" ry="16" fill={c} opacity="0.85" />
        <ellipse cx="80" cy="24" rx="30" ry="12" fill={c} opacity="0.7" />
        <ellipse cx="330" cy="22" rx="48" ry="17" fill={c} opacity="0.85" />
        <ellipse cx="292" cy="30" rx="26" ry="10" fill={c} opacity="0.7" />
        <ellipse cx="192" cy="8" rx="34" ry="12" fill={c} opacity="0.6" />
      </svg>
    );
  }
  if (s.type === "sunshine") {
    return (
      <svg style={style} height="120" viewBox="0 0 375 120" preserveAspectRatio="none">
        <circle cx="330" cy="18" r="46" fill={c} opacity="0.9" />
        <circle cx="330" cy="18" r="62" fill={c} opacity="0.4" />
        <ellipse cx="60" cy="26" rx="40" ry="13" fill={c} opacity="0.8" />
        <ellipse cx="94" cy="34" rx="26" ry="9" fill={c} opacity="0.6" />
        <ellipse cx="200" cy="14" rx="30" ry="10" fill={c} opacity="0.55" />
      </svg>
    );
  }
  if (s.type === "jungle") {
    return (
      <svg style={style} height="110" viewBox="0 0 375 110" preserveAspectRatio="none">
        <path d="M0 0 Q 20 34 6 66 Q 24 52 30 26 L 34 0 Z" fill={c} opacity="0.9" />
        <path d="M56 0 Q 68 26 60 48 Q 74 36 76 14 L 78 0 Z" fill={c} opacity="0.75" />
        <path d="M375 0 L 340 0 Q 336 30 348 58 Q 342 34 356 20 Q 352 44 366 60 Q 362 30 375 12 Z" fill={c} opacity="0.9" />
        <path d="M300 0 Q 306 20 298 36 Q 312 26 314 8 L 315 0 Z" fill={c} opacity="0.7" />
        <path d="M180 0 Q 186 16 180 30 Q 192 22 194 6 L 195 0 Z" fill={c} opacity="0.55" />
      </svg>
    );
  }
  if (s.type === "space") {
    return (
      <svg style={style} height="110" viewBox="0 0 375 110" preserveAspectRatio="none">
        <circle cx="40" cy="26" r="2.5" fill="rgba(255,255,255,0.30)" />
        <circle cx="120" cy="14" r="2" fill="rgba(255,255,255,0.25)" />
        <circle cx="205" cy="34" r="2.5" fill="rgba(255,255,255,0.28)" />
        <circle cx="286" cy="12" r="2" fill="rgba(255,255,255,0.25)" />
        <circle cx="352" cy="40" r="2.5" fill="rgba(255,255,255,0.30)" />
        <circle cx="76" cy="58" r="1.5" fill="rgba(255,255,255,0.20)" />
        <circle cx="250" cy="60" r="1.5" fill="rgba(255,255,255,0.20)" />
        <g opacity="0.9">
          <circle cx="322" cy="70" r="13" fill={c} />
          <ellipse cx="322" cy="70" rx="22" ry="6" fill="none" stroke={c} strokeWidth="3" transform="rotate(-18 322 70)" />
        </g>
      </svg>
    );
  }
  if (s.type === "snow") {
    const flake = (x, y, r, o) => (
      <g key={`${x}-${y}`} stroke={c} strokeWidth="2" strokeLinecap="round" opacity={o}>
        <line x1={x - r} y1={y} x2={x + r} y2={y} />
        <line x1={x} y1={y - r} x2={x} y2={y + r} />
        <line x1={x - r * 0.7} y1={y - r * 0.7} x2={x + r * 0.7} y2={y + r * 0.7} />
        <line x1={x - r * 0.7} y1={y + r * 0.7} x2={x + r * 0.7} y2={y - r * 0.7} />
      </g>
    );
    return (
      <svg style={style} height="110" viewBox="0 0 375 110" preserveAspectRatio="none">
        {flake(36, 30, 7, 0.9)}
        {flake(150, 16, 5, 0.7)}
        {flake(255, 40, 6, 0.8)}
        {flake(340, 20, 7, 0.9)}
        <circle cx="100" cy="52" r="3" fill={c} opacity="0.6" />
        <circle cx="205" cy="60" r="2.5" fill={c} opacity="0.5" />
        <circle cx="310" cy="64" r="3" fill={c} opacity="0.6" />
      </svg>
    );
  }
  return null;
}