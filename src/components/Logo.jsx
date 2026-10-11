// לוגו SHAKE SHAKE — שתי שורות טקסט וכוס מרטיני עם זית; גובה הכוס = גובה שתי שורות הטקסט
export default function Logo({ size = 22, boxed = true }) {
  const lineH = size * 0.82;
  const capH = size * 0.72; // גובה אות גדולה בערך
  const iconH = lineH + capH; // מראש השורה העליונה ועד בסיס השורה התחתונה
  return (
    <div className={boxed ? 'logo-box' : ''} dir="ltr" role="img" aria-label="SHAKE SHAKE">
      <div className="logo-word" style={{ fontSize: size, lineHeight: `${lineH}px` }} aria-hidden="true">
        <span>SHAKE</span>
        <span>SHAKE</span>
      </div>
      <svg aria-hidden="true" height={iconH} width={iconH * (264 / 286)} viewBox="18 10 264 286" fill="none" stroke="#6DB33F" strokeWidth="18" strokeLinecap="round" strokeLinejoin="round">
        <path d="M196 20 L118 128" />
        <ellipse cx="132" cy="108" rx="26" ry="20" transform="rotate(-54 132 108)" />
        <path d="M28 52 L272 52 L150 184 Z" />
        <path d="M150 192 L150 252" />
        <rect x="72" y="256" width="156" height="30" rx="15" />
      </svg>
    </div>
  );
}
