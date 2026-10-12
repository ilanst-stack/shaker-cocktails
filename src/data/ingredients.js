// מילון מצרכים: שם בעברית, השמות האנגליים במאגר TheCocktailDB, צבע לאינפוגרפיקה, וסוג
// kind: spirit | liqueur | wine | juice | mixer | sweet | dairy | fresh | garnish
// unlimited: ברירת מחדל "בלי הגבלה" כשמוסיפים למלאי
// optional: קישוט — אם חסר, הקוקטייל עדיין נחשב "מוכן"
// assumed: תמיד קיים בבית (מים, קרח) — לא צריך להוסיף למלאי

export const GROUPS = [
  // ---- אלכוהול בסיסי
  { key: 'vodka', he: 'וודקה', kind: 'spirit', color: '#DCEBF5', aliases: ['vodka', 'absolut vodka', 'absolut citron', 'absolut kurant', 'absolut peppar', 'lemon vodka', 'citrus vodka', 'peach vodka', 'vanilla vodka', 'raspberry vodka', 'cranberry vodka', 'smirnoff red label vodka'] },
  { key: 'gin', he: 'ג׳ין', kind: 'spirit', color: '#E3F2EC', aliases: ['gin', 'dry gin', 'london dry gin', 'old tom gin', 'tanqueray', 'bombay sapphire'] },
  { key: 'white rum', he: 'רום לבן', kind: 'spirit', color: '#F3F0E4', aliases: ['light rum', 'white rum', 'rum', 'bacardi limon', 'silver rum', 'bacardi'] },
  { key: 'dark rum', he: 'רום כהה', kind: 'spirit', color: '#8A4B1E', aliases: ['dark rum', 'gold rum', 'añejo rum', 'anejo rum', 'spiced rum', '151 proof rum', 'black rum', 'demerara rum'] },
  { key: 'coconut rum', he: 'רום קוקוס (מליבו)', kind: 'liqueur', color: '#F7F3EA', aliases: ['malibu rum', 'coconut rum'] },
  { key: 'tequila', he: 'טקילה', kind: 'spirit', color: '#F4E3A8', aliases: ['tequila', 'blanco tequila', 'silver tequila', 'reposado tequila', 'añejo tequila', 'mezcal'] },
  { key: 'whiskey', he: 'וויסקי', kind: 'spirit', color: '#C9822F', aliases: ['whiskey', 'whisky', 'blended whiskey', 'blended scotch', 'scotch', 'irish whiskey', 'rye whiskey', 'jack daniels', 'johnnie walker', 'crown royal', 'canadian whisky', 'islay single malt scotch', 'peat whiskey'] },
  { key: 'bourbon', he: 'בורבון', kind: 'spirit', color: '#B8691F', aliases: ['bourbon', 'southern comfort', 'wild turkey', 'maker\'s mark'] },
  { key: 'brandy', he: 'ברנדי / קוניאק', kind: 'spirit', color: '#A8521C', aliases: ['brandy', 'cognac', 'pisco', 'apple brandy', 'calvados', 'applejack'] },
  { key: 'cachaca', he: 'קשאסה', kind: 'spirit', color: '#F1EEDD', aliases: ['cachaca'] },
  { key: 'arak', he: 'ערק', kind: 'spirit', color: '#F7F7F2', aliases: ['arak', 'araq', 'arack', 'arrack'] },
  { key: 'ouzo', he: 'אוזו (וגם סמבוקה / פרנו / אבסינת)', kind: 'spirit', color: '#F2F4F0', aliases: ['ouzo', 'anis', 'pernod', 'absinthe', 'pastis', 'anisette', 'sambuca', 'ricard'] },

  // ---- ליקרים
  { key: 'triple sec', he: 'טריפל סק / קואנטרו', kind: 'liqueur', color: '#FBE7C6', aliases: ['triple sec', 'cointreau', 'grand marnier', 'orange curacao', 'curacao', 'orange liqueur'] },
  { key: 'blue curacao', he: 'בלו קורסאו', kind: 'liqueur', color: '#1FA3D9', aliases: ['blue curacao'] },
  { key: 'coffee liqueur', he: 'ליקר קפה (קלואה)', kind: 'liqueur', color: '#3E2415', aliases: ['kahlua', 'coffee liqueur', 'tia maria', 'coffee brandy'] },
  { key: 'irish cream', he: 'בייליס', kind: 'liqueur', color: '#D9BE9C', aliases: ['baileys irish cream', 'irish cream', 'baileys'] },
  { key: 'amaretto', he: 'אמרטו', kind: 'liqueur', color: '#B5651D', aliases: ['amaretto', 'disaronno'] },
  { key: 'campari', he: 'קמפרי', kind: 'liqueur', color: '#C8102E', aliases: ['campari'] },
  { key: 'aperol', he: 'אפרול', kind: 'liqueur', color: '#F26A21', aliases: ['aperol'] },
  { key: 'sweet vermouth', he: 'ורמוט אדום (מתוק)', kind: 'wine', color: '#7A1F2B', aliases: ['sweet vermouth', 'vermouth', 'red vermouth', 'rosso vermouth', 'martini rosso'] },
  { key: 'dry vermouth', he: 'ורמוט יבש', kind: 'wine', color: '#EEE8C8', aliases: ['dry vermouth', 'lillet blanc', 'lillet', 'white vermouth', 'martini extra dry'] },
  { key: 'bianco vermouth', he: 'ורמוט לבן מתוק (ביאנקו)', kind: 'wine', color: '#F4EBC9', aliases: ['bianco vermouth', 'vermouth bianco', 'martini bianco', 'blanc vermouth', 'sweet white vermouth'] },
  { key: 'elderflower liqueur', he: 'ליקר סמבוק (סן ז׳רמן)', kind: 'liqueur', color: '#F1E4A8', aliases: ['st-germain', 'st germain', 'st. germain', 'elderflower liqueur'] },
  { key: 'limoncello', he: 'לימונצ׳לו', kind: 'liqueur', color: '#F7E04B', aliases: ['limoncello'] },
  { key: 'peach schnapps', he: 'שנאפס אפרסק', kind: 'liqueur', color: '#FFC49B', aliases: ['peach schnapps', 'peachtree schnapps'] },
  { key: 'melon liqueur', he: 'ליקר מלון (מידורי)', kind: 'liqueur', color: '#7CC242', aliases: ['midori melon liqueur', 'midori', 'melon liqueur'] },
  { key: 'raspberry liqueur', he: 'ליקר פטל / קסיס', kind: 'liqueur', color: '#9E1B4F', aliases: ['chambord raspberry liqueur', 'raspberry liqueur', 'creme de cassis', 'black sambuca'] },
  { key: 'cacao liqueur', he: 'ליקר שוקולד', kind: 'liqueur', color: '#5C3A21', aliases: ['creme de cacao', 'white creme de cacao', 'chocolate liqueur', 'godiva liqueur'] },
  { key: 'mint liqueur', he: 'ליקר מנטה', kind: 'liqueur', color: '#5BC27A', aliases: ['creme de menthe', 'green creme de menthe', 'white creme de menthe', 'peppermint schnapps'] },
  { key: 'herbal liqueur', he: 'ליקר צמחים (יגרמייסטר / שרטרז)', kind: 'liqueur', color: '#4A3B1A', aliases: ['jägermeister', 'jagermeister', 'green chartreuse', 'yellow chartreuse', 'chartreuse', 'benedictine', 'galliano', 'drambuie', 'strega'] },
  { key: 'other liqueur', he: 'ליקר אגוזים / דובדבן', kind: 'liqueur', color: '#8C4A2F', aliases: ['frangelico', 'maraschino liqueur', 'cherry brandy', 'cherry liqueur', 'apricot brandy', 'sloe gin', 'cherry heering', 'kirschwasser', 'banana liqueur', 'creme de banane'] },
  { key: 'angostura', he: 'ביטרס (אנגוסטורה)', kind: 'liqueur', color: '#8B2E16', aliases: ['angostura bitters', 'bitters', 'orange bitters', 'peychaud bitters', 'aromatic bitters'] },

  // ---- יין ובירה
  { key: 'sparkling wine', he: 'שמפניה / פרוסקו / קאווה', kind: 'wine', color: '#F6EAB0', aliases: ['champagne', 'prosecco', 'sparkling wine', 'cava', 'brut'] },
  { key: 'white wine', he: 'יין לבן', kind: 'wine', color: '#F3EBB5', aliases: ['white wine', 'dry white wine'] },
  { key: 'rose wine', he: 'יין רוזה', kind: 'wine', color: '#F4B6C2', aliases: ['rose wine', 'rosé wine', 'rosé', 'rose'] },
  { key: 'red wine', he: 'יין אדום', kind: 'wine', color: '#6E1423', aliases: ['red wine', 'port', 'sherry', 'dry sherry', 'ruby port'] },
  { key: 'beer', he: 'בירה', kind: 'wine', color: '#F2B705', aliases: ['beer', 'lager', 'ale', 'guinness stout', 'stout', 'corona'] },
  { key: 'cider', he: 'סיידר', kind: 'wine', color: '#F2C14E', aliases: ['cider', 'apple cider', 'hard cider'] },

  // ---- מיצים ופירות
  { key: 'lemon', he: 'לימון (פרי)', kind: 'fresh', color: '#FFF27A', unlimited: true, aliases: ['lemon', 'lemons', 'lemon peel', 'lemon slice', 'juice of lemon', 'lemon wedge', 'lemon twist', 'lemon zest'] },
  { key: 'lemon juice', he: 'מיץ לימון', kind: 'juice', color: '#FFF27A', aliases: ['lemon juice', 'fresh lemon juice', 'bottled lemon juice'] },
  { key: 'lime', he: 'ליים (פרי)', kind: 'fresh', color: '#B6E35C', unlimited: true, aliases: ['lime', 'limes', 'lime peel', 'lime wedge', 'lime slice', 'juice of lime', 'lime twist', 'lime zest'] },
  { key: 'lime juice', he: 'מיץ ליים', kind: 'juice', color: '#B6E35C', aliases: ['lime juice', 'fresh lime juice', 'rose\'s lime juice', 'lime cordial'] },
  { key: 'orange juice', he: 'מיץ תפוזים', kind: 'juice', color: '#FF9F1C', aliases: ['orange juice', 'fresh orange juice'] },
  { key: 'orange', he: 'תפוז (פרי / קליפה)', kind: 'fresh', color: '#FF9F1C', aliases: ['orange', 'orange peel', 'orange spiral', 'orange slice', 'orange wedge', 'blood orange', 'orange zest'] },
  { key: 'pineapple juice', he: 'מיץ אננס', kind: 'juice', color: '#FFD84D', aliases: ['pineapple juice', 'pineapple', 'pineapple chunks'] },
  { key: 'cranberry juice', he: 'מיץ חמוציות', kind: 'juice', color: '#D7263D', aliases: ['cranberry juice', 'cranberries'] },
  { key: 'grapefruit juice', he: 'מיץ אשכוליות', kind: 'juice', color: '#FF7F7F', aliases: ['grapefruit juice', 'pink grapefruit juice', 'grapefruit'] },
  { key: 'apple juice', he: 'מיץ תפוחים', kind: 'juice', color: '#F2C14E', aliases: ['apple juice', 'apple'] },
  { key: 'tomato juice', he: 'מיץ עגבניות', kind: 'juice', color: '#C1272D', aliases: ['tomato juice', 'clamato juice'] },
  { key: 'passion fruit', he: 'מיץ / פרי פסיפלורה', kind: 'juice', color: '#F7B32B', aliases: ['passion fruit juice', 'passion fruit', 'maracuja juice', 'passion fruit nectar'] },
  { key: 'passion fruit syrup', he: 'סירופ פסיפלורה', kind: 'sweet', color: '#F2A93B', aliases: ['passion fruit syrup', 'maracuja syrup'] },
  { key: 'orgeat', he: 'סירופ אורז׳ה (שקדים)', kind: 'sweet', color: '#F3E5C3', aliases: ['orgeat syrup', 'orgeat', 'almond syrup', 'אורזה', 'סירופ שקדים'] },
  { key: 'elderflower syrup', he: 'סירופ סמבוק (Elderflower)', kind: 'sweet', color: '#F1EBC2', aliases: ['elderflower cordial', 'elderflower syrup', 'elderflower', 'elder flower syrup', 'סמבוק', 'סירופ אלדרפלאואר'] },
  { key: 'raspberry syrup', he: 'סירופ פטל', kind: 'sweet', color: '#C2185B', aliases: ['raspberry syrup', 'פטל'] },
  { key: 'strawberry syrup', he: 'סירופ תות', kind: 'sweet', color: '#E53950', aliases: ['strawberry syrup'] },
  { key: 'blackberry syrup', he: 'סירופ פטל שחור / אוכמניות', kind: 'sweet', color: '#4A1942', aliases: ['blackberry syrup', 'blueberry syrup', 'cassis syrup'] },
  { key: 'peach syrup', he: 'סירופ אפרסק', kind: 'sweet', color: '#F7A072', aliases: ['peach syrup'] },
  { key: 'cinnamon syrup', he: 'סירופ קינמון', kind: 'sweet', color: '#A0522D', aliases: ['cinnamon syrup'] },
  { key: 'falernum', he: 'פלרנום (סירופ תבלינים)', kind: 'sweet', color: '#E9D8A6', aliases: ['falernum', 'velvet falernum'] },
  { key: 'hazelnut syrup', he: 'סירופ אגוזי לוז', kind: 'sweet', color: '#8B5A2B', aliases: ['hazelnut syrup'] },
  { key: 'caramel syrup', he: 'סירופ קרמל', kind: 'sweet', color: '#C68E17', aliases: ['caramel syrup', 'caramel', 'salted caramel syrup'] },
  { key: 'lavender syrup', he: 'סירופ לבנדר', kind: 'sweet', color: '#B497D6', aliases: ['lavender syrup'] },
  { key: 'rose syrup', he: 'סירופ ורדים', kind: 'sweet', color: '#F4A6B7', aliases: ['rose syrup', 'rose water', 'מי ורדים'] },
  { key: 'mango syrup', he: 'סירופ מנגו', kind: 'sweet', color: '#FFB627', aliases: ['mango syrup'] },
  { key: 'flavored syrup', he: 'סירופ בטעם אחר', kind: 'sweet', color: '#E8A0BF', aliases: ['flavored syrup'] },
  { key: 'mango', he: 'מנגו', kind: 'juice', color: '#FFB627', aliases: ['mango', 'mango juice', 'mango nectar'] },
  { key: 'strawberries', he: 'תותים', kind: 'fresh', color: '#E63946', aliases: ['strawberries', 'strawberry', 'frozen strawberries', 'strawberry schnapps'] },
  { key: 'banana', he: 'בננה', kind: 'fresh', color: '#FBE37D', aliases: ['banana'] },
  { key: 'berries', he: 'פירות יער', kind: 'fresh', color: '#7B2D4A', aliases: ['blackberries', 'raspberries', 'blueberries', 'berries', 'raspberry'] },
  { key: 'lemonade', he: 'לימונדה', kind: 'juice', color: '#FFF59D', aliases: ['lemonade', 'pink lemonade'] },
  { key: 'cucumber', he: 'מלפפון', kind: 'fresh', color: '#9BD34C', aliases: ['cucumber'] },

  // ---- משקאות מוגזים
  { key: 'cola', he: 'קולה', kind: 'mixer', color: '#4A2511', aliases: ['coca-cola', 'cola', 'coke', 'pepsi cola', 'diet coke'] },
  { key: 'soda water', he: 'סודה', kind: 'mixer', color: '#EAF6FB', unlimited: true, aliases: ['soda water', 'club soda', 'carbonated water', 'sparkling water', 'seltzer water'] },
  { key: 'tonic water', he: 'טוניק', kind: 'mixer', color: '#EEF7F8', aliases: ['tonic water', 'tonic'] },
  { key: 'ginger ale', he: 'ג׳ינג׳ר אייל', kind: 'mixer', color: '#F6D58E', aliases: ['ginger ale'] },
  { key: 'ginger beer', he: 'ג׳ינג׳ר ביר', kind: 'mixer', color: '#F6C453', aliases: ['ginger beer'] },
  { key: 'lemon-lime soda', he: 'ספרייט / 7אפ', kind: 'mixer', color: '#E8F8D8', aliases: ['sprite', '7-up', 'lemon-lime soda', 'lemon-lime', 'lemon soda', 'squirt'] },
  { key: 'energy drink', he: 'משקה אנרגיה', kind: 'mixer', color: '#C6E53C', aliases: ['red bull', 'energy drink'] },

  // ---- ממתיקים
  { key: 'sugar', he: 'סוכר / סירופ סוכר', kind: 'sweet', color: '#FFFFFF', unlimited: true, aliases: ['sugar', 'sugar syrup', 'simple syrup', 'powdered sugar', 'brown sugar', 'white sugar', 'superfine sugar', 'demerara sugar', 'sugar cube', 'caster sugar', 'rich simple syrup'] },
  { key: 'grenadine', he: 'גרנדין', kind: 'sweet', color: '#C8102E', aliases: ['grenadine', 'pomegranate syrup'] },
  { key: 'honey', he: 'דבש', kind: 'sweet', color: '#F2A93B', aliases: ['honey', 'honey syrup'] },
  { key: 'agave', he: 'סירופ אגבה / מייפל', kind: 'sweet', color: '#E8B04B', aliases: ['agave syrup', 'maple syrup', 'agave nectar'] },
  { key: 'chocolate syrup', he: 'סירופ שוקולד', kind: 'sweet', color: '#4B2A17', aliases: ['chocolate syrup', 'chocolate sauce', 'chocolate', 'hot chocolate', 'cocoa powder'] },
  { key: 'vanilla', he: 'וניל', kind: 'sweet', color: '#F3E5C3', aliases: ['vanilla extract', 'vanilla', 'vanilla syrup', 'vanilla ice-cream', 'vanilla ice cream'] },

  // ---- מוצרי חלב וביצים
  { key: 'cream', he: 'שמנת מתוקה', kind: 'dairy', color: '#FFF8E7', aliases: ['cream', 'heavy cream', 'light cream', 'whipping cream', 'whipped cream', 'double cream', 'half-and-half', 'single cream'] },
  { key: 'milk', he: 'חלב', kind: 'dairy', color: '#FFFFFF', aliases: ['milk', 'whole milk', 'condensed milk', 'evaporated milk', 'chocolate milk'] },
  { key: 'coconut', he: 'קרם / חלב קוקוס', kind: 'dairy', color: '#FAF6EE', aliases: ['coconut milk', 'cream of coconut', 'coconut cream', 'coconut syrup'] },
  { key: 'egg', he: 'ביצה / חלבון', kind: 'dairy', color: '#FFF4C2', aliases: ['egg white', 'egg', 'egg yolk', 'whole egg'] },
  { key: 'ice cream', he: 'גלידה', kind: 'dairy', color: '#FFF1D6', aliases: ['ice-cream', 'ice cream'] },

  // ---- קפה ותה
  { key: 'coffee', he: 'קפה / אספרסו', kind: 'mixer', color: '#3B2314', aliases: ['coffee', 'espresso', 'cold brew coffee', 'instant coffee', 'hot coffee'] },
  { key: 'tea', he: 'תה', kind: 'mixer', color: '#B5651D', aliases: ['tea', 'iced tea', 'green tea', 'black tea'] },

  // ---- עשבים ותבלינים
  { key: 'mint', he: 'נענע', kind: 'fresh', color: '#3FA34D', unlimited: true, aliases: ['mint', 'fresh mint', 'mint leaves', 'mint sprig', 'mint syrup'] },
  { key: 'basil', he: 'בזיליקום', kind: 'fresh', color: '#3FA34D', aliases: ['basil', 'fresh basil'] },
  { key: 'ginger', he: 'ג׳ינג׳ר טרי', kind: 'fresh', color: '#E9C46A', aliases: ['ginger', 'fresh ginger', 'ginger syrup'] },
  { key: 'tabasco', he: 'טבסקו / ווסטרשייר', kind: 'garnish', color: '#B22222', aliases: ['tabasco sauce', 'worcestershire sauce', 'hot sauce'] },
  { key: 'salt', he: 'מלח', kind: 'garnish', color: '#FFFFFF', unlimited: true, optional: true, aliases: ['salt', 'celery salt', 'sea salt', 'coarse salt'] },
  { key: 'spices', he: 'פלפל / קינמון / אגוז מוסקט', kind: 'garnish', color: '#8B5A2B', unlimited: true, optional: true, aliases: ['pepper', 'black pepper', 'nutmeg', 'cinnamon', 'cloves', 'allspice', 'cayenne pepper', 'chili powder'] },
  { key: 'cherry', he: 'דובדבן לקישוט', kind: 'garnish', color: '#C8102E', optional: true, aliases: ['cherry', 'maraschino cherry', 'cherries', 'maraschino cherries'] },
  { key: 'olive', he: 'זית לקישוט', kind: 'garnish', color: '#6B8E23', optional: true, aliases: ['olive', 'olives', 'olive brine'] },
  { key: 'celery', he: 'סלרי לקישוט', kind: 'garnish', color: '#9BD34C', optional: true, aliases: ['celery'] },

  // ---- תמיד בבית
  { key: 'ice', he: 'קרח', kind: 'mixer', color: '#E8F7FF', assumed: true, aliases: ['ice', 'crushed ice', 'ice cubes', 'cracked ice'] },
  { key: 'water', he: 'מים', kind: 'mixer', color: '#EAF6FB', assumed: true, aliases: ['water', 'hot water', 'cold water', 'boiling water'] },
];

