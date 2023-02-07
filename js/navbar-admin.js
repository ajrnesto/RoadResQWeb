import { onAuthStateChanged, signOut } from '../node_modules/firebase/firebase-auth.js';
import { auth } from '../js/firebase.js';
import { generateAvatar, blockNonAdmins } from '../js/utils.js';

const tvEmail = document.querySelector('.dropdown-text-email');
const btnLogout = document.querySelector('#btnLogout');

window.addEventListener("load", () => {
});

onAuthStateChanged(auth, user => {
	blockNonAdmins(user);

	if (user) {
		generateAvatar(user.email.toUpperCase());
		tvEmail.textContent = user.email;
	}
});

btnLogout.addEventListener("click", () => {
	signOut(auth);
	window.location = "../login.html";
});