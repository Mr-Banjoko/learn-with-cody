/**
 * useUserPhoto(word) — hook for reading/writing a user's photo for a given word.
 * Backed by IndexedDB via userPhotoDB.js.
 * Returns { photoUrl, savePhoto, clearPhoto, loading }
 */
import { useState, useEffect, useCallback } from "react";
import { getPhoto, savePhoto as dbSave, clearPhoto as dbClear, subscribePhoto } from "./userPhotoDB";

export function useUserPhoto(word) {
  const [photoUrl, setPhotoUrl] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const load = () =>
      getPhoto(word).then((url) => {
        if (!cancelled) {
          setPhotoUrl(url);
          setLoading(false);
        }
      });
    load();
    // Refresh when any other instance saves/clears this word's photo.
    const unsubscribe = subscribePhoto(word, load);
    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [word]);

  const savePhoto = useCallback(async (dataUrl) => {
    const compressed = await dbSave(word, dataUrl);
    setPhotoUrl(compressed);
  }, [word]);

  const clearPhoto = useCallback(async () => {
    await dbClear(word);
    setPhotoUrl(null);
  }, [word]);

  return { photoUrl, savePhoto, clearPhoto, loading };
}