// ---- יחידות מידה: רוב המצרכים במ״ל, פירות וביצים ביחידות, סוכר בגרמים
// לפריטים ביחידות: כמה מ״ל מיץ/נוזל יש ביחידה אחת (להמרה כשהמתכון כותב "1/2 oz מיץ ליים")
const PCS_ML = { egg: 30, lemon: 30, lime: 25, orange: 60, cherry: null, olive: null, strawberries: null, banana: null, berries: null, cucumber: null, mint: null, basil: null, celery: null, ginger: null };
const GRAMS = new Set(['sugar', 'ice cream', 'salt', 'spices']);

export function unitOf(key) {
  if (key in PCS_ML) return 'pcs';
  if (GRAMS.has(key)) return 'g';
  return 'ml';
}
export const pcsMlOf = (key) => PCS_ML[key] ?? null;
export const UNIT_HE = { ml: 'מ״ל', pcs: 'יח׳', g: 'גר׳' };

// ---- אחוז אלכוהול (ABV) משוער לכל קבוצה
const ABV = {
  vodka: 40, gin: 40, 'white rum': 40, 'dark rum': 40, 'coconut rum': 21, tequila: 38, whiskey: 40, bourbon: 45, brandy: 40, cachaca: 40, arak: 40, ouzo: 40,
  'triple sec': 35, 'blue curacao': 25, 'coffee liqueur': 20, 'irish cream': 17, amaretto: 28, campari: 25, aperol: 11, 'sweet vermouth': 16, 'dry vermouth': 18,
  'bianco vermouth': 15, 'elderflower liqueur': 20, limoncello: 28, 'rose wine': 12, 'peach schnapps': 20, 'melon liqueur': 20, 'raspberry liqueur': 16, 'cacao liqueur': 25, 'mint liqueur': 25, 'herbal liqueur': 35, 'other liqueur': 25, angostura: 44,
  'sparkling wine': 12, 'white wine': 12, 'red wine': 14, beer: 5, cider: 5,
};
export const abvOf = (key) => ABV[key] ?? 0;

