import { useEffect, useRef, useState } from 'react';
import GlassArt, { glassType } from './GlassArt.jsx';
import { heName, colorOf, getGroup } from '../data/ingredients.js';
import { fmtIngredient } from '../data/measure.js';
import { servingsText, missingText, alcoholText } from './DrinkCard.jsx';
import { Star, IconBack, IconCamera, IconTrash } from './Icons.jsx';
import { loadPhoto, savePhoto, removePhoto, compressImage } from '../data/userData.js';
import { aiReady } from '../firebase.js';

const GLASS_HE = { tall: 'כוס היי-בול', short: 'כוס נמוכה (רוקס)', martini: 'כוס קוקטייל', flute: 'כוס שמפניה', wine: 'כוס יין', mug: 'ספל', shot: 'כוס צ׳ייסר' };

export function splitSteps(text) {
  const parts = String(text || '').replace(/\r/g, ' ').split(/(?<=[.!?])\s+|\n+/).map((s) => s.trim()).filter((s) => s.length > 2);
  while (parts.length > 6) { const a = parts.splice(parts.length - 2, 2); parts.push(a.join(' ')); }
  return parts.length ? parts : ['מערבבים את כל המצרכים ומגישים.'];
}

export default function Recipe({ e, uid, fav, rating, tasted, onBack, onFav, onRate, onTasted }) {
  const d = e.drink;
  const [photo, setPhoto] = useState(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  const fileRef = useRef(null);

  useEffect(() => { let on = true; loadPhoto(uid, d.id).then((p) => on && setPhoto(p)).catch(() => {}); return () => { on = false; }; }, [uid, d.id]);
  useEffect(() => { window.scrollTo(0, 0); }, [d.id]);

  const shown = d.ingredients.filter((i) => !getGroup(i.group)?.assumed);
  const callouts = shown.slice(0, 5);
  const missingSet = new Set(e.missing.map((i) => i.name));
  const steps = splitSteps(d.instructions);

  // תרגום ההוראות לעברית (Gemini), מוצג לצד המקור באנגלית
  const [heSteps, setHeSteps] = useState(null);
  const [trState, setTrState] = useState(aiReady ? 'busy' : 'off');
  const [trTry, setTrTry] = useState(0);
  useEffect(() => {
    if (!aiReady) return undefined;
    let on = true;
    setTrState('busy');
    import('../data/translate.js')
      .then(({ translateSteps }) => translateSteps(uid, d.id, steps))
      .then((he) => { if (on) { setHeSteps(he); setTrState('done'); } })
      .catch((err) => { console.error(err); if (on) setTrState('error'); });
    return () => { on = false; };
  }, [d.id, trTry]); // eslint-disable-line react-hooks/exhaustive-deps
  const gType = glassType(d.glass);
  const hasIce = d.ingredients.some((i) => i.group === 'ice');

  async function onFile(ev) {
    const f = ev.target.files?.[0];
    ev.target.value = '';
    if (!f) return;
    setBusy(true); setMsg('');
    try {
      const data = await compressImage(f);
      await savePhoto(uid, d.id, data);
      setPhoto(data);
      if (!tasted) onTasted(true);
      setMsg('התמונה נשמרה!');
    } catch { setMsg('לא הצלחתי לשמור את התמונה'); }
    setBusy(false);
  }

  return (
    <div className="overlay" role="dialog" aria-modal="true" aria-label={`מתכון ${d.name}`}>
      <div className="app">
        <header className="topbar">
          <button className="icon-btn" aria-label="חזרה" onClick={onBack}><IconBack /></button>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h1 className="h1" dir="ltr" style={{ textAlign: 'right' }}>{d.name}</h1>
            <div style={{ fontSize: 12, fontWeight: 700 }}>{GLASS_HE[gType]} · {d.category}</div>
          </div>
          <button className="icon-btn" style={{ width: 50, height: 50 }} aria-label={fav ? 'הסר מהמועדפים' : 'הוסף למועדפים'} aria-pressed={fav} onClick={onFav}><Star on={fav} size={30} /></button>
        </header>

        <div style={{ padding: '0 16px' }}>
          <section className="recipe-hero dots-cyan" aria-label="מצרכים וכמויות">
            <div className="glass-wrap"><GlassArt drink={d} width={170} /></div>
            <div className="callouts">
              {callouts.map((i, k) => (
                <div key={k} className="callout" style={{ background: missingSet.has(i.name) ? '#FFD1CF' : k % 3 === 1 ? colorOf(i.name) : '#fff' }}>
                  <b>{fmtIngredient(i)}</b>
                  <span>{heName(i.name)}{missingSet.has(i.name) ? ' (חסר!)' : ''}</span>
                </div>
              ))}
            </div>
            <div className="burst burst-badge" style={{ background: e.ready ? '#E8322B' : '#111' }} aria-label={e.ready ? servingsText(e) : 'חסר מצרך'}>
              {!e.ready ? <span>חסר<br />מצרך</span>
                : e.servings == null ? <span>בלי<br />הגבלה!</span>
                  : <span><small>מספיק ל-</small><big>{e.servings}</big><small>{e.servings === 1 ? 'כוס' : 'כוסות'}</small></span>}
            </div>
          </section>

          {(shown.length > 5 || !e.ready || e.subs.length > 0) && (
            <div className="panel" style={{ marginTop: 16 }}>
              <div style={{ font: '700 24px var(--display)' }}>כל המצרכים</div>
              <ul style={{ margin: '6px 0 0', paddingInlineStart: 18, lineHeight: 1.7 }}>
                {shown.map((i, k) => (
                  <li key={k} style={{ fontWeight: missingSet.has(i.name) ? 700 : 400, color: missingSet.has(i.name) ? '#B00020' : 'inherit' }}>
                    {heName(i.name)} — {fmtIngredient(i)} <small className="muted" dir="ltr">({i.measure} {i.name})</small>
                  </li>
                ))}
              </ul>
              {!e.ready && <p style={{ margin: '6px 0 0', fontWeight: 700 }}>חסר: {missingText(e)}</p>}
              {e.subs.map((s, k) => <p key={k} style={{ margin: '4px 0 0', fontSize: 14 }}>במקום {heName(s.ing.name)} אפשר להשתמש ב{s.using.he}</p>)}
            </div>
          )}

          <h2 className="h2">אופן ההכנה <span className="pill-count">{steps.length === 1 ? 'שלב אחד' : `${steps.length} שלבים`}</span></h2>
          <ol className="steps">
            {steps.map((s, k) => (
              <li key={k} className="step">
                <div className="num">{k + 1}</div>
                <div className="step-cols">
                  <p className="he" lang="he">{heSteps?.[k] ?? (trState === 'busy' ? 'מתרגם…' : '—')}</p>
                  <p className="en" dir="ltr" lang="en">{s}</p>
                </div>
              </li>
            ))}
          </ol>
          {trState === 'off' && <p className="muted" style={{ fontSize: 12, margin: '6px 0 0' }}>התרגום לעברית יופעל אחרי הגדרת Gemini.</p>}
          {trState === 'error' && <p style={{ fontSize: 13, margin: '6px 0 0', fontWeight: 700 }}>התרגום לא הצליח כרגע. <button className="btn small" style={{ minHeight: 34, fontSize: 18 }} onClick={() => setTrTry(trTry + 1)}>לנסות שוב</button></p>}

          <div className="serve">
            <span>כוס: {GLASS_HE[gType]}</span>
            {hasIce && <span>עם קרח</span>}
            <span>{alcoholText(e)}{e.alcohol.pure > 0 ? ` (~${e.alcohol.abv}%)` : ''}</span>
            <span>הכנה: ~{e.minutes} דק׳</span>
            <span>{e.count} מצרכים</span>
          </div>

          <h2 className="h2">הקוקטייל שלי</h2>
          <div className="panel">
            <div className="row" style={{ justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
              <button className={`btn small ${tasted ? 'black' : ''}`} aria-pressed={tasted} onClick={() => onTasted(!tasted)}>{tasted ? '✔ טעמתי' : 'טעמתי?'}</button>
              <div className="stars" role="group" aria-label="דירוג">
                <button className="zero-btn" aria-label="0 כוכבים — לא אהבתי בכלל" title="0 — לא אהבתי בכלל" onClick={() => onRate(0)} aria-pressed={rating === 0}>0</button>
                {[1, 2, 3, 4, 5].map((n) => (
                  <button key={n} aria-label={`${n} כוכבים`} aria-pressed={rating === n} onClick={() => onRate(n)}><Star on={rating != null && n <= rating} size={30} fill="#E8322B" /></button>
                ))}
              </div>
            </div>
            <div style={{ fontWeight: 700, fontSize: 14, marginTop: 6 }} role="status">
              {rating == null ? 'עוד לא דירגת · 0 = לא אהבתי בכלל, 5 = מושלם' : rating === 0 ? 'דירגת 0 — לא אהבת בכלל' : `דירגת ${rating} מתוך 5`}
            </div>
            <div style={{ marginTop: 14 }}>
              {photo ? (
                <img className="photo" src={photo} alt={`התמונה שלי של ${d.name}`} />
              ) : (
                <img className="photo" src={d.thumb} alt={`${d.name} – תמונה מהמאגר`} style={{ opacity: 0.9 }} loading="lazy" />
              )}
              <div className="row" style={{ marginTop: 12, gap: 10 }}>
                <input ref={fileRef} type="file" accept="image/*" hidden onChange={onFile} />
                <button className="btn cyan small" style={{ flex: 1 }} disabled={busy} onClick={() => fileRef.current?.click()}>
                  <IconCamera /> {busy ? 'שומר…' : photo ? 'החלף תמונה' : 'צילום / העלאת תמונה'}
                </button>
                {photo && <button className="icon-btn" aria-label="מחק תמונה" onClick={async () => { await removePhoto(uid, d.id); setPhoto(null); }}><IconTrash /></button>}
              </div>
              {msg && <p role="status" style={{ fontWeight: 700, margin: '8px 0 0' }}>{msg}</p>}
            </div>
          </div>
        </div>

        <div className="sticky-actions">
          <button className="btn" style={{ flex: 1 }} onClick={onBack}>חזרה</button>
          <button className="btn red" style={{ flex: 2 }} onClick={() => { onTasted(true); document.querySelector('.stars')?.scrollIntoView({ behavior: 'smooth', block: 'center' }); }}>הכנתי! לדירוג</button>
        </div>
      </div>
    </div>
  );
}
