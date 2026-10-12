// רשימת קניות: מוסיפים מוצר + כמות; סימון "נקנה" מוסיף אותו אוטומטית למלאי
import { useMemo, useState } from 'react';
import { GROUPS, getGroup, groupOf, norm, unitOf } from '../data/ingredients.js';
import { searchBrands, isReadyKey } from '../data/brands.js';
import { newId, isLow, isOut, addPurchase } from '../data/inventory.js';
import { isAlcoholKey } from '../data/age.js';
import { newItem } from './Inventory.jsx';
import { IconBack, IconTrash, IconPlus, IconShare, IconCheck } from './Icons.jsx';

const UNITS = [
  { id: 'bottle', he: 'בקבוק' },
  { id: 'ml', he: 'מ״ל' },
  { id: 'pcs', he: 'יח׳' },
  { id: 'g', he: 'גר׳' },
];
const BOTTLES = [200, 330, 350, 500, 700, 750, 1000, 1500, 2000];

function defaultsFor(key) {
  const u = unitOf(key);
  const kind = getGroup(key)?.kind;
  if (u === 'pcs') return { unit: 'pcs', qty: 6 };
  if (u === 'g') return { unit: 'g', qty: 1000 };
  return { unit: 'bottle', qty: 1, bottleMl: ['juice', 'mixer'].includes(kind) ? 1500 : 700 };
}

// מוצר מהמלאי → שורה ברשימת הקניות
export function shopItemFrom(it) {
  return { id: newId(), key: it.key, he: it.he, ...(it.brand ? { brand: it.brand, brandHe: it.brandHe } : {}), ...(it.free ? { free: true } : {}), ...defaultsFor(it.key), done: false };
}

const qtyMl = (s) => (s.unit === 'bottle' ? (Number(s.qty) || 1) * (Number(s.bottleMl) || 700) : Number(s.qty) || 0);
const qtyText = (s) => (s.unit === 'bottle' ? `${s.qty} ${Number(s.qty) === 1 ? 'בקבוק' : 'בקבוקים'} · ${s.bottleMl} מ״ל` : `${s.qty} ${UNITS.find((u) => u.id === s.unit)?.he}`);
const typeOf = (s) => (String(s.key).startsWith('ready:') ? s.key.slice(6) : String(s.he).replace(/\s*\(.*\)\s*$/, ''));
const nameOf = (s) => (s.brand && s.brand !== typeOf(s) ? `${typeOf(s)} – ${s.brand}` : typeOf(s));
// יחידות שמתאימות למוצר: נוזל → בקבוק / מ״ל; פירות וביצים → יח׳; סוכר → גר׳
function unitsFor(s) {
  if (s.free) return UNITS.filter((u) => u.id !== 'g');
  const u = unitOf(s.key);
  if (u === 'pcs') return UNITS.filter((x) => x.id === 'pcs');
  if (u === 'g') return UNITS.filter((x) => x.id === 'g');
  return UNITS.filter((x) => x.id === 'bottle' || x.id === 'ml');
}
const RLM = '\u200F';
// שורה ישנה עם יחידה שלא מתאימה (למשל "1 יח׳" לוויסקי) → בקבוקים
function fixUnit(s) {
  const allowed = unitsFor(s);
  return allowed.some((u) => u.id === s.unit) ? s : { ...s, unit: allowed[0].id, bottleMl: s.bottleMl || 700 };
}

