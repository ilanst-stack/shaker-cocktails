import { test } from 'node:test';
import assert from 'node:assert/strict';
import { toMl } from './measure.js';
import { normalizeDrink } from './cocktails.js';
import { buildIndex } from './match.js';
import { recommend } from './taste.js';
import { groupOf } from './ingredients.js';

const raw = (id, name, ings, extra = {}) => {
  const d = { idDrink: id, strDrink: name, strGlass: 'Highball glass', strAlcoholic: 'Alcoholic', strCategory: 'Cocktail', strInstructions: 'Mix. Serve.', strDrinkThumb: 'x', ...extra };
  ings.forEach(([n, m], k) => { d[`strIngredient${k + 1}`] = n; d[`strMeasure${k + 1}`] = m; });
  return normalizeDrink(d);
};

const DRINKS = [
  raw('1', 'Moscow Mule', [['Vodka', '2 oz'], ['Lime juice', '1/2 oz'], ['Ginger beer', '4 oz'], ['Ice', '']], { strGlass: 'Copper Mug' }),
  raw('2', 'Cosmopolitan', [['Absolut Citron', '1 1/4 oz'], ['Lime juice', '1/4 oz'], ['Cointreau', '1/4 oz'], ['Cranberry juice', '1/4 cup']]),
  raw('3', 'White Russian', [['Vodka', '2 oz'], ['Coffee liqueur', '1 oz'], ['Light cream', 'Fill']]),
  raw('4', 'Daiquiri', [['Light rum', '1 1/2 oz'], ['Lime', 'Juice of 1/2'], ['Powdered sugar', '1 tsp']]),
  raw('5', 'Screwdriver', [['Vodka', '2 oz'], ['Orange juice', '4 oz']]),
  raw('6', 'Gin Tonic', [['Gin', '2 oz'], ['Tonic water', '5 oz'], ['Lime', '1 slice']]),
  raw('7', 'Martini', [['Gin', '1 2/3 oz'], ['Dry Vermouth', '1/3 oz'], ['Olive', '1']], { strGlass: 'Cocktail glass' }),
];

test('measure parsing', () => {
  assert.equal(toMl('1 1/2 oz'), 45);
  assert.equal(toMl('2 cl'), 20);
  assert.equal(toMl('1/4 cup'), 60);
  assert.equal(toMl('1 tsp'), 5);
  assert.equal(toMl('1 slice'), null);
  assert.equal(toMl('Fill'), 120);
  assert.equal(toMl('½ oz'), 15);
});

test('ingredient groups', () => {
  assert.equal(groupOf('Ginger ale').key, 'ginger ale');
  assert.equal(groupOf('Gin').key, 'gin');
  assert.equal(groupOf('Absolut Citron').key, 'vodka');
  assert.equal(groupOf('Añejo rum').key, 'dark rum');
  assert.equal(groupOf('Cointreau').key, 'triple sec');
});

const INV = [
  { key: 'vodka', he: 'וודקה', unlimited: false, amount: 250 },
  { key: 'lime', he: 'ליים', unit: 'pcs', unlimited: true },
  { key: 'ginger beer', he: 'ג׳ינג׳ר ביר', unlimited: false, amount: 1000 },
  { key: 'orange juice', he: 'מיץ תפוזים', unlimited: false, amount: 1000 },
  { key: 'dark rum', he: 'רום כהה', unlimited: false, amount: 700 },
  { key: 'sugar', he: 'סוכר', unlimited: true },
];

test('matching, servings, substitutes, missing', () => {
  const idx = Object.fromEntries(buildIndex(DRINKS, INV).map((e) => [e.drink.name, e]));
  assert.equal(idx['Moscow Mule'].ready, true);
  assert.equal(idx['Moscow Mule'].servings, 4); // 250 / 60
  assert.equal(idx['Moscow Mule'].base, 'vodka');
  assert.ok(idx['Moscow Mule'].families.includes('fizzy'));
  assert.equal(idx['Screwdriver'].servings, 4);
  assert.equal(idx['Cosmopolitan'].ready, false);
  assert.deepEqual(idx['Cosmopolitan'].missing.map((i) => i.group).sort(), ['cranberry juice', 'triple sec']);
  assert.equal(idx['Daiquiri'].ready, true); // רום כהה במקום לבן
  assert.equal(idx['Daiquiri'].subs.length, 1);
  assert.equal(idx['Daiquiri'].base, 'rum');
  assert.equal(idx['White Russian'].gap, 2);
  assert.equal(idx['Martini'].optionalMissing.length, 1);
  assert.equal(idx['Gin Tonic'].base, 'gin');
});

test('not enough quantity', () => {
  const idx = buildIndex(DRINKS, [{ key: 'vodka', unlimited: false, amount: 30, he: 'וודקה' }, { key: 'orange juice', unlimited: true, he: 'x' }]);
  const s = idx.find((e) => e.drink.name === 'Screwdriver');
  assert.equal(s.ready, false);
  assert.equal(s.notEnough.length, 1);
});

