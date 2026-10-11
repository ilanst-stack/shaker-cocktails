import { useEffect, useMemo, useState } from 'react';
import { GROUPS, groupOf, norm, getGroup, unitOf, defaultAmount, UNIT_HE } from '../data/ingredients.js';
import { IconTrash, IconPlus, IconSearch } from './Icons.jsx';
import ScanShelf from './ScanShelf.jsx';
import ScrollRow from './ScrollRow.jsx';

const QUICK = ['vodka', 'gin', 'white rum', 'tequila', 'whiskey', 'triple sec', 'lime', 'lemon', 'sugar', 'soda water', 'cola', 'tonic water', 'orange juice', 'mint', 'ginger beer', 'cream'];
const KIND_ORDER = ['spirit', 'liqueur', 'wine', 'juice', 'mixer', 'fresh', 'sweet', 'dairy', 'garnish'];
const KIND_HE = { spirit: 'אלכוהול', liqueur: 'ליקרים', wine: 'יין ובירה', juice: 'מיצים', mixer: 'מוגזים ומשקאות', fresh: 'פירות ועשבים', sweet: 'ממתיקים', dairy: 'חלב וביצים', garnish: 'תבלינים וקישוטים', other: 'אחר' };

export function newItem(nameOrKey, amount) {
  const g = getGroup(nameOrKey) || groupOf(nameOrKey);
  if (g) {
    const unlimited = amount == null && !!g.unlimited;
    return { key: g.key, he: g.he, kind: g.kind, unit: unitOf(g.key), unlimited, amount: unlimited ? null : amount ?? defaultAmount(g.key, g.kind) };
  }
  return { key: norm(nameOrKey), he: nameOrKey, kind: 'other', unit: 'ml', unlimited: false, amount: amount ?? 500 };
}

export default function Inventory({ inventory, setInventory, ingredientNames }) {
  const [q, setQ] = useState('');
  const have = useMemo(() => new Set(inventory.map((i) => i.key)), [inventory]);

  const suggestions = useMemo(() => {
    const t = norm(q);
    if (!t) return [];
    const out = [];
    const seen = new Set();
    for (const g of GROUPS) {
      if (g.assumed || have.has(g.key)) continue;
      if (g.he.includes(q.trim()) || g.key.includes(t) || g.aliases.some((a) => a.includes(t))) { out.push({ key: g.key, label: g.he, sub: g.aliases[0] }); seen.add(g.key); }
    }
    for (const n of ingredientNames) {
      const k = groupOf(n)?.key || norm(n);
      if (seen.has(k) || have.has(k) || !norm(n).includes(t)) continue;
      seen.add(k);
      out.push({ key: n, label: n, sub: 'מהמאגר' });
    }
    return out.slice(0, 12);
  }, [q, have, ingredientNames]);

  const add = (key) => { setInventory([...inventory, newItem(key)]); setQ(''); };
  const update = (key, patch) => setInventory(inventory.map((i) => (i.key === key ? { ...i, ...patch } : i)));
  const remove = (key) => setInventory(inventory.filter((i) => i.key !== key));

  const grouped = useMemo(() => {
    const m = new Map();
    for (const it of inventory) {
      const k = it.kind || getGroup(it.key)?.kind || 'other';
      if (!m.has(k)) m.set(k, []);
      m.get(k).push(it);
    }
    return [...m.entries()].sort((a, b) => KIND_ORDER.indexOf(a[0]) - KIND_ORDER.indexOf(b[0]));
  }, [inventory]);

  return (
    <section className="screen" aria-labelledby="inv-title">
      <h1 id="inv-title" className="h1" style={{ margin: '8px 0 12px' }}>המלאי שלי</h1>
      <div className="panel" style={{ position: 'relative' }}>
        <label htmlFor="inv-search" style={{ fontWeight: 700, display: 'block', marginBottom: 6 }}>הוספת מצרך (בעברית או באנגלית)</label>
        <div className="row" style={{ position: 'relative' }}>
          <span style={{ position: 'absolute', right: 12, top: 13, pointerEvents: 'none' }}><IconSearch /></span>
          <input id="inv-search" className="field" style={{ paddingRight: 42 }} value={q} onChange={(e) => setQ(e.target.value)} placeholder="למשל: ג׳ין, קמפרי, pineapple…" autoComplete="off"
            onKeyDown={(e) => { if (e.key === 'Enter' && suggestions[0]) add(suggestions[0].key); }} />
          {suggestions.length > 0 && (
            <div className="suggest" role="listbox">
              {suggestions.map((s) => (
                <button key={s.key} role="option" aria-selected="false" onClick={() => add(s.key)}>
                  <b>{s.label}</b> <small className="muted" dir="ltr">{s.sub}</small>
                </button>
              ))}
            </div>
          )}
        </div>
        <div style={{ fontSize: 13, fontWeight: 700, margin: '12px 0 4px' }}>הוספה מהירה</div>
        <ScrollRow label="הוספה מהירה" inset={false}>
          {QUICK.filter((k) => !have.has(k)).map((k) => (
            <button key={k} className="chip sm" onClick={() => add(k)}><IconPlus /> {getGroup(k).he}</button>
          ))}
        </ScrollRow>
        <p style={{ fontSize: 12, margin: '6px 0 0' }} className="muted">מים וקרח נחשבים תמיד קיימים.</p>
      </div>

      <ScanShelf inventory={inventory} setInventory={setInventory} />

      {inventory.length === 0 && (
        <div className="bubble" style={{ marginTop: 22 }}><b>הבר ריק! תתחיל להוסיף בקבוקים.</b></div>
      )}

      {grouped.map(([kind, items]) => (
        <div key={kind}>
          <h2 className="h2" style={{ fontSize: 28, marginBottom: 6 }}>{KIND_HE[kind] || 'אחר'} <span className="pill-count">{items.length}</span></h2>
          <div className="inv-list" style={{ marginTop: 0 }}>
            {items.map((it) => (
              <InvRow key={it.key} it={it} onChange={(p) => update(it.key, p)} onRemove={() => remove(it.key)} />
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}

function InvRow({ it, onChange, onRemove }) {
  const [val, setVal] = useState(it.amount ?? '');
  const g = getGroup(it.key);
  const id = `amt-${it.key.replace(/\W/g, '')}`;
  const unit = it.unit || unitOf(it.key);
  useEffect(() => { setVal(it.amount ?? ''); }, [it.amount]);
  return (
    <div className="inv-item">
      <span className="dot" style={{ background: g?.color || '#F2B705' }} />
      <div className="n">{it.he}{it.he !== it.key && !g && <small dir="ltr">{it.key}</small>}</div>
      <button className="toggle" aria-pressed={it.unlimited} onClick={() => onChange({ unlimited: !it.unlimited, amount: it.unlimited ? Number(val) || defaultAmount(it.key, it.kind) : it.amount })}>
        {it.unlimited ? '∞ בלי הגבלה' : 'כמות'}
      </button>
      {!it.unlimited && (
        <>
          <label htmlFor={id} className="muted" style={{ fontSize: 12 }}>{UNIT_HE[unit]}</label>
          <input id={id} className="amount" type="number" inputMode="decimal" min="0" step={unit === 'pcs' ? 1 : unit === 'g' ? 50 : 10} value={val}
            onChange={(e) => setVal(e.target.value)} onBlur={() => onChange({ amount: Math.max(0, Number(val) || 0) })} />
        </>
      )}
      <button className="ghost" aria-label={`הסר ${it.he}`} onClick={onRemove}><IconTrash /></button>
    </div>
  );
}
