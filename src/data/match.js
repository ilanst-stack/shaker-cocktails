// התאמת קוקטיילים למלאי, חישוב "מספיק ל-X כוסות", וסיווג לקטגוריות
import { getGroup } from './ingredients.js';

// מצרכים שאפשר להחליף זה בזה (יוצג "במקום X אפשר Y")
const SUBS = {
  'white rum': ['dark rum'],
  'dark rum': ['white rum'],
  bourbon: ['whiskey'],
  whiskey: ['bourbon'],
  lemon: ['lime'],
  lime: ['lemon'],
  'ginger ale': ['ginger beer', 'lemon-lime soda'],
  'ginger beer': ['ginger ale'],
  'soda water': ['lemon-lime soda', 'tonic water'],
  'lemon-lime soda': ['soda water'],
  'triple sec': ['blue curacao'],
  milk: ['cream'],
  cream: ['milk'],
  'sparkling wine': ['white wine'],
};

export function inventoryMap(inventory) {
  const m = new Map();
  for (const it of inventory || []) m.set(it.key, it);
  return m;
}

export function matchDrink(drink, inv) {
  const missing = [];
  const optionalMissing = [];
  const subs = [];
  const need = new Map(); // מפתח במלאי → כמות נדרשת במ"ל לכוס
  for (const ing of drink.ingredients) {
    const g = getGroup(ing.group);
    if (g?.assumed) continue;
    let have = inv.get(ing.group);
    if (!have) {
      const alt = (SUBS[ing.group] || []).find((k) => inv.has(k));
      if (alt) { have = inv.get(alt); subs.push({ ing, using: have }); }
    }
    if (!have) {
      (g?.optional ? optionalMissing : missing).push(ing);
      continue;
    }
    if (!have.unlimited && ing.ml) need.set(have.key, (need.get(have.key) || 0) + ing.ml);
  }
  let servings = null; // null = בלי הגבלה
  const notEnough = [];
  for (const [key, ml] of need) {
    const it = inv.get(key);
    const n = Math.floor((Number(it.amount) || 0) / ml);
    if (n < 1) notEnough.push(it);
    servings = servings == null ? n : Math.min(servings, n);
  }
  const ready = missing.length === 0 && notEnough.length === 0;
  return { drink, missing, optionalMissing, subs, notEnough, servings, ready, gap: missing.length + notEnough.length };
}

// ---------- סיווג
export const BASES = [
  { id: 'vodka', he: 'וודקה', test: ['vodka'] },
  { id: 'gin', he: 'ג׳ין', test: ['gin'] },
  { id: 'rum', he: 'רום', test: ['white rum', 'dark rum', 'coconut rum', 'cachaca'] },
  { id: 'tequila', he: 'טקילה', test: ['tequila'] },
  { id: 'whiskey', he: 'וויסקי', test: ['whiskey', 'bourbon'] },
  { id: 'brandy', he: 'ברנדי', test: ['brandy'] },
  { id: 'wine', he: 'יין, בירה ובועות', test: ['sparkling wine', 'white wine', 'red wine', 'beer', 'cider', 'sweet vermouth', 'dry vermouth'] },
  { id: 'liqueur', he: 'ליקרים', test: [] },
  { id: 'none', he: 'ללא אלכוהול', test: [] },
];

const KIND_ALCOHOL = new Set(['spirit', 'liqueur', 'wine']);

export function baseOf(drink) {
  if (/non.?alcoholic/i.test(drink.alcoholic)) return 'none';
  for (const ing of drink.ingredients) {
    const b = BASES.find((x) => x.test.includes(ing.group));
    if (b && getGroup(ing.group)?.kind === 'spirit') return b.id;
  }
  for (const ing of drink.ingredients) {
    const b = BASES.find((x) => x.test.includes(ing.group));
    if (b) return b.id;
  }
  if (drink.ingredients.some((i) => KIND_ALCOHOL.has(getGroup(i.group)?.kind))) return 'liqueur';
  return /alcoholic/i.test(drink.alcoholic) ? 'liqueur' : 'none';
}

export const FAMILIES = [
  { id: 'creamy', he: 'קרמי', groups: ['cream', 'milk', 'irish cream', 'coconut', 'ice cream', 'egg'] },
  { id: 'citrus', he: 'הדרים', groups: ['lemon', 'lime', 'orange juice', 'grapefruit juice', 'lemonade'] },
  { id: 'fizzy', he: 'מוגז', groups: ['soda water', 'tonic water', 'cola', 'ginger ale', 'ginger beer', 'lemon-lime soda', 'sparkling wine', 'beer', 'energy drink'] },
  { id: 'fruity', he: 'פירותי', groups: ['pineapple juice', 'cranberry juice', 'passion fruit', 'mango', 'strawberries', 'banana', 'berries', 'apple juice', 'melon liqueur', 'peach schnapps', 'raspberry liqueur'] },
  { id: 'coffee', he: 'קפה ושוקולד', groups: ['coffee', 'coffee liqueur', 'cacao liqueur', 'chocolate syrup'] },
  { id: 'bitter', he: 'מריר', groups: ['campari', 'aperol', 'angostura', 'sweet vermouth', 'herbal liqueur'] },
];

export function familiesOf(drink) {
  const gs = new Set(drink.ingredients.map((i) => i.group));
  return FAMILIES.filter((f) => f.groups.some((g) => gs.has(g))).map((f) => f.id);
}

export function strengthOf(drink) {
  let alc = 0, total = 0;
  for (const i of drink.ingredients) {
    const ml = i.ml ?? 0;
    total += ml;
    if (KIND_ALCOHOL.has(getGroup(i.group)?.kind)) alc += ml;
  }
  return total ? alc / total : 0;
}

export function buildIndex(drinks, inventory) {
  const inv = inventoryMap(inventory);
  return drinks.map((d) => ({ ...matchDrink(d, inv), base: baseOf(d), families: familiesOf(d) }));
}
