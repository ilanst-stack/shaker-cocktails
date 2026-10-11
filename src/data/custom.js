// "מתכוני הבית" — קוקטיילים שהמשתמש יצר בעצמו
// נשמרים ב-users/{uid}/custom/{id}, והופכים למבנה זהה לקוקטייל מהמאגר כדי שכל המסכים יעבדו איתם
import { useEffect, useState } from 'react';
import { collection, doc, onSnapshot, setDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase.js';

export { CUSTOM_PREFIX, isCustomId, GLASSES, FORM_UNITS, customToDrink } from './customModel.js';
import { customToDrink } from './customModel.js';

export function useCustomDrinks(uid) {
  const [list, setList] = useState([]);
  useEffect(() => {
    if (!uid) return undefined;
    return onSnapshot(collection(db, 'users', uid, 'custom'), (snap) => {
      setList(snap.docs.map((d) => customToDrink(d.id, d.data())));
    }, (e) => console.error('custom drinks', e));
  }, [uid]);
  return list;
}

export async function saveCustom(uid, id, data) {
  const docId = id || `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
  await setDoc(doc(db, 'users', uid, 'custom', docId), { ...data, updatedAt: serverTimestamp() }, { merge: false });
  return docId;
}

export const deleteCustom = (uid, id) => deleteDoc(doc(db, 'users', uid, 'custom', id));
