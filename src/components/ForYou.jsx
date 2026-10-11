import { useMemo } from 'react';
import { recommend } from '../data/taste.js';
import DrinkCard from './DrinkCard.jsx';

export default function ForYou({ index, user, onOpen, onFav }) {
  const rec = useMemo(() => recommend(index, user.ratings), [index, user.ratings]);
  return (
    <section className="screen" aria-label="מומלץ בשבילך">
      <h1 className="h1" style={{ margin: '8px 0 12px' }}>בשבילך</h1>
      {rec.needMore > 0 ? (
        <div className="bubble"><b>תדרג עוד {rec.needMore === 1 ? 'קוקטייל אחד' : `${rec.needMore} קוקטיילים`} ואני אתחיל לנחש מה תאהב!</b></div>
      ) : (
        <div className="bubble">
          <b>{rec.top?.length ? `נראה שאתה אוהב: ${rec.top.join(' · ')}` : 'עדיין לומד את הטעם שלך…'}</b>
          <div style={{ fontSize: 13, marginTop: 4, fontWeight: 500 }}>ההמלצות מתעדכנות עם כל דירוג. כרטיס עם "חסר" — צריך לקנות מצרך אחד.</div>
        </div>
      )}
      {rec.needMore === 0 && rec.items.length === 0 && <div className="empty">לא מצאתי עוד התאמות טובות — נסה להוסיף מצרכים למלאי.</div>}
      <div className="cards" style={{ marginTop: 18 }}>
        {rec.items.map((e) => (
          <DrinkCard key={e.drink.id} e={e} fav={user.favorites.includes(e.drink.id)} rating={user.ratings[e.drink.id]}
            onOpen={() => onOpen(e.drink.id)} onFav={() => onFav(e.drink.id)} />
        ))}
      </div>
    </section>
  );
}
