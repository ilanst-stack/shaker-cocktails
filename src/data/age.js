// הגבלת גיל: מתחת ל-18 — רק מוקטיילים (בלי אלכוהול, גם לא יין ובירה)
import { getGroup, groupOf } from './ingredients.js';

const PENDING = 'shaker.age.pending';
const ALCOHOL_KINDS = new Set(['spirit', 'liqueur', 'wine']);

export const setPendingAge = (adult) => { try { localStorage.setItem(PENDING, adult ? 'adult' : 'minor'); } catch { /* ignore */ } };
export const clearPendingAge = () => { try { localStorage.removeItem(PENDING); } catch { /* ignore */ } };
export const getPendingAge = () => { try { const v = localStorage.getItem(PENDING); return v === 'adult' ? true : v === 'minor' ? false : null; } catch { return null; } };

export const isAlcoholKey = (key) => ALCOHOL_KINDS.has(getGroup(key)?.kind);
export const isAlcoholName = (name) => ALCOHOL_KINDS.has(groupOf(name)?.kind);

export function isAlcoholFree(drink) {
  if (!/^non.?alcoholic$/i.test(String(drink.alcoholic).trim())) return false; // כולל "Optional alcohol"
  return !drink.ingredients.some((i) => isAlcoholKey(i.group));
}
