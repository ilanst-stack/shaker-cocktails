// מודל המלאי: כל שורה = בקבוק/מוצר (יכולים להיות כמה מאותו סוג, עם מותגים שונים)
// { id, key, he, kind, unit, unlimited, amount, brand?, brandHe?, label?, cat?, free? }
import { getGroup, unitOf } from './ingredients.js';
import { isReadyKey } from './brands.js';
import { isAlcoholKey } from './age.js';

export const KIND_ORDER = ['spirit', 'liqueur', 'wine', 'ready', 'juice', 'mixer', 'fresh', 'sweet', 'dairy', 'garnish', 'other'];
export const KIND_HE = { spirit: 'אלכוהול', liqueur: 'ליקרים', wine: 'יין, ורמוט ובירה', ready: 'קוקטיילים מוכנים', juice: 'מיצים', mixer: 'מוגזים ומשקאות', fresh: 'פירות ועשבים', sweet: 'ממתיקים וסירופים', dairy: 'חלב וביצים', garnish: 'תבלינים וקישוטים', other: 'אחר' };

let seq = 0;
export const newId = () => `i${Date.now().toString(36)}${(seq++).toString(36)}`;

// פריט חופשי (לא מהמאגר) או קוקטייל מוכן — מותר להעביר בין קטגוריות
export const isMovable = (it) => it.free || isReadyKey(it.key) || !getGroup(it.key);
export const catOf = (it) => (isMovable(it) && it.cat) || it.kind || getGroup(it.key)?.kind || (isReadyKey(it.key) ? 'ready' : 'other');

// מזהה לכל שורה (מלאי ישן נשמר בלי מזהים)
export function ensureIds(inv) {
  const used = new Set();
  return (inv || []).map((it) => {
    let id = it.id || `k_${it.key}`;
    while (used.has(id)) id += '_';
    used.add(id);
    return id === it.id ? it : { ...it, id };
  });
}

// סף "מתמעט" לפי סוג המצרך
export function lowThreshold(it) {
  const unit = it.unit || unitOf(it.key);
  if (unit === 'pcs') return 2;
  if (unit === 'g') return 100;
  if (it.key === 'angostura') return 20;
  return 100;
}
export const isOut = (it) => !it.unlimited && !(Number(it.amount) > 0);
export const isLow = (it) => !it.unlimited && Number(it.amount) > 0 && Number(it.amount) < lowThreshold(it);

// הזזה בתוך קטגוריה: מחליפים מקום עם השכן הקודם/הבא באותה קטגוריה
export function moveWithinCat(inv, id, dir) {
  const i = inv.findIndex((x) => x.id === id);
  if (i < 0) return inv;
  const cat = catOf(inv[i]);
  let j = i + dir;
  while (j >= 0 && j < inv.length && catOf(inv[j]) !== cat) j += dir;
  if (j < 0 || j >= inv.length) return inv;
  const out = [...inv];
  [out[i], out[j]] = [out[j], out[i]];
  return out;
}
// גרירה: מעבירים את id למקום של targetId (רק באותה קטגוריה)
export function moveTo(inv, id, targetId) {
  const from = inv.findIndex((x) => x.id === id);
  const to = inv.findIndex((x) => x.id === targetId);
  if (from < 0 || to < 0 || from === to || catOf(inv[from]) !== catOf(inv[to])) return inv;
  const out = [...inv];
  const [it] = out.splice(from, 1);
  out.splice(to, 0, it);
  return out;
}

// "הכנתי": כמה יורד מכל שורה במלאי. need = Map(key → כמות לכוס) מ-matchDrink.
// יורד קודם מהבקבוק עם הכי מעט. לא יורד מתחת ל-0.
export function deductionPlan(inv, need, servings) {
  const changes = []; // { id, before, after }
  for (const [key, per] of need || []) {
    let left = Math.round(per * servings * 100) / 100;
    const rows = inv.filter((x) => x.key === key && !x.unlimited && Number(x.amount) > 0).sort((a, b) => a.amount - b.amount);
    if (!rows.length) continue;
    for (const r of rows) {
      if (left <= 0) break;
      const take = Math.min(r.amount, left);
      changes.push({ id: r.id, key, before: r.amount, after: Math.round((r.amount - take) * 100) / 100 });
      left -= take;
    }
    // ביקשת יותר ממה שרשום — הכל מתאפס (לא שלילי)
  }
  return changes;
}
export function applyChanges(inv, changes) {
  const m = new Map(changes.map((c) => [c.id, c.after]));
  return inv.map((x) => (m.has(x.id) ? { ...x, amount: m.get(x.id) } : x));
}

// שורה ברשימת הקניות נקנתה → מוסיפים למלאי (לאותה שורה אם יש מותג/מוצר זהה)
export function addPurchase(inv, item, mkItem) {
  const ml = item.qtyMl;
  const same = inv.find((x) => x.key === item.key && (x.brand || '') === (item.brand || '') && !x.unlimited);
  if (same) return inv.map((x) => (x === same ? { ...x, amount: Math.round(((Number(x.amount) || 0) + ml) * 100) / 100 } : x));
  return [...inv, { ...mkItem(item), amount: ml }];
}

// מתחת ל-18: מסתירים אלכוהול, קוקטיילים מוכנים ומוצרים חופשיים בקטגוריות אלכוהול
const ADULT_CATS = new Set(['spirit', 'liqueur', 'wine', 'ready']);
export const isAdultItem = (it) => isAlcoholKey(it.key) || isReadyKey(it.key) || ADULT_CATS.has(catOf(it)) || ADULT_CATS.has(it.kind);
