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
const nameOf = (s) => s.brand || s.he;

export default function ShoppingList({ shopping, setShopping, inventory, setInventory, index, kids, onClose }) {
  const [q, setQ] = useState('');
  const [toast, setToast] = useState('');
  const open = shopping.filter((s) => !s.done);
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

  async function share() {
    const text = ['רשימת קניות — SHAKE SHAKE', ...open.map((s) => `• ${nameOf(s)} — ${qtyText(s)}`)].join('\n');
    try {
      if (navigator.share) { await navigator.share({ text }); return; }
    } catch { /* בוטל */ }
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank', 'noopener');
  }

  return (
    <div className="overlay dots" role="dialog" aria-modal="true" aria-labelledby="shop-title">
      <div className="app" style={{ padding: "8px 16px 40px" }}>
        <div className="row" style={{ gap: 10, margin: '8px 0 12px' }}>
          <button className="icon-btn" aria-label="חזרה למלאי" onClick={onClose}><IconBack /></button>
          <h1 id="shop-title" className="h1" style={{ flex: 1 }}>רשימת קניות</h1>
          {open.length > 0 && <button className="btn" style={{ fontSize: 20, minHeight: 44 }} onClick={share}><IconShare /> שליחה</button>}
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
                  <bdi>{nameOf(s)}</bdi>
                  <small><bdi>{s.brand ? `${s.brandHe || ''} · ${s.he}` : s.free ? 'מוצר חופשי' : ''}</bdi></small>
                </div>
                <button className="ghost" aria-label={`הסר ${nameOf(s)} מהרשימה`} onClick={() => del(s.id)}><IconTrash /></button>
              </div>
              <div className="row" style={{ gap: 6, marginTop: 6, flexWrap: 'wrap' }}>
                <input className="amount" type="number" inputMode="decimal" min="0" aria-label="כמות" value={s.qty} onChange={(e) => upd(s.id, { qty: e.target.value })} style={{ width: 70 }} />
                <select className="field sel" aria-label="יחידה" value={s.unit} onChange={(e) => upd(s.id, { unit: e.target.value, ...(e.target.value === 'bottle' && !s.bottleMl ? { bottleMl: 700 } : {}) })}>
                  {UNITS.map((u) => <option key={u.id} value={u.id}>{u.he}</option>)}
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
    </div>
  );
}
