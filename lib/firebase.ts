import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Configuración directa (sácala de tu consola de Firebase)
const firebaseConfig = {
  apiKey: "AIzaSyC6EgiSUwpzoGhVR1vqrdVzEDI34j-m80c",
  authDomain: "filma-workspace.firebaseapp.com",
  projectId: "filma-workspace",
  storageBucket: "filma-workspace.appspot.com",
  messagingSenderId: "450164750067",
  appId: "1:450164750067:web:2f779183c6ef87de21e986",
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);
