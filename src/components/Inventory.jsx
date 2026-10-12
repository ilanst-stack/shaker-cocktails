import { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import { GROUPS, groupOf, norm, getGroup, unitOf, defaultAmount, UNIT_HE } from '../data/ingredients.js';
import { searchBrands, isReadyKey } from '../data/brands.js';
import { KIND_ORDER, KIND_HE, newId, catOf, isMovable, isLow, isOut, moveWithinCat } from '../data/inventory.js';
import { IconTrash, IconPlus, IconSearch, IconCamera, IconCart, IconSort, IconGrip, IconChevron, IconAlert, IconCheck } from './Icons.jsx';
import ScanShelf from './ScanShelf.jsx';
import ScrollRow from './ScrollRow.jsx';
import ShoppingList, { shopItemFrom } from './ShoppingList.jsx';
import { useSticky } from '../data/sticky.js';
import { isAlcoholKey } from '../data/age.js';

const QUICK = ['vodka', 'gin', 'white rum', 'tequila', 'whiskey', 'triple sec', 'lime', 'lemon', 'lemon juice', 'lime juice', 'sugar', 'soda water', 'cola', 'tonic water', 'orange juice', 'mint', 'ginger beer', 'cream'];

// "ליקר צמחים (יגרמייסטר/שרטרז)" → שם ראשי + שורת משנה קטנה
const nameMain = (he) => he.replace(/\s*\(.*\)\s*$/, '');
const nameSub = (he) => (he.match(/\((.*)\)\s*$/) || [])[1] || '';

// שורה חדשה במלאי. brand = { en, he } (אופציונלי)
export function newItem(nameOrKey, amount, label, brand) {
  if (isReadyKey(nameOrKey)) {
    return { id: newId(), key: nameOrKey, he: brand?.he || nameOrKey.slice(6), kind: 'ready', cat: 'ready', unit: 'ml', unlimited: false, amount: amount ?? 700, ...(brand ? { brand: brand.en, brandHe: brand.he } : {}) };
  }
  const g = getGroup(nameOrKey) || groupOf(nameOrKey);
  if (g) {
    const unlimited = amount == null && !brand && !!g.unlimited;
    return { id: newId(), key: g.key, he: g.he, kind: g.kind, unit: unitOf(g.key), unlimited, amount: unlimited ? null : amount ?? defaultAmount(g.key, g.kind), ...(label ? { label } : {}), ...(brand ? { brand: brand.en, brandHe: brand.he } : {}) };
  }
  // מוצר חופשי — לא מהמאגר, נשמר רק לרישום המלאי
  return { id: newId(), key: norm(nameOrKey), he: String(nameOrKey).trim(), kind: 'other', cat: 'other', free: true, unit: 'ml', unlimited: false, amount: amount ?? 700 };
}

export default function Inventory({ inventory, setInventory, ingredientNames, kids, shopping, setShopping, index, drinkNames = [] }) {
  const [q, setQ] = useState('');
  const [focus, setFocus] = useState(false);
  const [scan, setScan] = useState(false);
  const [shopOpen, setShopOpen] = useState(false);
  const [sorting, setSorting] = useState(false);
  const [openId, setOpenId] = useState(null);
  const [closed, setClosed] = useSticky('inv.closed', []);
  const [onlyAlerts, setOnlyAlerts] = useState(false);
  const [picked, setPicked] = useState(() => new Set()); // סימון מתמעטים להוספה לקניות
  const [toast, setToast] = useState('');
  const plainHave = useMemo(() => new Set(inventory.filter((i) => !i.brand).map((i) => i.key)), [inventory]);
  const blurT = useRef(null);

  const suggestions = useMemo(() => {
    const t = norm(q);
    if (!t) return [];
    const out = [];
    const seen = new Set();
    for (const b of searchBrands(q)) {
      if (kids && (isAlcoholKey(b.key) || isReadyKey(b.key))) continue;
      const g = getGroup(b.key);
      out.push({ id: `b:${b.en}`, add: () => add(b.key, b), main: b.en, sub: `${b.he} · ${g ? g.he : 'קוקטייל מוכן'}`, ltr: true });
    }
    for (const g of GROUPS) {
      if (g.assumed || plainHave.has(g.key) || (kids && isAlcoholKey(g.key))) continue;
      if (norm(g.he).includes(t) || g.key.includes(t) || g.aliases.some((a) => norm(a).includes(t))) {
        out.push({ id: g.key, add: () => add(g.key), main: g.he, sub: g.aliases[0] }); seen.add(g.key);
      }
    }
    for (const n of ingredientNames) {
      const k = groupOf(n)?.key || norm(n);
      if (seen.has(k) || plainHave.has(k) || !norm(n).includes(t)) continue;
      seen.add(k);
      out.push({ id: `n:${n}`, add: () => add(n), main: n, sub: 'מהמאגר' });
    }
    // קוקטייל שנמכר מוכן בבקבוק (כל קוקטייל מהמאגר)
    if (!kids && t.length >= 3) {
      const have = new Set(inventory.map((i) => i.key));
      for (const n of drinkNames.filter((n) => norm(n).includes(t)).slice(0, 3)) {
        if (have.has(`ready:${n}`) || out.some((o) => o.id === `b:${n}`)) continue;
        out.push({ id: `r:${n}`, add: () => add(`ready:${n}`, { en: n, he: 'קוקטייל מוכן בבקבוק' }), main: n, sub: 'קוקטייל מוכן בבקבוק' });
      }
    }
    const list = out.slice(0, 14);
    list.push({ id: 'free', add: () => add(q.trim()), main: `+ להוסיף "${q.trim()}" כמוצר חופשי`, sub: 'לרישום המלאי בלבד — לא משמש במתכונים', free: true });
    return list;
  }, [q, plainHave, ingredientNames, kids, inventory, drinkNames]);

  function add(key, brand) {
    const it = newItem(key, undefined, undefined, brand);
    setInventory([...inventory, it]);
    setQ('');
    setClosed(closed.filter((c) => c !== catOf(it)));
  }
  const update = (id, patch) => setInventory(inventory.map((i) => (i.id === id ? { ...i, ...patch } : i)));
  const remove = (id) => { setInventory(inventory.filter((i) => i.id !== id)); setOpenId(null); };
  const toShopping = (its) => {
    const fresh = its.filter((it) => !shopping.some((s) => !s.done && s.key === it.key && (s.brand || '') === (it.brand || '')));
    if (fresh.length) setShopping([...shopping, ...fresh.map((it) => shopItemFrom(it))]);
    return fresh.length;
  };

  const alerts = useMemo(() => ({ low: inventory.filter(isLow), out: inventory.filter(isOut) }), [inventory]);

  const grouped = useMemo(() => {
    const m = new Map();
    for (const it of inventory) {
      if (onlyAlerts && !isLow(it) && !isOut(it)) continue;
      const k = catOf(it);
      if (!m.has(k)) m.set(k, []);
      m.get(k).push(it);
    }
    // בכל קטגוריה: שנגמרו (0) בסוף, השאר לפי הסדר שבחרת
    for (const [k, list] of m) m.set(k, [...list.filter((x) => !isOut(x)), ...list.filter(isOut)]);
    return [...m.entries()].sort((a, b) => KIND_ORDER.indexOf(a[0]) - KIND_ORDER.indexOf(b[0]));
  }, [inventory, onlyAlerts]);

  // ---- גרירה (עובד גם במגע): פריט צף עוקב אחרי האצבע, קו מסמן איפה ינחת, שמירה רק בשחרור
  const [drag, setDrag] = useState(null); // { id, cat, label, x, y, dy, w, h, overId, before }
  const dragRef = useRef(null);
  const raf = useRef(0);
  function onGripDown(e, it) {
    e.preventDefault();
    const row = e.currentTarget.closest('[data-inv-id]').getBoundingClientRect();
    // הקוביה הריקה מתחילה במקום של הפריט עצמו
    const same = inventory.filter((x) => catOf(x) === catOf(it));
    const i = same.findIndex((x) => x.id === it.id);
    const start = same[i + 1] ? { overId: same[i + 1].id, before: true } : same[i - 1] ? { overId: same[i - 1].id, before: false } : { overId: null, before: true };
    const d = { id: it.id, cat: catOf(it), label: it.brand ? `${typeName(it)} · ${it.brand}` : typeName(it), x: row.left, y: e.clientY, dy: e.clientY - row.top, w: row.width, h: row.height, ...start };
    dragRef.current = d; setDrag(d);
    e.currentTarget.setPointerCapture?.(e.pointerId);
    navigator.vibrate?.(15);
  }
  function onGripMove(e) {
    const d = dragRef.current;
    if (!d) return;
    const y = e.clientY;
    cancelAnimationFrame(raf.current);
    raf.current = requestAnimationFrame(() => {
      let overId = null, before = true;
      for (const el of document.querySelectorAll(`.inv-item[data-inv-cat="${d.cat}"]`)) {
        const r = el.getBoundingClientRect();
        if (y >= r.top - 4 && y <= r.bottom + 4) { overId = el.getAttribute('data-inv-id'); before = y < r.top + r.height / 2; break; }
      }
      if (y < 70) window.scrollBy(0, -12); else if (y > window.innerHeight - 110) window.scrollBy(0, 12);
      // מעל הקוביה הריקה עצמה — לא משנים מקום
      const next = overId && overId !== d.id ? { ...d, y, overId, before } : { ...d, y };
      dragRef.current = next; setDrag(next);
    });
  }
  function onGripUp() {
    const d = dragRef.current;
    cancelAnimationFrame(raf.current);
    dragRef.current = null; setDrag(null);
    if (!d?.overId) return;
    const rest = inventory.filter((x) => x.id !== d.id);
    let idx = rest.findIndex((x) => x.id === d.overId);
    if (idx < 0) return;
    if (!d.before) idx += 1;
    const moved = inventory.find((x) => x.id === d.id);
    rest.splice(idx, 0, moved);
    setInventory(rest);
  }
  const onGripCancel = () => { cancelAnimationFrame(raf.current); dragRef.current = null; setDrag(null); };

  const unsorted = shopping.filter((s) => !s.done).length;

  return (
    <section className="screen" aria-labelledby="inv-title">
      <h1 id="inv-title" className="h1" style={{ margin: '8px 0 12px' }}>המלאי שלי</h1>

      <div className="panel" style={{ position: 'relative', padding: 10 }}>
        <div className="row" style={{ position: 'relative' }}>
          <span style={{ position: 'absolute', right: 12, top: 13, pointerEvents: 'none' }}><IconSearch /></span>
          <input id="inv-search" className="field" style={{ paddingRight: 42 }} value={q} onChange={(e) => setQ(e.target.value)} aria-label="הוספת מצרך או מותג"
            placeholder="הוספת מצרך או מותג…" autoComplete="off"
            onFocus={() => { clearTimeout(blurT.current); setFocus(true); }} onBlur={() => { blurT.current = setTimeout(() => setFocus(false), 200); }}
            onKeyDown={(e) => { if (e.key === 'Enter' && suggestions[0]) suggestions[0].add(); }} />
          {suggestions.length > 0 && (
            <div className="suggest" role="listbox">
              {suggestions.map((s) => (
                <button key={s.id} role="option" aria-selected="false" onMouseDown={(e) => e.preventDefault()} onClick={s.add} className={s.free ? 'free' : ''}>
                  <b><bdi>{s.main}</bdi></b> <small className="muted"><bdi>{s.sub}</bdi></small>
                </button>
              ))}
            </div>
          )}
        </div>
        {focus && !q && (
          <div onMouseDown={(e) => e.preventDefault()}>
            <div style={{ fontSize: 13, fontWeight: 700, margin: '10px 0 4px' }}>הוספה מהירה</div>
            <ScrollRow label="הוספה מהירה" inset={false}>
              {QUICK.filter((k) => !plainHave.has(k) && !(kids && isAlcoholKey(k))).map((k) => (
                <button key={k} className="chip sm" onClick={() => add(k)}><IconPlus /> {getGroup(k).he}</button>
              ))}
            </ScrollRow>
          </div>
        )}
        <div className="inv-tools">
          <button className="tool" aria-pressed={scan} onClick={() => setScan(!scan)}><IconCamera /> צלם את הבר</button>
          <button className="tool" onClick={() => setShopOpen(true)}><IconCart /> קניות{unsorted ? <span className="pill-count">{unsorted}</span> : null}</button>
          <button className="tool" aria-pressed={sorting} onClick={() => { setSorting(!sorting); setOpenId(null); }}><IconSort /> {sorting ? 'סיום' : 'סידור'}</button>
        </div>
      </div>

      {scan && <ScanShelf inventory={inventory} setInventory={setInventory} kids={kids} />}

      {(alerts.low.length > 0 || alerts.out.length > 0) && (
        <div className="inv-alert" role="status">
          <IconAlert />
          <span style={{ flex: 1 }}>
            {[alerts.low.length && `${alerts.low.length} מתמעטים`, alerts.out.length && `${alerts.out.length} נגמרו`].filter(Boolean).join(' · ')}
          </span>
          <button onClick={() => { setOnlyAlerts(!onlyAlerts); setPicked(new Set()); setSorting(false); setOpenId(null); }}>{onlyAlerts ? 'סגור' : 'הצג'}</button>
        </div>
      )}

      {inventory.length === 0 && (
        <div className="bubble" style={{ marginTop: 22 }}><b>הבר ריק! תתחיל להוסיף בקבוקים.</b></div>
      )}

      {onlyAlerts && (
        <div className="alert-bar">
          <span>סמן מה להוסיף לרשימת הקניות:</span>
          <button className="toggle" onClick={() => setPicked(picked.size === alerts.low.length + alerts.out.length ? new Set() : new Set([...alerts.low, ...alerts.out].map((i) => i.id)))}>
            {picked.size === alerts.low.length + alerts.out.length ? 'נקה הכל' : 'סמן הכל'}
          </button>
          <button className="btn red small" disabled={!picked.size} onClick={() => {
            const n = toShopping(inventory.filter((i) => picked.has(i.id)));
            setPicked(new Set()); setOnlyAlerts(false);
            setToast(n ? `${n} נוספו לרשימת הקניות` : 'כבר ברשימת הקניות'); setTimeout(() => setToast(''), 2200);
          }}>הוסף לקניות{picked.size ? ` (${picked.size})` : ''}</button>
        </div>
      )}

      {sorting && inventory.length > 0 && <p className="muted" style={{ fontSize: 13, margin: '12px 0 0' }}>גרור בעזרת הידית או השתמש בחיצים. הסידור אפשרי בתוך הקטגוריה בלבד.</p>}

      {grouped.map(([cat, items]) => {
        const isClosed = closed.includes(cat) && !sorting && !onlyAlerts;
        const lowN = items.filter(isLow).length, outN = items.filter(isOut).length;
        return (
          <div key={cat} className="inv-cat">
            <button className="inv-cat-h" aria-expanded={!isClosed} onClick={() => setClosed(isClosed ? closed.filter((c) => c !== cat) : [...closed, cat])}>
              <IconChevron dir={isClosed ? 'left' : 'down'} />
              <span className="t">{KIND_HE[cat] || 'אחר'}</span>
              <span className="pill-count">{items.length}</span>
              <span className="flags">
                {lowN > 0 && <span className="flag low">{lowN} מתמעט</span>}
                {outN > 0 && <span className="flag out">{outN} נגמר</span>}
              </span>
            </button>
            {!isClosed && (
              <div className="inv-list">
                {items.map((it) => (
                  <Fragment key={it.id}>
                  {drag?.overId === it.id && drag.before && <div className="drop-slot" style={{ height: drag.h }} aria-hidden="true" />}
                  <InvRow it={it} sorting={sorting} open={openId === it.id} dragging={drag?.id === it.id} 
                    pickMode={onlyAlerts} picked={picked.has(it.id)} onPick={() => { const n = new Set(picked); n.has(it.id) ? n.delete(it.id) : n.add(it.id); setPicked(n); }}
                    onToggle={() => setOpenId(openId === it.id ? null : it.id)}
                    onChange={(p) => update(it.id, p)} onRemove={() => remove(it.id)}
                    onShop={() => { toShopping([it]); setOpenId(null); }}
                    onMove={(dir) => setInventory(moveWithinCat(inventory, it.id, dir))}
                    gripProps={{ onPointerDown: (e) => onGripDown(e, it), onPointerMove: onGripMove, onPointerUp: onGripUp, onPointerCancel: onGripCancel }} />
                  {drag?.overId === it.id && !drag.before && <div className="drop-slot" style={{ height: drag.h }} aria-hidden="true" />}
                  </Fragment>
                ))}
              </div>
            )}
          </div>
        );
      })}

      {drag && (
        <div className="drag-ghost" style={{ left: drag.x, top: drag.y - drag.dy, width: drag.w * 0.78, height: drag.h }} aria-hidden="true">
          <IconGrip /> <bdi>{drag.label}</bdi>
        </div>
      )}
      {toast && <div className="toast" role="status">{toast}</div>}

      {shopOpen && <ShoppingList shopping={shopping} setShopping={setShopping} inventory={inventory} setInventory={setInventory}
        index={index} kids={kids} ingredientNames={ingredientNames} onClose={() => setShopOpen(false)} />}
    </section>
  );
}

// השם הראשי בשורה: הסוג (וויסקי). המותג — מתחת, בקטן.
function typeName(it) {
  if (isReadyKey(it.key)) return it.key.slice(6);
  return nameMain(it.he);
}

function amountText(it) {
  if (it.unlimited) return '∞';
  return `${Number(it.amount) || 0} ${UNIT_HE[it.unit || unitOf(it.key)]}`;
}

function InvRow({ it, sorting, open, dragging, dropBefore, dropAfter, pickMode, picked, onPick, onToggle, onChange, onRemove, onShop, onMove, gripProps }) {
  const g = getGroup(it.key);
  const main = typeName(it);
  const ready = isReadyKey(it.key);
  const sub = ready ? (it.brand && it.brand !== main ? `קוקטייל מוכן · ${it.brand}` : 'קוקטייל מוכן בבקבוק')
    : it.brand ? it.brand : nameSub(it.he) || (it.free ? 'מוצר חופשי' : '');
  const low = isLow(it), out = isOut(it);
  return (
    <div className={`inv-item${out ? ' out' : ''}${dragging ? ' dragging' : ''}${open ? ' open' : ''}${dropBefore ? ' drop-before' : ''}${dropAfter ? ' drop-after' : ''}${pickMode ? ' pickable' : ''}`}
      data-inv-id={it.id} data-inv-cat={catOf(it)} onClick={pickMode ? onPick : undefined}>
      <div className="inv-line">
        {pickMode && <span className={`check${picked ? ' on' : ''}`} role="checkbox" aria-checked={picked} aria-label={`הוסף ${main} לקניות`}>{picked && <IconCheck />}</span>}
        {sorting && <span className="grip" aria-hidden="true" {...gripProps}><IconGrip /></span>}
        <span className="dot" style={{ background: g?.color || (isReadyKey(it.key) ? '#C8102E' : '#F2B705') }} />
        <div className="n">
          <bdi>{main}</bdi>
          {sub && <small><bdi>{sub}</bdi></small>}
          {it.label && !it.brand && <small><bdi>{it.label}</bdi></small>}
        </div>
        {pickMode ? (
          <span className={`amt-pill static${low ? ' low' : ''}${out ? ' out' : ''}`}>{out ? 'נגמר' : amountText(it)}</span>
        ) : sorting ? (
          <span className="row" style={{ gap: 4 }}>
            <button className="mini" aria-label={`הזז למעלה ${main}`} onClick={() => onMove(-1)}><IconChevron dir="up" /></button>
            <button className="mini" aria-label={`הזז למטה ${main}`} onClick={() => onMove(1)}><IconChevron dir="down" /></button>
          </span>
        ) : (
          <button className={`amt-pill${low ? ' low' : ''}${out ? ' out' : ''}`} aria-expanded={open} aria-label={`${main}: ${out ? 'נגמר' : amountText(it)} — עריכה`} onClick={onToggle}>
            {out ? 'נגמר' : amountText(it)}
          </button>
        )}
      </div>
      {open && !sorting && !pickMode && <RowEditor it={it} onChange={onChange} onRemove={onRemove} onShop={onShop} onClose={onToggle} />}
    </div>
  );
}

function RowEditor({ it, onChange, onRemove, onShop, onClose }) {
  const [val, setVal] = useState(it.amount ?? '');
  const unit = it.unit || unitOf(it.key);
  const id = `amt-${it.id}`;
  useEffect(() => { setVal(it.amount ?? ''); }, [it.amount]);
  const inputRef = useRef(null);
  useEffect(() => { const el = inputRef.current; if (el) { el.focus(); el.select(); } }, []);
  const commit = () => onChange({ amount: Math.max(0, Number(val) || 0) });
  return (
    <div className="inv-edit">
      <div className="row" style={{ gap: 8, flexWrap: 'wrap' }}>
        {!it.unlimited && (
          <>
            <label htmlFor={id} style={{ fontSize: 13, fontWeight: 700 }}>כמות</label>
            <input ref={inputRef} id={id} className="amount" type="number" inputMode="decimal" min="0" step={unit === 'pcs' ? 1 : unit === 'g' ? 50 : 10} value={val}
              onChange={(e) => setVal(e.target.value)} onBlur={commit} onKeyDown={(e) => { if (e.key === 'Enter') { commit(); onClose(); } }} />
            <span className="muted" style={{ fontSize: 13 }}>{UNIT_HE[unit]}</span>
          </>
        )}
        <button className="toggle" aria-pressed={!!it.unlimited} onClick={() => onChange({ unlimited: !it.unlimited, amount: it.unlimited ? Number(val) || defaultAmount(it.key, it.kind) : it.amount })}>
          ∞ בלי הגבלה
        </button>
      </div>
      {isMovable(it) && (
        <div className="row" style={{ gap: 8, marginTop: 8 }}>
          <label htmlFor={`cat-${it.id}`} style={{ fontSize: 13, fontWeight: 700 }}>קטגוריה</label>
          <select id={`cat-${it.id}`} className="field" style={{ minHeight: 40, padding: '4px 8px', fontSize: 15, flex: 1 }} value={catOf(it)} onChange={(e) => onChange({ cat: e.target.value })}>
            {KIND_ORDER.map((k) => <option key={k} value={k}>{KIND_HE[k]}</option>)}
          </select>
        </div>
      )}
      <div className="row" style={{ gap: 8, marginTop: 8, justifyContent: 'space-between' }}>
        <button className="toggle" onClick={onShop}><IconCart /> לרשימת קניות</button>
        <button className="toggle danger" onClick={onRemove}><IconTrash /> הסר</button>
      </div>
    </div>
  );
}
