// התאמת קוקטיילים למלאי, חישוב "מספיק ל-X כוסות", וסיווג לקטגוריות
import { getGroup, unitOf, abvOf, pcsMlOf } from './ingredients.js';

// מצרכים שאפשר להחליף זה בזה (יוצג "במקום X אפשר Y")
const SUBS = {
  'white rum': ['dark rum'],
  'dark rum': ['white rum'],
  bourbon: ['whiskey'],
  whiskey: ['bourbon'],
  // מיץ הדרים: מבקבוק, או סחיטה מפרי טרי (מומר ליחידות)
  'lemon juice': ['lemon', 'lime juice', 'lime'],
  'lime juice': ['lime', 'lemon juice', 'lemon'],
  'orange juice': ['orange'],
  lemon: ['lime'],
  lime: ['lemon'],
  'passion fruit': ['passion fruit syrup'],
  'passion fruit syrup': ['passion fruit'],
  'ginger ale': ['ginger beer', 'lemon-lime soda'],
  'ginger beer': ['ginger ale'],
  'soda water': ['lemon-lime soda', 'tonic water'],
  'lemon-lime soda': ['soda water'],
  'triple sec': ['blue curacao'],
  milk: ['cream'],
  cream: ['milk'],
  'sparkling wine': ['white wine'],
  'white wine': ['rose wine'],
  'dry vermouth': ['bianco vermouth'],
  'irish cream': ['cacao liqueur'],
  arak: ['ouzo'],
  ouzo: ['arak'],
  pastis: ['absinthe'],
  absinthe: ['pastis'],
};

const SQUEEZE = { 'lemon juice': 'lemon', 'lime juice': 'lime', 'orange juice': 'orange' };

// כמה בקבוקים מאותו סוג (למשל Bacardi + Havana Club) נספרים יחד. כמות 0 = אין.
export function inventoryMap(inventory) {
  const m = new Map();
  for (const it of inventory || []) {
    if (!it.unlimited && !(Number(it.amount) > 0)) continue;
    const cur = m.get(it.key);
    if (!cur) { m.set(it.key, { ...it }); continue; }
    m.set(it.key, { ...cur, unlimited: cur.unlimited || it.unlimited, amount: (Number(cur.amount) || 0) + (Number(it.amount) || 0) });
  }
  return m;
}

const KIND_ALC = new Set(['spirit', 'liqueur', 'wine']);
// כמה מ״ל בכוס אחת לפי המתכון (לבקבוק קוקטייל מוכן): סכום הנוזלים, בלי קרח וקישוט
export function servingMl(drink) {
  let total = 0;
  for (const i of drink.ingredients) {
    const g = getGroup(i.group);
    if (g?.assumed || g?.optional || i.unit === 'pcs' || i.unit === 'g') continue;
    total += i.ml ?? (KIND_ALC.has(g?.kind) ? 30 : 60);
  }
  return total < 40 ? 90 : Math.round(total);
}

export function matchDrink(drink, inv) {
  // בקבוק מוכן של הקוקטייל הזה במלאי → מוכן, בלי קשר למצרכים
  const rb = inv.get(`ready:${drink.name}`);
  if (rb) {
    const per = servingMl(drink);
    const servings = rb.unlimited ? null : Math.floor((Number(rb.amount) || 0) / per);
    return { drink, missing: [], optionalMissing: [], subs: [], notEnough: [], servings, ready: true, gap: 0, need: new Map(rb.unlimited ? [] : [[rb.key, per]]), readyBottle: rb, servingMl: per };
  }
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
      if (alt) { have = inv.get(alt); subs.push({ ing, using: have, squeeze: SQUEEZE[ing.group] === alt }); }
    }
    if (!have) {
      (g?.optional ? optionalMissing : missing).push(ing);
      continue;
    }
    // הכמות ביחידה של המצרך במלאי (מ״ל / יח׳ / גר׳). בהחלפה ליחידה אחרת — לא מחשבים
    const haveUnit = have.unit || unitOf(have.key);
    let amt = haveUnit === ing.unit ? ing.amount : null;
    // מידה לא מוכרת ("a dash of…", "1 part"…) לאלכוהול עם כמות במלאי — לא "בלי הגבלה", אלא 30 מ״ל
    if (amt == null && haveUnit === 'ml' && !have.unlimited && KIND_ALC.has(getGroup(have.key)?.kind)) amt = 30;
    // מיץ שנסחט מפרי טרי: מ״ל במתכון → מספר פירות במלאי
    if (haveUnit === 'pcs' && ing.unit === 'ml' && ing.ml && pcsMlOf(have.key)) amt = Math.round((ing.ml / pcsMlOf(have.key)) * 100) / 100;
    if (!have.unlimited && amt) need.set(have.key, (need.get(have.key) || 0) + amt);
  }
  let servings = null; // null = בלי הגבלה
  const notEnough = [];
  for (const [key, per] of need) {
    const it = inv.get(key);
    const n = Math.floor(((Number(it.amount) || 0) + 1e-9) / per);
    if (n < 1) notEnough.push(it);
    servings = servings == null ? n : Math.min(servings, n);
  }
  const ready = missing.length === 0 && notEnough.length === 0;
  return { drink, missing, optionalMissing, subs, notEnough, servings, ready, gap: missing.length + notEnough.length, need };
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
  { id: 'citrus', he: 'הדרים', groups: ['lemon', 'lime', 'lemon juice', 'lime juice', 'orange juice', 'grapefruit juice', 'lemonade'] },
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

