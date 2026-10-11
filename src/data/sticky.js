// מצב תצוגה "דביק": מיונים וסינונים נשמרים כל עוד משתמשים באפליקציה,
// ומתאפסים לברירת המחדל אחרי שעה שהאפליקציה לא בשימוש
import { useEffect, useState } from 'react';

const PREFIX = 'shaker.ui.';
const LAST = 'shaker.lastActive';
const IDLE_MS = 60 * 60 * 1000; // שעה

const now = () => Date.now();
const touch = () => { try { localStorage.setItem(LAST, String(now())); } catch { /* ignore */ } };

function resetIfIdle() {
  try {
    const last = Number(localStorage.getItem(LAST) || 0);
    if (last && now() - last > IDLE_MS) {
      Object.keys(localStorage).filter((k) => k.startsWith(PREFIX)).forEach((k) => localStorage.removeItem(k));
      return true;
    }
  } catch { /* ignore */ }
  return false;
}

// בפתיחת האפליקציה, ובכל חזרה אליה מאפליקציה אחרת
export function startIdleWatch() {
  resetIfIdle();
  touch();
  setInterval(() => { if (document.visibilityState === 'visible') touch(); }, 30_000);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') touch();
    else if (resetIfIdle()) location.reload(); // חזרה אחרי יותר משעה — מתחילים נקי
    else touch();
  });
}

export function useSticky(key, initial) {
  const k = PREFIX + key;
  const [val, setVal] = useState(() => {
    try { const v = localStorage.getItem(k); return v != null ? JSON.parse(v) : initial; } catch { return initial; }
  });
  useEffect(() => { try { localStorage.setItem(k, JSON.stringify(val)); } catch { /* ignore */ } }, [k, val]);
  return [val, setVal];
}
