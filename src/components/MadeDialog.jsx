// "הכנתי!": כמה כוסות, ומה יורד מהמלאי (לפני ← אחרי). אין הגבלה לפי המלאי.
import { useMemo, useState } from 'react';
import { UNIT_HE, unitOf } from '../data/ingredients.js';
import { deductionPlan } from '../data/inventory.js';
import { fmtNum } from '../data/measure.js';
import { IconPlus } from './Icons.jsx';

export default function MadeDialog({ e, inventory, onCancel, onConfirm }) {
  const [n, setN] = useState(1);
  const [deduct, setDeduct] = useState(true);
  const plan = useMemo(() => deductionPlan(inventory, e.need, n), [inventory, e.need, n]);
  const byId = useMemo(() => new Map(inventory.map((i) => [i.id, i])), [inventory]);
  const unlimited = useMemo(() => {
    const keys = new Set(e.drink.ingredients.map((i) => i.group));
    return inventory.filter((i) => i.unlimited && keys.has(i.key));
  }, [inventory, e.drink]);

  return (
    <div className="modal-back" role="dialog" aria-modal="true" aria-labelledby="made-title" onClick={(ev) => { if (ev.target === ev.currentTarget) onCancel(); }}>
      <div className="modal panel">
        <h2 id="made-title" className="h2" style={{ marginTop: 0 }}>כמה כוסות הכנת?</h2>
        <div className="stepper" role="group" aria-label="מספר כוסות">
          <button className="icon-btn" aria-label="פחות" onClick={() => setN(Math.max(1, n - 1))}><span style={{ font: '700 26px var(--body)' }}>−</span></button>
          <output aria-live="polite">{n}</output>
          <button className="icon-btn" aria-label="יותר" onClick={() => setN(n + 1)}><IconPlus /></button>
        </div>

        <label className="house-check" style={{ margin: '12px 0 8px' }}>
          <input type="checkbox" checked={deduct} onChange={(ev) => setDeduct(ev.target.checked)} /> להוריד מהמלאי
        </label>

        {deduct && (
          <div className="made-plan">
            {plan.length === 0 && unlimited.length === 0 && <div className="muted" style={{ fontSize: 14 }}>אין מצרכים עם כמות רשומה במלאי — לא יורד כלום.</div>}
            {plan.map((c) => {
              const it = byId.get(c.id);
              const u = UNIT_HE[it.unit || unitOf(it.key)];
              return (
                <div key={c.id} className="row" style={{ justifyContent: 'space-between' }}>
                  <bdi>{it.brand || it.he}</bdi>
                  <span style={{ whiteSpace: 'nowrap' }}>
                    {fmtNum(c.before)} ← <b>{fmtNum(c.after)}</b> {u}
                    {c.after <= 0 && <span className="flag out" style={{ marginRight: 6 }}>נגמר</span>}
                  </span>
                </div>
              );
            })}
            {unlimited.map((it) => (
              <div key={it.id} className="row muted" style={{ justifyContent: 'space-between' }}><bdi>{it.brand || it.he}</bdi><span>בלי הגבלה</span></div>
            ))}
          </div>
        )}

        <div className="row" style={{ gap: 10, marginTop: 14 }}>
          <button className="btn" style={{ flex: 1 }} onClick={onCancel}>ביטול</button>
          <button className="btn red" style={{ flex: 2 }} onClick={() => onConfirm(n, deduct ? plan : [])}>הכנתי, לדירוג</button>
        </div>
      </div>
    </div>
  );
}
