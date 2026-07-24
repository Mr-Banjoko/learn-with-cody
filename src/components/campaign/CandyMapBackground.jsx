const MAP_IMAGE = "https://media.base44.com/images/public/69c4ec00726384fdef1ab181/18c697bad_generated_image.png";

export default function CandyMapBackground() {
  const tiles = Array.from({ length: 20 });

  return (
    <div aria-hidden="true" style={{ position: "absolute", inset: 0, zIndex: 0, overflow: "hidden", pointerEvents: "none" }}>
      {tiles.map((_, index) => (
        <div
          key={index}
          style={{
            width: "100%",
            aspectRatio: "1 / 1",
            marginTop: index === 0 ? 0 : -2,
            flexShrink: 0,
            backgroundImage: `url(${MAP_IMAGE})`,
            backgroundSize: "100% 100%",
            backgroundRepeat: "no-repeat",
            transform: index % 2 ? "scaleY(-1)" : "none",
          }}
        />
      ))}
    </div>
  );
}