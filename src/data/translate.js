// תרגום הוראות ההכנה לעברית עם Gemini, עם שמירה במטמון (בדפדפן וב-Firestore) כדי לתרגם כל קוקטייל פעם אחת
import { Schema } from 'firebase/ai';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase.js';
import { askJson } from './ai.js';

const LS = 'shaker.tr.v1.';
const schema = Schema.object({ properties: { steps: Schema.array({ items: Schema.string() }) } });

export async function translateSteps(uid, drinkId, steps) {
  const lsKey = LS + drinkId;
  try { const c = JSON.parse(localStorage.getItem(lsKey)); if (c?.length === steps.length) return c; } catch { /* ignore */ }
  const ref = doc(db, 'users', uid, 'tr', drinkId);
  try {
    const snap = await getDoc(ref);
    const he = snap.exists() ? snap.data().steps : null;
    if (he?.length === steps.length) { localStorage.setItem(lsKey, JSON.stringify(he)); return he; }
  } catch { /* ממשיכים לתרגום */ }
  const prompt = `Translate these cocktail preparation steps from English into short, natural Hebrew for a home bartender.
Return exactly ${steps.length} items, one per step, same order. Keep numbers. Use common Israeli bar terms (שייקר, לסנן, לערבב, כוס היי-בול).
Steps:\n${steps.map((s, i) => `${i + 1}. ${s}`).join('\n')}`;
  const res = await askJson('translate', schema, [prompt]);
  const he = Array.isArray(res.steps) && res.steps.length === steps.length ? res.steps : null;
  if (!he) throw new Error('תרגום חלקי');
  try { localStorage.setItem(lsKey, JSON.stringify(he)); } catch { /* ignore */ }
  setDoc(ref, { steps: he }).catch(() => {});
  return he;
}
