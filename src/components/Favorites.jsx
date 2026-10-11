import { useMemo, useState } from 'react';
import DrinkCard from './DrinkCard.jsx';
import { SortBar } from './CocktailList.jsx';
import { sortEntries } from '../data/match.js';
import { useSticky } from '../data/sticky.js';

export default function Favorites({ index, user, onOpen, onFav }) {
  const [tab, setTab] = useSticky('fav.tab', 'fav');
  const [sort, setSort] = useSticky('fav.sort', { id: 'rating', dir: 'desc' });
  const [onlyHouse, setOnlyHouse] = useSticky('fav.house', false);
  const byId = useMemo(() => new Map(index.map((e) => [e.drink.id, e])), [index]);
  const favs = user.favorites.map((id) => byId.get(id)).filter(Boolean);
  const tasted = Object.entries(user.tasted || {})
    .sort((a, b) => b[1] - a[1])
    .map(([id]) => byId.get(id)).filter(Boolean);
  const list = sortEntries((tab === 'fav' ? favs : tasted).filter((e) => !onlyHouse || e.drink.custom), sort.id, sort.dir, user);
  return (
    <section className="screen" aria-label="המועדפים שלי">
      <h1 className="h1" style={{ margin: '8px 0 12px' }}>מועדפים וטעימות</h1>
      <div className="seg" role="group" aria-label="תצוגה">
        <button aria-pressed={tab === 'fav'} onClick={() => setTab('fav')}>★ מועדפים ({favs.length})</button>
        <button aria-pressed={tab === 'tasted'} onClick={() => setTab('tasted')}>✔ טעמתי ({tasted.length})</button>
      </div>
      <SortBar sort={sort} setSort={setSort} onlyHouse={onlyHouse} setOnlyHouse={setOnlyHouse} />
      {list.length === 0 && (
        <div className="bubble" style={{ marginTop: 22 }}>
          <b>{tab === 'fav' ? 'עוד אין מועדפים — לחץ על הכוכב בכרטיס קוקטייל.' : 'עוד לא סימנת שטעמת. במתכון: "טעמתי" ודירוג.'}</b>
        </div>
      )}
      <div className="cards" style={{ marginTop: 18 }}>
        {list.map((e) => (
          <DrinkCard key={e.drink.id} e={e} fav={user.favorites.includes(e.drink.id)} rating={user.ratings[e.drink.id]}
            onOpen={() => onOpen(e.drink.id)} onFav={() => onFav(e.drink.id)} highlight={sort.id} />
        ))}
      </div>
    </section>
  );
}
