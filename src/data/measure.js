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

export function fmtMl(ml) {
  if (ml == null) return '';
  if (ml < 1) return 'כמה טיפות';
  if (ml < 3) return `${Math.round(ml)} דאש`;
  return `${Math.round(ml)} מ״ל`;
}
