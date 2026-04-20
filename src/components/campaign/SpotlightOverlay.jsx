/**
 * SpotlightOverlay — 5-step onboarding spotlight with synchronized audio guidance.
 *
 * Props:
 *   targets  — array of { ref, yOffsetPct?, stretchBottomPct?, audio? }
 *              audio: array of { url, pauseAfterMs? } — played in sequence when step mounts.
 *              tap-to-advance is LOCKED until all audio for the current step has finished.
 *   onDone   — called after user taps on the final step.
 */
import { useEffect, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { warmupAudio } from "../../lib/useAudio";

const PAD = 14;
const RADIUS = 18;

const GITHUB_BASE = "https://raw.githubusercontent.com/Mr-Banjoko/learn-with-cody/main/";

// Build a raw GitHub URL from a repo-relative path (spaces encoded)
function repoUrl(path) {
  return GITHUB_BASE + path.split("/").map(encodeURIComponent).join("/");
}

function getRect(ref) {
  if (!ref?.current) return null;
  return ref.current.getBoundingClientRect();
}

/**
 * Play a sequence of audio steps for one spotlight step.
 * Each entry: { url, pauseAfterMs? }
 * pauseAfterMs — delay (ms) inserted AFTER that clip before the next one starts.
 *
 * Safari iOS fix: ALL Audio objects are pre-created and pre-loaded synchronously
 * before any async work begins. Safari requires that Audio().play() be called
 * in the same user-gesture stack OR on a pre-created element. Creating a new
 * Audio() inside setTimeout breaks this requirement and silently fails.
 * By pre-creating all elements upfront we keep them in the same gesture context.
 *
 * Returns a cancel function.
 */
function playStepAudio(audioSteps, onDone) {
  let cancelled = false;
  let timerId = null;

  // Pre-create ALL Audio elements synchronously (Safari gesture requirement)
  const audioEls = audioSteps.map(() => {
    const a = new Audio();
    a.preload = "auto";
    a.playbackRate = 1.0;
    a.volume = 1;
    return a;
  });

  function cleanup() {
    if (timerId) { clearTimeout(timerId); timerId = null; }
    audioEls.forEach(a => { a.pause(); a.onended = null; });
  }

  // Resolve blob src then assign + play the pre-created element
  async function playIndex(i) {
    if (cancelled || i >= audioSteps.length) {
      if (!cancelled) onDone();
      return;
    }

    const { url, pauseAfterMs = 0 } = audioSteps[i];
    const audio = audioEls[i];

    // Resolve via cache (same logic as useAudio.js)
    let src = url;
    try {
      const cache = await caches.open("cody-audio-v5");
      let response = await cache.match(url);
      if (!response) {
        const fetched = await fetch(url);
        if (fetched.ok && fetched.status === 200) {
          await cache.put(url, fetched.clone());
          response = fetched;
        }
      }
      if (response) {
        const ab = await response.arrayBuffer();
        const blob = new Blob([ab], { type: "audio/mpeg" });
        src = URL.createObjectURL(blob);
      }
    } catch { /* fall through to remote URL */ }

    if (cancelled) return;

    audio.src = src;
    audio.onended = () => {
      if (cancelled) return;
      if (pauseAfterMs > 0) {
        timerId = setTimeout(() => {
          timerId = null;
          if (!cancelled) playIndex(i + 1);
        }, pauseAfterMs);
      } else {
        playIndex(i + 1);
      }
    };

    audio.load();
    audio.play().catch(() => {
      if (!cancelled) playIndex(i + 1);
    });
  }

  playIndex(0);

  return function cancel() {
    cancelled = true;
    cleanup();
  };
}

export default function SpotlightOverlay({ targets, onDone }) {
  const [step, setStep] = useState(0);
  const [spotlight, setSpotlight] = useState(null);
  const [audioReady, setAudioReady] = useState(false); // tap-advance gating
  const containerRef = useRef(null);
  const cancelAudioRef = useRef(null);

  // ── Spotlight geometry ───────────────────────────────────────────────────
  const measure = useCallback(() => {
    const t = targets[step];
    if (!t) return;
    const targetRect = getRect(t.ref);
    if (!targetRect) return;

    const container = containerRef.current;
    const origin = container
      ? container.getBoundingClientRect()
      : { left: 0, top: 0, width: window.innerWidth, height: window.innerHeight };

    const baseH = targetRect.height + PAD * 2;
    const yShift = (t.yOffsetPct || 0) * baseH;
    const stretchH = baseH * (1 + (t.stretchBottomPct || 0));

    setSpotlight({
      x:  targetRect.left - origin.left - PAD,
      y:  targetRect.top  - origin.top  - PAD + yShift,
      w:  targetRect.width  + PAD * 2,
      h:  stretchH - yShift,
      vw: origin.width,
      vh: origin.height,
    });
  }, [step, targets]);

  useEffect(() => {
    const id = requestAnimationFrame(measure);
    window.addEventListener("resize", measure);
    return () => {
      cancelAnimationFrame(id);
      window.removeEventListener("resize", measure);
    };
  }, [measure]);

  // ── Audio for each step ──────────────────────────────────────────────────
  useEffect(() => {
    // Cancel any audio from the previous step
    if (cancelAudioRef.current) {
      cancelAudioRef.current();
      cancelAudioRef.current = null;
    }

    const t = targets[step];
    if (!t?.audio || t.audio.length === 0) {
      // No audio for this step → unlock immediately
      setAudioReady(true);
      return;
    }

    // Lock tap-to-advance
    setAudioReady(false);

    const cancel = playStepAudio(t.audio, () => {
      // All clips for this step finished → unlock
      setAudioReady(true);
    });
    cancelAudioRef.current = cancel;

    return () => {
      cancel();
      cancelAudioRef.current = null;
    };
  }, [step]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Tap handler ──────────────────────────────────────────────────────────
  const advance = useCallback((e) => {
    e.stopPropagation();
    if (!audioReady) return; // still playing — ignore tap

    const next = step + 1;
    if (next >= targets.length) {
      onDone();
    } else {
      setStep(next);
    }
  }, [audioReady, step, targets.length, onDone]);

  return (
    <div
      ref={containerRef}
      onClick={advance}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        // Show wait cursor while audio is playing; pointer when ready
        cursor: audioReady ? "pointer" : "default",
        touchAction: "manipulation",
      }}
    >
      <AnimatePresence mode="wait">
        {spotlight && (
          <motion.svg
            key={step}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            width="100%"
            height="100%"
            viewBox={`0 0 ${spotlight.vw} ${spotlight.vh}`}
            preserveAspectRatio="none"
            style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
          >
            <defs>
              <mask id={`sm-${step}`}>
                <rect x={0} y={0} width={spotlight.vw} height={spotlight.vh} fill="white" />
                <rect
                  x={spotlight.x} y={spotlight.y}
                  width={spotlight.w} height={spotlight.h}
                  rx={RADIUS} ry={RADIUS}
                  fill="black"
                />
              </mask>
            </defs>

            <rect
              x={0} y={0}
              width={spotlight.vw} height={spotlight.vh}
              fill="rgba(0,0,0,0.55)"
              mask={`url(#sm-${step})`}
            />

            <rect
              x={spotlight.x} y={spotlight.y}
              width={spotlight.w} height={spotlight.h}
              rx={RADIUS} ry={RADIUS}
              fill="none"
              stroke="rgba(255,255,255,0.75)"
              strokeWidth={3}
            />
          </motion.svg>
        )}
      </AnimatePresence>
    </div>
  );
}