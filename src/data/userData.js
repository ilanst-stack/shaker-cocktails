// כל המידע של המשתמש נשמר ב-Firestore:
// users/{uid}            → { inventory: [...], favorites: [id], ratings: { id: 0–5 }, tasted: { id: תאריך } }
// users/{uid}/photos/{id} → { data: תמונה דחוסה (base64), at }
import { useEffect, useState, useCallback } from 'react';
import { doc, onSnapshot, setDoc, getDoc, deleteDoc, serverTimestamp, deleteField } from 'firebase/firestore';
import { db } from '../firebase.js';

const EMPTY = { inventory: [], favorites: [], ratings: {}, tasted: {} };

export function useUserData(uid) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!uid) return undefined;
    const ref = doc(db, 'users', uid);
    return onSnapshot(ref, (snap) => setData({ ...EMPTY, ...(snap.data() || {}) }), (e) => setError(e));
  }, [uid]);

  const save = useCallback((patch) => setDoc(doc(db, 'users', uid), { ...patch, updatedAt: serverTimestamp() }, { merge: true }), [uid]);

  const api = {
    setInventory: (inventory) => save({ inventory }),
    toggleFavorite: (id) => {
      const fav = new Set(data?.favorites || []);
      fav.has(id) ? fav.delete(id) : fav.add(id);
      return save({ favorites: [...fav] });
    },
    setTasted: (id, on) => save({ tasted: { [id]: on ? Date.now() : deleteField() }, ...(on ? {} : { ratings: { [id]: deleteField() } }) }),
    setRating: (id, r) => save({ ratings: { [id]: r }, tasted: { [id]: data?.tasted?.[id] || Date.now() } }),
  };

  return { data, error, ...api };
}

export async function loadPhoto(uid, drinkId) {
  const snap = await getDoc(doc(db, 'users', uid, 'photos', drinkId));
  return snap.exists() ? snap.data().data : null;
}

export async function savePhoto(uid, drinkId, dataUrl) {
  await setDoc(doc(db, 'users', uid, 'photos', drinkId), { data: dataUrl, at: serverTimestamp() });
}

export const removePhoto = (uid, drinkId) => deleteDoc(doc(db, 'users', uid, 'photos', drinkId));

// מכווץ תמונה מהמצלמה ל-~900 פיקסלים ו-JPEG, כדי שתיכנס למסמך (עד ~1MB)
export async function compressImage(file, maxSide = 900) {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = url; });
    let quality = 0.75, side = maxSide, out = '';
    for (let attempt = 0; attempt < 5; attempt++) {
      const scale = Math.min(1, side / Math.max(img.width, img.height));
      const c = document.createElement('canvas');
      c.width = Math.round(img.width * scale);
      c.height = Math.round(img.height * scale);
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
      out = c.toDataURL('image/jpeg', quality);
      if (out.length < 700_000) break;
      quality -= 0.12; side = Math.round(side * 0.8);
    }
    return out;
  } finally {
    URL.revokeObjectURL(url);
  }
}
