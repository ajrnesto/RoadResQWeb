import { db, auth, storage } from '../js/firebase.js';
import { onAuthStateChanged } from '../node_modules/firebase/firebase-auth.js';
import { doc, collection, getDoc, onSnapshot, getDocs, setDoc, updateDoc, increment, query, where, orderBy, limit } from 'https://www.gstatic.com/firebasejs/10.5.2/firebase-firestore.js';
import { ref, getDownloadURL } from "../node_modules/firebase/firebase-storage.js";
import { parseButtonAction, dateFormatter } from '../js/utils.js';

const menuFilter = document.querySelector("#menuFilter");
const etSearchId = document.querySelector("#etSearchId");
const etFirstName = document.querySelector("#etFirstName");
const etLastName = document.querySelector("#etLastName");
const btnFilter = document.querySelector("#btnFilter");

menuFilter.addEventListener("change", () => {
	if (menuFilter.value == "User ID") {
		etSearchId.classList.toggle("d-none", false);
		etFirstName.classList.toggle("d-none", true);
		etFirstName.value = "";
		etLastName.classList.toggle("d-none", true);
		etLastName.value = "";
	}
	else {
		etSearchId.classList.toggle("d-none", true);
		etSearchId.value = "";
		etFirstName.classList.toggle("d-none", false);
		etLastName.classList.toggle("d-none", false);
	}
});

btnFilter.addEventListener("click", function(){
	getAppointmentsData();
});;

// chips
const btnPending = document.querySelector("#btnPending");
const btnInService = document.querySelector("#btnInService");
const btnCompleted = document.querySelector("#btnCompleted");
const btnPendingLabel = document.querySelector("#btnPendingLabel");
const btnInServiceLabel = document.querySelector("#btnInServiceLabel");
const btnCompletedLabel = document.querySelector("#btnCompletedLabel");

const appointmentsContainer = document.querySelector("#appointmentsContainer");

onAuthStateChanged(auth, user => {
	// const docRef = doc(db, "users", user.uid);
	// getDoc(docRef).then(userSnap => {
	// 	const userType = userSnap.data().userType;

	// 	if (userType == 3) {
	// 		getAppointmentsData("In Transit");
	// 	}
	// });
});

window.addEventListener("load", function() {
	getAppointmentsData();
	btnPendingLabel.style.color = "white";
});

btnPending.addEventListener("click", function() {
	getAppointmentsData();
	btnPendingLabel.style.color = "white";
	btnInServiceLabel.style.color = "#A22C29";
	btnCompletedLabel.style.color = "#A22C29";
});

btnInService.addEventListener("click", function() {
	getAppointmentsData();
	btnPendingLabel.style.color = "#A22C29";
	btnInServiceLabel.style.color = "white";
	btnCompletedLabel.style.color = "#A22C29";
});

btnCompleted.addEventListener("click", function() {
	getAppointmentsData();
	btnPendingLabel.style.color = "#A22C29";
	btnInServiceLabel.style.color = "#A22C29";
	btnCompletedLabel.style.color = "white";
});

function getAppointmentsData() {
	const id = etSearchId.value;
	const firstName = etFirstName.value.toUpperCase();
	const lastName = etLastName.value.toUpperCase();

	let filterStatus = null;
	if (btnPending.checked) {
		filterStatus = "PENDING";
	}
	else if (btnInService.checked) {
		filterStatus = "IN SERVICE";
	}
	else if (btnCompleted.checked) {
		filterStatus = "COMPLETED";
	}

	let qryAppointments = null;
	
	if (!id) {
		qryAppointments = query(collection(db, "appointments"), where("status", "==", filterStatus), orderBy("timestamp", "desc"));
		queryAppointments(qryAppointments, filterStatus);
	}
	else if (id) {
		getDocs(query(collection(db, "users"), where("uidReadable", "==", id))).then((users) => {
		
			users.forEach(user => {
				qryAppointments = query(collection(db, "appointments"), where("status", "==", filterStatus), where("userUid", "==", user.id), orderBy("timestamp", "desc"));
				queryAppointments(qryAppointments, filterStatus);
			});
		});
	}

	// if (btnPending.checked) {
	// 	qryAppointments = query(collection(db, "appointments"), where("status", "==", "PENDING"), orderBy("timestamp", "desc"));
	// }
	// else if (btnInService.checked) {
	// 	qryAppointments = query(collection(db, "appointments"), where("status", "==", "IN SERVICE"), orderBy("timestamp", "desc"));
	// }
	// else {
	// 	qryAppointments = query(collection(db, "appointments"), where("status", "==", "COMPLETED"), orderBy("timestamp", "asc"));
	// }
}

