/**
 * useUserPhoto(word) — hook for reading/writing a user's photo for a given word.
 * Backed by IndexedDB via userPhotoDB.js.
 * Returns { photoUrl, savePhoto, clearPhoto, loading }
 */
import { useState, useEffect, useCallback } from "react";
import { getPhoto, savePhoto as dbSave, clearPhoto as dbClear } from "./userPhotoDB";

export function useUserPhoto(word) {
  const [photoUrl, setPhotoUrl] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getPhoto(word).then((url) => {
      if (!cancelled) {
        setPhotoUrl(url);
        setLoading(false);
      }
    });
    return () => { cancelled = true; };
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