import { useEffect, useMemo, useRef, useState } from 'react';
import { resetSticky } from './data/sticky.js';
import { isConfigured, watchUser, logout } from './firebase.js';
import { useUserData } from './data/userData.js';
import { VERSION } from './version.js';
import Logo from './components/Logo.jsx';
import AgeChoice from './components/AgeChoice.jsx';
import { getPendingAge, clearPendingAge, isAlcoholFree, isAlcoholKey, isAlcoholName } from './data/age.js';
import { loadDrinks, allIngredientNames } from './data/cocktails.js';
import { buildIndex } from './data/match.js';
import Login from './components/Login.jsx';
import Inventory from './components/Inventory.jsx';
import CocktailList from './components/CocktailList.jsx';
import Favorites from './components/Favorites.jsx';
import ForYou from './components/ForYou.jsx';
import Recipe from './components/Recipe.jsx';
import MadeDialog from './components/MadeDialog.jsx';
import { applyChanges, lowThreshold, isAdultItem } from './data/inventory.js';
import { UNIT_HE, unitOf } from './data/ingredients.js';
import AllCocktails from './components/AllCocktails.jsx';
import CustomEditor from './components/CustomEditor.jsx';
import { useCustomDrinks } from './data/custom.js';
import { IconList, IconGlass, IconStarLine, IconSpark, IconSearch } from './components/Icons.jsx';

export default function App() {
  const [user, setUser] = useState(undefined);
  useEffect(() => watchUser(setUser), []);

  if (!isConfigured) {
    return (
      <main className="center dots">
        <Logo size={40} />
        <div className="bubble" style={{ maxWidth: 360 }}><b>חסרים פרטי Firebase</b>יש להדביק אותם בקובץ src/firebase-config.js</div>
      </main>
    );
  }
  if (user === undefined) return <Loading text="רגע…" />;
  if (!user) return <Login />;
  return <Main user={user} />;
}

function Loading({ text, progress }) {
  return (
    <main className="center dots" aria-busy="true">
      <Logo size={40} />
      <div style={{ font: '700 30px var(--display)' }}>{text}</div>
      {progress != null && <div className="progress" role="progressbar" aria-valuenow={Math.round(progress * 100)} aria-valuemin={0} aria-valuemax={100}><div style={{ width: `${progress * 100}%` }} /></div>}
    </main>
  );
}

const TABS = [
  { id: 'inventory', he: 'המלאי', Icon: IconList },
  { id: 'cocktails', he: 'הקוקטיילים שלי', Icon: IconGlass },
  { id: 'all', he: 'כל הקוקטיילים', Icon: IconSearch },
  { id: 'mine', he: 'מועדפים', Icon: IconStarLine },
  { id: 'foryou', he: 'בשבילך', Icon: IconSpark },
];

