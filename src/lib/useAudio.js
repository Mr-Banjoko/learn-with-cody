// v9: Global interruption-handling — sequences pause on visibility/blur, resume on return.
// Architecture:
//   - AppLifecycleManager listens to visibilitychange, blur, focus, pagehide, pageshow, freeze, resume
//   - When interrupted: all active sequences are paused (cancelled + step index saved)
//   - When resumed: AudioContext is checked, then each sequence restarts from its saved step
//   - playAudioSequence returns a controller with { cancel, pause, resume } — but pause/resume
//     are managed automatically by AppLifecycleManager; callers only need the cancel function.

const CACHE_NAME = "cody-audio-v9";

/**
 * APPROVED BLEND TIMING
 * 200 ms inter-phoneme gap between each step in playAudioSequence.
 * DO NOT change without explicit approval.
 */
export const BLEND_GAP_MS = 200;

// currentAudio: the HTMLAudioElement currently playing (or null)
let currentAudio = null;

// resolvedBlobUrls: remoteUrl -> blobUrl (populated by warmupAudio / getCachedAudioUrl)
const resolvedBlobUrls = new Map();

// pendingResolution: remoteUrl -> Promise<blobUrl>
const pendingResolution = new Map();

async function getCachedAudioUrl(remoteUrl) {
  if (resolvedBlobUrls.has(remoteUrl)) return resolvedBlobUrls.get(remoteUrl);
  if (pendingResolution.has(remoteUrl)) return pendingResolution.get(remoteUrl);

  const promise = (async () => {
    try {
      const cache = await caches.open(CACHE_NAME);
      let response = await cache.match(remoteUrl);
      if (!response) {
        const fetched = await fetch(remoteUrl);
        if (!fetched.ok) return remoteUrl;
        if (fetched.status === 200) await cache.put(remoteUrl, fetched.clone());
        response = fetched;
      }
      const arrayBuffer = await response.arrayBuffer();
      const blob = new Blob([arrayBuffer], { type: "audio/mpeg" });
      const blobUrl = URL.createObjectURL(blob);
      resolvedBlobUrls.set(remoteUrl, blobUrl);
      pendingResolution.delete(remoteUrl);
      return blobUrl;
    } catch {
      pendingResolution.delete(remoteUrl);
      return remoteUrl;
    }
  })();

  pendingResolution.set(remoteUrl, promise);
  return promise;
}

export async function warmupAudio(urls) {
  await Promise.all(urls.map(url => getCachedAudioUrl(url).catch(() => {})));
}

export async function preloadAudio(urls) {
  try {
    const cache = await caches.open(CACHE_NAME);
    for (const url of urls) {
      const cached = await cache.match(url);
      if (!cached) {
        fetch(url)
          .then(res => { if (res.ok && res.status === 200) cache.put(url, res); })
          .catch(() => {});
      }
    }
  } catch {
    // silently fail
  }
}

// ─── AppLifecycleManager ──────────────────────────────────────────────────────
// Singleton that tracks all active sequences and handles interruption/resume globally.

class AppLifecycleManager {
  constructor() {
    // Map of sequenceId -> { steps, currentStep, onDone, onStart (per step), paused }
    this._sequences = new Map();
    this._nextId = 1;
    this._interrupted = false;
    this._resumeRetries = 0;
    this._MAX_RETRIES = 3;
    this._initialized = false;
  }

  init() {
    if (this._initialized) return;
    this._initialized = true;

    const onInterrupt = () => this._onInterrupt();
    const onReturn = () => this._onReturn();

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) onInterrupt(); else onReturn();
    });
    window.addEventListener("pagehide", onInterrupt);
    window.addEventListener("pageshow", onReturn);
    // Freeze/resume — fired by some mobile browsers on aggressive background suspension
    document.addEventListener("freeze", onInterrupt);
    document.addEventListener("resume", onReturn);
  }

  // Register a sequence. Returns sequenceId.
  register(steps, onDone) {
    const id = this._nextId++;
    this._sequences.set(id, {
      steps,
      currentStep: 0,
      onDone,
      cancelled: false,
      paused: false,
      activeCancel: null, // cancel fn for the currently-playing sub-sequence
    });
    return id;
  }

  // Called by the sequence executor to update which step is now playing
  setStep(id, step) {
    const seq = this._sequences.get(id);
    if (seq) seq.currentStep = step;
  }

  // Store the cancel fn for the currently active audio element
  setActiveCancel(id, cancelFn) {
    const seq = this._sequences.get(id);
    if (seq) seq.activeCancel = cancelFn;
  }

  // Deregister a sequence (called when it completes naturally or is cancelled)
  deregister(id) {
    this._sequences.delete(id);
  }

  // Mark cancelled (so resume doesn't restart it)
  cancel(id) {
    const seq = this._sequences.get(id);
    if (!seq) return;
    seq.cancelled = true;
    if (seq.activeCancel) { seq.activeCancel(); seq.activeCancel = null; }
    this._sequences.delete(id);
  }

  _onInterrupt() {
    if (this._interrupted) return;
    this._interrupted = true;

    // Stop all currently playing audio immediately without advancing sequences
    if (currentAudio) {
      currentAudio.onended = null;
      currentAudio.onerror = null;
      currentAudio.pause();
      currentAudio = null;
    }

    // Mark all sequences as paused and stop any active audio in them
    for (const seq of this._sequences.values()) {
      seq.paused = true;
      if (seq.activeCancel) { seq.activeCancel(); seq.activeCancel = null; }
    }
  }

  _onReturn() {
    if (!this._interrupted) return;
    this._interrupted = false;
    this._resumeRetries = 0;

    // Give audio engine and rendering a moment to reinitialize
    setTimeout(() => this._resumeAllSequences(), 400);
  }

  _resumeAllSequences() {
    if (this._sequences.size === 0) return;

    // Resume all paused sequences
    for (const [id, seq] of this._sequences.entries()) {
      if (!seq.paused || seq.cancelled) continue;
      seq.paused = false;
      // Restart from the current step (step that was interrupted)
      _resumeSequenceFromStep(id, seq, seq.currentStep);
    }
  }
}

