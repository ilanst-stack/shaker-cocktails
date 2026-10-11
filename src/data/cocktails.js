// טעינת כל המאגר מ-TheCocktailDB (חיפוש לפי אות ראשונה a–z, 0–9), שמירה במטמון לשבוע
import { groupOf, norm } from './ingredients.js';
import { toMl } from './measure.js';

const API = '/api/cocktaildb';
const CACHE_KEY = 'shaker.drinks.v1';
const CACHE_DAYS = 7;
const LETTERS = 'abcdefghijklmnopqrstuvwxyz0123456789'.split('');

export function normalizeDrink(d) {
  const ingredients = [];
  for (let i = 1; i <= 15; i++) {
    const name = d[`strIngredient${i}`];
    if (!name || !name.trim()) continue;
    const measure = (d[`strMeasure${i}`] || '').trim();
    const g = groupOf(name);
    ingredients.push({ name: name.trim(), measure, ml: toMl(measure), group: g?.key || norm(name) });
  }
  return {
    id: d.idDrink,
    name: d.strDrink,
    thumb: d.strDrinkThumb,
    glass: d.strGlass || '',
    category: d.strCategory || '',
    alcoholic: d.strAlcoholic || '',
    instructions: d.strInstructions || '',
    ingredients,
  };
}

async function fetchLetter(letter) {
  const res = await fetch(`${API}/search.php?f=${letter}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json();
  return Array.isArray(json.drinks) ? json.drinks : [];
}

export async function loadDrinks({ force = false, onProgress } = {}) {
  if (!force) {
    try {
      const cached = JSON.parse(localStorage.getItem(CACHE_KEY) || 'null');
      if (cached && Date.now() - cached.at < CACHE_DAYS * 864e5 && cached.drinks?.length) return cached.drinks;
    } catch { /* מטמון פגום — טוענים מחדש */ }
  }
  const all = [];
  let done = 0;
  // 6 בקשות במקביל, כדי לא להעמיס על השרת
  const queue = [...LETTERS];
  async function worker() {
    while (queue.length) {
      const l = queue.shift();
      try { all.push(...(await fetchLetter(l))); } catch { /* מדלגים על אות שנכשלה */ }
      done++;
      onProgress?.(done / LETTERS.length);
    }
  }
  await Promise.all(Array.from({ length: 6 }, worker));
  const seen = new Set();
  const drinks = all.filter((d) => !seen.has(d.idDrink) && seen.add(d.idDrink)).map(normalizeDrink);
  if (!drinks.length) throw new Error('לא הצלחתי לטעון מתכונים');
  try { localStorage.setItem(CACHE_KEY, JSON.stringify({ at: Date.now(), drinks })); } catch { /* אין מקום — ממשיכים בלי מטמון */ }
  return drinks;
}

// רשימת כל שמות המצרכים שמופיעים במאגר (להשלמה אוטומטית)
export function allIngredientNames(drinks) {
  const s = new Map();
  for (const d of drinks) for (const i of d.ingredients) s.set(norm(i.name), i.name);
  return [...s.values()].sort((a, b) => a.localeCompare(b));
}
