// שורת צ'יפים עם גלילה הצידה: חיצים בקצוות, גלגלת עכבר ו"גרירה" עם העכבר במחשב
import { useEffect, useRef, useState } from 'react';

export default function ScrollRow({ label, children, inset = true, className = '' }) {
  const ref = useRef(null);
  const [edge, setEdge] = useState({ start: false, end: false });

  const update = () => {
    const el = ref.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    const pos = Math.abs(el.scrollLeft); // ב-RTL הערך שלילי
    setEdge({ start: pos > 2, end: pos < max - 2 });
  };

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    const onWheel = (e) => {
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
      const max = el.scrollWidth - el.clientWidth;
      if (max <= 0) return;
      e.preventDefault();
      el.scrollBy({ left: -e.deltaY });
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    // גרירה עם עכבר
    let drag = null;
    const down = (e) => { if (e.pointerType === 'mouse') drag = { x: e.clientX, left: el.scrollLeft, moved: false }; };
    const move = (e) => {
      if (!drag) return;
      const dx = e.clientX - drag.x;
      if (Math.abs(dx) > 5) drag.moved = true;
      if (drag.moved) el.scrollLeft = drag.left - dx;
    };
    const up = () => { if (drag?.moved) { const block = (ev) => { ev.stopPropagation(); ev.preventDefault(); }; el.addEventListener('click', block, { capture: true, once: true }); setTimeout(() => el.removeEventListener('click', block, { capture: true }), 50); } drag = null; };
    el.addEventListener('pointerdown', down);
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    return () => {
      ro.disconnect();
      el.removeEventListener('wheel', onWheel);
      el.removeEventListener('pointerdown', down);
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
  }, []);

  useEffect(update, [children]);

  const go = (toEnd) => {
    const el = ref.current;
    el.scrollBy({ left: (toEnd ? -1 : 1) * el.clientWidth * 0.7, behavior: 'smooth' });
  };

  return (
    <div className={`scrollrow ${inset ? 'inset' : ''} ${className}`}>
      {edge.start && (
        <button className="sr-arrow sr-start" aria-label="גלילה ימינה" onClick={() => go(false)}>
          <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M9 5l7 7-7 7" /></svg>
        </button>
      )}
      <nav ref={ref} className="chips" aria-label={label} onScroll={update}>{children}</nav>
      {edge.end && (
        <button className="sr-arrow sr-end" aria-label="גלילה שמאלה לעוד" onClick={() => go(true)}>
          <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M15 5l-7 7 7 7" /></svg>
        </button>
      )}
    </div>
  );
}
