import { useEffect, useMemo, useState } from 'react';
import { BASES, FAMILIES, SORTS, sortEntries } from '../data/match.js';
import DrinkCard from './DrinkCard.jsx';
import ScrollRow from './ScrollRow.jsx';

const SORT_KEY = 'shaker.sort.v1';
function readSort() {
  try { const s = JSON.parse(localStorage.getItem(SORT_KEY)); if (s && SORTS.some((x) => x.id === s.id)) return s; } catch { /* ignore */ }
  return { id: 'match', dir: 'desc' };
}

export function SortBar({ sort, setSort }) {
  const dirLabel = {
    match: ['הכי מתאים קודם', 'הכי פחות מתאים קודם'],
    fav: ['מועדפים קודם', 'לא-מועדפים קודם'],
    rating: ['הגבוה קודם', 'הנמוך קודם'],
    alcohol: ['החזק קודם', 'הקליל קודם'],
    time: ['האיטי קודם', 'המהיר קודם'],
    count: ['הכי הרבה קודם', 'הכי מעט קודם'],
    name: ['ת–א / Z–A', 'א–ת / A–Z'],
  }[sort.id];
  return (
    <div className="sortbar">
      <label htmlFor="sort-sel">מיון</label>
      <select id="sort-sel" value={sort.id} onChange={(e) => { const s = SORTS.find((x) => x.id === e.target.value); setSort({ id: s.id, dir: s.dir }); }}>
        {SORTS.map((s) => <option key={s.id} value={s.id}>{s.he}</option>)}
      </select>
      <button className="dir-btn" onClick={() => setSort({ ...sort, dir: sort.dir === 'asc' ? 'desc' : 'asc' })}
        aria-label={`כיוון: ${sort.dir === 'desc' ? dirLabel[0] : dirLabel[1]} — לחץ להפוך`}>
        <span aria-hidden="true">{sort.dir === 'desc' ? '▼' : '▲'}</span> {sort.dir === 'desc' ? dirLabel[0] : dirLabel[1]}
      </button>
    </div>
  );
}

export default function CocktailList({ index, user, onOpen, onFav, inventoryCount }) {
  const [mode, setMode] = useState('ready'); // ready | almost
  const [base, setBase] = useState('all');
  const [fam, setFam] = useState(null);
  const [limit, setLimit] = useState(40);
  const [sort, setSort] = useState(readSort);
  useEffect(() => { try { localStorage.setItem(SORT_KEY, JSON.stringify(sort)); } catch { /* ignore */ } }, [sort]);

  const readyCount = useMemo(() => index.filter((e) => e.ready).length, [index]);
  const almostCount = useMemo(() => index.filter((e) => !e.ready && e.gap <= 2).length, [index]);

  const list = useMemo(() => {
    let l = mode === 'ready' ? index.filter((e) => e.ready) : index.filter((e) => !e.ready && e.gap <= 2);
    if (base !== 'all') l = l.filter((e) => e.base === base);
    if (fam) l = l.filter((e) => e.families.includes(fam));
    return sortEntries(l, sort.id, sort.dir, user);
  }, [index, mode, base, fam, sort, user]);

  const basesPresent = useMemo(() => {
    const pool = mode === 'ready' ? index.filter((e) => e.ready) : index.filter((e) => !e.ready && e.gap <= 2);
    const counts = new Map();
    for (const e of pool) counts.set(e.base, (counts.get(e.base) || 0) + 1);
    return BASES.filter((b) => counts.has(b.id)).map((b) => ({ ...b, n: counts.get(b.id) }));
  }, [index, mode]);

  // במיון "הכי מתאים" — קבוצות לפי בסיס; בכל מיון אחר — רשימה אחת רציפה
  const sections = useMemo(() => {
    const shown = list.slice(0, limit);
    if (sort.id !== 'match') return [{ id: 'flat', he: null, items: shown }];
    if (base !== 'all') return [{ id: base, he: BASES.find((b) => b.id === base)?.he, items: shown }];
    return BASES.map((b) => ({ id: b.id, he: b.he, items: shown.filter((e) => e.base === b.id) })).filter((s) => s.items.length);
  }, [list, base, limit, sort.id]);

  return (
    <section className="screen" aria-label="קוקטיילים">
      <div className="bubble">
        <b>{inventoryCount ? `יש לך ${inventoryCount} מצרכים — אפשר להכין ${readyCount} קוקטיילים!` : 'עוד לא הוספת מצרכים למלאי'}</b>
        <div style={{ fontSize: 13, marginTop: 4, fontWeight: 500 }}>ועוד {almostCount} שחסרים להם מצרך או שניים</div>
      </div>

      <div className="seg" role="group" aria-label="תצוגה">
        <button aria-pressed={mode === 'ready'} onClick={() => { setMode('ready'); setBase('all'); }}>מוכנים ({readyCount})</button>
        <button aria-pressed={mode === 'almost'} onClick={() => { setMode('almost'); setBase('all'); }}>כמעט ({almostCount})</button>
      </div>

      <ScrollRow label="בסיס">
        <button className="chip" aria-pressed={base === 'all'} onClick={() => setBase('all')}>הכל</button>
        {basesPresent.map((b) => <button key={b.id} className="chip" aria-pressed={base === b.id} onClick={() => setBase(b.id)}>{b.he} {b.n}</button>)}
      </ScrollRow>
      <ScrollRow label="סגנון">
        {FAMILIES.map((f) => <button key={f.id} className="chip sm" aria-pressed={fam === f.id} onClick={() => setFam(fam === f.id ? null : f.id)}>{f.he}</button>)}
      </ScrollRow>

      <SortBar sort={sort} setSort={setSort} />

      {list.length === 0 && <div className="empty"><b style={{ font: '700 30px var(--display)' }}>אין כאן כלום (עדיין)</b><p>נסה לסנן אחרת, או להוסיף מצרכים למלאי.</p></div>}

      {sections.map((s) => (
        <div key={s.id}>
          {s.he ? <h2 className="h2">על בסיס {s.he} <span className="pill-count">{s.items.length}</span></h2> : <div style={{ height: 14 }} />}
          <div className="cards">
            {s.items.map((e) => (
              <DrinkCard key={e.drink.id} e={e} fav={user.favorites.includes(e.drink.id)} rating={user.ratings[e.drink.id]}
                onOpen={() => onOpen(e.drink.id)} onFav={() => onFav(e.drink.id)} highlight={sort.id} />
            ))}
          </div>
        </div>
      ))}
      {list.length > limit && <div style={{ textAlign: 'center', marginTop: 18 }}><button className="btn black" onClick={() => setLimit(limit + 40)}>עוד קוקטיילים</button></div>}
    </section>
  );
}
