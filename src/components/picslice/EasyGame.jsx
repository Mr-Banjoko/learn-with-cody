import { useState, useEffect, useCallback } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { playAudio } from "../../lib/useAudio";
import { getLetterSoundUrl, getLetterGain } from "../../lib/letterSounds";
import SliceImage from "./SliceImage";

// Pool piece dimensions
const POOL_W = 82;
const POOL_H = 94;
// Slot height (width is flexible / fills column)
const SLOT_H = 80;

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildPool(round) {
  const slices = [];
  round.forEach((wordData, wi) => {
    for (let si = 0; si < 3; si++) {
      slices.push({
        id: `${wordData.word}-${si}-${Date.now()}`,
        wordIndex: wi,
        sliceIndex: si,
        phoneme: wordData.word[si],
        image: wordData.image,
        word: wordData.word,
      });
    }
  });
  return shuffle(slices);
}

export default function EasyGame({ rounds, onBack }) {
  const [roundIdx, setRoundIdx] = useState(0);
  const [pool, setPool] = useState([]);
  const [slots, setSlots] = useState({});
  const [roundDone, setRoundDone] = useState(false);

  const round = rounds[roundIdx];

  useEffect(() => {
    if (!round) return;
    setPool(buildPool(round));
    setSlots({});
    setRoundDone(false);
  }, [roundIdx, rounds]);

  // Check all slots filled
  useEffect(() => {
    if (!round || Object.keys(slots).length === 0) return;
    const allFilled = round.every((_, wi) =>
      [0, 1, 2].every(si => !!slots[`w${wi}s${si}`])
    );
    if (allFilled) {
      const t = setTimeout(() => setRoundDone(true), 700);
      return () => clearTimeout(t);
    }
  }, [slots, round]);

  const onDragEnd = useCallback((result) => {
    const { destination, draggableId } = result;
    if (!destination) return;
    const slotId = destination.droppableId;
    if (slotId === "pool") return;

    const m = slotId.match(/^w(\d+)s(\d+)$/);
    if (!m) return;
    const wi = parseInt(m[1]);
    const si = parseInt(m[2]);

    if (slots[slotId]) return; // already filled

    const slice = pool.find(s => s.id === draggableId);
    if (!slice) return;

    // Phoneme match check — enforces correct position
    const required = round[wi]?.word[si];
    if (!required || slice.phoneme !== required) return; // reject → dnd animates back

    setSlots(prev => ({ ...prev, [slotId]: slice }));
    setPool(prev => prev.filter(s => s.id !== draggableId));
  }, [pool, slots, round]);

  const handleWordTap = (wordData) => {
    if (wordData.audio) playAudio(wordData.audio);
  };

  const handleSliceTap = useCallback((slice, e) => {
    e.stopPropagation();
    const url = getLetterSoundUrl(slice.phoneme);
    if (url) playAudio(url, getLetterGain(slice.phoneme));
  }, []);

  const handleNext = () => {
    const next = roundIdx + 1;
    if (next < rounds.length) {
      setRoundIdx(next);
    } else {
      onBack();
    }
  };

  if (!round) return null;

  return (
    <div style={{ background: "#D6EEFF", minHeight: "100%", fontFamily: "Fredoka, sans-serif", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <div style={{ background: "#A8D0E6", borderBottomLeftRadius: 28, borderBottomRightRadius: 28, padding: "14px 20px 18px", display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
        <button
          onClick={onBack}
          style={{ width: 40, height: 40, borderRadius: 20, background: "rgba(255,255,255,0.7)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
        >
          <ArrowLeft size={22} color="#1E3A5F" />
        </button>
        <h1 style={{ flex: 1, textAlign: "center", fontSize: 18, fontWeight: 700, color: "#1E3A5F", marginRight: 40 }}>
          Round {roundIdx + 1} / {rounds.length}
        </h1>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div style={{ flex: 1, padding: "18px 12px 0", display: "flex", flexDirection: "column", gap: 14 }}>

          {/* ── Word target areas ── */}
          <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
            {round.map((wordData, wi) => {
              const wordComplete = [0, 1, 2].every(si => !!slots[`w${wi}s${si}`]);
              return (
                <div key={wi} style={{ flex: 1, maxWidth: 200, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>

                  {/* Word label — tap to hear full word */}
                  <motion.button
                    whileTap={{ scale: 0.93 }}
                    onClick={() => handleWordTap(wordData)}
                    style={{
                      fontSize: 26, fontWeight: 700, color: "#1E3A5F",
                      background: "rgba(255,255,255,0.85)",
                      border: "2px solid #A8D0E6",
                      borderRadius: 16, padding: "6px 20px",
                      cursor: "pointer", letterSpacing: 3,
                      textTransform: "uppercase",
                      fontFamily: "Fredoka, sans-serif",
                    }}
                  >
                    {wordData.word}
                  </motion.button>

                  {/* Target box */}
                  <div style={{
                    position: "relative",
                    width: "100%",
                    height: SLOT_H + 16,
                    borderRadius: 18,
                    background: "rgba(255,255,255,0.55)",
                    border: "2px dashed #A8D0E6",
                    overflow: "hidden",
                  }}>
                    {/* Completed reveal */}
                    <AnimatePresence>
                      {wordComplete && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.85 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ type: "spring", bounce: 0.3 }}
                          style={{ position: "absolute", inset: 0, zIndex: 10 }}
                        >
                          <img
                            src={wordData.image}
                            alt={wordData.word}
                            style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 16 }}
                          />
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.25, type: "spring", bounce: 0.5 }}
                            style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}
                          >
                            <span style={{ fontSize: 40, filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.3))" }}>⭐</span>
                          </motion.div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* 3 Droppable slots */}
                    <div style={{ display: "flex", height: "100%", padding: "8px 8px" }}>
                      {[0, 1, 2].map(si => {
                        const slotId = `w${wi}s${si}`;
                        const filled = slots[slotId];
                        return (
                          <Droppable
                            key={slotId}
                            droppableId={slotId}
                            isDropDisabled={!!filled}
                          >
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.droppableProps}
                                style={{
                                  flex: 1,
                                  height: SLOT_H,
                                  borderRight: si < 2 ? "2px dotted #A8D0E6" : "none",
                                  background: snapshot.isDraggingOver && !filled
                                    ? "rgba(74,144,196,0.18)"
                                    : "transparent",
                                  transition: "background 0.15s",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  overflow: "hidden",
                                  position: "relative",
                                }}
                              >
                                {filled && (
                                  <motion.div
                                    initial={{ scale: 0.7, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ type: "spring", bounce: 0.4 }}
                                    style={{ width: "100%", height: "100%" }}
                                  >
                                    <SliceImage
                                      src={filled.image}
                                      sliceIndex={filled.sliceIndex}
                                      borderRadius={0}
                                    />
                                  </motion.div>
                                )}
                                <div style={{ display: "none" }}>{provided.placeholder}</div>
                              </div>
                            )}
                          </Droppable>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ── Shuffled pool pieces ── */}
          <div style={{ marginTop: 4 }}>
            <p style={{ textAlign: "center", fontSize: 14, color: "#7BACC8", fontWeight: 600, marginBottom: 10 }}>
              👆 Drag a piece · Tap to hear its sound
            </p>
            <Droppable droppableId="pool" direction="horizontal" isDropDisabled={true}>
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 10,
                    justifyContent: "center",
                    padding: "14px 10px",
                    background: "rgba(255,255,255,0.45)",
                    borderRadius: 24,
                    minHeight: 110,
                  }}
                >
                  {pool.map((slice, idx) => (
                    <Draggable key={slice.id} draggableId={slice.id} index={idx}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          onClick={(e) => handleSliceTap(slice, e)}
                          style={{
                            ...provided.draggableProps.style,
                            width: POOL_W,
                            height: POOL_H,
                            borderRadius: 16,
                            boxShadow: snapshot.isDragging
                              ? "0 16px 40px rgba(30,58,95,0.28)"
                              : "0 4px 14px rgba(30,58,95,0.14)",
                            cursor: snapshot.isDragging ? "grabbing" : "grab",
                            overflow: "hidden",
                            flexShrink: 0,
                            transform: snapshot.isDragging
                              ? `${provided.draggableProps.style?.transform} scale(1.07)`
                              : provided.draggableProps.style?.transform,
                            border: snapshot.isDragging ? "3px solid #4A90C4" : "3px solid transparent",
                            transition: snapshot.isDragging ? undefined : "box-shadow 0.15s, border 0.15s",
                          }}
                        >
                          <SliceImage
                            src={slice.image}
                            sliceIndex={slice.sliceIndex}
                            borderRadius={13}
                          />
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>
        </div>
      </DragDropContext>

      {/* ── Round completion overlay ── */}
      <AnimatePresence>
        {roundDone && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: "fixed", inset: 0,
              background: "rgba(30,58,95,0.55)",
              display: "flex", alignItems: "center", justifyContent: "center",
              zIndex: 200,
            }}
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0, y: 40 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ type: "spring", bounce: 0.5, duration: 0.5 }}
              style={{
                background: "white", borderRadius: 36,
                padding: "44px 40px 36px",
                textAlign: "center",
                boxShadow: "0 30px 80px rgba(0,0,0,0.3)",
                maxWidth: 300, width: "88%",
              }}
            >
              <motion.div
                animate={{ rotate: [0, -10, 10, -10, 10, 0], scale: [1, 1.2, 1.2, 1.2, 1.2, 1] }}
                transition={{ delay: 0.2, duration: 0.6 }}
                style={{ fontSize: 64, marginBottom: 6 }}
              >
                🎉
              </motion.div>
              <h2 style={{ fontSize: 36, fontWeight: 700, color: "#1E3A5F", marginBottom: 6 }}>
                Good Job!
              </h2>
              <p style={{ fontSize: 16, color: "#7BACC8", marginBottom: 28 }}>
                {roundIdx + 1 < rounds.length
                  ? "Ready for the next 2 words?"
                  : "You finished all the rounds! 🏆"}
              </p>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleNext}
                style={{
                  background: "#4A90C4", color: "white", border: "none",
                  borderRadius: 999, padding: "15px 44px",
                  fontSize: 22, fontWeight: 700, cursor: "pointer",
                  fontFamily: "Fredoka, sans-serif",
                  boxShadow: "0 8px 24px rgba(74,144,196,0.45)",
                }}
              >
                {roundIdx + 1 < rounds.length ? "Next →" : "Done! 🏆"}
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}