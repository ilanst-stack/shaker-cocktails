// חיבור משותף ל-Gemini (Firebase AI Logic) — מודל שמחזיר JSON לפי סכמה
// כשהמודל הראשי עמוס (שגיאה 500/503/429) — מחכים, מנסים שוב, ובסוף עוברים למודל גיבוי
import { getAI, getGenerativeModel, GoogleAIBackend } from 'firebase/ai';
import { app } from '../firebase.js';
import { geminiModel, geminiFallbackModel } from '../firebase-config.js';

let ai = null;
const cache = new Map();

function model(modelName, schema, key) {
  const k = `${key}|${modelName}`;
  if (cache.has(k)) return cache.get(k);
  ai = ai || getAI(app, { backend: new GoogleAIBackend() });
  const m = getGenerativeModel(ai, {
    model: modelName,
    generationConfig: { responseMimeType: 'application/json', responseSchema: schema },
  });
  cache.set(k, m);
  return m;
}

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

// עמוס / זמנית לא זמין — שווה לנסות שוב
export function isBusyError(e) {
  return /\b(429|500|502|503|504)\b|high demand|overloaded|unavailable|resource.?exhausted/i.test(String(e?.message || e));
}

export async function askJson(name, schema, parts) {
  const plan = [
    [geminiModel, 0], [geminiModel, 2000], [geminiModel, 5000],
    ...(geminiFallbackModel ? [[geminiFallbackModel, 1000], [geminiFallbackModel, 4000]] : []),
  ];
  let lastErr;
  for (const [modelName, delay] of plan) {
    if (delay) await wait(delay);
    try {
      const res = await model(modelName, schema, name).generateContent(parts);
      try { return JSON.parse(res.response.text()); } catch { throw new Error('bad-json'); }
    } catch (e) {
      lastErr = e;
      console.warn(`Gemini ${modelName} failed`, e);
      if (!isBusyError(e) && e.message !== 'bad-json') break; // שגיאה שלא תיפתר בניסיון חוזר
    }
  }
  throw lastErr;
}
