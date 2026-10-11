import { initializeApp } from 'firebase/app';
import {
  getAuth, GoogleAuthProvider, signInWithPopup, signInWithRedirect, signOut, onAuthStateChanged,
} from 'firebase/auth';
import { initializeFirestore, persistentLocalCache } from 'firebase/firestore';
import { firebaseConfig } from './firebase-config.js';

export const isConfigured = !String(firebaseConfig.apiKey).includes('PASTE');

export const app = isConfigured ? initializeApp(firebaseConfig) : null;
export const auth = app ? getAuth(app) : null;
// מטמון מקומי: האפליקציה ממשיכה לעבוד גם בלי קליטה, ומסתנכרנת כשחוזרים לרשת
export const db = app ? initializeFirestore(app, { localCache: persistentLocalCache() }) : null;

export async function loginWithGoogle() {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  try {
    await signInWithPopup(auth, provider);
  } catch (e) {
    // בדפדפנים שחוסמים חלונות קופצים — מעבר לכניסה בדף מלא
    if (e?.code === 'auth/popup-blocked' || e?.code === 'auth/operation-not-supported-in-this-environment') {
      await signInWithRedirect(auth, provider);
    } else if (e?.code !== 'auth/popup-closed-by-user' && e?.code !== 'auth/cancelled-popup-request') {
      throw e;
    }
  }
}

export const logout = () => signOut(auth);
export const watchUser = (cb) => (auth ? onAuthStateChanged(auth, cb) : (cb(null), () => {}));
