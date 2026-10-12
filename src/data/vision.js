// זיהוי בקבוקים ומצרכים מתמונה בעזרת Gemini (Firebase AI Logic)
import { Schema } from 'firebase/ai';
import { askJson } from './ai.js';
import { GROUPS, getGroup, unitOf } from './ingredients.js';

let schema = null;
function getSchema() {
  if (schema) return schema;
  const keys = [...GROUPS.filter((g) => !g.assumed).map((g) => g.key), 'other'];
  schema = Schema.object({
        properties: {
          items: Schema.array({
            items: Schema.object({
              properties: {
                label: Schema.string({ description: 'Product name as written on the label, e.g. "Bombay Sapphire London Dry Gin"' }),
                key: Schema.enumString({ enum: keys, description: 'Best matching ingredient category' }),
                bottleMl: Schema.number({ description: 'Full container size in ml (typical: 50, 200, 330, 500, 700, 750, 1000, 1500). 0 for fruit/eggs.' }),
                fillPercent: Schema.number({ description: 'Estimated remaining liquid, 0-100, judged from the visible liquid level. 100 if sealed/unclear.' }),
                count: Schema.number({ description: 'Number of units for countable items (eggs, lemons, limes, oranges). Otherwise 1 (number of identical bottles).' }),
                confidence: Schema.number({ description: 'Confidence 0-1 that the identification is correct' }),
              },
            }),
          }),
        },
      });
  return schema;
}

const PROMPT = `You are helping fill a home-bar inventory for a cocktail app.
Look at the photo and list EVERY drink-related product you can identify: spirits, liqueurs, wines, beers,
mixers (soda, tonic, cola, ginger beer), juices, syrups, bitters, plus cocktail fruit (lemons, limes, oranges) and eggs.
For each item give the label text, the best matching category key, container size, estimated fill level, count and confidence.
Notes: Cointreau / Grand Marnier / Triple Sec → "triple sec". Kahlua → "coffee liqueur". Baileys → "irish cream".
Martini Rosso → "sweet vermouth". Martini Extra Dry → "dry vermouth". Prosecco/Cava/Champagne → "sparkling wine".
Arak → "arak". Ouzo → "ouzo". Pernod/Ricard/Pastis → "pastis". Absinthe → "absinthe". Sambuca → "sambuca". Spiced/gold/dark rum → "dark rum", white/silver rum → "white rum". Jägermeister → "herbal liqueur".
Syrups (Monin, Vedrenne, Teisseire...) are NOT juices: passion fruit syrup → "passion fruit syrup", each flavored syrup has its own key: orgeat/almond → "orgeat", elderflower → "elderflower syrup", raspberry → "raspberry syrup", strawberry → "strawberry syrup", blackberry/blueberry/cassis → "blackberry syrup", peach → "peach syrup", cinnamon → "cinnamon syrup", hazelnut → "hazelnut syrup", caramel → "caramel syrup", lavender → "lavender syrup", rose → "rose syrup", mango → "mango syrup", vanilla → "vanilla", coconut → "coconut", mint → "mint", ginger → "ginger", chocolate → "chocolate syrup", any other flavor → "flavored syrup", sugar syrup → "sugar", grenadine → "grenadine".
Bottled lemon/lime juice → "lemon juice"/"lime juice"; whole fruit → "lemon"/"lime"/"orange" with count.
Ignore items that are not drink ingredients. If two identical bottles appear, use count 2.`;

// מחזיר רשימת הצעות להוספה למלאי
export async function identifyBottles(dataUrl) {
  const [meta, b64] = dataUrl.split(',');
  const mimeType = meta.match(/data:(.*?);/)?.[1] || 'image/jpeg';
  const parsed = await askJson('vision', getSchema(), [PROMPT, { inlineData: { data: b64, mimeType } }]);
  const merged = new Map();
  for (const it of parsed.items || []) {
    const g = getGroup(it.key);
    if (!g) continue;
    const unit = unitOf(g.key);
    const count = Math.max(1, Math.round(it.count || 1));
    let amount;
    if (unit === 'pcs') amount = count;
    else if (unit === 'g') amount = 1000;
    else amount = Math.round(((it.bottleMl || 700) * Math.min(100, Math.max(0, it.fillPercent ?? 100)) / 100) * count / 10) * 10;
    const prev = merged.get(g.key);
    if (prev) { prev.amount += amount; prev.labels.push(it.label); prev.confidence = Math.min(prev.confidence, it.confidence ?? 0.5); }
    else merged.set(g.key, { key: g.key, he: g.he, unit, amount, labels: [it.label], confidence: it.confidence ?? 0.5 });
  }
  return [...merged.values()].sort((a, b) => b.confidence - a.confidence);
}
