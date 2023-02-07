import { onAuthStateChanged, signInWithEmailAndPassword } from '../node_modules/firebase/firebase-auth.js';
import { auth, db } from '../js/firebase.js';
import { doc, getDoc } from 'https://www.gstatic.com/firebasejs/9.16.0/firebase-firestore.js';
import { checkUserTypeThenRedirect, validate, invalidate } from '../js/utils.js';

const errLogin = document.querySelector('#errLogin');
const btnLogin = document.querySelector('#btnLogin');
const btnGotoSignup = document.querySelector('#btnGotoSignup');
const btnSkipLogin = document.querySelector('#btnSkipLogin');

const etLoginEmail = document.querySelector('#etLoginEmail');
const etLoginPassword = document.querySelector('#etLoginPassword');
const emailValidator = document.querySelectorAll('.email-validator');
const passwordValidator = document.querySelectorAll('.password-validator');

onAuthStateChanged(auth, user => {
	checkUserTypeThenRedirect(user);
});

btnGotoSignup.addEventListener("click", function() {
	window.location = "../signup.html";
});

btnSkipLogin.addEventListener("click", function() {
	window.location = "../shop.html";
});

btnLogin.addEventListener("click", () => {
    const email = etLoginEmail.value;
    const password = etLoginPassword.value;

    signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
		validate(emailValidator);
		validate(passwordValidator);
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