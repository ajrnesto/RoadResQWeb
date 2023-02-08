import { onAuthStateChanged, signOut } from '../node_modules/firebase/firebase-auth.js';
import { doc, getDoc } from 'https://www.gstatic.com/firebasejs/9.16.0/firebase-firestore.js';
import { db, auth } from '../js/firebase.js';
import { generateAvatar, showElement, hideElement } from '../js/utils.js';

const btnShop = document.querySelector('#btnShop');
const btnTrackOrders = document.querySelector('#btnTrackOrders');
const btnCart = document.querySelector('#btnCart');
const btnAvatar = document.querySelector('#btnAvatar');
const btnLoginOrSignup = document.querySelector('#btnLoginOrSignup');
const tvEmail = document.querySelector('#tvEmail');
const btnLogout = document.querySelector('#btnLogout');

window.addEventListener("load", () => {
});

onAuthStateChanged(auth, user => {
	const USER_EXISTS = user;

	if (USER_EXISTS) {
		// check user type
		getDoc(doc(db, "users", user.uid)).then(userSnap => {
			const CUSTOMER = 0;
			const ADMIN = 1;
			const userType = userSnap.data().userType;

			if (userType == ADMIN) {
				window.location = "../admin/dashboard.html";
			}
			else if (userType == CUSTOMER) {
				showElement(btnTrackOrders);
				showElement(btnCart);
				showElement(btnAvatar);
				hideElement(btnLoginOrSignup);
				generateAvatar(user.email.toUpperCase());
				tvEmail.textContent = user.email;
			}
		});
	}
	else {
		hideElement(btnTrackOrders);
		hideElement(btnCart);
		hideElement(btnAvatar);
		showElement(btnLoginOrSignup);
	}
});

async function getUserType(uid) {
	
}

btnLogout.addEventListener("click", () => {
	signOut(auth);
	window.location = "../login.html";
});

btnLoginOrSignup.addEventListener("click", () => {
	window.location = "../login.html";
});