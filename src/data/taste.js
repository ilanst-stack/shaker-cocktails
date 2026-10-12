// לימוד הטעם: מכל דירוג (0–5) ומכל מועדף לומדים אילו מאפיינים אהבת (בסיס, משפחת טעם, מצרכים, חוזק)
// וכל קוקטייל שלא דירגת ולא במועדפים מקבל ציון לפי הדמיון למה שאהבת.
// אות לכל משקה: דירוג − 2.5 (0 → −2.5, 5 → +2.5); מועדף בלי דירוג = כמו 4 (+1.5); מועדף עם דירוג = +0.5 בונוס.
// ערך מאפיין = סכום האותות / (מספר המשקאות שבהם הופיע + 1) — כך מאפיין שחוזר בהרבה משקאות שאהבת
// חזק יותר ממאפיין של משקה בודד, גם אם המשקה הבודד קיבל 5.
import { strengthOf } from './match.js';

function features(entry) {
  const f = [`base:${entry.base}`];
  for (const fam of entry.families) f.push(`fam:${fam}`);
  for (const i of entry.drink.ingredients) f.push(`ing:${i.group}`);
  const s = strengthOf(entry.drink);
  f.push(s > 0.7 ? 'str:strong' : s > 0.35 ? 'str:medium' : 'str:light');
  return [...new Set(f)];
}

const WEIGHT = { base: 1.2, fam: 1, ing: 0.5, str: 0.8 };

export function signals(ratings, favorites) {
  const sig = {};
  for (const [id, r] of Object.entries(ratings || {})) if (typeof r === 'number') sig[id] = r - 2.5;
  for (const id of favorites || []) sig[id] = sig[id] != null ? sig[id] + 0.5 : 1.5;
  return sig;
}

export function learnProfile(index, ratings, favorites) {
  const sum = new Map(), cnt = new Map();
  const byId = new Map(index.map((e) => [e.drink.id, e]));
  for (const [id, c] of Object.entries(signals(ratings, favorites))) {
    const e = byId.get(id);
    if (!e) continue;
    for (const f of features(e)) { sum.set(f, (sum.get(f) || 0) + c); cnt.set(f, (cnt.get(f) || 0) + 1); }
  }
  const profile = new Map();
  for (const [f, s] of sum) profile.set(f, s / (cnt.get(f) + 1));
  return profile;
}

export function scoreEntry(entry, profile) {
  let score = 0;
  for (const f of features(entry)) {
    const p = profile.get(f);
    if (p != null) score += p * WEIGHT[f.split(':')[0]];
  }
  return score;
}

export function recommend(index, ratings, { limit = 20, maxGap = 1, favorites = [] } = {}) {
  const known = new Set(Object.keys(signals(ratings, favorites)));
  if (known.size < 2) return { needMore: 2 - known.size, items: [] };
  const profile = learnProfile(index, ratings, favorites);
  const items = index
    .filter((e) => !known.has(e.drink.id) && e.gap <= maxGap)
    .map((e) => ({ ...e, score: scoreEntry(e, profile) - e.gap * 0.8 }))
    .filter((e) => e.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
  return { needMore: 0, items, top: topLikes(profile) };
}

const LABELS = {
  base: { vodka: 'וודקה', gin: 'ג׳ין', rum: 'רום', tequila: 'טקילה', whiskey: 'וויסקי', brandy: 'ברנדי', wine: 'יין ובועות', liqueur: 'ליקרים', none: 'ללא אלכוהול' },
  fam: { creamy: 'קרמי', citrus: 'הדרים', fizzy: 'מוגז', fruity: 'פירותי', coffee: 'קפה ושוקולד', bitter: 'מריר' },
  str: { strong: 'חזק', medium: 'בינוני', light: 'קליל' },
};

function topLikes(profile) {
  return [...profile.entries()]
    .filter(([f, v]) => v > 0.4 && LABELS[f.split(':')[0]])
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([f]) => { const [t, k] = f.split(':'); return LABELS[t][k]; })
    .filter(Boolean);
}
