const MAP_ART = "https://media.base44.com/images/public/69c4ec00726384fdef1ab181/18c697bad_generated_image.png";
const TILE_COUNT = 24;

export default function SeamlessMapBackground() {
  return (
    <div aria-hidden="true" style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
      {Array.from({ length: TILE_COUNT }, (_, index) => (
        <img
          key={index}
          src={MAP_ART}
          alt=""
          draggable="false"
          style={{
            display: "block",
            width: "100%",
            height: "auto",
            marginTop: index === 0 ? 0 : -1,
            transform: index % 2 ? "scaleY(-1)" : "none",
          }}
        />
      ))}
    </div>
  );
}