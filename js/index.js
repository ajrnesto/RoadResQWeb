import { onAuthStateChanged } from '../node_modules/firebase/firebase-auth.js';
import { auth } from '../js/firebase.js';
import { checkUserTypeThenRedirect } from '../js/utils.js';

onAuthStateChanged(auth, user => {
    checkUserTypeThenRedirect(user);
});