import { createUserWithEmailAndPassword, onAuthStateChanged } from '../node_modules/firebase/firebase-auth.js';
import { collection, doc, setDoc, getDoc, addDoc } from 'https://www.gstatic.com/firebasejs/9.16.0/firebase-firestore.js'; 
import { auth, db } from '../js/firebase.js';
import { checkUserTypeThenRedirect, validate, invalidate } from '../js/utils.js';

const etFirstName = document.querySelector('#etFirstName');
const etLastName = document.querySelector('#etLastName');
const etMobile = document.querySelector('#etMobile');
const etSignupEmail = document.querySelector('#etSignupEmail');
const etSignupPassword = document.querySelector('#etSignupPassword');
const etSignupConfirmPassword = document.querySelector('#etSignupConfirmPassword');
const btnGotoLogin = document.querySelector('#btnGotoLogin');
const btnSignup = document.querySelector('#btnSignup');

const firstNameValidator = document.querySelectorAll('.first-name-validator');
const lastNameValidator = document.querySelectorAll('.last-name-validator');
const mobileValidator = document.querySelectorAll('.mobile-validator');
const emailValidator = document.querySelectorAll('.email-validator');
const passwordValidator = document.querySelectorAll('.password-validator');
const confirmPasswordValidator = document.querySelectorAll('.confirm-password-validator');

onAuthStateChanged(auth, user => {
	checkUserTypeThenRedirect(user);
});

btnGotoLogin.addEventListener("click", function() {
	window.location = "../login.html";
});

btnSignup.addEventListener("click", function() {
	const firstname = etFirstName.value;
	const lastname = etLastName.value;
	const mobile = etMobile.value;
	const email = etSignupEmail.value;
	const password = etSignupPassword.value;
	const confirmPassword = etSignupConfirmPassword.value;

	const signupIsValid = validateRegistration(firstname, lastname, mobile, email, password, confirmPassword);
	if (!signupIsValid) {
		return;
	}

	createUserWithEmailAndPassword(auth, email, password)
		.then((userCredential) => {
			// Signed in 
			const user = userCredential.user;

			console.log("Logged in as: "+user.uid);
			
			// add new user document in firestore
			setDoc(doc(db, "users", user.uid), {
				uid: user.uid,
				firstName: firstname,
				lastName: lastname,
				mobile: mobile,
				email: email,
				userType: 0,
			});
		})
		.catch((error) => {
			const errorCode = error.code;
			const errorMessage = error.message;
			// ..
		});
});

function validateRegistration(firstname, lastname, mobile, email, password, confirmPassword) {
	let signupIsValid = true;
	const validEmailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
	
	if (firstname == null || firstname == "") {
		invalidate(firstNameValidator);
		signupIsValid = false;
	}
	else {
		validate(firstNameValidator);
	}
	
	if (lastname == null || lastname == "") {
		invalidate(lastNameValidator);
		signupIsValid = false;
	}
	else {
		validate(lastNameValidator);
	}
	
	if (mobile == null || mobile == "" || mobile.length != 11) {
		invalidate(mobileValidator);
		signupIsValid = false;
	}
	else {
		validate(mobileValidator);
	}
	
	if (email == null || email == "" || !email.match(validEmailRegex)) {
		invalidate(emailValidator);
		signupIsValid = false;
	}
	else {
		validate(emailValidator);
	}

	if (password == null || password.length < 6) {
		invalidate(passwordValidator);
		signupIsValid = false;
	}
	else {
		validate(passwordValidator);
	}

	if (confirmPassword != password) {
		invalidate(confirmPasswordValidator);
		signupIsValid = false;
	}
	else {
		if (confirmPassword == null || confirmPassword == "") {
			return;
		}
		validate(confirmPasswordValidator);
	}

	return signupIsValid;
}