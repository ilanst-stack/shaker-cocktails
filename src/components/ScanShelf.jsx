// צילום הבר / בקבוק → זיהוי עם Gemini → אישור שלך → הוספה למלאי
import { useRef, useState } from 'react';
import { aiReady } from '../firebase.js';
import { compressImage } from '../data/userData.js';
import { GROUPS, getGroup, unitOf, UNIT_HE } from '../data/ingredients.js';
import { newItem } from './Inventory.jsx';
import { IconCamera, IconGallery } from './Icons.jsx';
import { isAlcoholKey } from '../data/age.js';

const OPTIONS = GROUPS.filter((g) => !g.assumed).sort((a, b) => a.he.localeCompare(b.he, 'he'));

export default function ScanShelf({ inventory, setInventory, kids }) {
  const fileRef = useRef(null);
  const galleryRef = useRef(null);
  const [state, setState] = useState('idle'); // idle | busy | review | error
  const [img, setImg] = useState(null);
  const [rows, setRows] = useState([]);
  const [err, setErr] = useState('');
  const [source, setSource] = useState('camera'); // camera | gallery
  const have = new Map(inventory.map((i) => [i.key, i]));

  async function onFile(ev, src) {
    const f = ev.target.files?.[0];
    setSource(src);
    ev.target.value = '';
    if (!f) return;
    setState('busy'); setErr('');
    try {
      const data = await compressImage(f, 1400);
      setImg(data);
      const { identifyBottles } = await import('../data/vision.js');
      const found = (await identifyBottles(data)).filter((r) => !kids || !isAlcoholKey(r.key));
      setRows(found.map((r) => ({ ...r, on: !have.has(r.key) && r.confidence >= 0.5, exists: have.has(r.key) })));
      setState(found.length ? 'review' : 'error');
      if (!found.length) setErr(src === 'camera'
        ? 'לא זיהיתי משקאות בתמונה. נסה לצלם שוב — קרוב יותר, עם התווית מול המצלמה.'
        : 'לא זיהיתי משקאות בתמונה. נסה תמונה אחרת, שבה התוויות ברורות.');
    } catch (e) {
      console.error(e); // הפרטים הטכניים נשארים רק בקונסול
      const { isBusyError } = await import('../data/ai.js');
      setErr(isBusyError(e)
        ? 'שירות הזיהוי עמוס כרגע. נסה שוב בעוד דקה.'
        : src === 'camera' ? 'הזיהוי נכשל. נסה לצלם שוב, או צילום נוסף מזווית אחרת.' : 'הזיהוי נכשל. נסה תמונה אחרת מהגלריה.');
      setState('error');
    }
  }

  const upd = (k, patch) => setRows(rows.map((r, i) => (i === k ? { ...r, ...patch } : r)));

  function apply() {
    let inv = [...inventory];
    for (const r of rows.filter((x) => x.on)) {
      const amount = Math.max(0, Number(r.amount) || 0);
      const idx = inv.findIndex((i) => i.key === r.key);
      const label = r.labels.filter(Boolean).join(' + ');
      if (idx >= 0) inv[idx] = { ...inv[idx], unlimited: false, unit: unitOf(r.key), amount, ...(label ? { label } : {}) };
      else inv.push(newItem(r.key, amount, label));
    }
    setInventory(inv);
    setState('idle'); setRows([]); setImg(null);
  }

  const chosen = rows.filter((r) => r.on).length;

  return (
    <div className="panel" style={{ marginTop: 16, background: '#1FA3D9', color: '#fff' }}>
      <div style={{ font: '700 28px/1 var(--display)' }}>צלם את הבר!</div>
      <div style={{ fontSize: 13, marginTop: 4 }}>צילום של המדף או של בקבוק — אני אזהה ואציע להוסיף</div>
      <input ref={fileRef} type="file" accept="image/*" capture="environment" hidden onChange={(ev) => onFile(ev, 'camera')} />
      <input ref={galleryRef} type="file" accept="image/*" hidden onChange={(ev) => onFile(ev, 'gallery')} />
      <div className="row" style={{ gap: 10, marginTop: 10 }}>
        <button className="btn small" style={{ flex: 1 }} disabled={!aiReady || state === 'busy'} onClick={() => fileRef.current?.click()}>
          <IconCamera /> {state === 'busy' && source === 'camera' ? 'מזהה…' : 'צילום'}
        </button>
        <button className="btn small" style={{ flex: 1 }} disabled={!aiReady || state === 'busy'} onClick={() => galleryRef.current?.click()}>
          <IconGallery /> {state === 'busy' && source === 'gallery' ? 'מזהה…' : 'מהגלריה'}
        </button>
      </div>
      {!aiReady && <p style={{ fontSize: 13, margin: '8px 0 0', fontWeight: 700 }}>הזיהוי עדיין לא הופעל — מחכה להגדרת Fraud Defense ב-Firebase.</p>}
      {state === 'error' && <p role="alert" style={{ fontWeight: 700, margin: '10px 0 0', background: '#fff', color: '#111', border: '2px solid #111', padding: '6px 10px' }}>{err}</p>}

      {state === 'review' && (
        <div style={{ marginTop: 12, background: '#fff', color: '#111', border: '3px solid #111', padding: 10 }}>
          {img && <img src={img} alt="התמונה שצילמת" style={{ width: '100%', maxHeight: 220, objectFit: 'cover', border: '2px solid #111' }} />}
          <div style={{ font: '700 24px var(--display)', margin: '8px 0 4px' }}>זה מה שמצאתי — לאשר?</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {rows.map((r, k) => (
              <div key={k} style={{ border: '2px solid #111', padding: 8, background: r.on ? '#FFF7C2' : '#fff' }}>
                <label className="row" style={{ gap: 8, fontWeight: 700 }}>
                  <input type="checkbox" checked={r.on} onChange={(e) => upd(k, { on: e.target.checked })} style={{ width: 22, height: 22 }} />
                  <span style={{ flex: 1 }}>{r.labels.join(' + ')}</span>
                  {r.confidence < 0.5 && <span className="tag" style={{ background: '#FFD1CF' }}>לא בטוח</span>}
                </label>
                <div className="row" style={{ gap: 6, marginTop: 6, flexWrap: 'wrap' }}>
                  <select aria-label="קטגוריה" value={r.key} onChange={(e) => { const g = getGroup(e.target.value); upd(k, { key: g.key, he: g.he, unit: unitOf(g.key), exists: have.has(g.key) }); }}
                    style={{ flex: 1, minWidth: 150, minHeight: 40, border: '2px solid #111', fontSize: 15 }}>
                    {OPTIONS.map((g) => <option key={g.key} value={g.key}>{g.he}</option>)}
                  </select>
                  <input aria-label="כמות" className="amount" type="number" inputMode="decimal" value={r.amount} onChange={(e) => upd(k, { amount: e.target.value })} />
                  <span style={{ fontSize: 13 }}>{UNIT_HE[r.unit]}</span>
                </div>
                {r.exists && <div style={{ fontSize: 12, marginTop: 4 }}>כבר במלאי ({have.get(r.key).unlimited ? 'בלי הגבלה' : `${have.get(r.key).amount} ${UNIT_HE[unitOf(r.key)]}`}) — סימון יעדכן את הכמות</div>}
              </div>
            ))}
          </div>
          <div className="row" style={{ gap: 8, marginTop: 10 }}>
            <button className="btn small" style={{ flex: 1 }} onClick={() => { setState('idle'); setRows([]); setImg(null); }}>ביטול</button>
            <button className="btn red small" style={{ flex: 2 }} disabled={!chosen} onClick={apply}>הוסף {chosen} למלאי</button>
          </div>
        </div>
      )}
    </div>
  );
}
