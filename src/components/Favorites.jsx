import { useMemo, useState } from 'react';
import DrinkCard from './DrinkCard.jsx';

export default function Favorites({ index, user, onOpen, onFav }) {
  const [tab, setTab] = useState('fav');
  const byId = useMemo(() => new Map(index.map((e) => [e.drink.id, e])), [index]);
  const favs = user.favorites.map((id) => byId.get(id)).filter(Boolean);
  const tasted = Object.entries(user.tasted || {})
    .sort((a, b) => b[1] - a[1])
    .map(([id]) => byId.get(id)).filter(Boolean);
  const list = tab === 'fav' ? favs : tasted;
  return (
    <section className="screen" aria-label="המועדפים שלי">
      <h1 className="h1" style={{ margin: '8px 0 12px' }}>שלי</h1>
      <div className="seg" role="group" aria-label="תצוגה">
        <button aria-pressed={tab === 'fav'} onClick={() => setTab('fav')}>★ מועדפים ({favs.length})</button>
        <button aria-pressed={tab === 'tasted'} onClick={() => setTab('tasted')}>✔ טעמתי ({tasted.length})</button>
      </div>
      {list.length === 0 && (
        <div className="bubble" style={{ marginTop: 22 }}>
          <b>{tab === 'fav' ? 'עוד אין מועדפים — לחץ על הכוכב בכרטיס קוקטייל.' : 'עוד לא סימנת שטעמת. במתכון: "טעמתי" ודירוג.'}</b>
        </div>
      )}
      <div className="cards" style={{ marginTop: 18 }}>
        {list.map((e) => (
          <DrinkCard key={e.drink.id} e={e} fav={user.favorites.includes(e.drink.id)} rating={user.ratings[e.drink.id]}
            onOpen={() => onOpen(e.drink.id)} onFav={() => onFav(e.drink.id)} />
        ))}
      </div>
    </section>
  );
}
