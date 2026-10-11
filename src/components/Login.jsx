import { useState } from 'react';
import { loginWithGoogle } from '../firebase.js';

export default function Login() {
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  return (
    <main className="center dots">
      <div className="logo" style={{ fontSize: 72, padding: '4px 26px 0' }}>שייקר!</div>
      <div className="bubble" style={{ maxWidth: 340 }}>
        <b>מה יש לך בבר? אני אגיד לך מה למזוג!</b>
        <div style={{ marginTop: 6, fontWeight: 500 }}>רושמים את המצרכים, מקבלים קוקטיילים, מדרגים — והאפליקציה לומדת את הטעם שלך.</div>
      </div>
      <button className="btn red" style={{ fontSize: 28, minWidth: 260 }} disabled={busy}
        onClick={async () => { setBusy(true); setErr(''); try { await loginWithGoogle(); } catch (e) { setErr(e.message || 'הכניסה נכשלה'); } finally { setBusy(false); } }}>
        {busy ? 'מתחבר…' : 'כניסה עם Google'}
      </button>
      {err && <p role="alert" style={{ fontWeight: 700, color: '#8B0000', maxWidth: 320 }}>{err}</p>}
    </main>
  );
}
