// imports
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.5.2/firebase-app.js';
import { getAuth } from '../node_modules/firebase/firebase-auth.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.5.2/firebase-firestore.js';
import { getStorage } from "../node_modules/firebase/firebase-storage.js";

export const app = initializeApp({
  apiKey: "AIzaSyCWJnK_1qUC3SexC0qPIYiflpAm3lgk8_U",
  authDomain: "road-resq.firebaseapp.com",
  projectId: "road-resq",
  storageBucket: "road-resq.appspot.com",
  messagingSenderId: "294167437924",
  appId: "1:294167437924:web:946e3cd9c59bd3dbe47571",
  measurementId: "G-L1ZWV91T3F"
});

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);