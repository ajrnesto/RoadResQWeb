import { db } from '../js/firebase.js';
import { doc, getDoc } from 'https://www.gstatic.com/firebasejs/9.16.0/firebase-firestore.js';

/* authentication */
export function checkUserTypeThenRedirect(user) {
	if (!user) {
		return;
	}

	const docRef = doc(db, "users", user.uid);
	getDoc(docRef).then(userSnap => {
		const userType = userSnap.data().userType;
		if (userType == 0) {
			window.location = "../shop.html";
		}
		else if (userType == 1) {
			window.location = "../admin/dashboard.html";
		}
	});
}

export function checkAuthThenRedirect(user) {
	if (!user) {
		window.location = "../shop.html";
		return;
	}

	checkUserTypeThenRedirect(user);
}

export function blockNonAdmins(user) {
	if (!user) {
		window.location = "../shop.html";
		return;
	}

	const docRef = doc(db, "users", user.uid);
	getDoc(docRef).then(userSnap => {
		const userType = userSnap.data().userType;
		if (userType != 1) {
			window.location = "../shop.html";
		}
	});
}

/* ui */
export function showModal(modalId) {
    const modal = bootstrap.Modal.getOrCreateInstance(document.querySelector(modalId)); 
    modal.show();
}

export function hideModal(modalId) {
    const modal = bootstrap.Modal.getOrCreateInstance(document.querySelector(modalId)); 
    modal.hide();
}

export function hideElement(element) {
	element.classList.toggle('d-none', true);
}

export function showElement(element) {
	element.classList.toggle('d-none', false);
}

export function validate(elements) {
	elements.forEach((element) => {
		element.classList.toggle('is-invalid', false);
		element.classList.toggle('is-valid', true);
	});
}

export function invalidate(elements) {
	elements.forEach((element) => {
		element.classList.toggle('is-valid', false);
		element.classList.toggle('is-invalid', true);
	});
}

export function resetValidation(elements) {
	elements.forEach((element) => {
		element.classList.toggle('is-valid', false);
		element.classList.toggle('is-invalid', false);
	});
}

export function generateAvatar(firstName) {
	const firstLetter = firstName.charAt(0);
    const imgAvatar = document.querySelectorAll('.user-avatar');
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");

    const foregroundColor = "white";
    const backgroundColor = '#2980ba';

    canvas.width = 35;
    canvas.height = 35;

    // Draw background
    context.fillStyle = backgroundColor;
    context.fillRect(0, 0, canvas.width, canvas.height);

    // Draw text
    context.font = "1.2rem Nunito";
    context.fillStyle = foregroundColor;
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText(firstLetter, canvas.width / 2, canvas.height / 1.8);

	imgAvatar.forEach(element => {
		element.src = canvas.toDataURL("image/png");
		element.style.borderRadius = "50%";
	});
}