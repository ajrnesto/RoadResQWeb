import { onAuthStateChanged, signOut } from '../node_modules/firebase/firebase-auth.js';
import { auth } from '../js/firebase.js';
import { generateAvatar, showElement, hideElement } from '../js/utils.js';

const btnTrackOrders = document.querySelector('.nav-btn-track-orders');
const btnCart = document.querySelector('.nav-btn-cart');
const btnAvatar = document.querySelector('.nav-btn-avatar');
const btnLoginOrSignup = document.querySelector('.nav-btn-login');
const tvEmail = document.querySelector('.dropdown-text-email');
const btnLogout = document.querySelector('#btnLogout');

window.addEventListener("load", () => {
});

onAuthStateChanged(auth, user => {
	if (user) {
		showElement(btnTrackOrders);
		showElement(btnCart);
		showElement(btnAvatar);
		hideElement(btnLoginOrSignup);
		generateAvatar(user.email.toUpperCase());
		tvEmail.textContent = user.email;
	}
	else {
		hideElement(btnTrackOrders);
		hideElement(btnCart);
		hideElement(btnAvatar);
		showElement(btnLoginOrSignup);
	}
});

btnLogout.addEventListener("click", () => {
	signOut(auth);
	window.location = "../login.html";
});

btnLoginOrSignup.addEventListener("click", () => {
	window.location = "../login.html";
});