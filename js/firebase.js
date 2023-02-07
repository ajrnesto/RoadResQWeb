// imports
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.16.0/firebase-app.js';
import { getAuth } from '../node_modules/firebase/firebase-auth.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/9.16.0/firebase-firestore.js';
import { getStorage } from "../node_modules/firebase/firebase-storage.js";

export const app = initializeApp({
	apiKey: "AIzaSyBHj7ai9DnMGMO8jHvchLUxnbmrVST8WhI",
	authDomain: "j-and-j-motorparts.firebaseapp.com",
	projectId: "j-and-j-motorparts",
	storageBucket: "j-and-j-motorparts.appspot.com",
	messagingSenderId: "497755068532",
	appId: "1:497755068532:web:6fe41ea958a74f85281921",
	measurementId: "G-P1S76JTRLM"
});

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);