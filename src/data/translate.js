// תרגום הוראות ההכנה לעברית עם Gemini, עם שמירה במטמון (בדפדפן וב-Firestore) כדי לתרגם כל קוקטייל פעם אחת
import { Schema } from 'firebase/ai';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase.js';
import { askJson } from './ai.js';

const LS = 'shaker.tr.v2.';
const schema = Schema.object({ properties: { steps: Schema.array({ items: Schema.string() }) } });

// מסיר מספור כפול שהמודל לפעמים מוסיף ("1. ", "2) ", "שלב 3:")
const clean = (s) => String(s || '').replace(/^\s*(שלב\s*)?\d+\s*[.):\-–]\s*/, '').trim();

// מתאים את מספר השורות למספר השלבים, גם אם המודל איחד או פיצל
function fit(he, n) {
  const out = he.map(clean).filter(Boolean);
  while (out.length > n) { const last = out.pop(); out[out.length - 1] += ` ${last}`; }
  while (out.length < n) out.push('');
  return out;
}

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

export async function translateSteps(uid, drinkId, steps) {
  const lsKey = LS + drinkId;
  try { const c = JSON.parse(localStorage.getItem(lsKey)); if (c?.length === steps.length) return c; } catch { /* ignore */ }
  const ref = doc(db, 'users', uid, 'tr2', drinkId);
  try {
    const snap = await getDoc(ref);
    const he = snap.exists() ? snap.data().steps : null;
    if (he?.length === steps.length) { localStorage.setItem(lsKey, JSON.stringify(he)); return he; }
  } catch { /* ממשיכים לתרגום */ }

  const prompt = `Translate each cocktail preparation step from English into short, natural Hebrew for a home bartender.
Input is a JSON array of ${steps.length} strings. Return "steps": an array of exactly ${steps.length} Hebrew strings, same order.
Do NOT add numbering. Keep numbers and units. Use common Israeli bar terms (שייקר, לסנן, לערבב, כוס היי-בול).
Input: ${JSON.stringify(steps)}`;

  let lastErr;
  for (let attempt = 0; attempt < 1; attempt++) {
    try {
      const res = await askJson('translate', schema, [prompt]);
      if (!Array.isArray(res.steps) || !res.steps.length) throw new Error('תרגום ריק');
      const he = fit(res.steps, steps.length);
      try { localStorage.setItem(lsKey, JSON.stringify(he)); } catch { /* ignore */ }
      setDoc(ref, { steps: he }).catch(() => {});
      return he;
    } catch (e) {
      lastErr = e;
      console.warn('translate attempt failed', attempt + 1, e);
      await wait(1500 * (attempt + 1)); // מכסת בקשות לדקה — מחכים ומנסים שוב
    }
  }
  throw lastErr;
}