function queryAppointments(qryAppointments, filterStatus) {
	onSnapshot(qryAppointments, (appointments) => {
		// clear table
		if (filterStatus == "PENDING") {
			btnPendingLabel.textContent = "Pending ("+appointments.size+")";
			btnInServiceLabel.textContent = "In Service";
			btnCompletedLabel.textContent = "Completed";
		}
		else if (filterStatus == "IN SERVICE") {
			btnPendingLabel.textContent = "Pending";
			btnInServiceLabel.textContent = "In Service ("+appointments.size+")";
			btnCompletedLabel.textContent = "Completed";
		}
		else if (filterStatus == "COMPLETED") {
			btnPendingLabel.textContent = "Pending";
			btnInServiceLabel.textContent = "In Service";
			btnCompletedLabel.textContent = "Completed ("+appointments.size+")";
		}

		appointmentsContainer.innerHTML = '';

		console.log("Appointments size: "+appointments.size);
		if (appointments.size == 0) {
			appointmentsContainer.innerHTML = '<div class="col-12 text-center mt-4"><h4>No Appointments to Display</h4></div>';
		}
		else {
			appointmentsContainer.innerHTML = '';
		}
			
		appointments.forEach(async appointment => {
			const qryServiceFee = query(collection(db, "services"), where("serviceNameAllCaps", "==", appointment.data().serviceType), limit(1));
			const snapServiceFee = await getDocs(qryServiceFee);

			snapServiceFee.forEach((service) => {
				renderAppointmentCard(
					appointment.id,
					appointment.data().userUid,
					appointment.data().firstName,
					appointment.data().lastName,
					appointment.data().mobile,
					appointment.data().brand,
					appointment.data().model,
					appointment.data().serviceType,
					appointment.data().description,
					appointment.data().location,
					appointment.data().schedule,
					appointment.data().status,
					appointment.data().timestamp,
					service.data().price
				);
			});
		});
	});
}

