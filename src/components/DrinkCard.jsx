import { heName } from '../data/ingredients.js';
import { FAMILIES } from '../data/match.js';
import { Star } from './Icons.jsx';

const FAM_HE = Object.fromEntries(FAMILIES.map((f) => [f.id, f.he]));

export function servingsText(e) {
  if (!e.ready) return '';
  if (e.servings == null) return 'בלי הגבלה';
  return `מספיק ל-${e.servings}`;
}

export function missingText(e) {
  const names = [...e.missing.map((i) => heName(i.name)), ...e.notEnough.map((i) => `עוד ${i.he}`)];
  return [...new Set(names)].join(', ');
}

export default function DrinkCard({ e, fav, rating, onOpen, onFav }) {
  const miss = missingText(e);
  return (
    <article className="card">
      <button className="card-open" aria-label={`פתח מתכון ${e.drink.name}`} onClick={onOpen} />
      <img className="thumb" src={`${e.drink.thumb}/preview`} alt="" loading="lazy" width="64" height="64" />
      <div className="body">
        <div className="name" dir="ltr" style={{ textAlign: 'right' }}>{e.drink.name}</div>
        <div className="tags">
          {e.families.slice(0, 3).map((f) => <span key={f} className="tag">{FAM_HE[f]}</span>)}
          {rating != null && <span className="tag" style={{ background: '#111', color: '#FFE14D' }}>★ {rating}</span>}
        </div>
        <div className="meta">
          {e.ready ? servingsText(e) : `${e.drink.ingredients.length} מצרכים`}
          {e.subs.length > 0 && ` · החלפה: ${heName(e.subs[0].ing.name)} ← ${e.subs[0].using.he}`}
        </div>
      </div>
      <button className="ghost" aria-label={fav ? 'הסר מהמועדפים' : 'הוסף למועדפים'} aria-pressed={fav} onClick={onFav}>
        <Star on={fav} size={34} />
      </button>
      {!e.ready && miss && <div className="sticker">חסר: {miss}</div>}
    </article>
  );
}
