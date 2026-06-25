/**
 * useCustomWordImage — React hook that resolves a word's display image.
 *
 * Returns { resolvedImage, hasCustom, saving, capture, reset }
 *   resolvedImage  — custom image data URL if set, otherwise defaultImage
 *   hasCustom      — true when a custom override is active
 *   saving         — true while the image is being compressed / stored
 *   capture(file)  — compress and persist a new custom image, update state
 *   reset()        — remove the custom image for this word, return to default
 */
import { useState, useEffect, useCallback } from "react";
import { getCustomImage, saveCustomImage, removeCustomImage, compressImage } from "./customWordImages";

export function useCustomWordImage(word, defaultImage) {
  const [resolvedImage, setResolvedImage] = useState(defaultImage);
  const [hasCustom, setHasCustom] = useState(false);
  const [saving, setSaving] = useState(false);

  // Load on mount / word change
  useEffect(() => {
    let cancelled = false;
    getCustomImage(word).then((dataUrl) => {
      if (cancelled) return;
      if (dataUrl) {
        setResolvedImage(dataUrl);
        setHasCustom(true);
      } else {
        setResolvedImage(defaultImage);
        setHasCustom(false);
      }
    });
    return () => { cancelled = true; };
  }, [word, defaultImage]);

  const capture = useCallback(async (file) => {
    if (!file) return;
    setSaving(true);
    try {
      const dataUrl = await compressImage(file);
      if (dataUrl) {
        await saveCustomImage(word, dataUrl);
        setResolvedImage(dataUrl);
        setHasCustom(true);
      }
    } catch (_) {
      // silently continue with default
    } finally {
      setSaving(false);
    }
  }, [word]);

  const reset = useCallback(async () => {
    await removeCustomImage(word);
    setResolvedImage(defaultImage);
    setHasCustom(false);
  }, [word, defaultImage]);

  return { resolvedImage, hasCustom, saving, capture, reset };
}