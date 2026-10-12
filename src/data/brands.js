// מותגים מוכרים → סוג המצרך (key) שבו הם נספרים במתכונים.
// [שם באנגלית, שם בעברית, key]
// key שמתחיל ב-"ready:" = קוקטייל מוכן בבקבוק (לא משמש כמצרך במתכונים אחרים)
const B = (key, list) => list.map(([en, he]) => ({ en, he, key }));

export const BRANDS = [
  // ---- וויסקי
  ...B('whiskey', [
    ['Johnnie Walker Red Label', 'ג׳וני ווקר רד לייבל'], ['Johnnie Walker Black Label', 'ג׳וני ווקר בלאק לייבל'], ['Johnnie Walker Double Black', 'ג׳וני ווקר דאבל בלאק'],
    ['Johnnie Walker Gold Label', 'ג׳וני ווקר גולד לייבל'], ['Johnnie Walker Blue Label', 'ג׳וני ווקר בלו לייבל'], ['Chivas Regal 12', 'שיבאס ריגל 12'], ['Chivas Regal 18', 'שיבאס ריגל 18'],
    ['Ballantine\'s', 'בלנטיינס'], ['J&B Rare', 'ג׳יי אנד בי'], ['Dewar\'s', 'דיוארס'], ['Famous Grouse', 'פיימוס גראוס'], ['Grant\'s', 'גרנטס'], ['Teacher\'s', 'טיצ׳רס'],
    ['Monkey Shoulder', 'מאנקי שולדר'], ['Glenfiddich 12', 'גלנפידיך 12'], ['Glenfiddich 15', 'גלנפידיך 15'], ['Glenfiddich 18', 'גלנפידיך 18'],
    ['Glenlivet 12', 'גלנליווט 12'], ['Glenmorangie', 'גלנמורנג׳י'], ['Macallan 12', 'מקאלן 12'], ['Balvenie', 'בלווני'], ['Singleton', 'סינגלטון'],
    ['Talisker', 'טליסקר'], ['Laphroaig', 'לפרויג'], ['Lagavulin', 'לגבולין'], ['Ardbeg', 'ארדבג'], ['Highland Park', 'היילנד פארק'], ['Oban', 'אובן'], ['Aberlour', 'אברלאואר'],
    ['Jameson', 'ג׳יימסון'], ['Bushmills', 'בושמילס'], ['Tullamore D.E.W.', 'טולמור דיו'], ['Redbreast', 'רדברסט'], ['Teeling', 'טילינג'],
    ['Jack Daniel\'s', 'ג׳ק דניאלס'], ['Jack Daniel\'s Gentleman Jack', 'ג׳נטלמן ג׳ק'], ['Jack Daniel\'s Single Barrel', 'ג׳ק דניאלס סינגל בארל'],
    ['Canadian Club', 'קנדיאן קלאב'], ['Crown Royal', 'קראון רויאל'], ['Suntory Toki', 'סנטורי טוקי'], ['Hibiki', 'היביקי'], ['Nikka From the Barrel', 'ניקה'], ['Yamazaki', 'יאמאזאקי'],
    ['Milk & Honey Classic', 'מילק אנד האני'], ['Golani', 'גולני'],
  ]),
  ...B('bourbon', [
    ['Jim Beam', 'ג׳ים בים'], ['Maker\'s Mark', 'מייקרס מארק'], ['Woodford Reserve', 'וודפורד ריזרב'], ['Wild Turkey', 'ווילד טרקי'], ['Bulleit', 'בולט'],
    ['Buffalo Trace', 'באפלו טרייס'], ['Four Roses', 'פור רוזס'], ['Knob Creek', 'נוב קריק'], ['Evan Williams', 'אוון וויליאמס'], ['Southern Comfort', 'סאות׳רן קומפורט'],
  ]),
  // ---- וודקה
  ...B('vodka', [
    ['Absolut', 'אבסולוט'], ['Absolut Citron', 'אבסולוט סיטרון'], ['Absolut Vanilia', 'אבסולוט וניליה'], ['Absolut Raspberri', 'אבסולוט פטל'], ['Absolut Mandrin', 'אבסולוט מנדרין'],
    ['Smirnoff', 'סמירנוף'], ['Stolichnaya', 'סטוליצ׳נאיה'], ['Grey Goose', 'גריי גוס'], ['Belvedere', 'בלוודר'], ['Finlandia', 'פינלנדיה'], ['Russian Standard', 'רוסקי סטנדרט'],
    ['Ketel One', 'קטל וואן'], ['Beluga', 'בלוגה'], ['Tito\'s', 'טיטוס'], ['Skyy', 'סקיי'], ['Cîroc', 'סירוק'], ['Danzka', 'דנזקה'], ['Eristoff', 'אריסטוף'],
    ['Żubrówka', 'זוברובקה'], ['Wyborowa', 'ויבורובה'], ['Keglevich', 'קגלביץ׳'], ['Van Gogh', 'ואן גוך'], ['Kalashnikov', 'קלצ׳ניקוב'], ['Nemiroff', 'נמירוף'], ['Khortytsa', 'חורטיצה'],
  ]),
  // ---- רום
  ...B('white rum', [
    ['Bacardi Carta Blanca', 'בקרדי קרטה בלנקה'], ['Havana Club 3 Años', 'הוואנה קלאב 3'], ['Captain Morgan White', 'קפטן מורגן לבן'], ['Plantation 3 Stars', 'פלנטיישן 3 סטארס'],
    ['Flor de Caña 4', 'פלור דה קניה 4'], ['Brugal Blanco', 'ברוגל בלנקו'], ['Don Q Cristal', 'דון קיו'], ['Matusalem Platino', 'מטוסלם'],
  ]),
  ...B('dark rum', [
    ['Bacardi Carta Oro', 'בקרדי קרטה אורו'], ['Bacardi Black', 'בקרדי בלאק'], ['Bacardi Spiced', 'בקרדי ספייסד'], ['Havana Club Especial', 'הוואנה קלאב אספסיאל'], ['Havana Club 7 Años', 'הוואנה קלאב 7'],
    ['Captain Morgan Spiced Gold', 'קפטן מורגן ספייסד'], ['Captain Morgan Black', 'קפטן מורגן בלאק'], ['Kraken', 'קראקן'], ['Sailor Jerry', 'סיילור ג׳רי'],
    ['Diplomático Reserva Exclusiva', 'דיפלומטיקו'], ['Ron Zacapa 23', 'רון זקאפה 23'], ['Don Papa', 'דון פאפא'], ['Appleton Estate', 'אפלטון'], ['Mount Gay', 'מאונט גיי'],
    ['Myers\'s', 'מאיירס'], ['Gosling\'s Black Seal', 'גוסלינגס'], ['El Dorado', 'אל דוראדו'], ['Angostura 7', 'אנגוסטורה 7'], ['Plantation Original Dark', 'פלנטיישן דארק'],
  ]),
  ...B('coconut rum', [['Malibu', 'מליבו'], ['Bacardi Coconut', 'בקרדי קוקוס'], ['Batida de Côco', 'בטידה דה קוקו']]),
  ...B('cachaca', [['Ypióca', 'איפיוקה'], ['Leblon', 'לבלון'], ['Sagatiba', 'סגטיבה'], ['51 Pirassununga', 'קשאסה 51']]),
  // ---- ג׳ין
  ...B('gin', [
    ['Bombay Sapphire', 'בומביי ספייר'], ['Gordon\'s', 'גורדונס'], ['Tanqueray', 'טנקרי'], ['Tanqueray No. Ten', 'טנקרי 10'], ['Hendrick\'s', 'הנדריקס'], ['Beefeater', 'ביפיטר'],
    ['Monkey 47', 'מאנקי 47'], ['Roku', 'רוקו'], ['The Botanist', 'דה בוטניסט'], ['Gin Mare', 'ג׳ין מארה'], ['Malfy', 'מאלפי'], ['Sipsmith', 'סיפסמית׳'], ['Aviation', 'אביאיישן'],
    ['Plymouth', 'פלימות׳'], ['Bulldog', 'בולדוג'], ['Whitley Neill', 'וויטלי ניל'], ['Seagram\'s', 'סיגרמס'], ['Larios', 'לאריוס'], ['Jerusalem Gin', 'ג׳ין ירושלים'], ['Akko Gin', 'ג׳ין עכו'],
  ]),
  // ---- טקילה ומזקל
  ...B('tequila', [
    ['Jose Cuervo Especial', 'חוסה קוארבו'], ['Jose Cuervo Silver', 'חוסה קוארבו סילבר'], ['Patrón Silver', 'פטרון סילבר'], ['Patrón Reposado', 'פטרון רפוסדו'], ['Olmeca', 'אולמקה'],
    ['Sauza', 'סאוזה'], ['Don Julio Blanco', 'דון חוליו'], ['Herradura', 'הרדורה'], ['1800', 'טקילה 1800'], ['Espolòn', 'אספולון'], ['Casamigos', 'קאסאמיגוס'], ['El Jimador', 'אל חימדור'],
    ['Sierra', 'סיירה'], ['Camino Real', 'קמינו ריאל'], ['Del Maguey Vida (mezcal)', 'דל מגאי מזקל'], ['Montelobos (mezcal)', 'מונטלובוס מזקל'],
  ]),
  // ---- ברנדי וקוניאק
  ...B('brandy', [
    ['Hennessy VS', 'הנסי'], ['Hennessy XO', 'הנסי XO'], ['Rémy Martin VSOP', 'רמי מרטן'], ['Martell', 'מרטל'], ['Courvoisier', 'קורבואזייה'], ['Metaxa 5*', 'מטקסה 5'],
    ['Metaxa 7*', 'מטקסה 7'], ['St-Rémy', 'סן רמי'], ['Stock 84', 'סטוק 84'], ['Torres 10', 'טורס 10'], ['Calvados Pays d\'Auge', 'קלבדוס'], ['Pisco Capel', 'פיסקו'],
  ]),
  // ---- אניס
  ...B('arak', [
    ['Arak Elite', 'ערק עלית'], ['Arak Kawar', 'ערק כאוור'], ['Arak Ashkelon', 'ערק אשקלון'], ['Arak Alouk', 'ערק אלוק'], ['Arak Touma', 'ערק תומא'], ['Arak Haddad', 'ערק חדאד'],
  ]),
  ...B('ouzo', [
    ['Ouzo 12', 'אוזו 12'], ['Ouzo Plomari', 'אוזו פלומרי'], ['Ouzo Mini', 'אוזו מיני'], ['Tsantali Ouzo', 'אוזו צנטלי'], ['Sambuca Ramazzotti', 'סמבוקה רמזוטי'], ['Sambuca Molinari', 'סמבוקה מולינרי'], ['Pernod', 'פרנו'], ['Ricard', 'ריקאר'], ['Absinthe', 'אבסינת'],
  ]),
  // ---- ליקרים
  ...B('triple sec', [['Cointreau', 'קואנטרו'], ['Grand Marnier', 'גרנד מרנייה'], ['Bols Triple Sec', 'בולס טריפל סק'], ['De Kuyper Triple Sec', 'דה קויפר טריפל סק'], ['Marie Brizard Triple Sec', 'מארי בריזאר טריפל סק']]),
  ...B('blue curacao', [['Bols Blue', 'בולס בלו'], ['De Kuyper Blue Curaçao', 'דה קויפר בלו'], ['Marie Brizard Blue', 'מארי בריזאר בלו']]),
  ...B('coffee liqueur', [
    ['Kahlúa', 'קלואה'], ['Tia Maria', 'טיה מריה'], ['Sheridan\'s', 'שרידנס'], ['Mr Black', 'מיסטר בלאק'], ['Patrón XO Cafe', 'פטרון XO קפה'], ['Borghetti', 'בורגטי'],
    ['De Kuyper Coffee', 'דה קויפר קפה'], ['Bols Coffee', 'בולס קפה'],
  ]),
  ...B('irish cream', [['Baileys', 'בייליס'], ['Baileys Salted Caramel', 'בייליס קרמל מלוח'], ['Carolans', 'קרולנס'], ['Amarula', 'אמרולה'], ['Feeney\'s', 'פיניס'], ['Five Farms', 'פייב פארמס']]),
  ...B('cacao liqueur', [
    ['Mozart Chocolate Cream (Gold)', 'מוצרט שוקולד חלב'], ['Mozart Dark Chocolate', 'מוצרט שוקולד מריר'], ['Mozart White Chocolate', 'מוצרט שוקולד לבן'], ['Mozart Caramel', 'מוצרט קרמל'],
    ['Godiva Chocolate Liqueur', 'גודיבה'], ['De Kuyper Crème de Cacao', 'דה קויפר קקאו'], ['Bols Crème de Cacao White', 'בולס קקאו לבן'], ['Bols Crème de Cacao Brown', 'בולס קקאו חום'],
    ['Marie Brizard Cacao', 'מארי בריזאר קקאו'], ['Vana Tallinn', 'ואנה טאלין'],
  ]),
  ...B('amaretto', [['Disaronno', 'דיסרונו'], ['Lazzaroni Amaretto', 'לזרוני'], ['Bols Amaretto', 'בולס אמרטו'], ['De Kuyper Amaretto', 'דה קויפר אמרטו']]),
  ...B('campari', [['Campari', 'קמפרי']]),
  ...B('aperol', [['Aperol', 'אפרול'], ['Select Aperitivo', 'סלקט']]),
  ...B('herbal liqueur', [
    ['Jägermeister', 'יגרמייסטר'], ['Green Chartreuse', 'שרטרז ירוק'], ['Yellow Chartreuse', 'שרטרז צהוב'], ['Bénédictine', 'בנדיקטין'], ['Galliano', 'גליאנו'], ['Drambuie', 'דרמבוי'],
    ['Fernet-Branca', 'פרנה ברנקה'], ['Becherovka', 'בכרובקה'], ['Strega', 'סטרגה'], ['Ramazzotti Amaro', 'רמזוטי אמרו'], ['Averna', 'אוורנה'], ['Amaro Montenegro', 'מונטנגרו'],
    ['Licor 43', 'ליקור 43'], ['Underberg', 'אונדרברג'], ['Unicum', 'אוניקום'],
  ]),
  ...B('other liqueur', [
    ['Frangelico', 'פרנג׳ליקו'], ['Luxardo Maraschino', 'לוקסרדו מרסקינו'], ['Cherry Heering', 'צ׳רי הירינג'], ['De Kuyper Cherry Brandy', 'דה קויפר צ׳רי ברנדי'], ['Sloe Gin', 'סלו ג׳ין'],
    ['Bols Banana', 'בולס בננה'], ['Nocello', 'נוצ׳לו'],
  ]),
  ...B('elderflower liqueur', [['St-Germain', 'סן ז׳רמן'], ['Fiorente', 'פיורנטה']]),
  ...B('limoncello', [['Limoncello di Capri', 'לימונצ׳לו די קאפרי'], ['Villa Massa', 'וילה מסה'], ['Pallini', 'פליני']]),
  ...B('melon liqueur', [['Midori', 'מידורי'], ['Bols Melon', 'בולס מלון']]),
  ...B('peach schnapps', [['Archers', 'ארצ׳רס'], ['De Kuyper Peachtree', 'פיצ׳טרי']]),
  ...B('raspberry liqueur', [['Chambord', 'שאמבור'], ['Crème de Cassis', 'קרם דה קסיס'], ['Lejay Cassis', 'לז׳ה קסיס']]),
  ...B('mint liqueur', [['Get 27', 'גט 27'], ['De Kuyper Crème de Menthe', 'דה קויפר מנטה']]),
  ...B('angostura', [['Angostura Aromatic Bitters', 'אנגוסטורה'], ['Angostura Orange Bitters', 'אנגוסטורה תפוז'], ['Peychaud\'s', 'פישו'], ['Fee Brothers', 'פי ברדרס']]),
  // ---- ורמוט ויין
  ...B('sweet vermouth', [['Martini Rosso', 'מרטיני רוסו'], ['Cinzano Rosso', 'צ׳ינזנו רוסו'], ['Carpano Antica Formula', 'קרפנו אנטיקה'], ['Cocchi Vermouth di Torino', 'קוקי'], ['Punt e Mes', 'פונט א מס']]),
  ...B('dry vermouth', [['Martini Extra Dry', 'מרטיני אקסטרה דריי'], ['Noilly Prat', 'נואי פרה'], ['Dolin Dry', 'דולן'], ['Cinzano Extra Dry', 'צ׳ינזנו אקסטרה דריי'], ['Lillet Blanc', 'לילה בלאן']]),
  ...B('bianco vermouth', [['Martini Bianco', 'מרטיני ביאנקו'], ['Cinzano Bianco', 'צ׳ינזנו ביאנקו'], ['Dolin Blanc', 'דולן בלאן']]),
  ...B('sparkling wine', [['Moët & Chandon', 'מואט'], ['Veuve Clicquot', 'וו קליקו'], ['Martini Asti', 'מרטיני אסטי'], ['Martini Prosecco', 'מרטיני פרוסקו'], ['Freixenet', 'פרשנה'], ['Mionetto Prosecco', 'מיונטו'], ['Yarden Blanc de Blancs', 'ירדן בלאן דה בלאן']]),
  // ---- בירה
  ...B('beer', [['Goldstar', 'גולדסטאר'], ['Maccabee', 'מכבי'], ['Heineken', 'הייניקן'], ['Corona', 'קורונה'], ['Carlsberg', 'קרלסברג'], ['Tuborg', 'טובורג'], ['Guinness', 'גינס'], ['Stella Artois', 'סטלה ארטואה'], ['Weihenstephaner', 'וייהנשטפן']]),
  // ---- סירופים
  ...B('elderflower syrup', [['Monin Elderflower', 'מונין סמבוק'], ['Vedrenne Elderflower', 'ודרן סמבוק'], ['Belvoir Elderflower Cordial', 'בלוואר סמבוק']]),
  ...B('passion fruit syrup', [['Monin Passion Fruit', 'מונין פסיפלורה'], ['Vedrenne Passion Fruit', 'ודרן פסיפלורה']]),
  ...B('orgeat', [['Monin Orgeat', 'מונין אורז׳ה']]),
  ...B('grenadine', [['Monin Grenadine', 'מונין גרנדין'], ['Rose\'s Grenadine', 'רוזס גרנדין']]),
  // ---- קוקטיילים מוכנים בבקבוק
  { en: 'Campari Negroni (ready to drink)', he: 'קמפרי נגרוני מוכן', key: 'ready:Negroni' },
  { en: 'Aperol Spritz (ready to drink)', he: 'אפרול שפריץ מוכן', key: 'ready:Aperol Spritz' },
  { en: 'Bacardi Mojito (ready to drink)', he: 'בקרדי מוחיטו מוכן', key: 'ready:Mojito' },
  { en: 'Jack Daniel\'s & Cola (can)', he: 'ג׳ק דניאלס וקולה בפחית', key: 'ready:Jack and Coke' },
  { en: 'Gin & Tonic (can)', he: 'ג׳ין טוניק בפחית', key: 'ready:Gin And Tonic' },
];

// חיפוש מותגים לפי טקסט (עברית או אנגלית, בלי תלות בגרשים ורווחים)
const simp = (s) => String(s || '').toLowerCase().replace(/['’‘`´׳"״.&\-]/g, '').replace(/\s+/g, ' ').trim();
const INDEX = BRANDS.map((b) => ({ ...b, s: simp(`${b.en} ${b.he}`) }));
export function searchBrands(q, limit = 8) {
  const t = simp(q);
  if (t.length < 2) return [];
  return INDEX.filter((b) => b.s.includes(t)).slice(0, limit);
}

export const isReadyKey = (key) => String(key).startsWith('ready:');
export const readyDrinkName = (key) => String(key).slice(6);