export default function ShoppingList({ shopping, setShopping, inventory, setInventory, index, kids, onClose }) {
  const [q, setQ] = useState('');
  const [toast, setToast] = useState('');
  const open = shopping.filter((s) => !s.done).map(fixUnit);
  const done = shopping.filter((s) => s.done);

  const upd = (id, patch) => setShopping(shopping.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  const del = (id) => setShopping(shopping.filter((s) => s.id !== id));
  const addRow = (row) => { setShopping([...shopping, row]); setQ(''); };

  function bought(s) {
    const unit = s.unit === 'bottle' ? 'ml' : s.unit;
    const mk = () => {
      const base = newItem(s.free ? s.he : s.key, undefined, undefined, s.brand ? { en: s.brand, he: s.brandHe } : undefined);
      return { ...base, unit: base.unit || unit, unlimited: false };
    };
    setInventory(addPurchase(inventory, { key: s.free ? norm(s.he) : s.key, brand: s.brand, qtyMl: qtyMl(s) }, mk));
    upd(s.id, { done: true, doneAt: Date.now() });
    setToast(`${nameOf(s)} נוסף למלאי`);
    setTimeout(() => setToast(''), 2200);
  }

  // הצעות: מה שנגמר/מתמעט במלאי, ומצרכים שחסרים בקוקטיילים שכמעט אפשר להכין
  const suggestions = useMemo(() => {
    const inList = new Set(open.map((s) => `${s.key}|${s.brand || ''}`));
    const fromInv = inventory.filter((it) => (isLow(it) || isOut(it)) && !inList.has(`${it.key}|${it.brand || ''}`))
      .map((it) => ({ id: `i:${it.id}`, text: it.brand || it.he, why: isOut(it) ? 'נגמר' : 'מתמעט', row: () => shopItemFrom(it) }));
    const counts = new Map();
    for (const e of index || []) {
      if (e.gap !== 1 || e.missing.length !== 1) continue;
      const k = e.missing[0].group;
      if (!getGroup(k) || (kids && isAlcoholKey(k)) || inList.has(`${k}|`)) continue;
      counts.set(k, (counts.get(k) || 0) + 1);
    }
    const fromAlmost = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5)
      .map(([k, n]) => ({ id: `a:${k}`, text: getGroup(k).he, why: `יפתח ${n} קוקטיילים`, row: () => ({ id: newId(), key: k, he: getGroup(k).he, ...defaultsFor(k), done: false }) }));
    return [...fromInv, ...fromAlmost];
  }, [inventory, index, open, kids]);

  const results = useMemo(() => {
    const t = norm(q);
    if (!t) return [];
    const out = searchBrands(q, 6).filter((b) => !(kids && (isAlcoholKey(b.key) || isReadyKey(b.key))))
      .map((b) => ({ id: `b:${b.en}`, main: b.en, sub: `${b.he} · ${getGroup(b.key)?.he || 'קוקטייל מוכן'}`,
        row: () => ({ id: newId(), key: b.key, he: getGroup(b.key)?.he || b.he, brand: b.en, brandHe: b.he, ...defaultsFor(b.key), done: false }) }));
    for (const g of GROUPS) {
      if (out.length >= 10) break;
      if (g.assumed || (kids && isAlcoholKey(g.key))) continue;
      if (norm(g.he).includes(t) || g.key.includes(t) || g.aliases.some((a) => norm(a).includes(t))) {
        out.push({ id: g.key, main: g.he, sub: g.aliases[0], row: () => ({ id: newId(), key: g.key, he: g.he, ...defaultsFor(g.key), done: false }) });
      }
    }
    const g = groupOf(q);
    out.push({ id: 'free', main: `+ "${q.trim()}" כמוצר חופשי`, sub: 'לא מהמאגר',
      row: () => ({ id: newId(), key: norm(q), he: q.trim(), free: !g, unit: 'bottle', qty: 1, bottleMl: 700, done: false }) });
    return out;
  }, [q, kids]);

  const [shareOpen, setShareOpen] = useState(false);
  // טקסט: כל פריט בשורה משלו, עם סימן כיוון ימין-לשמאל בתחילת כל שורה
  async function shareText() {
    const lines = [`${RLM}🛒 *רשימת קניות — SHAKE SHAKE*`, '', ...open.map((s) => `${RLM}▫️ ${nameOf(s)} — ${qtyText(s)}`)];
    const text = lines.join('\n');
    setShareOpen(false);
    try {
      if (navigator.share) { await navigator.share({ text }); return; }
    } catch (e) { if (e?.name === 'AbortError') return; }
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank', 'noopener');
  }
  // תמונה: הרשימה מצוירת בעיצוב האפליקציה ונשלחת כקובץ
  async function shareImage() {
    setShareOpen(false);
    const W = 1080, rowH = 96, top = 230;
    const c = document.createElement('canvas');
    c.width = W; c.height = top + open.length * rowH + 80;
    const g = c.getContext('2d');
    g.fillStyle = '#FFE14D'; g.fillRect(0, 0, W, c.height);
    g.fillStyle = '#F2B705';
    for (let y = 10; y < c.height; y += 26) for (let x = 10; x < W; x += 26) { g.beginPath(); g.arc(x, y, 3.2, 0, 7); g.fill(); }
    g.direction = 'rtl'; g.textAlign = 'right'; g.textBaseline = 'middle';
    g.fillStyle = '#111'; g.font = '700 92px Karantina, Rubik, sans-serif';
    g.fillText('רשימת קניות', W - 60, 110);
    g.font = '600 34px "Kumbh Sans", Rubik, sans-serif'; g.textAlign = 'left'; g.direction = 'ltr';
    g.fillText('SHAKE SHAKE', 60, 110);
    open.forEach((s, i) => {
      const y = top + i * rowH;
      g.fillStyle = '#111'; g.fillRect(66, y + 6, W - 120, rowH - 18);
      g.fillStyle = '#fff'; g.fillRect(60, y, W - 120, rowH - 18);
      g.strokeStyle = '#111'; g.lineWidth = 5; g.strokeRect(60, y, W - 120, rowH - 18);
      g.direction = 'rtl'; g.textAlign = 'right'; g.fillStyle = '#111';
      g.font = '700 40px Rubik, sans-serif'; g.fillText(nameOf(s), W - 90, y + (rowH - 18) / 2, W - 520);
      g.textAlign = 'left'; g.font = '500 34px Rubik, sans-serif'; g.fillText(qtyText(s), 90, y + (rowH - 18) / 2, 380);
    });
    const blob = await new Promise((r) => c.toBlob(r, 'image/png'));
    const file = new File([blob], 'shopping-list.png', { type: 'image/png' });
    try {
      if (navigator.canShare?.({ files: [file] })) { await navigator.share({ files: [file] }); return; }
    } catch (e) { if (e?.name === 'AbortError') return; }
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'shopping-list.png'; a.click();
  }

  return (
    <div className="overlay dots" role="dialog" aria-modal="true" aria-labelledby="shop-title">
      <div className="app" style={{ padding: "8px 16px 40px" }}>
        <div className="row" style={{ gap: 10, margin: '8px 0 12px' }}>
          <button className="icon-btn" aria-label="חזרה למלאי" onClick={onClose}><IconBack /></button>
          <h1 id="shop-title" className="h1" style={{ flex: 1 }}>רשימת קניות</h1>
          {open.length > 0 && <button className="btn" style={{ fontSize: 20, minHeight: 44 }} onClick={() => setShareOpen(true)}><IconShare /> שליחה</button>}
        </div>

        <div className="panel" style={{ position: 'relative', padding: 10 }}>
          <input className="field" value={q} onChange={(e) => setQ(e.target.value)} placeholder="מה לקנות? מותג או מצרך…" aria-label="הוספה לרשימת הקניות" autoComplete="off"
            onKeyDown={(e) => { if (e.key === 'Enter' && results[0]) addRow(results[0].row()); }} />
          {results.length > 0 && (
            <div className="suggest" role="listbox">
              {results.map((r) => (
                <button key={r.id} role="option" aria-selected="false" onClick={() => addRow(r.row())}>
                  <b><bdi>{r.main}</bdi></b> <small className="muted"><bdi>{r.sub}</bdi></small>
                </button>
              ))}
            </div>
          )}
        </div>

        {open.length === 0 && <div className="bubble" style={{ marginTop: 18 }}><b>הרשימה ריקה</b><div style={{ fontSize: 14 }}>חפש מוצר למעלה, או בחר מההצעות למטה.</div></div>}

        <div className="inv-list" style={{ marginTop: 14 }}>
          {open.map((s) => (
            <div key={s.id} className="inv-item shop-item">
              <div className="inv-line">
                <button className="check" aria-label={`נקנה: ${nameOf(s)} — להוסיף למלאי`} onClick={() => bought(s)} />
                <div className="n">
                  <bdi>{typeOf(s)}</bdi>
                  {(s.brand && s.brand !== typeOf(s) || s.free) && <small><bdi>{s.brand && s.brand !== typeOf(s) ? s.brand : 'מוצר חופשי'}</bdi></small>}
                </div>
                <button className="ghost" aria-label={`הסר ${nameOf(s)} מהרשימה`} onClick={() => del(s.id)}><IconTrash /></button>
              </div>
              <div className="row" style={{ gap: 6, marginTop: 6, flexWrap: 'wrap' }}>
                <input className="amount" type="number" inputMode="decimal" min="0" aria-label="כמות" value={s.qty} onChange={(e) => upd(s.id, { qty: e.target.value })} style={{ width: 70 }} />
                <select className="field sel" aria-label="יחידה" value={s.unit} onChange={(e) => upd(s.id, { unit: e.target.value, ...(e.target.value === 'bottle' && !s.bottleMl ? { bottleMl: 700 } : {}) })}>
                  {unitsFor(s).map((u) => <option key={u.id} value={u.id}>{u.he}</option>)}
                </select>
                {s.unit === 'bottle' && (
                  <select className="field sel" aria-label="גודל בקבוק" value={s.bottleMl} onChange={(e) => upd(s.id, { bottleMl: Number(e.target.value) })}>
                    {BOTTLES.map((b) => <option key={b} value={b}>{b} מ״ל</option>)}
                  </select>
                )}
              </div>
            </div>
          ))}
        </div>

        {suggestions.length > 0 && (
          <>
            <h2 className="h2" style={{ fontSize: 26 }}>הצעות</h2>
            <div className="row" style={{ flexWrap: 'wrap', gap: 8 }}>
              {suggestions.map((g) => (
                <button key={g.id} className="chip sm" onClick={() => setShopping([...shopping, g.row()])}>
                  <IconPlus /> <bdi>{g.text}</bdi> <small style={{ font: '500 12px var(--body)' }}>({g.why})</small>
                </button>
              ))}
            </div>
          </>
        )}

        {done.length > 0 && (
          <>
            <h2 className="h2" style={{ fontSize: 26 }}>נקנו <button className="toggle" onClick={() => setShopping(open)}>ניקוי</button></h2>
            <div className="inv-list">
              {done.map((s) => (
                <div key={s.id} className="inv-item out-done">
                  <div className="inv-line">
                    <span className="check on" aria-hidden="true"><IconCheck /></span>
                    <div className="n"><s><bdi>{nameOf(s)}</bdi></s><small>נוסף למלאי · {qtyText(s)}</small></div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
      {toast && <div className="toast" role="status">{toast}</div>}
      {shareOpen && (
        <div className="modal-back" role="dialog" aria-modal="true" aria-labelledby="share-title" onClick={(e) => { if (e.target === e.currentTarget) setShareOpen(false); }}>
          <div className="modal panel">
            <h2 id="share-title" className="h2" style={{ marginTop: 0 }}>איך לשלוח?</h2>
            <div className="row" style={{ gap: 10, flexDirection: 'column', alignItems: 'stretch' }}>
              <button className="btn red" onClick={shareText}>כטקסט (ווטסאפ)</button>
              <button className="btn" onClick={shareImage}>כתמונה</button>
              <button className="btn" style={{ fontSize: 20 }} onClick={() => setShareOpen(false)}>ביטול</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
