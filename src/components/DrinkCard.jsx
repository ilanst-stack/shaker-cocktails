import { heName } from '../data/ingredients.js';
import { FAMILIES } from '../data/match.js';
import { Star } from './Icons.jsx';
import { heDrinkName } from '../data/hebrewNames.js';

const FAM_HE = Object.fromEntries(FAMILIES.map((f) => [f.id, f.he]));

export function servingsText(e) {
  if (!e.ready) return '';
  if (e.servings == null) return 'בלי הגבלה';
  return `מספיק ל-${e.servings} ${e.servings === 1 ? 'כוס' : 'כוסות'}`;
}

export function missingText(e) {
  const names = [...e.missing.map((i) => heName(i.name)), ...e.notEnough.map((i) => `עוד ${i.he}`)];
  return [...new Set(names)].join(', ');
}

export function subText(e) {
  const s = e.subs.find((x) => !x.squeeze);
  return s ? `החלפה: ${heName(s.ing.name)} ← ${s.using.he}` : '';
}

export function alcoholText(e) {
  return e.alcohol.pure > 0 ? `${Math.round(e.alcohol.pure)} מ״ל אלכוהול` : 'ללא אלכוהול';
}

export default function DrinkCard({ e, fav, rating, onOpen, onFav, highlight, showReady }) {
  const hl = (k) => `stat ${highlight === k ? 'hl' : ''}`;
  const miss = missingText(e);
  const he = heDrinkName(e.drink.name);
  const missCount = e.missing.length + e.notEnough.length;
  return (
    <article className="card">
      <button className="card-open" aria-label={`פתח מתכון ${e.drink.name}`} onClick={onOpen} />
      <img className="thumb" src={`${e.drink.thumb}/preview`} alt="" loading="lazy" width="64" height="64" />
      <div className="body">
        <div className="name" dir="ltr" style={{ textAlign: 'right' }}>{e.drink.name}</div>
        {he && <div style={{ fontSize: 13, fontWeight: 700 }}>{he}</div>}
        <div className="tags">
          {e.families.slice(0, 3).map((f) => <span key={f} className="tag">{FAM_HE[f]}</span>)}
          {rating != null && <span className="tag" style={{ background: '#111', color: '#FFE14D' }}>★ {rating}</span>}
        </div>
        <div className="meta" style={{ display: 'flex', flexWrap: 'wrap', gap: '2px 8px' }}>
          <span className={hl('alcohol')}>{alcoholText(e)}</span>
          <span className={hl('time')}>~{e.minutes} דק׳</span>
          <span className={hl('count')}>{e.count} מצרכים</span>
        </div>
        <div className="meta" style={{ marginTop: 2, fontWeight: 500 }}>
          {e.ready && servingsText(e)}
          {subText(e) && `${e.ready ? ' · ' : ''}${subText(e)}`}
        </div>
      </div>
      <button className="ghost" aria-label={fav ? 'הסר מהמועדפים' : 'הוסף למועדפים'} aria-pressed={fav} onClick={onFav}>
        <Star on={fav} size={34} />
      </button>
      {!e.ready && miss && <div className="sticker">{missCount > 1 ? `חסרים ${missCount}: ` : 'חסר: '}{miss}</div>}
      {showReady && e.ready && <div className="sticker blue">אפשר להכין!</div>}
    </article>
  );
}
