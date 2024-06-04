import { db, auth, storage } from '../js/firebase.js';
import { onAuthStateChanged } from '../node_modules/firebase/firebase-auth.js';
import { doc, collection, collectionGroup, addDoc, setDoc, getDoc, getDocs, deleteDoc, updateDoc, increment, query, where, orderBy, startAt, endAt, onSnapshot } from 'https://www.gstatic.com/firebasejs/10.5.2/firebase-firestore.js';
import { ref, uploadBytes, getDownloadURL, deleteObject } from "../node_modules/firebase/firebase-storage.js";
import { showModal, hideModal, resetValidation, invalidate, blockNonAdmins } from '../js/utils.js';

// table
const tbodyServices = document.querySelector('#tbodyServices');
// modal
const tvManageServiceTitle = document.querySelector('#tvManageServiceTitle');
const btnSaveService = document.querySelector('#btnSaveService');
const btnCancelServiceManagement = document.querySelector('#btnCancelServiceManagement');
// modal form
const etServiceName = document.querySelector('#etServiceName');
const etDescription = document.querySelector('#etDescription');
const etPrice = document.querySelector('#etPrice');
const switchStatus = document.querySelector("#switchStatus");
const switchStatusLabel = document.querySelector("#switchStatusLabel");
let selectedServiceImage = null;
let serviceThumbnailWasChanged = false;

// delete modal
const tvConfirmDeleteMessage = document.querySelector('#tvConfirmDeleteMessage');
const btnDelete = document.querySelector('#btnDelete');

const serviceNameValidator = document.querySelectorAll('.service-name-validator');
const descriptionValidator = document.querySelectorAll('.service-description-validator');
const priceValidator = document.querySelectorAll('.price-validator');

onAuthStateChanged(auth, user => {
	blockNonAdmins(user);
});

window.addEventListener("load", function() {
	autosizeTextareas();
	renderServices();
});

switchStatus.addEventListener("change", () => {
	const STATUS_SWITCH_IS_ON = switchStatus.checked;
	if (STATUS_SWITCH_IS_ON) {
		switchStatusLabel.innerHTML = "Available";
	}
	else {
		switchStatusLabel.innerHTML = "Unavailable";
	}
});

window.manageService = manageService;
window.confirmDeleteService = confirmDeleteService;

function renderServices() {
	onSnapshot(collection(db, "services"), (snapServices) => {
		// clear table
		tbodyServices.innerHTML = '';

		snapServices.forEach(service => {
      renderServicesTable(
				service.id,
				service.data().serviceName,
				service.data().description,
				service.data().price,
				service.data().status
			);
    });
	});
}

async function renderServicesTable(id, serviceName, description, price, status) {
    const newRow = document.createElement('tr');
    const cellServiceName = document.createElement('td');
    const cellDescription = document.createElement('td');
    const cellPrice = document.createElement('td');
    const cellStatus = document.createElement('td');
    const cellAction = document.createElement('td');
		const buttonEdit = document.createElement('button');
			const buttonEditIcon = document.createElement('i');
		const buttonDelete = document.createElement('button');
			const buttonDeleteIcon = document.createElement('i');

	cellServiceName.innerHTML = serviceName;
	cellDescription.innerHTML = description;
	cellPrice.innerHTML = "₱"+Number(price).toFixed(2);
	if (status) {
		cellStatus.innerHTML = "Available";
	}
	else {
		cellStatus.innerHTML = "Unavailable";
	}

  buttonEdit.className = "btn btn-no-border btn-primary col me-2";
  buttonEdit.onclick = function() { manageService(id, serviceName, description, price, status) };
	buttonEdit.type = 'button';
	buttonEditIcon.className = "bi bi-pencil-fill text-white";
	buttonEditIcon.style.fontSize = "0.8rem";

	buttonDelete.className = "btn btn-no-border btn-danger col";
	buttonDelete.onclick = function() { confirmDeleteService(id, serviceName) };
	buttonDelete.type = 'button';
		buttonDeleteIcon.className = "bi bi-trash-fill text-white";
		buttonDeleteIcon.style.fontSize = "0.8rem";

    newRow.appendChild(cellServiceName);
    newRow.appendChild(cellDescription);
    newRow.appendChild(cellPrice);
    newRow.appendChild(cellStatus);
    newRow.appendChild(cellAction);
		cellAction.appendChild(buttonEdit);
			buttonEdit.appendChild(buttonEditIcon);
		cellAction.appendChild(buttonDelete);
			buttonDelete.appendChild(buttonDeleteIcon);

	tbodyServices.append(newRow);
}

