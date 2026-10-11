// איור כוס עם שכבות נוזל לפי היחס בין המצרכים — לב האינפוגרפיקה
import { useId } from 'react';
import { getGroup, colorOf } from '../data/ingredients.js';

export function glassType(glass) {
  const g = (glass || '').toLowerCase();
  if (/shot/.test(g)) return 'shot';
  if (/flute/.test(g)) return 'flute';
  if (/cocktail|martini|margarita|coupe|coupette|nick and nora/.test(g)) return 'martini';
  if (/old.?fashioned|whiskey|rocks|lowball|cordial/.test(g)) return 'short';
  if (/wine|balloon|snifter|goblet|cognac|brandy|pousse|sour/.test(g)) return 'wine';
  if (/mug|cup|irish coffee|punch|bowl/.test(g)) return 'mug';
  return 'tall';
}

// לכל סוג כוס: קו מתאר, אזור הנוזל (גבולות למעלה ולמטה), ותוספות (רגל, ידית)
const SHAPES = {
  tall: { body: 'M40 30 L160 30 L150 250 L50 250 Z', top: 30, bottom: 250, extra: null },
  short: { body: 'M28 120 L172 120 L164 250 L36 250 Z', top: 120, bottom: 250, extra: null },
  martini: { body: 'M12 40 L188 40 L100 150 Z', top: 40, bottom: 150, extra: 'M100 150 L100 238 M62 246 L138 246' },
  flute: { body: 'M72 20 L128 20 L120 170 Q100 186 80 170 Z', top: 20, bottom: 182, extra: 'M100 182 L100 238 M70 246 L130 246' },
  wine: { body: 'M42 40 L158 40 Q164 140 100 160 Q36 140 42 40 Z', top: 40, bottom: 160, extra: 'M100 160 L100 238 M64 246 L136 246' },
  mug: { body: 'M30 60 L162 60 L154 250 L38 250 Z', top: 60, bottom: 250, extra: 'M160 100 C200 100 200 200 156 200', mugHandle: true },
  shot: { body: 'M62 150 L138 150 L130 250 L70 250 Z', top: 150, bottom: 250, extra: null },
};

export default function GlassArt({ drink, width = 190 }) {
  const id = useId().replace(/:/g, '');
  const type = glassType(drink.glass);
  const s = SHAPES[type];
  const liquids = drink.ingredients.filter((i) => {
    const g = getGroup(i.group);
    return !g?.assumed && g?.kind !== 'garnish' && i.ml && i.ml >= 3;
  });
  const total = liquids.reduce((a, i) => a + i.ml, 0) || 1;
  const fillTop = s.top + (s.bottom - s.top) * 0.18;
  const span = s.bottom - fillTop;
  // שכבות מלמטה למעלה: הראשון במתכון בתחתית
  let y = s.bottom;
  const layers = liquids.map((i) => {
    const h = Math.max(6, (i.ml / total) * span);
    y -= h;
    return { y, h, color: colorOf(i.name), name: i.name };
  });
  const groups = new Set(drink.ingredients.map((i) => i.group));
  const hasIce = groups.has('ice');
  const citrus = groups.has('lime') ? '#9BD34C' : groups.has('lemon') ? '#FFE14D' : groups.has('orange') ? '#FF9F1C' : null;
  const mint = groups.has('mint') || groups.has('basil');
  const cherry = groups.has('cherry');
  const olive = groups.has('olive');
  const rimX = type === 'martini' ? 170 : type === 'short' ? 160 : 150;

  return (
    <svg role="img" aria-label={`כוס ${drink.glass || ''} עם שכבות המצרכים`} width={width} height={width * 1.32} viewBox="0 0 200 264">
      <defs><clipPath id={`c${id}`}><path d={s.body} /></clipPath></defs>
      {s.mugHandle && <path d={s.extra} fill="none" stroke="#111" strokeWidth="16" strokeLinecap="round" />}
      {s.mugHandle && <path d={s.extra} fill="none" stroke="#C8743C" strokeWidth="9" strokeLinecap="round" />}
      <path d={s.body} fill={s.mugHandle ? '#C8743C' : '#fff'} stroke="#111" strokeWidth="4" strokeLinejoin="round" />
      {!s.mugHandle && (
        <g clipPath={`url(#c${id})`}>
          {layers.map((l, k) => <rect key={k} x="0" y={l.y} width="200" height={l.h + 0.5} fill={l.color} stroke="#111" strokeWidth="2" />)}
          {hasIce && [0, 1, 2].map((k) => (
            <rect key={k} x={60 + k * 30} y={fillTop + 6 + (k % 2) * 22} width="26" height="26" fill="#E8F7FF" fillOpacity="0.85" stroke="#111" strokeWidth="2.5" transform={`rotate(${k % 2 ? 12 : -10} ${73 + k * 30} ${fillTop + 19})`} />
          ))}
          <path d={`M55 ${fillTop + 20} L60 ${s.bottom - 20}`} stroke="#fff" strokeWidth="6" strokeLinecap="round" opacity="0.55" />
        </g>
      )}
      {s.mugHandle && (
        <>
          <path d="M36 80 L156 80" stroke="#E9A06A" strokeWidth="6" />
          <path d="M50 100 L54 230" stroke="#E9A06A" strokeWidth="7" strokeLinecap="round" />
          {hasIce && <rect x="54" y="34" width="32" height="32" fill="#E8F7FF" stroke="#111" strokeWidth="3" transform="rotate(-14 70 50)" />}
          {hasIce && <rect x="96" y="30" width="30" height="30" fill="#E8F7FF" stroke="#111" strokeWidth="3" transform="rotate(10 111 45)" />}
        </>
      )}
      <path d={s.body} fill="none" stroke="#111" strokeWidth="4" strokeLinejoin="round" />
      {s.extra && !s.mugHandle && <path d={s.extra} fill="none" stroke="#111" strokeWidth="5" strokeLinecap="round" />}
      {citrus && (
        <g transform={`translate(${rimX} ${s.top - 4})`}>
          <circle r="20" fill={citrus} stroke="#111" strokeWidth="3.5" />
          <circle r="12" fill="none" stroke="#111" strokeWidth="2" />
          <path d="M0 -20 L0 20 M-20 0 L20 0" stroke="#111" strokeWidth="2" />
        </g>
      )}
      {mint && <path d={`M${rimX - 70} ${s.top - 2} C${rimX - 80} ${s.top - 26} ${rimX - 56} ${s.top - 34} ${rimX - 52} ${s.top - 6}`} fill="#3FA34D" stroke="#111" strokeWidth="2.5" />}
      {cherry && <g><path d={`M100 ${fillTop - 2} C104 ${fillTop - 30} 118 ${fillTop - 34} 124 ${fillTop - 40}`} fill="none" stroke="#111" strokeWidth="2.5" /><circle cx="100" cy={fillTop + 4} r="11" fill="#E8322B" stroke="#111" strokeWidth="3" /></g>}
      {olive && <g><path d={`M70 ${fillTop - 30} L125 ${fillTop + 30}`} stroke="#111" strokeWidth="3" /><ellipse cx="98" cy={fillTop} rx="13" ry="10" fill="#6B8E23" stroke="#111" strokeWidth="3" /></g>}
    </svg>
  );
}
