import { initializeApp, getApps, getApp } from "firebase/app";
import { initializeFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  projectId: "gen-lang-client-0828561058",
  appId: "1:315009178690:web:4f544465f1fed61390e1db",
  apiKey: "AIzaSyARiEkwUjMnD8MkjNoK3-4Oqs95Eb651n4",
  authDomain: "gen-lang-client-0828561058.firebaseapp.com",
  storageBucket: "gen-lang-client-0828561058.firebasestorage.app",
  messagingSenderId: "315009178690",
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const db = initializeFirestore(app, {
  databaseId: "ai-studio-attechfirm-e7b76af3-b425-43fc-8a6d-a5cb8341c6e7",
  experimentalForceLongPolling: true,
});

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