test('recommendations learn from ratings', () => {
  const idx = buildIndex(DRINKS, INV);
  assert.equal(recommend(idx, { 1: 5 }).needMore, 1);
  const r = recommend(idx, { 1: 5, 7: 0 }, { maxGap: 2 });
  assert.ok(r.items.length > 0);
  // אהב וודקה מוגזת, לא אהב מרטיני ג'ין → קוקטייל וודקה לפני ג'ין טוניק
  const names = r.items.map((e) => e.drink.name);
  assert.ok(!names.includes('Gin Tonic') || names.indexOf('Screwdriver') < names.indexOf('Gin Tonic'));
});

import { toAmount } from './measure.js';
import { sortEntries, alcoholOf, prepMinutesOf } from './match.js';
import { migrateInventory } from './ingredients.js';

test('units: eggs, citrus, sugar', () => {
  assert.equal(toAmount('1', null, 'pcs', 30), 1);
  assert.equal(toAmount('1 tblsp', 15, 'pcs', 30), 0.5);
  assert.equal(toAmount('Juice of 1/2', null, 'pcs', 25), 0.5);
  assert.equal(toAmount('1/2 oz', 15, 'pcs', 30), 0.5);
  assert.equal(toAmount('1 wedge', null, 'pcs', 25), 0.125);
  assert.equal(toAmount('2 tsp', 10, 'g', null), 8);
  assert.equal(toAmount('1 cube', null, 'g', null), 4);
  const d = raw('9', 'Whiskey Sour', [['Bourbon', '2 oz'], ['Lemon juice', '3/4 oz'], ['Sugar', '1 tsp'], ['Egg white', '1']]);
  const egg = d.ingredients.find((i) => i.group === 'egg');
  assert.equal(egg.unit, 'pcs'); assert.equal(egg.amount, 1);
  const idx = buildIndex([d], [
    { key: 'bourbon', unit: 'ml', amount: 700 }, { key: 'lemon', unit: 'pcs', amount: 2 },
    { key: 'sugar', unit: 'g', unlimited: true }, { key: 'egg', unit: 'pcs', amount: 3 },
  ]);
  assert.equal(idx[0].ready, true);
  assert.equal(idx[0].servings, 2); // 2 לימונים / 0.75 לכוס = 2
});

test('migration of old ml-based eggs', () => {
  const m = migrateInventory([{ key: 'egg', kind: 'dairy', amount: 500, unlimited: false }]);
  assert.equal(m[0].unit, 'pcs');
  assert.equal(m[0].amount, 6);
});

test('alcohol, time, sorting', () => {
  const mm = DRINKS[0];
  assert.equal(alcoholOf(mm).pure, 24); // 60ml * 40%
  assert.ok(prepMinutesOf({ ...mm, instructions: 'Shake with ice and strain.' }) > prepMinutesOf({ ...mm, instructions: 'Pour.' }));
  const idx = buildIndex(DRINKS, INV);
  const byAlc = sortEntries(idx, 'alcohol', 'desc', {}).map((e) => e.alcohol.pure);
  assert.deepEqual(byAlc, [...byAlc].sort((a, b) => b - a));
  const byRate = sortEntries(idx, 'rating', 'desc', { ratings: { 5: 2, 1: 5 } }).map((e) => e.drink.id);
  assert.deepEqual(byRate.slice(0, 2), ['1', '5']);
  const asc = sortEntries(idx, 'rating', 'asc', { ratings: { 5: 2, 1: 5 } }).map((e) => e.drink.id);
  assert.deepEqual(asc.slice(0, 2), ['5', '1']);
  const fav = sortEntries(idx, 'fav', 'desc', { favorites: ['7'] });
  assert.equal(fav[0].drink.id, '7');
});

test('lemon juice from fresh lemons, syrup is not juice', () => {
  const d = raw('20', 'Sour', [['Vodka', '2 oz'], ['Lemon juice', '1 oz']]);
  assert.equal(d.ingredients[1].group, 'lemon juice');
  const [e] = buildIndex([d], [{ key: 'vodka', unit: 'ml', amount: 700 }, { key: 'lemon', unit: 'pcs', amount: 3 }]);
  assert.equal(e.ready, true);
  assert.equal(e.servings, 3); // 30 מ"ל = לימון אחד לכוס
  assert.equal(e.subs[0].squeeze, true);
  assert.equal(groupOf('Passion fruit syrup').key, 'passion fruit syrup');
});

import { customToDrink } from './customModel.js';
test('house recipe converts and matches inventory', () => {
  const d = customToDrink('abc', { name: 'הסוד של צורן', glass: 'Highball glass', steps: ['קרח', 'מוזגים'], ingredients: [
    { name: 'וודקה', qty: 50, unit: 'ml' }, { name: 'מיץ לימון', qty: 2, unit: 'tbsp' }, { name: 'נענע', qty: 6, unit: 'pcs' },
  ] });
  assert.equal(d.id, 'c_abc');
  assert.equal(d.ingredients[0].group, 'vodka');
  assert.equal(d.ingredients[1].ml, 30);
  assert.equal(d.alcoholic, 'Alcoholic');
  const [e] = buildIndex([d], [{ key: 'vodka', unit: 'ml', amount: 500 }, { key: 'lemon', unit: 'pcs', amount: 10 }, { key: 'mint', unit: 'pcs', unlimited: true }]);
  assert.equal(e.ready, true);
  assert.equal(e.servings, 10);
});
