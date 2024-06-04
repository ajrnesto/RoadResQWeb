import { onAuthStateChanged } from '../node_modules/firebase/firebase-auth.js';
import { auth } from '../js/firebase.js';
import { authenticate } from '../js/utils.js';

onAuthStateChanged(auth, user => {
	console.log(user);
    authenticate(user);
});