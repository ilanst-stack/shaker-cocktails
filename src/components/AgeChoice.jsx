// בחירת גיל — חובה לפני כניסה (וגם למשתמשים קיימים שעוד לא בחרו)
export default function AgeChoice({ value, onChange }) {
  return (
    <div className="age-choice" role="radiogroup" aria-label="גיל">
      <div style={{ font: '700 26px/1 var(--display)', marginBottom: 8 }}>רגע, בן/בת כמה את/ה?</div>
      <div className="row" style={{ gap: 10 }}>
        <button role="radio" aria-checked={value === true} className={`age-btn ${value === true ? 'on' : ''}`} onClick={() => onChange(true)}>
          <b>18+</b><span>מגיל 18 ומעלה — קוקטיילים מלאים</span>
        </button>
        <button role="radio" aria-checked={value === false} className={`age-btn ${value === false ? 'on' : ''}`} onClick={() => onChange(false)}>
          <b>מתחת ל-18</b><span>מוקטיילים — כל הכיף, בלי אלכוהול</span>
        </button>
      </div>
    </div>
  );
}
