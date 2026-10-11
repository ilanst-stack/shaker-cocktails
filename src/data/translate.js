// תרגום הוראות ההכנה לעברית עם Gemini, עם שמירה במטמון (בדפדפן וב-Firestore) כדי לתרגם כל קוקטייל פעם אחת
import { Schema } from 'firebase/ai';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase.js';
import { askJson } from './ai.js';

const LS = 'shaker.tr.v2.';
// אותיות שלא אמורות להופיע בתרגום עברי (ערבית, קירילית, סינית וכו')
const FOREIGN = /[\u0600-\u06FF\u0750-\u077F\u0400-\u04FF\u3040-\u30FF\u4E00-\u9FFF]/;
const clean_ok = (arr) => Array.isArray(arr) && !arr.some((x) => FOREIGN.test(x));
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
  try { const c = JSON.parse(localStorage.getItem(lsKey)); if (c?.length === steps.length && clean_ok(c)) return c; } catch { /* ignore */ }
  const ref = doc(db, 'users', uid, 'tr2', drinkId);
  try {
    const snap = await getDoc(ref);
    const he = snap.exists() ? snap.data().steps : null;
    if (he?.length === steps.length && clean_ok(he)) { localStorage.setItem(lsKey, JSON.stringify(he)); return he; }
  } catch { /* ממשיכים לתרגום */ }

  const prompt = `Translate each cocktail preparation step from English into short, natural Hebrew for a home bartender.
Input is a JSON array of ${steps.length} strings. Return "steps": an array of exactly ${steps.length} Hebrew strings, same order.
Do NOT add numbering. Keep numbers and units. Write ONLY Hebrew letters (plus digits and Latin brand names) - never Arabic or any other script. Use common Hebrew names for ingredients (passion fruit = פסיפלורה, lime = ליים). Use common Israeli bar terms (שייקר, לסנן, לערבב, כוס היי-בול).
Input: ${JSON.stringify(steps)}`;

  let lastErr;
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const res = await askJson('translate', schema, [prompt]);
      if (!Array.isArray(res.steps) || !res.steps.length) throw new Error('תרגום ריק');
      let he = fit(res.steps, steps.length);
      if (!clean_ok(he)) {
        if (attempt === 0) throw new Error('foreign-script'); // ננסה שוב
        he = he.map((x) => x.replace(new RegExp(FOREIGN.source, 'g'), '').replace(/\s{2,}/g, ' ').trim());
      }
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
