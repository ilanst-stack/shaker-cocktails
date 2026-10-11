// כל הקוקטיילים במאגר — חיפוש לפי שם (עברית/אנגלית) או מצרך, ומה חסר לך כדי להכין
import { useMemo, useState } from 'react';
import { BASES, sortEntries } from '../data/match.js';
import { heName } from '../data/ingredients.js';
import { HE_NAMES } from '../data/hebrewNames.js';
import DrinkCard from './DrinkCard.jsx';
import ScrollRow from './ScrollRow.jsx';
import { useSticky } from '../data/sticky.js';
import { SortBar } from './CocktailList.jsx';
import { IconSearch, IconPlus } from './Icons.jsx';

const simplify = (s) => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[׳'"`’\-–_.]/g, '').replace(/\s+/g, ' ').trim();

export default function AllCocktails({ index, user, onOpen, onFav, onNewCustom }) {
  const [onlyHouse, setOnlyHouse] = useSticky('all.house', false);
  const [q, setQ] = useSticky('all.q', '');
  const [base, setBase] = useSticky('all.base', 'all');
  const [onlyReady, setOnlyReady] = useSticky('all.ready', false);
  const [sort, setSort] = useSticky('all.sort', { id: 'name', dir: 'asc' });
  const [limit, setLimit] = useState(40);

  // אינדקס חיפוש: שם באנגלית, שם עברי (אם יש), ושמות המצרכים בעברית ובאנגלית
  const searchable = useMemo(() => index.map((e) => ({
    e,
    name: simplify(`${e.drink.name} ${HE_NAMES[e.drink.name] || ''}`),
    ings: simplify(e.drink.ingredients.map((i) => `${i.name} ${heName(i.name)}`).join(' ')),
  })), [index]);

  const list = useMemo(() => {
    const t = simplify(q);
    let l = searchable;
    if (t) {
      const words = t.split(' ');
      l = l.filter((s) => words.every((w) => s.name.includes(w) || s.ings.includes(w)));
      // התאמה בשם קודם, אחר כך התאמה במצרכים
      l = [...l.filter((s) => words.every((w) => s.name.includes(w))), ...l.filter((s) => !words.every((w) => s.name.includes(w)))];
    }
    let entries = l.map((s) => s.e);
    if (base !== 'all') entries = entries.filter((e) => e.base === base);
    if (onlyReady) entries = entries.filter((e) => e.ready);
    if (onlyHouse) entries = entries.filter((e) => e.drink.custom);
    if (!t || sort.id !== 'name') entries = sortEntries(entries, sort.id, sort.dir, user);
    return entries;
  }, [searchable, q, base, onlyReady, onlyHouse, sort, user]);

  return (
    <section className="screen" aria-label="כל הקוקטיילים">
      <div className="row" style={{ justifyContent: 'space-between', margin: '8px 0 12px', gap: 10 }}>
        <h1 className="h1" style={{ margin: 0 }}>כל הקוקטיילים</h1>
        <button className="btn red small" onClick={onNewCustom}><IconPlus /> מתכון בית</button>
      </div>
      <div className="panel" style={{ position: 'relative' }}>
        <label htmlFor="all-search" style={{ fontWeight: 700, display: 'block', marginBottom: 6 }}>חיפוש לפי שם קוקטייל או מצרך</label>
        <div style={{ position: 'relative' }}>
          <span style={{ position: 'absolute', right: 12, top: 13, pointerEvents: 'none' }}><IconSearch /></span>
          <input id="all-search" className="field" style={{ paddingRight: 42 }} type="search" value={q} autoComplete="off"
            onChange={(ev) => { setQ(ev.target.value); setLimit(40); }} placeholder="למשל: מוחיטו, Negroni, קמפרי…" />
        </div>
        <label className="row" style={{ gap: 8, marginTop: 10, fontWeight: 700, fontSize: 14 }}>
          <input type="checkbox" checked={onlyReady} onChange={(ev) => setOnlyReady(ev.target.checked)} style={{ width: 22, height: 22 }} />
          רק מה שאפשר להכין עכשיו
        </label>
      </div>

      <div style={{ height: 12 }} />
      <ScrollRow label="בסיס">
        <button className="chip" aria-pressed={base === 'all'} onClick={() => setBase('all')}>הכל</button>
        {BASES.map((b) => <button key={b.id} className="chip" aria-pressed={base === b.id} onClick={() => setBase(b.id)}>{b.he}</button>)}
      </ScrollRow>
      <SortBar sort={sort} setSort={setSort} onlyHouse={onlyHouse} setOnlyHouse={setOnlyHouse} />

      <p style={{ fontWeight: 700, margin: '14px 0 8px' }} role="status">{list.length} קוקטיילים{q ? ` עבור "${q}"` : ' במאגר'}</p>
      {list.length === 0 && !onlyHouse && (
        <div className="bubble"><b>לא מצאתי קוקטייל כזה.</b>נסה שם באנגלית, או חלק מהשם (למשל "spritz"). המצאת משהו משלך? <button className="btn small" style={{ marginTop: 8 }} onClick={onNewCustom}><IconPlus /> הוסף מתכון בית</button></div>
      )}
      {list.length === 0 && onlyHouse && (
        <div className="bubble"><b>עוד אין מתכוני בית.</b><button className="btn small" style={{ marginTop: 8 }} onClick={onNewCustom}><IconPlus /> הוסף את הראשון</button></div>
      )}
      <div className="cards">
        {list.slice(0, limit).map((e) => (
          <DrinkCard key={e.drink.id} e={e} fav={user.favorites.includes(e.drink.id)} rating={user.ratings[e.drink.id]}
            onOpen={() => onOpen(e.drink.id)} onFav={() => onFav(e.drink.id)} highlight={sort.id} showReady />
        ))}
      </div>
      {list.length > limit && <div style={{ textAlign: 'center', marginTop: 18 }}><button className="btn black" onClick={() => setLimit(limit + 40)}>עוד קוקטיילים</button></div>}
    </section>
  );
}