export const appLifecycle = new AppLifecycleManager();

// Auto-initialize when module loads (safe — just adds event listeners)
if (typeof document !== "undefined") {
  appLifecycle.init();
}

// ─── Internal: run a sequence starting from a given step ─────────────────────

function _resumeSequenceFromStep(id, seq, fromStep) {
  const { steps, onDone } = seq;

  function playStep(i) {
    if (seq.cancelled) return;
    if (seq.paused) return; // interrupted again — stop and wait

    if (i >= steps.length) {
      appLifecycle.deregister(id);
      onDone && onDone();
      return;
    }

    appLifecycle.setStep(id, i);

    const { url, gain = 1, onStart } = steps[i];
    onStart && onStart(i);

    const src = resolvedBlobUrls.get(url);

    function startAudio(resolvedSrc) {
      if (seq.cancelled || seq.paused) return;

      const audio = new Audio();
      audio.preload = "auto";
      audio.playbackRate = 1.0;
      audio.volume = Math.min(1, Math.max(0, gain));
      audio.src = resolvedSrc;
      currentAudio = audio;

      // Store a stop function so AppLifecycleManager can kill it on interrupt
      appLifecycle.setActiveCancel(id, () => {
        audio.onended = null;
        audio.onerror = null;
        audio.pause();
        if (currentAudio === audio) currentAudio = null;
      });

      audio.onended = () => {
        if (seq.cancelled) return;
        if (currentAudio === audio) currentAudio = null;
        // Advance step tracker BEFORE the timeout so if interrupted during the gap,
        // resume picks up from i+1 (the next step) not i (the completed step).
        appLifecycle.setStep(id, i + 1);
        setTimeout(() => {
          if (!seq.cancelled && !seq.paused) playStep(i + 1);
          // If paused here, _resumeAllSequences will call playStep(i+1) on return
        }, BLEND_GAP_MS);
      };

      audio.onerror = () => {
        if (currentAudio === audio) currentAudio = null;
        if (!seq.cancelled && !seq.paused) setTimeout(() => playStep(i + 1), BLEND_GAP_MS);
      };

      audio.load();
      const p = audio.play();
      if (p !== undefined) {
        p.catch(() => {
          if (currentAudio === audio) currentAudio = null;
          if (!seq.cancelled && !seq.paused) playStep(i + 1);
        });
      }
    }

    if (src) {
      startAudio(src);
    } else {
      getCachedAudioUrl(url).then(resolvedSrc => {
        if (!seq.cancelled && !seq.paused) startAudio(resolvedSrc);
      }).catch(() => {
        if (!seq.cancelled && !seq.paused) playStep(i + 1);
      });
    }
  }

  playStep(fromStep);
}

// ─── Internal: stop current audio cleanly ─────────────────────────────────────

function _stopCurrent() {
  if (currentAudio) {
    currentAudio.onended = null;
    currentAudio.onerror = null;
    currentAudio.pause();
    currentAudio = null;
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * playAudio — play a single file.
 * Synchronous fast-path if blob URL is already resolved.
 */
export function playAudio(remoteUrl, gain = 1) {
  if (!remoteUrl) return;
  _stopCurrent();

  if (resolvedBlobUrls.has(remoteUrl)) {
    _startPlaybackSingle(resolvedBlobUrls.get(remoteUrl), gain);
    return;
  }
  getCachedAudioUrl(remoteUrl).then(src => _startPlaybackSingle(src, gain));
}

function _startPlaybackSingle(src, gain) {
  const audio = new Audio();
  audio.preload = "auto";
  audio.playbackRate = 1.0;
  audio.volume = Math.min(1, Math.max(0, gain));
  audio.src = src;
  currentAudio = audio;

  audio.onended = () => { if (currentAudio === audio) currentAudio = null; };
  audio.onerror = () => { if (currentAudio === audio) currentAudio = null; };

  audio.load();
  const p = audio.play();
  if (p !== undefined) {
    p.catch(() => { if (currentAudio === audio) currentAudio = null; });
  }
  return audio;
}

/**
 * playAudioSequence — play steps sequentially with interruption recovery.
 *
 * Each step: { url, gain?, onStart? }
 * Returns a cancel() function (same API as before — no breaking changes).
 *
 * Internally registers with AppLifecycleManager so interruptions auto-pause
 * and resumes auto-restart from the correct step.
 */
export function playAudioSequence(steps, onDone) {
  // Cancel any sequence that was using the shared currentAudio track
  // (normal usage: callers call cancel() before starting a new sequence,
  //  but _stopCurrent here is a safety net)
  _stopCurrent();

  if (!steps || steps.length === 0) {
    onDone && onDone();
    return () => {};
  }

  const id = appLifecycle.register(steps, onDone);
  const seq = appLifecycle._sequences.get(id);

  _resumeSequenceFromStep(id, seq, 0);

  // Return cancel() — same public API as v8, no breaking changes for callers
  return function cancel() {
    appLifecycle.cancel(id);
    _stopCurrent();
  };
}

/**
 * stopAllSequences — emergency stop of all registered sequences.
 * Used when a game component unmounts to ensure no ghost callbacks fire.
 */
export function stopAllSequences() {
  for (const id of [...appLifecycle._sequences.keys()]) {
    appLifecycle.cancel(id);
  }
  _stopCurrent();
}