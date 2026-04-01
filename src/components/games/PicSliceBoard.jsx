import { useState, useEffect, useCallback } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { motion, AnimatePresence } from "framer-motion";
import { buildRoundPieces } from "../../lib/picSliceGameData";
import { playAudio } from "../../lib/useAudio";
import { getLetterGain } from "../../lib/letterSounds";

// Renders one vertical slice of an image using background-image (reliable crop)
// sliceIndex: 0=left, 1=middle, 2=right
function ImageSlice({ image, sliceIndex, size = 76, borderRadius = 10 }) {
  // background-size: 300% 100% means the full image spans 3× the container width
  // background-position: 0%=left, 50%=middle, 100%=right
  const positions = ["0% 50%", "50% 50%", "100% 50%"];
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius,
        flexShrink: 0,
        pointerEvents: "none",
        backgroundImage: `url(${image})`,
        backgroundSize: "300% 100%",
        backgroundPosition: positions[sliceIndex],
        backgroundRepeat: "no-repeat",
      }}
    />
  );
}

function buildInitialState(wordPair) {
  const pieces = buildRoundPieces(wordPair);
  return {
    pieces,
    trayIds: pieces.map((p) => p.id),
    placed: {}, // "wi-si" → pieceId
    wordComplete: [false, false],
    rejectedSlot: null,
  };
}

