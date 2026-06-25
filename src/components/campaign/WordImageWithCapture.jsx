/**
 * WordImageWithCapture
 *
 * Drop-in replacement for a plain <img> in campaign rounds that display a
 * whole word image.  Adds a small camera-button overlay so the child / parent
 * can replace the picture with their own photo, plus a reset button when a
 * custom image is active.
 *
 * Props:
 *   word          — the phonics word (used as storage key)
 *   defaultImage  — the app's default image URL for this word
 *   style         — optional extra style for the outer wrapper
 *   imgStyle      — optional extra style for the <img>
 *   onPointerDown — forwarded to the image wrapper (e.g. audio replay)
 */
import { useCallback } from "react";
import { Camera, X } from "lucide-react";
import { useCustomWordImage } from "../../lib/useCustomWordImage";

export default function WordImageWithCapture({ word, defaultImage, style, imgStyle, onPointerDown, alt }) {
  const { resolvedImage, hasCustom, saving, capture, reset } = useCustomWordImage(word, defaultImage);

  const handleFileChange = useCallback((e) => {
    const file = e.target.files?.[0];
    if (file) capture(file);
    e.target.value = "";
  }, [capture]);

  const handleReset = useCallback((e) => {
    e.stopPropagation();
    e.preventDefault();
    reset();
  }, [reset]);

  return (
    <div
      style={{ position: "relative", display: "inline-block", ...style }}
      onPointerDown={onPointerDown}
    >
      <img
        src={resolvedImage || defaultImage}
        alt={alt || word}
        style={{
          width: "100%",
          aspectRatio: "1/1",
          objectFit: "cover",
          borderRadius: 14,
          display: "block",
          ...imgStyle,
        }}
      />

      {/* Camera button — label wrapping the file input so it opens natively on mobile */}
      <label
        style={{
          position: "absolute",
          bottom: 6,
          right: 6,
          width: 34,
          height: 34,
          borderRadius: "50%",
          background: hasCustom ? "rgba(74,144,196,0.92)" : "rgba(255,255,255,0.88)",
          border: "2px solid rgba(255,255,255,0.95)",
          boxShadow: "0 2px 10px rgba(0,0,0,0.18)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          touchAction: "manipulation",
          zIndex: 10,
          transition: "background 0.2s",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {saving
          ? <span style={{ fontSize: 11, color: "#4A90C4" }}>…</span>
          : <Camera size={16} color={hasCustom ? "white" : "#4A90C4"} strokeWidth={2} />
        }
        <input
          type="file"
          accept="image/*"
          capture="environment"
          style={{ display: "none" }}
          onChange={handleFileChange}
        />
      </label>

      {/* Reset button — top-right corner, only when custom image is active */}
      {hasCustom && (
        <button
          onPointerDown={handleReset}
          title="Reset to default picture"
          style={{
            position: "absolute",
            top: 6,
            right: 6,
            width: 28,
            height: 28,
            borderRadius: "50%",
            background: "rgba(255,107,107,0.88)",
            border: "2px solid rgba(255,255,255,0.9)",
            boxShadow: "0 2px 8px rgba(0,0,0,0.18)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            touchAction: "manipulation",
            zIndex: 10,
          }}
        >
          <X size={14} color="white" strokeWidth={2.5} />
        </button>
      )}
    </div>
  );
}