function Main({ user }) {
  const { data, error, setInventory, setShopping, recordMade, toggleFavorite, setRating, setTasted, setAdult } = useUserData(user.uid);
  const [drinks, setDrinks] = useState(null);
  const [progress, setProgress] = useState(0);
  const [loadErr, setLoadErr] = useState('');
  const [tab, setTab] = useState(null);
  const [openId, setOpenId] = useState(null);
  const [editing, setEditing] = useState(null); // null | 'new' | drink
  const [madeFor, setMadeFor] = useState(null); // קוקטייל שפתוח עליו חלון "הכנתי"
  const [undo, setUndo] = useState(null); // { id, plan, n, msg }
  const [askLogout, setAskLogout] = useState(false);
  const undoT = useRef(null);
  const custom = useCustomDrinks(user.uid);

  const load = (force) => {
    setLoadErr('');
    loadDrinks({ force, onProgress: setProgress }).then(setDrinks).catch((e) => setLoadErr(e.message));
  };
  useEffect(() => { load(false); }, []);

  // פתיחה ראשונה: מלאי ריק → מסך מלאי; אחרת → קוקטיילים
  useEffect(() => { if (data && tab === null) setTab(data.inventory.length ? 'cocktails' : 'inventory'); }, [data, tab]);

  // כפתור "חזרה" של הטלפון סוגר את המתכון
  useEffect(() => {
    const onPop = () => setOpenId(null);
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);
  const open = (id) => { history.pushState({ drink: id }, ''); setOpenId(id); };
  const close = () => { if (history.state?.drink) history.back(); else setOpenId(null); };

  // גיל: נשמר בחשבון. משתמש קיים בלי בחירה — לוקחים מהבחירה במסך הכניסה, אחרת שואלים
  const adult = data ? (getPendingAge() ?? data.adult) : null;
  useEffect(() => {
    // הבחירה במסך הכניסה קובעת לכל הכניסה הזו (גם אם בחשבון נשמרה בחירה אחרת)
    if (!data) return;
    const p = getPendingAge();
    if (p != null) { if (data.adult !== p) setAdult(p); clearPendingAge(); }
  }, [!!data]); // eslint-disable-line react-hooks/exhaustive-deps
  const kids = adult === false;
  const visibleInv = useMemo(() => (data ? (kids ? data.inventory.filter((i) => !isAdultItem(i)) : data.inventory) : []), [data?.inventory, kids]);
  const setVisibleInv = (vis) => setInventory(kids ? [...data.inventory.filter(isAdultItem), ...vis] : vis);
  const shopAll = data?.shopping || [];
  const visibleShop = kids ? shopAll.filter((i) => !isAdultItem(i)) : shopAll;
  const setVisibleShop = (vis) => setShopping(kids ? [...shopAll.filter(isAdultItem), ...vis] : vis);
  const allDrinks = useMemo(() => (drinks ? [...custom, ...drinks] : null), [drinks, custom]);
  const index = useMemo(() => (allDrinks && data ? buildIndex(kids ? allDrinks.filter(isAlcoholFree) : allDrinks, visibleInv) : []), [allDrinks, visibleInv, kids]);
  const drinkNames = useMemo(() => (drinks && !kids ? drinks.map((d) => d.name) : []), [drinks, kids]);
  const names = useMemo(() => (drinks ? allIngredientNames(drinks).filter((n) => !kids || !isAlcoholName(n)) : []), [drinks, kids]);

  if (error) return <Loading text={`שגיאה בגישה לנתונים: ${error.code || error.message}`} />;
  if (loadErr) return (
    <main className="center dots"><Logo size={40} /><div className="bubble"><b>לא הצלחתי לטעון מתכונים</b>{loadErr}</div><button className="btn red" onClick={() => load(true)}>לנסות שוב</button></main>
  );
  if (data && data.adult === undefined && getPendingAge() == null) {
    return <main className="center dots"><Logo size={40} /><AgeChoice value={null} onChange={setAdult} /></main>;
  }
  if (!drinks || !data || tab === null) return <Loading text="מערבב את המאגר…" progress={drinks ? null : progress} />;

  const opened = openId && index.find((e) => e.drink.id === openId);
  function confirmMade(e, n, plan) {
    const id = e.drink.id;
    recordMade(id, n, plan.length ? applyChanges(data.inventory, plan) : null);
    if (!data.tasted[id]) setTasted(id, true);
    setMadeFor(null);
    const byId = new Map(data.inventory.map((i) => [i.id, i]));
    const low = plan.map((c) => ({ c, it: byId.get(c.id) })).filter(({ c, it }) => c.after < lowThreshold(it));
    const msg = low.length
      ? `נשארו ${low.map(({ c, it }) => `${c.after} ${UNIT_HE[it.unit || unitOf(it.key)]} ${it.brand || it.he}`).join(', ')}`
      : `לחיים! ${n > 1 ? `${n} כוסות נרשמו` : 'נרשם'}`;
    clearTimeout(undoT.current);
    setUndo({ id, plan, n, msg });
    undoT.current = setTimeout(() => setUndo(null), 5000);
    setTimeout(() => document.querySelector('.stars')?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 50);
  }
  function undoMade() {
    if (!undo) return;
    const back = undo.plan.map((c) => ({ id: c.id, after: c.before }));
    recordMade(undo.id, -undo.n, back.length ? applyChanges(data.inventory, back) : null);
    clearTimeout(undoT.current);
    setUndo(null);
  }

  const common = { index, user: data, onOpen: open, onFav: toggleFavorite, onNewCustom: () => setEditing('new') };

  return (
    <div className="app dots">
      <header className="topbar">
        <div className="row" style={{ gap: 10, alignItems: 'flex-end' }}>
          <Logo size={22} />
          <span className="version" dir="ltr">v{VERSION}</span>
          {kids && <span className="version" style={{ background: '#9BD34C' }}>מוקטיילים</span>}
        </div>
        <button className="icon-btn" style={{ background: '#1FA3D9', color: '#fff', font: '700 24px var(--display)' }}
          aria-label="התנתקות" title={`${user.displayName || ''} — התנתקות`} onClick={() => setAskLogout(true)}>
          {user.photoURL ? <img src={user.photoURL} alt="" width="38" height="38" style={{ borderRadius: '50%' }} referrerPolicy="no-referrer" /> : (user.displayName || '?')[0]}
        </button>
      </header>

      {tab === 'inventory' && <Inventory inventory={visibleInv} setInventory={setVisibleInv} ingredientNames={names} kids={kids} shopping={visibleShop} setShopping={setVisibleShop} index={index} drinkNames={drinkNames} />}
      {tab === 'cocktails' && <CocktailList {...common} inventoryCount={data.inventory.length} />}
      {tab === 'all' && <AllCocktails {...common} />}
      {tab === 'mine' && <Favorites {...common} />}
      {tab === 'foryou' && <ForYou {...common} />}

      <nav className="tabbar" aria-label="ניווט ראשי">
        {TABS.map(({ id, he, Icon }) => (
          <button key={id} aria-current={tab === id ? 'page' : undefined} onClick={() => { setTab(id); window.scrollTo(0, 0); }} style={{ position: 'relative' }}>
            <Icon />{he}
          </button>
        ))}
      </nav>

      {opened && (
        <Recipe e={opened} uid={user.uid} fav={data.favorites.includes(opened.drink.id)} rating={data.ratings[opened.drink.id]} tasted={!!data.tasted[opened.drink.id]}
          onBack={close} onFav={() => toggleFavorite(opened.drink.id)} onRate={(r) => setRating(opened.drink.id, r)} onTasted={(on) => setTasted(opened.drink.id, on)} onEdit={opened.drink.custom ? () => setEditing(opened.drink) : null}
          madeCount={data.made?.[opened.drink.id] || 0} onMade={() => setMadeFor(opened)}
          readyBottle={data.inventory.find((i) => i.key === `ready:${opened.drink.name}` && !(i.amount <= 0))} />
      )}
      {askLogout && (
        <div className="modal-back center" role="dialog" aria-modal="true" aria-labelledby="logout-title" onClick={(e) => { if (e.target === e.currentTarget) setAskLogout(false); }}>
          <div className="modal panel yellow">
            <h2 id="logout-title" className="h2" style={{ marginTop: 0 }}>להתנתק?</h2>
            <p style={{ margin: '0 0 14px', fontSize: 15, fontWeight: 700 }}>המלאי, המועדפים והדירוגים נשמרים — יחכו לך בכניסה הבאה.</p>
            <div className="row" style={{ gap: 10 }}>
              <button className="btn" style={{ flex: 1 }} onClick={() => setAskLogout(false)}>ביטול</button>
              <button className="btn red" style={{ flex: 1 }} onClick={() => { setAskLogout(false); resetSticky(); logout(); }}>התנתקות</button>
            </div>
          </div>
        </div>
      )}
      {madeFor && <MadeDialog e={madeFor} inventory={visibleInv} onCancel={() => setMadeFor(null)} onConfirm={(n, plan) => confirmMade(madeFor, n, plan)} />}
      {undo && (
        <div className="toast undo" role="status">
          <span>{undo.msg}</span>
          <button onClick={undoMade}>ביטול</button>
        </div>
      )}
      {editing && (
        <CustomEditor uid={user.uid} kids={kids} drink={editing === 'new' ? null : editing}
          onClose={() => setEditing(null)} onSaved={(id) => { setEditing(null); if (openId !== id) open(id); }} />
      )}
    </div>
  );
}
