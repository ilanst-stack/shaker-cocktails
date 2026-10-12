import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './styles.css';
import { startIdleWatch } from './data/sticky.js';

startIdleWatch();

// שדה כמות: לחיצה מסמנת את כל המספר, כדי להקליד ישר מספר חדש
document.addEventListener('focusin', (e) => {
  const el = e.target;
  if (el instanceof HTMLInputElement && (el.type === 'number' || el.inputMode === 'decimal' || el.inputMode === 'numeric')) setTimeout(() => el.select(), 0);
});

createRoot(document.getElementById('root')).render(<StrictMode><App /></StrictMode>);
