import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from '../node_modules/firebase/firebase-auth.js';
import { app, auth, db } from '../js/firebase.js';
import { doc, getDoc, collection, query, where, getCountFromServer } from 'https://www.gstatic.com/firebasejs/10.5.2/firebase-firestore.js';
import { authenticate, validate, invalidate } from '../js/utils.js';

const errLogin = document.querySelector('#errLogin');
const errNotAdmin = document.querySelector('#errNotAdmin');
const btnLogin = document.querySelector('#btnLogin');

const etLoginEmail = document.querySelector('#etLoginEmail');
const etLoginPassword = document.querySelector('#etLoginPassword');

const emailValidator = document.querySelectorAll('.email-validator');
const passwordValidator = document.querySelectorAll('.password-validator');

onAuthStateChanged(auth, user => {
	if (!user) {
		return;
	}

	const docRef = doc(db, "users", user.uid);
	getDoc(docRef).then(userSnap => {
		console.log(userSnap);
		const userType = userSnap.data().userType;
		if (userType != 1) {
			errNotAdmin.style.display = "block";
			invalidate(emailValidator);
			invalidate(passwordValidator);
			signOut(auth)
			return;
		}

		errNotAdmin.style.display = "none";
		validate(emailValidator);
		validate(passwordValidator);
		window.location = "../services.html";
	});

});

btnLogin.addEventListener("click", () => {
    const email = etLoginEmail.value;
    const password = etLoginPassword.value;

    signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      errLogin.style.display = "none";
      // let onAuthStateChanged handle the authentication validation
    })
    .catch((error) => {
      // display error text
		invalidate(emailValidator);
		invalidate(passwordValidator);
      errLogin.style.display = "block";
    });
});