function renderAppointmentCard(appointmentId, userUid, firstName, lastName, mobile, brand, model, serviceType, description, location, schedule, status, timestamp, serviceFee) {
  const cardContainer = document.createElement('div');
  	const card = document.createElement('div');
			const cardHeader = document.createElement('div');
				const cardHeaderLeft = document.createElement('div');
					const tvFullName = document.createElement('h6');
					const tvUserId = document.createElement('p');
					const tvVehicle = document.createElement('p');
				const cardHeaderRight = document.createElement('div');
					const tvSchedule = document.createElement('h6');
					const tvStatus = document.createElement('p');
			const cardBody = document.createElement('div');
				const tvServiceType = document.createElement('h6');
				const tvDescription = document.createElement('p');
				const table = document.createElement('table');
					const thead = document.createElement('thead');
						const tr = document.createElement('tr');
							const thImage = document.createElement('th');
							const thProductId = document.createElement('th');
							const thProduct = document.createElement('th');
							const thQuantity = document.createElement('th');
							//const thDetails = document.createElement('th');
							const thPrice = document.createElement('th');
							const thSubtotal = document.createElement('th');
					const tbody = document.createElement('tbody');
				const cardBodyFooter = document.createElement('div');
					const tvCartSubtotal = document.createElement('p');
					const tvServiceFee = document.createElement('p');
					const tvTotal = document.createElement('h6');
					const btnLocation = document.createElement('button');
					const btnAppointmentAction = document.createElement('button');

	cardContainer.classList = "col-10 col-md-8 container col p-4 pb-0 justify-content-center";
	card.classList = "rounded bg-white col-12 text-center p-4";
	cardHeader.classList = "row";
	cardHeaderLeft.classList = "col-6";
	tvFullName.classList = "col text-primary text-start";
	tvUserId.classList = "col text-dark text-start";
	tvVehicle.classList = "col text-dark fw-medium text-start fs-6 my-0";
	cardHeaderRight.classList = "col-6";
	tvSchedule.classList = "col fw-medium text-end text-dark fs-6";
	tvStatus.classList = "col fw-medium text-end text-danger fs-6";
	cardBody.classList = "col";
	tvServiceType.classList = "col text-primary text-start";
	tvDescription.classList = "text-dark text-start col-12 mt-2";
	cardBodyFooter.classList = "col mt-4 text-end align-self-end";
	cardBody.className = "row";
	table.className = "table align-middle";
	thImage.className = "col-1 invisible";
	thProductId.className = "col-2";
	thProduct.className = "col-2";
	//thDetails.className = "col-2";
	thPrice.className = "col-1";
	thQuantity.className = "col-1";
	thSubtotal.className = "col-1";
	tvCartSubtotal.classList = "col text-dark text-end mb-0";
	tvServiceFee.classList = "col text-dark text-end mb-0";
	tvTotal.classList = "col text-primary text-end mb-4";
	btnLocation.classList = "btn btn-light me-2";
	btnAppointmentAction.classList = "btn btn-primary";


	getDoc(doc(db, "users", userUid)).then((user) => {
		tvUserId.innerHTML = "User ID: " + user.data().uidReadable;
	});
	
	tvFullName.innerHTML = firstName + " " + lastName;
	tvVehicle.innerHTML = "Vehicle: " + brand + " " + model;
	tvSchedule.innerHTML = dateFormatter(schedule);
	tvStatus.innerHTML = status;
	tvServiceType.innerHTML = "Service: " + serviceType;
	tvDescription.innerHTML = description;
	tvServiceFee.innerHTML = "Service Fee: ₱"+serviceFee.toFixed(2);
	tvTotal.innerHTML = "Total: ₱"+serviceFee.toFixed(2);

	if (status == "PENDING") {
		btnAppointmentAction.innerHTML = "Start Servicing";
	}
	else if (status == "IN SERVICE") {
		btnAppointmentAction.innerHTML = "Complete Service";
	}
	else if (status == "COMPLETED") {
		btnAppointmentAction.classList.toggle("d-none", true);
	}

	btnAppointmentAction.onclick = function() { appointmentAction(appointmentId, status) };

	btnLocation.innerHTML = "Show Location";
	btnLocation.onclick = function() { showVehicleLocation(appointmentId, location) };

	cardContainer.appendChild(card);
		card.appendChild(cardHeader);
			cardHeader.appendChild(cardHeaderLeft);
				cardHeaderLeft.appendChild(tvFullName);
				cardHeaderLeft.appendChild(tvUserId);
				cardHeaderLeft.appendChild(tvVehicle);
			cardHeader.appendChild(cardHeaderRight);
				cardHeaderRight.appendChild(tvSchedule);
				cardHeaderRight.appendChild(tvStatus);
		card.appendChild(cardBody);
			cardBody.appendChild(tvServiceType);
			cardBody.appendChild(tvDescription);
			card.appendChild(table);
			table.appendChild(thead);
				thead.appendChild(tr);
					tr.appendChild(thImage);
					tr.appendChild(thProductId);
					tr.appendChild(thProduct);
					//tr.appendChild(thDetails);
					tr.appendChild(thPrice);
					tr.appendChild(thQuantity);
					tr.appendChild(thSubtotal);
			table.appendChild(tbody);
				card.appendChild(cardBodyFooter);
					cardBodyFooter.appendChild(tvCartSubtotal);
					cardBodyFooter.appendChild(tvServiceFee);
					cardBodyFooter.appendChild(tvTotal);
					cardBodyFooter.appendChild(btnLocation);
					cardBodyFooter.appendChild(btnAppointmentAction);

	appointmentsContainer.prepend(cardContainer);
	getAppointmentItemsData(appointmentId, tbody, tvCartSubtotal, tvServiceFee, tvTotal, serviceFee);
}