export function defaultAmount(key, kind) {
  const u = unitOf(key);
  if (u === 'pcs') return key === 'egg' ? 6 : ['lemon', 'lime', 'orange'].includes(key) ? 5 : 10;
  if (u === 'g') return 1000;
  if (kind === 'spirit' || kind === 'liqueur' || kind === 'wine') return 700;
  if (kind === 'juice' || kind === 'mixer') return 1500;
  return 500;
}

// מלאי שנשמר לפני שהיו יחידות: מוסיפים יחידה, ואם היא השתנתה — כמות ברירת מחדל
export function migrateInventory(inv) {
  return (inv || []).map((it) => {
    const unit = unitOf(it.key);
    const g = byKey.get(it.key);
    // השם תמיד לפי המילון העדכני (למשל "לימון / מיץ לימון" → "לימון (פרי)")
    const named = g && it.he !== g.he ? { ...it, he: g.he, kind: g.kind } : it;
    if (named.unit === unit) return named;
    const amount = named.unlimited ? null : unit === 'ml' ? named.amount : defaultAmount(named.key, named.kind);
    return { ...named, unit, amount };
  });
}

// גרש/גרשיים בכל הצורות (' ’ ` ׳) נחשבים אותו דבר: ג'ין = ג׳ין
export const norm = (s) => String(s || '').trim().toLowerCase().replace(/['’‘`´]/g, '׳').replace(/["“”]/g, '״').replace(/\s+/g, ' ');

const byKey = new Map(GROUPS.map((g) => [g.key, g]));
const byAlias = new Map();
for (const g of GROUPS) {
  byAlias.set(norm(g.key), g);
  for (const a of g.aliases) byAlias.set(norm(a), g);
}
// גם שמות בעברית (למתכוני בית): "ליקר צמחים (יגרמייסטר / שרטרז)" → "ליקר צמחים", "יגרמייסטר", "שרטרז"
for (const g of GROUPS) {
  const he = norm(g.he);
  if (!byAlias.has(he)) byAlias.set(he, g);
  for (const part of he.replace(/[()]/g, ' / ').split('/').map((x) => x.trim()).filter((x) => x.length > 1)) {
    if (!byAlias.has(part)) byAlias.set(part, g);
  }
}


// מוצא את הקבוצה של מצרך מהמאגר (לפי שם מדויק, ואם לא — לפי מילת מפתח)
export function groupOf(name) {
  const n = norm(name);
  if (byAlias.has(n)) return byAlias.get(n);
  if (/\bvodka\b/.test(n)) return byKey.get('vodka');
  if (/\bgin\b/.test(n)) return byKey.get('gin');
  if (/\btequila\b|\bmezcal\b/.test(n)) return byKey.get('tequila');
  if (/\bbourbon\b/.test(n)) return byKey.get('bourbon');
  if (/whisk(e)?y|scotch/.test(n)) return byKey.get('whiskey');
  if (/\brum\b/.test(n)) return /dark|gold|spiced|añejo|anejo|black/.test(n) ? byKey.get('dark rum') : byKey.get('white rum');
  if (/brandy|cognac/.test(n)) return byKey.get('brandy');
  if (/bitters/.test(n)) return byKey.get('angostura');
  if (/schnapps/.test(n)) return byKey.get('peach schnapps');
  return null;
}

export const getGroup = (key) => byKey.get(key) || null;

export function heName(name) {
  const g = groupOf(name);
  return g ? g.he : name;
}

export function colorOf(name) {
  return groupOf(name)?.color || '#F2B705';
}

// המפתח שבו נשמר המצרך במלאי (לקבוצה מוכרת — המפתח שלה; אחרת השם האנגלי)
export function inventoryKeyOf(name) {
  return groupOf(name)?.key || norm(name);
}
