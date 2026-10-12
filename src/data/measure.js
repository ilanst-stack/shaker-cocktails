// המרת כמויות מהמאגר (oz, cl, shot, dash...) למיליליטרים

const UNITS = [
  [/\b(oz|ounces?|fl\.? ?oz)\b/, 30],
  [/\bcl\b/, 10],
  [/\bml\b/, 1],
  [/\bdl\b/, 100],
  [/\b(l|liters?|litres?)\b/, 1000],
  [/\b(shots?|jiggers?)\b/, 44],
  [/\b(measures?)\b/, 30],
  [/\b(cups?)\b/, 240],
  [/\b(glass(es)?|mugs?)\b/, 240],
  [/\b(pints?)\b/, 470],
  [/\b(tbsp|tblsp|tablespoons?)\b/, 15],
  [/\b(tsp|teaspoons?)\b/, 5],
  [/\b(splash(es)?)\b/, 10],
  [/\b(dash(es)?)\b/, 1],
  [/\b(drops?)\b/, 0.1],
  [/\b(bottles?)\b/, 330],
  [/\b(cans?)\b/, 330],
  [/\b(parts?)\b/, 30],
];

function parseNumber(str) {
  // "1 1/2", "1/2", "1.5", "2-3" (לוקחים את הממוצע)
  const range = str.match(/(\d+(?:\.\d+)?)\s*-\s*(\d+(?:\.\d+)?)/);
  if (range) return (parseFloat(range[1]) + parseFloat(range[2])) / 2;
  const mixed = str.match(/(\d+)\s+(\d+)\s*\/\s*(\d+)/);
  if (mixed) return +mixed[1] + +mixed[2] / +mixed[3];
  const frac = str.match(/(\d+)\s*\/\s*(\d+)/);
  if (frac) return +frac[1] / +frac[2];
  const num = str.match(/(\d+(?:\.\d+)?)/);
  if (num) return parseFloat(num[1]);
  return null;
}

export function toMl(measure) {
  if (!measure) return null;
  const m = String(measure).toLowerCase().replace(/½/g, ' 1/2').replace(/¼/g, ' 1/4').replace(/¾/g, ' 3/4').trim();
  if (/\b(fill|top|to taste|garnish)\b/.test(m)) return /fill|top/.test(m) ? 120 : null;
  for (const [re, ml] of UNITS) {
    if (re.test(m)) {
      const n = parseNumber(m);
      return Math.round((n ?? 1) * ml * 10) / 10;
    }
  }
  return null; // יחידות כמו "1 slice", "2 leaves" — לא נמדדות במ"ל
}

// הכמות ביחידה של המצרך (מ״ל / יחידות / גרמים) — לחישוב מול המלאי
export function toAmount(measure, ml, unit, pcsMl) {
  const m = String(measure || '').toLowerCase().replace(/½/g, ' 1/2').replace(/¼/g, ' 1/4').replace(/¾/g, ' 3/4').trim();
  const n = parseNumber(m);
  if (unit === 'ml') return ml;
  if (unit === 'g') {
    if (/\b(cubes?|lumps?)\b/.test(m)) return (n ?? 1) * 4;
    if (/\b(tsp|teaspoons?)\b/.test(m)) return (n ?? 1) * 4;
    if (/\b(tbsp|tblsp|tablespoons?)\b/.test(m)) return (n ?? 1) * 12;
    if (/\b(scoops?)\b/.test(m)) return (n ?? 1) * 70;
    if (/\b(cups?)\b/.test(m)) return (n ?? 1) * 200;
    if (/\b(pinch|dash)/.test(m)) return 0.5;
    if (ml) return Math.round(ml * 0.65); // סירופ סוכר: ~65% סוכר
    return n != null ? n * 4 : 4;
  }
  // יחידות (ביצים, פירות, עלים)
  if (/\b(wedges?|slices?|twists?|peels?|spirals?|zest|wheels?|rinds?)\b/.test(m)) return pcsMl ? (n ?? 1) * 0.125 : (n ?? 1);
  if (/juice of/.test(m)) return n ?? 1;
  if (ml && pcsMl) return Math.round((ml / pcsMl) * 100) / 100;
  if (ml && !pcsMl) return n ?? 1;
  return n ?? 1;
}

export function fmtNum(x) {
  if (x == null) return '';
  const frac = { 0.125: '⅛', 0.25: '¼', 0.5: '½', 0.75: '¾' };
  const whole = Math.floor(x), rest = Math.round((x - whole) * 1000) / 1000;
  if (frac[rest]) return whole ? `${whole}${frac[rest]}` : frac[rest];
  return String(Math.round(x * 10) / 10);
}

// תצוגת כמות במתכון
// מידות שנשארו באנגלית ("glass 1/6", "1 slice") → עברית
const HE_WORDS = [[/\bglass(es)?\b/g, 'כוס'], [/\bcups?\b/g, 'כוס'], [/\bslices?\b/g, 'פרוסה'], [/\bwedges?\b/g, 'פלח'], [/\btwists?\b/g, 'קליפה'],
  [/\bleaves\b|\bleaf\b/g, 'עלים'], [/\bsprigs?\b/g, 'ענף'], [/\bpinch\b/g, 'קורט'], [/\bscoops?\b/g, 'כדור'], [/\bstrong\b/g, 'חזק'], [/\bblack\b/g, 'שחור'],
  [/\bhot\b/g, 'חם'], [/\bcold\b/g, 'קר'], [/\bfresh\b/g, 'טרי'], [/\bjuice of\b/g, 'מיץ מ-'], [/\bto taste\b/g, 'לפי הטעם'], [/\bgarnish\b/g, 'לקישוט'], [/\bwhole\b/g, 'שלם'], [/\bpiece\b/g, 'חתיכה']];
export function measureHe(m) {
  let s = String(m || '').toLowerCase();
  for (const [re, he] of HE_WORDS) s = s.replace(re, he);
  return s.trim();
}

export function fmtIngredient(ing) {
  if (ing.unit === 'g' && ing.amount) return `${Math.round(ing.amount)} גר׳`;
  if (ing.unit === 'pcs' && ing.amount && !(ing.ml && ing.ml >= 3)) return `${fmtNum(ing.amount)} יח׳`;
  if (ing.ml) return fmtMl(ing.ml);
  return ing.measure ? measureHe(ing.measure) : 'לפי הטעם';
}

export function fmtMl(ml) {
  if (ml == null) return '';
  if (ml < 1) return 'כמה טיפות';
  if (ml < 3) return `${Math.round(ml)} דאש`;
  return `${Math.round(ml)} מ״ל`;
}