function manageService(id, serviceName, description, price, status) {
	const NEW_PRODUCT = (id == null);
	if (!NEW_PRODUCT) {
		showModal('#modalManageService');
		tvManageServiceTitle.textContent = "Edit Service";
		btnSaveService.textContent = "Save Service";
		switchStatus.checked = status;

		etServiceName.value = serviceName;
		etDescription.value = description;
		etPrice.value = Number(price).toFixed(2);
	}
	else if (NEW_PRODUCT) {
		tvManageServiceTitle.textContent = "Add Service";
		btnSaveService.textContent = "Add Service";
		switchStatus.checked = true;
	}

	btnSaveService.onclick = function() {
		saveService(id);
	}
}

function saveService(serviceId) {
	const serviceName = etServiceName.value;
	const description = etDescription.value;
	const price = etPrice.value;
	const status = switchStatus.checked;

	const PRODUCT_NAME_IS_INVALID = (serviceName == null || serviceName == "");
	if (PRODUCT_NAME_IS_INVALID) {
		invalidate(serviceNameValidator);
		return;
	}
	resetValidation(serviceNameValidator);

	const PRODUCT_DETAILS_ARE_INVALID = (description == null || description == "");
	if (PRODUCT_DETAILS_ARE_INVALID) {
		invalidate(descriptionValidator);
		return;
	}
	resetValidation(descriptionValidator);

	const PRICE_IS_INVALID = (price == null || price == "");
	if (PRICE_IS_INVALID) {
		invalidate(priceValidator);
		return;
	}
	resetValidation(priceValidator);

	uploadServiceData(serviceId, serviceName, description, price, status);
}

function uploadServiceData(serviceId, serviceName, description, price, status) {
	const NEW_PRODUCT = (serviceId == null);
	
	let serviceRef = null;
	
	if (NEW_PRODUCT) {
		serviceRef = doc(collection(db, "services"));
	}
	else if (!NEW_PRODUCT) {
		serviceRef = doc(db, "services", serviceId);
	}

	setDoc((serviceRef), {
		id: serviceRef.id,
		serviceName: serviceName,
		serviceNameAllCaps: serviceName.toUpperCase(),
		description: description,
		price: parseFloat(price),
		status: status
	});

	etServiceName.value = "";
	etDescription.value = "";
	etPrice.value = "";
	switchStatus.checked = true;
	hideModal('#modalManageService');
}

function confirmDeleteService(serviceId, serviceName) {
	tvConfirmDeleteMessage.textContent = "Delete the service \"" + serviceName + "\"?";
	btnDelete.textContent = "Delete Service";
	showModal('#modalConfirmDelete');

	btnDelete.onclick = function() {
		deleteService(serviceId);
	};
}

function deleteService(serviceId) {
	hideModal("#modalConfirmDelete");
	deleteDoc(doc(db, "services", serviceId)).then(() => {
	}).catch((error) => {
		console.log("COULD NOT DELETE DATA: "+ error);
	});

	deleteCartItems(serviceId);
}

function deleteCartItems(serviceId) {
	const qryCartItems = query(collectionGroup(db, "items"), where("serviceId", "==", serviceId));

	getDocs(qryCartItems).then((docRefs) => {

		docRefs.forEach((docRef) => {
			deleteDoc(docRef.ref);
		});
	});
}

function autosizeTextareas() {
	const txHeight = 56;
	const tx = document.getElementsByTagName("textarea");

	for (let i = 0; i < tx.length; i++) {
		if (tx[i].value == '') {
			tx[i].setAttribute("style", "height:" + txHeight + "px;overflow-y:hidden;");
		}
		else {
			tx[i].setAttribute("style", "height:" + (tx[i].scrollHeight) + "px;overflow-y:hidden;");
		}
		tx[i].addEventListener("input", OnInput, false);
	}

	function OnInput(e) {
		this.style.height = 0;
		this.style.height = (this.scrollHeight) + "px";
	}
}