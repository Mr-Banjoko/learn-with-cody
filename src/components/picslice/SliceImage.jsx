/**
 * Renders one vertical third of an image.
 * sliceIndex: 0 = left, 1 = middle, 2 = right
 * Fills 100% of its parent container.
 */
export default function SliceImage({ src, sliceIndex, borderRadius = 14 }) {
  return (
    <div style={{ width: "100%", height: "100%", overflow: "hidden", borderRadius, position: "relative" }}>
      <img
        src={src}
        alt=""
        draggable={false}
        style={{
          width: "300%",
          height: "100%",
          objectFit: "cover",
          position: "absolute",
          left: `${-sliceIndex * 100}%`,
          top: 0,
          userSelect: "none",
          pointerEvents: "none",
          WebkitUserSelect: "none",
        }}
      />
    </div>
  );
}