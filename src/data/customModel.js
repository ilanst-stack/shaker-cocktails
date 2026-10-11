// מבנה "מתכון בית" והמרה לקוקטייל רגיל (בלי תלות ב-Firebase — לבדיקות)
import { getGroup, groupOf, norm, unitOf, pcsMlOf } from './ingredients.js';
import { toAmount } from './measure.js';

export const CUSTOM_PREFIX = 'c_';
export const isCustomId = (id) => String(id).startsWith(CUSTOM_PREFIX);

export const GLASSES = [
  { id: 'Highball glass', he: 'כוס היי-בול (גבוהה)' },
  { id: 'Old-fashioned glass', he: 'כוס נמוכה (רוקס)' },
  { id: 'Cocktail glass', he: 'כוס קוקטייל / מרטיני' },
  { id: 'Champagne flute', he: 'כוס שמפניה' },
  { id: 'Wine Glass', he: 'כוס יין' },
  { id: 'Copper Mug', he: 'ספל (נחושת / קפה)' },
  { id: 'Shot glass', he: 'כוס צ׳ייסר (שוט)' },
];

// יחידות לבחירה בטופס → כמה מ״ל ביחידה (null = לא נמדד בנפח)
export const FORM_UNITS = [
  { id: 'ml', he: 'מ״ל', ml: 1 },
  { id: 'cl', he: 'ס״ל', ml: 10 },
  { id: 'oz', he: 'oz', ml: 30 },
  { id: 'tsp', he: 'כפית', ml: 5 },
  { id: 'tbsp', he: 'כף', ml: 15 },
  { id: 'dash', he: 'דאש', ml: 1 },
  { id: 'pcs', he: 'יח׳', ml: null },
  { id: 'g', he: 'גר׳', ml: null },
  { id: 'taste', he: 'לפי הטעם', ml: null },
];

export function customToDrink(id, c) {
  const ingredients = (c.ingredients || []).filter((i) => i.name?.trim()).map((i) => {
    const g = (i.key && getGroup(i.key)) || groupOf(i.name);
    const group = g?.key || norm(i.name);
    const u = FORM_UNITS.find((x) => x.id === i.unit) || FORM_UNITS[0];
    const qty = Number(i.qty) || 0;
    const ml = u.ml && qty ? qty * u.ml : null;
    const gUnit = unitOf(group);
    let amount;
    if (gUnit === 'ml') amount = ml;
    else if (gUnit === 'pcs') amount = u.id === 'pcs' ? qty || 1 : toAmount(`${qty} ${u.id}`, ml, 'pcs', pcsMlOf(group));
    else amount = u.id === 'g' ? qty : toAmount(`${qty} ${u.id}`, ml, 'g', null);
    const measure = u.id === 'taste' ? 'to taste' : `${qty || ''} ${u.id === 'ml' ? 'ml' : u.id}`.trim();
    return { name: i.name.trim(), he: i.name.trim(), measure, ml, group, unit: gUnit, amount, key: g?.key || null };
  });
  const hasAlcohol = ingredients.some((i) => ['spirit', 'liqueur', 'wine'].includes(getGroup(i.group)?.kind));
  const steps = (c.steps || []).map((s) => s.trim()).filter(Boolean);
  return {
    id: CUSTOM_PREFIX + id,
    docId: id,
    custom: true,
    name: c.name || 'קוקטייל בלי שם',
    thumb: c.thumb || null,
    glass: c.glass || 'Highball glass',
    category: 'מתכון בית',
    alcoholic: hasAlcohol ? 'Alcoholic' : 'Non alcoholic',
    instructions: steps.join(' '),
    stepsHe: steps,
    notes: c.notes || '',
    ingredients,
    raw: c,
  };
}

