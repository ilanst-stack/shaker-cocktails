// פרטי הפרויקט ב-Firebase (אינם סודיים — האבטחה נעשית דרך חוקי Firestore)
export const firebaseConfig = {
  apiKey: 'AIzaSyB1a2tPnxfasXznnm_zwBUkdQVWOZPaIE0',
  authDomain: 'shaker-cocktails.firebaseapp.com',
  projectId: 'shaker-cocktails',
  storageBucket: 'shaker-cocktails.firebasestorage.app',
  messagingSenderId: '391900418580',
  appId: '1:391900418580:web:fba87be12ada403a2b8d01',
};

// זיהוי בקבוקים מתמונה (Gemini דרך Firebase AI Logic) — דורש App Check עם reCAPTCHA v3
// ↓↓↓ כאן מדביקים את ה-Site key של reCAPTCHA (לא את ה-Secret!) ↓↓↓
export const recaptchaSiteKey = '';
export const geminiModel = 'gemini-3.8-flash';
