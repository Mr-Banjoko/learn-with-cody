function smoothPath(points) {
  return points.slice(1).reduce((path, point, index) => {
    const start = points[index];
    const before = points[index - 1] || start;
    const after = points[index + 2] || point;
    const control1 = { x: start.x + (point.x - before.x) / 6, y: start.y + (point.y - before.y) / 6 };
    const control2 = { x: point.x - (after.x - start.x) / 6, y: point.y - (after.y - start.y) / 6 };
    return `${path} C ${control1.x} ${control1.y}, ${control2.x} ${control2.y}, ${point.x} ${point.y}`;
  }, `M ${points[0].x} ${points[0].y}`);
}

export default function CandyTrailPath({ points }) {
  if (!points.length) return null;
  const d = smoothPath(points);

  return (
    <svg aria-hidden="true" viewBox={`0 0 1000 ${points.at(-1).y + 160}`} preserveAspectRatio="none" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", overflow: "visible" }}>
      <path d={d} fill="none" stroke="#F4A62A" strokeWidth="10" strokeLinecap="round" strokeDasharray="1 24" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}