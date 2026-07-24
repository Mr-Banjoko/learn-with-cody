export default function CandyTrailPath({ points }) {
  if (!points.length) return null;
  const d = points.slice(1).reduce((path, point, index) => {
    const previous = points[index];
    const middleY = (previous.y + point.y) / 2;
    return `${path} C ${previous.x} ${middleY}, ${point.x} ${middleY}, ${point.x} ${point.y}`;
  }, `M ${points[0].x} ${points[0].y}`);

  return (
    <svg aria-hidden="true" viewBox={`0 0 1000 ${points.at(-1).y + 100}`} preserveAspectRatio="none" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", overflow: "visible" }}>
      <path d={d} fill="none" stroke="#FFD11A" strokeWidth="13" strokeLinecap="round" strokeDasharray="20 24" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}