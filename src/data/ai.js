// חיבור משותף ל-Gemini (Firebase AI Logic) — מודל שמחזיר JSON לפי סכמה
import { getAI, getGenerativeModel, GoogleAIBackend } from 'firebase/ai';
import { app } from '../firebase.js';
import { geminiModel } from '../firebase-config.js';

let ai = null;
const cache = new Map();

export function jsonModel(name, schema) {
  if (cache.has(name)) return cache.get(name);
  ai = ai || getAI(app, { backend: new GoogleAIBackend() });
  const m = getGenerativeModel(ai, {
    model: geminiModel,
    generationConfig: { responseMimeType: 'application/json', responseSchema: schema },
  });
  cache.set(name, m);
  return m;
}

export async function askJson(name, schema, parts) {
  const res = await jsonModel(name, schema).generateContent(parts);
  try { return JSON.parse(res.response.text()); } catch { throw new Error('תשובה לא תקינה מ-Gemini'); }
}
