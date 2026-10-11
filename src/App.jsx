import { useEffect, useMemo, useState } from 'react';
import { isConfigured, watchUser, logout } from './firebase.js';
import { useUserData } from './data/userData.js';
import { loadDrinks, allIngredientNames } from './data/cocktails.js';
import { buildIndex } from './data/match.js';
import Login from './components/Login.jsx';
import Inventory from './components/Inventory.jsx';
import CocktailList from './components/CocktailList.jsx';
import Favorites from './components/Favorites.jsx';
import ForYou from './components/ForYou.jsx';
import Recipe from './components/Recipe.jsx';
import AllCocktails from './components/AllCocktails.jsx';
import { IconList, IconGlass, IconStarLine, IconSpark, IconSearch } from './components/Icons.jsx';

export default function App() {
  const [user, setUser] = useState(undefined);
  useEffect(() => watchUser(setUser), []);

  if (!isConfigured) {
    return (
      <main className="center dots">
        <div className="logo">שייקר!</div>
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
      <div className="logo">שייקר!</div>
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
  const { data, error, setInventory, toggleFavorite, setRating, setTasted } = useUserData(user.uid);
  const [drinks, setDrinks] = useState(null);
  const [progress, setProgress] = useState(0);
  const [loadErr, setLoadErr] = useState('');
  const [tab, setTab] = useState(null);
  const [openId, setOpenId] = useState(null);

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

  const index = useMemo(() => (drinks && data ? buildIndex(drinks, data.inventory) : []), [drinks, data?.inventory]);
  const names = useMemo(() => (drinks ? allIngredientNames(drinks) : []), [drinks]);

  if (error) return <Loading text={`שגיאה בגישה לנתונים: ${error.code || error.message}`} />;
  if (loadErr) return (
    <main className="center dots"><div className="logo">שייקר!</div><div className="bubble"><b>לא הצלחתי לטעון מתכונים</b>{loadErr}</div><button className="btn red" onClick={() => load(true)}>לנסות שוב</button></main>
  );
  if (!drinks || !data || tab === null) return <Loading text="מערבב את המאגר…" progress={drinks ? null : progress} />;

  const opened = openId && index.find((e) => e.drink.id === openId);
  const common = { index, user: data, onOpen: open, onFav: toggleFavorite };

  return (
    <div className="app dots">
      <header className="topbar">
        <div className="logo">שייקר!</div>
        <button className="icon-btn" style={{ background: '#1FA3D9', color: '#fff', font: '700 24px var(--display)' }}
          aria-label="התנתקות" title={`${user.displayName || ''} — התנתקות`} onClick={() => { if (confirm('להתנתק?')) logout(); }}>
          {user.photoURL ? <img src={user.photoURL} alt="" width="38" height="38" style={{ borderRadius: '50%' }} referrerPolicy="no-referrer" /> : (user.displayName || '?')[0]}
        </button>
      </header>

      {tab === 'inventory' && <Inventory inventory={data.inventory} setInventory={setInventory} ingredientNames={names} />}
      {tab === 'cocktails' && <CocktailList {...common} inventoryCount={data.inventory.length} />}
      {tab === 'all' && <AllCocktails {...common} />}
      {tab === 'mine' && <Favorites {...common} />}
      {tab === 'foryou' && <ForYou {...common} />}

      <nav className="tabbar" aria-label="ניווט ראשי">
        {TABS.map(({ id, he, Icon }) => (
          <button key={id} aria-current={tab === id ? 'page' : undefined} onClick={() => { setTab(id); window.scrollTo(0, 0); }}><Icon />{he}</button>
        ))}
      </nav>

      {opened && (
        <Recipe e={opened} uid={user.uid} fav={data.favorites.includes(opened.drink.id)} rating={data.ratings[opened.drink.id]} tasted={!!data.tasted[opened.drink.id]}
          onBack={close} onFav={() => toggleFavorite(opened.drink.id)} onRate={(r) => setRating(opened.drink.id, r)} onTasted={(on) => setTasted(opened.drink.id, on)} />
      )}
    </div>
  );
}