export default function PicSliceBoard({ wordPair, onRoundComplete }) {
  const [state, setState] = useState(() => buildInitialState(wordPair));

  // Reset when wordPair changes (new round)
  useEffect(() => {
    setState(buildInitialState(wordPair));
  }, [wordPair]);

  // Fire completion when both words done
  useEffect(() => {
    if (state.wordComplete[0] && state.wordComplete[1]) {
      onRoundComplete();
    }
  }, [state.wordComplete]);

  const handleDragEnd = useCallback(
    (result) => {
      const { destination, draggableId } = result;
      if (!destination) return;
      if (destination.droppableId === "tray") return;

      // Parse slot destination: "slot-wi-si"
      const parts = destination.droppableId.split("-");
      const wi = parseInt(parts[1]);
      const si = parseInt(parts[2]);
      const slotKey = `${wi}-${si}`;

      // Already filled
      if (state.placed[slotKey]) return;

      const piece = state.pieces.find((p) => p.id === draggableId);
      const requiredPhoneme = wordPair[wi].phonemes[si].letter;

      if (piece.phoneme === requiredPhoneme) {
        // Correct — snap in
        const newPlaced = { ...state.placed, [slotKey]: draggableId };
        const newTrayIds = state.trayIds.filter((id) => id !== draggableId);

        // Check each word for completion
        const wordComplete = [0, 1].map((wordIdx) =>
          [0, 1, 2].every((slotIdx) => {
            const k = `${wordIdx}-${slotIdx}`;
            return k === slotKey ? true : !!newPlaced[k];
          })
        );

        setState((prev) => ({
          ...prev,
          placed: newPlaced,
          trayIds: newTrayIds,
          wordComplete,
        }));
      } else {
        // Wrong — reject with shake
        setState((prev) => ({ ...prev, rejectedSlot: destination.droppableId }));
        setTimeout(() => setState((prev) => ({ ...prev, rejectedSlot: null })), 500);
      }
    },
    [state, wordPair]
  );

  const handleSliceTap = (piece) => {
    playAudio(piece.letterAudio, getLetterGain(piece.phoneme));
  };

  const slotSize = 76;

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div style={{ fontFamily: "Fredoka, sans-serif", padding: "0 12px" }}>
        {/* Target word boxes */}
        <div style={{ display: "flex", gap: 14, marginBottom: 24 }}>
          {wordPair.map((wd, wi) => (
            <div key={wi} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
              {/* Word label — tap to hear full word */}
              <button
                onClick={() => playAudio(wd.audio)}
                style={{
                  fontSize: 26,
                  fontWeight: 700,
                  color: "#1E3A5F",
                  background: "white",
                  border: "2px solid #A8D0E6",
                  borderRadius: 14,
                  padding: "6px 18px",
                  cursor: "pointer",
                  boxShadow: "0 3px 10px rgba(30,58,95,0.10)",
                  letterSpacing: 1,
                  fontFamily: "Fredoka, sans-serif",
                }}
              >
                {wd.word.toUpperCase()}
              </button>

              {/* Slot box or completed image */}
              <AnimatePresence mode="wait">
                {state.wordComplete[wi] ? (
                  <motion.div
                    key="complete"
                    initial={{ scale: 0.7, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 18 }}
                    style={{
                      borderRadius: 16,
                      overflow: "hidden",
                      width: slotSize * 3,
                      height: slotSize,
                      boxShadow: "0 6px 24px rgba(78,205,196,0.35)",
                      border: "3px solid #4ECDC4",
                    }}
                  >
                    <img
                      src={wd.image}
                      alt={wd.word}
                      style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                    />
                  </motion.div>
                ) : (
                  <motion.div
                    key="slots"
                    style={{
                      display: "flex",
                      border: "2px dashed #A8D0E6",
                      borderRadius: 16,
                      overflow: "hidden",
                      background: "rgba(255,255,255,0.7)",
                      width: slotSize * 3,
                      height: slotSize,
                    }}
                  >
                    {[0, 1, 2].map((si) => {
                      const slotKey = `${wi}-${si}`;
                      const placedId = state.placed[slotKey];
                      const placedPiece = placedId
                        ? state.pieces.find((p) => p.id === placedId)
                        : null;
                      const isRejected = state.rejectedSlot === `slot-${wi}-${si}`;

                      return (
                        <Droppable
                          key={si}
                          droppableId={`slot-${wi}-${si}`}
                          isDropDisabled={!!placedId}
                        >
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.droppableProps}
                              style={{
                                flex: 1,
                                height: slotSize,
                                borderRight: si < 2 ? "1.5px dashed #A8D0E6" : "none",
                                background: snapshot.isDraggingOver
                                  ? "rgba(78,205,196,0.15)"
                                  : "transparent",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                position: "relative",
                                animation: isRejected ? "picSliceShake 0.4s ease" : "none",
                                transition: "background 0.15s",
                              }}
                            >
                              {placedPiece ? (
                                <motion.div
                                  initial={{ scale: 0.6, opacity: 0 }}
                                  animate={{ scale: 1, opacity: 1 }}
                                  transition={{ type: "spring", stiffness: 400, damping: 20 }}
                                >
                                  <ImageSlice
                                    image={placedPiece.image}
                                    sliceIndex={placedPiece.sliceIndex}
                                    size={slotSize}
                                  />
                                </motion.div>
                              ) : (
                                <span style={{ fontSize: 11, color: "#B0C8D8", fontWeight: 600 }}>
                                  {si === 0 ? "1st" : si === 1 ? "2nd" : "3rd"}
                                </span>
                              )}
                              <div style={{ display: "none" }}>{provided.placeholder}</div>
                            </div>
                          )}
                        </Droppable>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div style={{ borderTop: "1.5px dashed #C5DCF0", marginBottom: 20 }} />

        {/* Shuffled piece tray */}
        <Droppable droppableId="tray" direction="horizontal">
          {(provided) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 10,
                justifyContent: "center",
                minHeight: slotSize + 16,
                padding: "8px 4px",
              }}
            >
              {state.trayIds.map((pieceId, index) => {
                const piece = state.pieces.find((p) => p.id === pieceId);
                return (
                  <Draggable key={pieceId} draggableId={pieceId} index={index}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        onClick={() => handleSliceTap(piece)}
                        style={{
                          ...provided.draggableProps.style,
                          borderRadius: 12,
                          boxShadow: snapshot.isDragging
                            ? "0 12px 32px rgba(30,58,95,0.28)"
                            : "0 4px 12px rgba(30,58,95,0.14)",
                          border: snapshot.isDragging
                            ? "2.5px solid #4ECDC4"
                            : "2px solid rgba(168,208,230,0.5)",
                          transform: snapshot.isDragging
                            ? `${provided.draggableProps.style?.transform} scale(1.08)`
                            : provided.draggableProps.style?.transform,
                          cursor: "grab",
                          userSelect: "none",
                          WebkitUserSelect: "none",
                          background: "white",
                          overflow: "hidden",
                        }}
                      >
                        <ImageSlice
                          image={piece.image}
                          sliceIndex={piece.sliceIndex}
                          size={slotSize}
                        />
                      </div>
                    )}
                  </Draggable>
                );
              })}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </div>

      <style>{`
        @keyframes picSliceShake {
          0%   { transform: translateX(0); }
          20%  { transform: translateX(-6px); background: rgba(255,100,100,0.15); }
          40%  { transform: translateX(6px); }
          60%  { transform: translateX(-4px); }
          80%  { transform: translateX(4px); }
          100% { transform: translateX(0); }
        }
      `}</style>
    </DragDropContext>
  );
}