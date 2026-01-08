// frontend/src/app/firebase.ts
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// BURADAKİ BİLGİLERİ KENDİ FIREBASE KONSOLUNDAN ALDIKLARINLA DEĞİŞTİR
const firebaseConfig = {
  apiKey: "AIzaSyB6knxOLnS8bzAF_pRZQf6u95JEw_Ig_YY", // Kendi Key'ini yapıştır
  authDomain: "lms-project-6a061.firebaseapp.com",
  projectId: "lms-project-6a061",
  storageBucket: "lms-project-6a061.firebasestorage.app",
  messagingSenderId: "304758133370",
  appId: "1:304758133370:web:d620efdd40fd08858ae1c3"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();