// ---- מדדים למיון
// אלכוהול נקי בכוס (מ״ל) = סכום (כמות × אחוז אלכוהול). מצרך אלכוהולי בלי כמות → מניחים 30 מ״ל
export function alcoholOf(drink) {
  let pure = 0, total = 0;
  for (const i of drink.ingredients) {
    const abv = abvOf(i.group);
    const ml = i.ml ?? (abv > 0 ? 30 : 0);
    total += ml;
    pure += (ml * abv) / 100;
  }
  return { pure: Math.round(pure * 10) / 10, abv: total ? Math.round((pure / total) * 100) : 0 };
}

// זמן הכנה משוער (דקות) לפי מספר המצרכים ופעולות בהוראות
const STEPS = [
  [/overnight|hours?\b|steep|infuse|refrigerate|freeze\b|marinate/, 60],
  [/heat|boil|simmer|warm|hot water|microwave/, 4],
  [/blend|blender/, 2],
  [/whip|whisk|dry shake/, 2],
  [/layer|float|carefully|slowly|back of a spoon/, 1.5],
  [/muddle|crush|mash/, 1],
  [/shake|shaker/, 1],
  [/rim|salt the|sugar the/, 1],
  [/stir/, 0.5],
  [/strain/, 0.3],
  [/chill/, 0.5],
];
export function prepMinutesOf(drink) {
  const text = String(drink.instructions || '').toLowerCase();
  let t = 1 + 0.25 * ingredientCountOf(drink);
  for (const [re, add] of STEPS) if (re.test(text)) t += add;
  return Math.max(1, Math.round(t * 2) / 2);
}

export function ingredientCountOf(drink) {
  return drink.ingredients.filter((i) => !getGroup(i.group)?.assumed).length;
}

export function buildIndex(drinks, inventory) {
  const inv = inventoryMap(inventory);
  return drinks.map((d) => ({
    ...matchDrink(d, inv), base: baseOf(d), families: familiesOf(d),
    alcohol: alcoholOf(d), minutes: prepMinutesOf(d), count: ingredientCountOf(d),
  }));
}

// ---- מיון
export const SORTS = [
  { id: 'match', he: 'הכי מתאים', dir: 'desc' },
  { id: 'fav', he: 'מועדפים בראש', dir: 'desc' },
  { id: 'rating', he: 'לפי דירוג', dir: 'desc' },
  { id: 'alcohol', he: 'כמות אלכוהול בכוס', dir: 'desc' },
  { id: 'time', he: 'זמן הכנה', dir: 'asc' },
  { id: 'count', he: 'מספר מצרכים', dir: 'asc' },
  { id: 'name', he: 'שם (א–ת / A–Z)', dir: 'asc' },
];

export function sortEntries(list, sortId, dir, user) {
  const sign = dir === 'asc' ? 1 : -1;
  const fav = new Set(user?.favorites || []);
  const ratings = user?.ratings || {};
  const byMatch = (a, b) => a.gap - b.gap || (b.servings ?? 99) - (a.servings ?? 99) || a.drink.name.localeCompare(b.drink.name);
  const val = {
    fav: (e) => (fav.has(e.drink.id) ? 1 : 0),
    alcohol: (e) => e.alcohol.pure,
    time: (e) => e.minutes,
    count: (e) => e.count,
  }[sortId];
  return [...list].sort((a, b) => {
    if (sortId === 'match') return dir === 'desc' ? byMatch(a, b) : -byMatch(a, b);
    if (sortId === 'name') return sign * a.drink.name.localeCompare(b.drink.name);
    if (sortId === 'rating') {
      const ra = ratings[a.drink.id], rb = ratings[b.drink.id];
      if (ra == null && rb == null) return byMatch(a, b);
      if (ra == null) return 1; // בלי דירוג — תמיד בסוף
      if (rb == null) return -1;
      return sign * (ra - rb) || byMatch(a, b);
    }
    return sign * (val(a) - val(b)) || byMatch(a, b);
  });
}
