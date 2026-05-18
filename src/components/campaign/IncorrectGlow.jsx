/**
 * IncorrectGlow — soft red screen-edge glow overlay for incorrect answers.
 * Appears instantly, fades out over ~700ms. Child-friendly: soft, not alarming.
 */
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function IncorrectGlow({ trigger }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!trigger) return;
    setVisible(true);
    const t = setTimeout(() => setVisible(false), 700);
    return () => clearTimeout(t);
  }, [trigger]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key={trigger}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15, exit: { duration: 0.55 } }}
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            zIndex: 999,
            background:
              "radial-gradient(ellipse at center, transparent 40%, rgba(220, 38, 38, 0.22) 100%)",
            boxShadow: "inset 0 0 60px 20px rgba(220, 38, 38, 0.18)",
          }}
        />
      )}
    </AnimatePresence>
  );
}