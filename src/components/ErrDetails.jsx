// שורת "פרטים טכניים" מקופלת — כדי שאפשר יהיה לצלם לי את סיבת השגיאה בלי להעמיס על המסך
export const errText = (e) => String(e?.code ? `${e.code}: ${e.message || ''}` : e?.message || e || '').slice(0, 300);

export default function ErrDetails({ text }) {
  if (!text) return null;
  return (
    <details className="err-details">
      <summary>פרטים טכניים</summary>
      <code dir="ltr">{text}</code>
    </details>
  );
}
