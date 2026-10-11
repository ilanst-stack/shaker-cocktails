import { useState } from 'react';
import { loginWithGoogle } from '../firebase.js';
import { resetSticky } from '../data/sticky.js';
import Logo from './Logo.jsx';
import AgeChoice from './AgeChoice.jsx';
import { setPendingAge, getPendingAge } from '../data/age.js';

export default function Login() {
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const [adult, setAdult] = useState(getPendingAge);
  return (
    <main className="center dots">
      <Logo size={48} />
      <div className="bubble" style={{ maxWidth: 340 }}>
        <b>מה יש לך בבר? אני אגיד לך מה למזוג!</b>
        <div style={{ marginTop: 6, fontWeight: 500 }}>רושמים את המצרכים, מקבלים קוקטיילים, מדרגים — והאפליקציה לומדת את הטעם שלך.</div>
      </div>
      <AgeChoice value={adult} onChange={(v) => { setAdult(v); setPendingAge(v); }} />
      <button className="btn red" style={{ fontSize: 28, minWidth: 260 }} disabled={busy || adult == null}
        onClick={async () => { setBusy(true); setErr(''); try { resetSticky(); await loginWithGoogle(); } catch (e) { setErr(e.message || 'הכניסה נכשלה'); } finally { setBusy(false); } }}>
        {busy ? 'מתחבר…' : adult == null ? 'בחר/י גיל כדי להמשיך' : 'כניסה עם Google'}
      </button>
      {err && <p role="alert" style={{ fontWeight: 700, color: '#8B0000', maxWidth: 320 }}>{err}</p>}
    </main>
  );
}
