// טופס "מתכון בית": שם, כוס, מצרכים וכמויות, שלבי הכנה, תמונה, וסיפור חופשי
import { useRef, useState } from 'react';
import { GROUPS, groupOf } from '../data/ingredients.js';
import { GLASSES, FORM_UNITS, saveCustom, deleteCustom } from '../data/custom.js';
import { compressImage, savePhoto, removePhoto } from '../data/userData.js';
import { IconBack, IconCamera, IconGallery, IconTrash, IconPlus } from './Icons.jsx';

const OPTIONS = GROUPS.filter((g) => !g.assumed).map((g) => g.he).sort((a, b) => a.localeCompare(b, 'he'));
const emptyRow = () => ({ name: '', qty: '', unit: 'ml' });

export default function CustomEditor({ uid, drink, onClose, onSaved, kids }) {
  const raw = drink?.raw;
  const [name, setName] = useState(raw?.name || '');
  const [glass, setGlass] = useState(raw?.glass || GLASSES[0].id);
  const [rows, setRows] = useState(raw?.ingredients?.length ? raw.ingredients : [emptyRow(), emptyRow()]);
  const [steps, setSteps] = useState((raw?.steps || []).join('\n'));
  const [notes, setNotes] = useState(raw?.notes || '');
  const [thumb, setThumb] = useState(raw?.thumb || null);
  const [photo, setPhoto] = useState(null); // תמונה חדשה בגודל מלא
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const camRef = useRef(null);
  const galRef = useRef(null);

  const upd = (k, patch) => setRows(rows.map((r, i) => (i === k ? { ...r, ...patch } : r)));

  async function onFile(ev) {
    const f = ev.target.files?.[0];
    ev.target.value = '';
    if (!f) return;
    setPhoto(await compressImage(f));
    setThumb(await compressImage(f, 240));
  }

  async function save() {
    setErr('');
    const ings = rows.filter((r) => r.name.trim()).map((r) => ({ ...r, name: r.name.trim(), key: groupOf(r.name)?.key || null }));
    if (!name.trim()) return setErr('צריך לתת לקוקטייל שם');
    if (!ings.length) return setErr('צריך לפחות מצרך אחד');
    if (kids && ings.some((i) => ['spirit', 'liqueur', 'wine'].includes(groupOf(i.name)?.kind))) return setErr('במצב מוקטיילים אי אפשר להוסיף מצרכים עם אלכוהול');
    setBusy(true);
    try {
      const id = await saveCustom(uid, drink?.docId, {
        name: name.trim(), glass, ingredients: ings,
        steps: steps.split('\n').map((s) => s.trim()).filter(Boolean),
        notes: notes.trim(), thumb: thumb || null, createdAt: raw?.createdAt || Date.now(),
      });
      if (photo) await savePhoto(uid, `c_${id}`, photo);
      if (!thumb && raw?.thumb) await removePhoto(uid, `c_${id}`).catch(() => {});
      onSaved?.(`c_${id}`);
    } catch (e) {
      console.error(e);
      setErr('השמירה נכשלה, נסה שוב');
    }
    setBusy(false);
  }

  async function remove() {
    if (!drink || !confirm(`למחוק את "${raw.name}"?`)) return;
    await deleteCustom(uid, drink.docId);
    await removePhoto(uid, drink.id).catch(() => {});
    onClose();
  }

  return (
    <div className="overlay" role="dialog" aria-modal="true" aria-label="מתכון בית">
      <div className="app">
        <header className="topbar">
          <button className="icon-btn" aria-label="סגירה" onClick={onClose}><IconBack /></button>
          <h1 className="h1" style={{ flex: 1 }}>{drink ? 'עריכת מתכון בית' : 'מתכון בית חדש'}</h1>
        </header>
        <div className="screen" style={{ paddingBottom: 30 }}>
          <datalist id="ing-options">{OPTIONS.map((o) => <option key={o} value={o} />)}</datalist>

          <div className="panel form">
            <label htmlFor="c-name">שם הקוקטייל *</label>
            <input id="c-name" className="field" value={name} onChange={(e) => setName(e.target.value)} placeholder="למשל: הסוד של צורן" />

            <label htmlFor="c-glass">כוס הגשה</label>
            <select id="c-glass" className="field" value={glass} onChange={(e) => setGlass(e.target.value)}>
              {GLASSES.map((g) => <option key={g.id} value={g.id}>{g.he}</option>)}
            </select>
          </div>

          <h2 className="h2">מצרכים</h2>
          <div className="panel form">
            {rows.map((r, k) => (
              <div key={k} className="ing-row">
                <input aria-label={`מצרך ${k + 1}`} className="field" list="ing-options" value={r.name} onChange={(e) => upd(k, { name: e.target.value })} placeholder="מצרך (למשל וודקה)" />
                <input aria-label="כמות" className="field qty" type="number" inputMode="decimal" min="0" value={r.qty} onChange={(e) => upd(k, { qty: e.target.value })} disabled={r.unit === 'taste'} />
                <select aria-label="יחידה" className="field unit" value={r.unit} onChange={(e) => upd(k, { unit: e.target.value })}>
                  {FORM_UNITS.map((u) => <option key={u.id} value={u.id}>{u.he}</option>)}
                </select>
                <button className="ghost" aria-label="הסר מצרך" onClick={() => setRows(rows.filter((_, i) => i !== k))}><IconTrash /></button>
              </div>
            ))}
            <button className="btn small" onClick={() => setRows([...rows, emptyRow()])}><IconPlus /> מצרך</button>
            <p className="muted" style={{ fontSize: 12, margin: '8px 0 0' }}>בחירה מהרשימה מחברת את המצרך למלאי, כדי לדעת מה חסר וכמה כוסות אפשר להכין.</p>
          </div>

          <h2 className="h2">אופן ההכנה</h2>
          <div className="panel form">
            <label htmlFor="c-steps">כל שורה = שלב</label>
            <textarea id="c-steps" className="field" rows={5} value={steps} onChange={(e) => setSteps(e.target.value)} placeholder={'ממלאים כוס בקרח\nמוזגים את הוודקה\nמשלימים בג׳ינג׳ר ביר'} />
          </div>

          <h2 className="h2">הסיפור</h2>
          <div className="panel form">
            <label htmlFor="c-notes">מאיפה הגיע, מי המציא, לאיזה אירוע…</label>
            <textarea id="c-notes" className="field" rows={4} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="הומצא במסיבת יום ההולדת של…" />
          </div>

          <h2 className="h2">תמונה</h2>
          <div className="panel form">
            {thumb && <img src={photo || thumb} alt="תמונת הקוקטייל" className="photo" style={{ maxHeight: 260, objectFit: 'cover' }} />}
            <input ref={camRef} type="file" accept="image/*" capture="environment" hidden onChange={onFile} />
            <input ref={galRef} type="file" accept="image/*" hidden onChange={onFile} />
            <div className="row" style={{ gap: 10, marginTop: thumb ? 10 : 0 }}>
              <button className="btn small" style={{ flex: 1 }} onClick={() => camRef.current?.click()}><IconCamera /> צילום</button>
              <button className="btn small" style={{ flex: 1 }} onClick={() => galRef.current?.click()}><IconGallery /> מהגלריה</button>
              {thumb && <button className="icon-btn" aria-label="הסר תמונה" onClick={() => { setThumb(null); setPhoto(null); }}><IconTrash /></button>}
            </div>
          </div>

          {err && <div role="alert" className="scan-err" style={{ marginTop: 16 }}>{err}</div>}
          <div className="row" style={{ gap: 10, marginTop: 18 }}>
            {drink && <button className="btn small" onClick={remove}><IconTrash /> מחיקה</button>}
            <button className="btn" style={{ flex: 1 }} onClick={onClose}>ביטול</button>
            <button className="btn red" style={{ flex: 2 }} disabled={busy} onClick={save}>{busy ? 'שומר…' : 'שמירה'}</button>
          </div>
        </div>
      </div>
    </div>
  );
}
