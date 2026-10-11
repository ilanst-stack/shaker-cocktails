// פרטי הפרויקט ב-Firebase (אינם סודיים — האבטחה נעשית דרך חוקי Firestore)
export const firebaseConfig = {
  apiKey: 'AIzaSyB1a2tPnxfasXznnm_zwBUkdQVWOZPaIE0',
  authDomain: 'shaker-cocktails.firebaseapp.com',
  projectId: 'shaker-cocktails',
  storageBucket: 'shaker-cocktails.firebasestorage.app',
  messagingSenderId: '391900418580',
  appId: '1:391900418580:web:fba87be12ada403a2b8d01',
};

// זיהוי בקבוקים ותרגום (Gemini דרך Firebase AI Logic) — דורש App Check עם Fraud Defense (reCAPTCHA Enterprise)
// ↓↓↓ כאן מדביקים את ה-Key ID מ-Google Cloud → Fraud Defense ↓↓↓
export const recaptchaEnterpriseKey = '6Ldc9uktAAAAAI6b0aisEeAEDji68ks5_CVY2MQ3';
export const geminiModel = 'gemini-3.8-flash';
