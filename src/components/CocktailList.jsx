import { useMemo, useState } from 'react';
import { BASES, FAMILIES } from '../data/match.js';
import DrinkCard from './DrinkCard.jsx';

export default function CocktailList({ index, user, onOpen, onFav, inventoryCount }) {
  const [mode, setMode] = useState('ready'); // ready | almost
  const [base, setBase] = useState('all');
  const [fam, setFam] = useState(null);
  const [limit, setLimit] = useState(40);

  const readyCount = useMemo(() => index.filter((e) => e.ready).length, [index]);
  const almostCount = useMemo(() => index.filter((e) => !e.ready && e.gap <= 2).length, [index]);

  const list = useMemo(() => {
    let l = mode === 'ready' ? index.filter((e) => e.ready) : index.filter((e) => !e.ready && e.gap <= 2);
    if (base !== 'all') l = l.filter((e) => e.base === base);
    if (fam) l = l.filter((e) => e.families.includes(fam));
    return l.sort((a, b) => a.gap - b.gap || (b.servings ?? 99) - (a.servings ?? 99) || a.drink.name.localeCompare(b.drink.name));
  }, [index, mode, base, fam]);

  const basesPresent = useMemo(() => {
    const pool = mode === 'ready' ? index.filter((e) => e.ready) : index.filter((e) => !e.ready && e.gap <= 2);
    const counts = new Map();
    for (const e of pool) counts.set(e.base, (counts.get(e.base) || 0) + 1);
    return BASES.filter((b) => counts.has(b.id)).map((b) => ({ ...b, n: counts.get(b.id) }));
  }, [index, mode]);

  const sections = useMemo(() => {
    const shown = list.slice(0, limit);
    if (base !== 'all') return [{ id: base, he: BASES.find((b) => b.id === base)?.he, items: shown }];
    return BASES.map((b) => ({ id: b.id, he: b.he, items: shown.filter((e) => e.base === b.id) })).filter((s) => s.items.length);
  }, [list, base, limit]);

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

      <nav className="chips" aria-label="בסיס">
        <button className="chip" aria-pressed={base === 'all'} onClick={() => setBase('all')}>הכל</button>
        {basesPresent.map((b) => <button key={b.id} className="chip" aria-pressed={base === b.id} onClick={() => setBase(b.id)}>{b.he} {b.n}</button>)}
      </nav>
      <nav className="chips" aria-label="סגנון" style={{ paddingTop: 0 }}>
        {FAMILIES.map((f) => <button key={f.id} className="chip sm" aria-pressed={fam === f.id} onClick={() => setFam(fam === f.id ? null : f.id)}>{f.he}</button>)}
      </nav>

      {list.length === 0 && <div className="empty"><b style={{ font: '700 30px var(--display)' }}>אין כאן כלום (עדיין)</b><p>נסה לסנן אחרת, או להוסיף מצרכים למלאי.</p></div>}

      {sections.map((s) => (
        <div key={s.id}>
          <h2 className="h2">על בסיס {s.he} <span className="pill-count">{s.items.length}</span></h2>
          <div className="cards">
            {s.items.map((e) => (
              <DrinkCard key={e.drink.id} e={e} fav={user.favorites.includes(e.drink.id)} rating={user.ratings[e.drink.id]}
                onOpen={() => onOpen(e.drink.id)} onFav={() => onFav(e.drink.id)} />
            ))}
          </div>
        </div>
      ))}
      {list.length > limit && <div style={{ textAlign: 'center', marginTop: 18 }}><button className="btn black" onClick={() => setLimit(limit + 40)}>עוד קוקטיילים</button></div>}
    </section>
  );
}