async function getAppointmentItemsData(appointmentId, tbody, tvCartSubtotal, tvServiceFee, tvTotal, serviceFee) {
	const querySnapshot = await getDocs(collection(db, "appointments", appointmentId, "orderItems"));
	let cartTotal = 0;

	querySnapshot.forEach((item) => {
		// renderAppointmentItems
		const refProduct = doc(db, "products", item.id);
		getDoc(refProduct).then((product) => {
			if (!product.exists()) {
				renderAppointmentItems(
					tbody,
					"<s>Item Removed</s>",
					0,
					0,
					null
				);

				return;
			}

			renderAppointmentItems(
				tbody,
				product.id,
				product.data().productName,
				product.data().price,
				item.data().quantity,
				product.data().thumbnail
			);

			cartTotal += product.data().price;
			tvCartSubtotal.innerHTML = "Cart Subtotal: ₱"+cartTotal.toFixed(2);
			tvServiceFee.innerHTML = "Service Fee: ₱"+serviceFee.toFixed(2);
			tvTotal.innerHTML = "Total: ₱"+(cartTotal + serviceFee).toFixed(2);
		});
	});
}

//function renderAppointmentItems(tbody, productName, productDetails, price, quantity, thumbnail) {
function renderAppointmentItems(tbody, productId, productName, price, quantity, thumbnail) {
	const newRow = document.createElement('tr');
	const cellProductThumbnail = document.createElement('td');
		const imgThumbnail = document.createElement('img');
	const cellProductId = document.createElement('td');
	const cellProductName = document.createElement('td');
	//const cellProductDetails = document.createElement('td');
	const cellUnitPrice = document.createElement('td');
	const cellQuantity = document.createElement('td');
	const cellSubtotal = document.createElement('td');

	if (thumbnail == null){
		imgThumbnail.src = "https://via.placeholder.com/150?text=Image";
	}
	else {
		getDownloadURL(ref(storage, 'products/'+thumbnail))
			.then((url) => {
				imgThumbnail.src = url;
			});
	}
	imgThumbnail.className = "col-12";
	imgThumbnail.style.width = "50px";
	imgThumbnail.style.height = "50px";
	imgThumbnail.style.objectFit = "contain";

	cellProductId.innerHTML = productId;
	cellProductName.innerHTML = productName;
	//cellProductDetails.innerHTML = productDetails;
	cellUnitPrice.innerHTML = "₱"+Number(price).toFixed(2);
	cellQuantity.innerHTML = quantity;
	cellSubtotal.innerHTML = "₱"+Number(parseFloat(price) * parseFloat(quantity)).toFixed(2);

	newRow.appendChild(cellProductThumbnail);
		cellProductThumbnail.appendChild(imgThumbnail);
	newRow.appendChild(cellProductId);
	newRow.appendChild(cellProductName);
	//newRow.appendChild(cellProductDetails);
	newRow.appendChild(cellUnitPrice);
	newRow.appendChild(cellQuantity);
	newRow.appendChild(cellSubtotal);

	tbody.append(newRow);
}

function appointmentAction(appointmentId, status) {
	const refAppointment = doc(db, "appointments", appointmentId);

	let updateData = {};

	if (status == "PENDING") {
		updateData = {
			status: "IN SERVICE"
		}
	}
	else if (status == "IN SERVICE") {
		updateData = {
			status: "COMPLETED"
		}
	}

	updateDoc(refAppointment, updateData).then(() => {});
	getAppointmentsData();
}

window.showVehicleLocation = showVehicleLocation;
function showVehicleLocation(appointmentId, location) {
	// update modal UI
	const myModal = new bootstrap.Modal('#modalMap', null);
	const tvModalMapTitle = document.querySelector('#tvModalMapTitle');

	initMap(location);
	tvModalMapTitle.textContent = location.addressLine;

	myModal.show();
}

// Initialize and add the map
let map;

async function initMap(location) {
  // The location of Siaton
  const position = { lat: location.latitude, lng: location.longitude };
  // Request needed libraries.
  //@ts-ignore
  const { Map } = await google.maps.importLibrary("maps");
  const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");

  // The map, centered at Siaton
  map = new Map(document.getElementById("map"), {
    zoom: 16,
    center: position,
    mapId: "DEMO_MAP_ID",
  });

  // The marker, positioned at Uluru
  const marker = new AdvancedMarkerElement({
    map: map,
    position: position,
    title: "Uluru",
  });
}