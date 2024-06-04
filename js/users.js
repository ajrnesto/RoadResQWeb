import { db, auth, storage } from '../js/firebase.js';
import { onAuthStateChanged } from '../node_modules/firebase/firebase-auth.js';
import { doc, collection, getDoc, onSnapshot, getDocs, setDoc, updateDoc, increment, query, where, orderBy } from 'https://www.gstatic.com/firebasejs/10.5.2/firebase-firestore.js';
import { ref, getDownloadURL } from "../node_modules/firebase/firebase-storage.js";
import { parseOrderButtonAction, showModal, dateFormatter } from '../js/utils.js';

const tbodyUsers = document.querySelector("#tbodyUsers");
const tvUserName = document.querySelector("#tvUserName");
const ordersContainer = document.querySelector("#ordersContainer");
const tvUserNameAppointments = document.querySelector("#tvUserNameAppointments");
const appointmentsContainer = document.querySelector("#appointmentsContainer");

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
})

onAuthStateChanged(auth, user => {
	const docRef = doc(db, "users", user.uid);
	getDoc(docRef).then(userSnap => {
		const userType = userSnap.data().userType;
	});
});

window.addEventListener("load", function() {
	getUsersData();
});

btnFilter.addEventListener("click", function() {
	getUsersData();
});

function getUsersData() {
	let qryUsers = null;
	
	const id = etSearchId.value;
	const firstName = etFirstName.value.toUpperCase();
	const lastName = etLastName.value.toUpperCase();

	if (!id && !firstName && !lastName) {
		qryUsers = query(collection(db, "users"));
	}
	else if (id && !firstName && !lastName) {
		qryUsers = query(collection(db, "users"), where("uidReadable", "==", id));	
	}
	else if (!id && firstName && !lastName) {
		qryUsers = query(collection(db, "users"), where("firstName", "==", firstName));	
	}
	else if (!id && !firstName && lastName) {
		qryUsers = query(collection(db, "users"), where("lastName", "==", lastName));	
	} 
	else if (!id && firstName && lastName) {
		qryUsers = query(collection(db, "users"), where("firstName", "==", firstName), where("lastName", "==", lastName));	
	} 
	
	onSnapshot(qryUsers, (users) => {
		// clear table
		tbodyUsers.innerHTML = '';

		console.log("Users size: "+users.size);
		if (users.size == 0) {
			tbodyUsers.innerHTML = '<div class="col-12 text-center mt-4"><h4>No Users to Display</h4></div>';
		}
		else {
			tbodyUsers.innerHTML = '';
		}
			
		users.forEach(user => {
			if (user.data().userType != 1) {
				renderUsers(
					user.id,
					user.data().firstName,
					user.data().lastName,
					user.data().email,
					user.data().mobile,
					user.data().userType,
					user.data().uidReadable
				);
			}
		});
	});
}

function renderUsers(id, firstName, lastName, email, mobile, userType, uidReadable) {
	const newRow = document.createElement('tr');
	const cellId = document.createElement('td');
	const cellName = document.createElement('td');
	const cellMobile = document.createElement('td');
	const cellEmail = document.createElement('td');
	const cellHistory = document.createElement('td');
	const btnOrderHistory = document.createElement('button');
	const btnAppointmentsHistory = document.createElement('button');

	cellId.innerHTML = uidReadable;
	cellName.innerHTML = firstName + " " + lastName;
	cellMobile.innerHTML = mobile;
	cellEmail.innerHTML = email;

	btnOrderHistory.className = "btn btn-no-border btn-primary me-2";
	btnOrderHistory.innerHTML = "Orders";
	btnOrderHistory.onclick = function() {
		viewOrderHistory(id, firstName, lastName);
	}

	btnAppointmentsHistory.className = "btn btn-no-border btn-primary";
	btnAppointmentsHistory.innerHTML = "Appointments";
	btnAppointmentsHistory.onclick = function() {
		viewAppointmentsHistory(id, firstName, lastName);
	}
	
	newRow.appendChild(cellId);
	newRow.appendChild(cellName);
	newRow.appendChild(cellMobile);
	newRow.appendChild(cellEmail);
	newRow.appendChild(cellHistory);
	cellHistory.appendChild(btnOrderHistory);
	cellHistory.appendChild(btnAppointmentsHistory);
	
	tbodyUsers.append(newRow);
}

function viewOrderHistory(userId, firstName, lastName) {
	tvUserName.innerHTML = firstName + " " + lastName;
	showModal("#modalViewOrders");

	getDocs(query(collection(db, "orders"), where("customer", "==", userId), orderBy("timestamp", "asc"))).then((users) => {
		// clear table
		ordersContainer.innerHTML = '';

		console.log("Users size: "+users.size);
		if (users.size == 0) {
			ordersContainer.innerHTML = '<div class="col-12 text-center mt-4"><h4>No Orders to Display</h4></div>';
		}
		else {
			ordersContainer.innerHTML = '';
		}
			
		users.forEach(order => {
			renderOrderCard(
				order.id,
				order.data().customer,
				order.data().deliveryOption,
				order.data().deliveryAddress,
				order.data().status,
				order.data().timestamp,
				order.data().total
			);
		});
	});
}

function renderOrderCard(orderId, customerId, deliveryOption, deliveryAddress, status, timestamp, total) {
    const cardContainer = document.createElement('div');
    	const card = document.createElement('div');
    		const cardHeader = document.createElement('div');
    			const tvTimestamp = document.createElement('p');
    			const tvStatus = document.createElement('p');
    			const divButtonContainer = document.createElement('div');
					const btnAction = document.createElement('button');
					const btnSecondaryAction = document.createElement('button');
				const tvCustomerName = document.createElement('h6');
				const tvCustomerId = document.createElement('p');
    			const tvdeliveryOption = document.createElement('h6');
    			const tvDeliveryAddress = document.createElement('p');
			const cardBody = document.createElement('div');
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
			const cardFooter = document.createElement('div');
				const tvTotal = document.createElement('h6');

	cardContainer.className = "row container mx-auto col p-4 justify-content-center";
	card.className = "rounded bg-white col-12 text-center p-4";
	cardHeader.className = "row";
	tvTimestamp.className = "col-6 text-start text-dark fs-6";
	tvStatus.className = "col-6 text-end text-danger fs-6";
	divButtonContainer.className = "col-12 text-end mt-3";
	btnAction.className = "btn btn-primary";
	btnSecondaryAction.className = "ms-2 btn btn-danger text-white";
	tvdeliveryOption.className = "text-primary col-6 text-start";
	tvCustomerName.className = "text-primary col-12 text-start";
	tvCustomerId.className = "text-dark col-12 text-start";
	tvDeliveryAddress.className = "col-12 text-start text-dark fs-6";
	// tvItems.className = "text-primary col-12 text-start mt-2";
	cardBody.className = "row";
	table.className = "table align-middle";
	thImage.className = "col-1 invisible";
	thProductId.className = "col-2";
	thProduct.className = "col-2";
	//thDetails.className = "col-2";
	thPrice.className = "col-1";
	thQuantity.className = "col-1";
	thSubtotal.className = "col-1";
	cardFooter.className = "row";
	tvTotal.className = "text-primary col-12 text-end mt-2";

	// tvItems.innerHTML = "Items";
	thProductId.innerHTML = "Product ID";
	thProduct.innerHTML = "Product Name";
	//thDetails.innerHTML = "Details";
	thPrice.innerHTML = "Price";
	thQuantity.innerHTML = "Quantity";
	thSubtotal.innerHTML = "Subtotal";

	const date = new Date(timestamp);
	tvTimestamp.innerHTML = date.toLocaleString();
	tvStatus.innerHTML = "Status: "+status;

	const btnActionValue = parseOrderButtonAction(status, deliveryOption);
	if (btnActionValue == -1) {
		divButtonContainer.className = "d-none";
	}
	else {
		btnAction.innerHTML = btnActionValue;
	}
	btnAction.onclick = function() { updateOrderStatus(orderId, deliveryOption, status, total) }

	btnSecondaryAction.className = "invisible";
	// if (status == "In Transit"){
	// 	btnSecondaryAction.innerHTML = "Failed To Deliver";
	// }
	// else {
	// 	btnSecondaryAction.className = "invisible";
	// }
	btnSecondaryAction.onclick = function() { updateOrderStatus(orderId, deliveryOption, "Marked as Failed Delivery", total) }

	tvdeliveryOption.innerHTML = "Delivery Method: " + deliveryOption;

	getDoc(doc(db, "users", customerId)).then((user) => {
		const firstName = user.data().firstName;
		const lastName = user.data().lastName;
		//const mobile = user.data().mobile;

		//tvCustomerName.innerHTML = "Customer: " + firstName + " " + lastName + " ("+mobile+")";
		tvCustomerName.innerHTML = "Customer: " + firstName + " " + lastName;
		tvCustomerId.innerHTML = "User ID: " + user.id;
	});

	tvDeliveryAddress.innerHTML = "Delivery Address: " + deliveryAddress;
	tvTotal.innerHTML = "Total: ₱"+Number(parseInt(total)).toFixed(2);

	cardContainer.appendChild(card);
		card.appendChild(cardHeader);
			cardHeader.appendChild(tvTimestamp);
			cardHeader.appendChild(tvStatus);
			// cardHeader.appendChild(tvCustomerName);
			// cardHeader.appendChild(tvCustomerId);
			// cardHeader.appendChild(tvdeliveryOption);
			// cardHeader.appendChild(tvDeliveryAddress);
			//cardHeader.appendChild(divButtonContainer);
			//	divButtonContainer.appendChild(btnAction);
			// cardHeader.appendChild(tvItems);
		card.appendChild(cardBody);
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
		card.appendChild(cardFooter);
			cardFooter.appendChild(tvTotal);
			cardFooter.appendChild(divButtonContainer);
				divButtonContainer.appendChild(btnAction);
				divButtonContainer.appendChild(btnSecondaryAction);

	ordersContainer.prepend(cardContainer);

	getOrderItemsData(orderId, tbody);
}

function updateOrderStatus(orderId, deliveryOption, status, total) {
	if (status == "Pending") {
		updateDoc(doc(db, "orders", orderId), {
			status: "Preparing"
		});

		const now = new Date();
		const thisMonth = ("0" + (now.getMonth() + 1)).slice(-2);
		const thisYear = now.getFullYear();
		setDoc(doc(db, "revenue", thisYear+thisMonth), {
			revenue: increment(total)
		},
		{
			merge:true
		});
	}
	else if (status == "Preparing") {
		if (deliveryOption == "Delivery") {
			updateDoc(doc(db, "orders", orderId), {
				status: "In Transit"
			});
		}
		else if (deliveryOption == "Pick-up") {
			updateDoc(doc(db, "orders", orderId), {
				status: "Ready for Pick-up"
			});
		}
	}
	else if (status == "In Transit" || status == "Ready for Pick-up") {
		updateDoc(doc(db, "orders", orderId), {
			status: "Completed"
		});
	}

	getOrdersData(status);
}

async function getOrderItemsData(orderId, tbody) {
	const querySnapshot = await getDocs(collection(db, "orders", orderId, "orderItems"));
	querySnapshot.forEach((item) => {
		// renderOrderItems
		
		const refProduct = doc(db, "products", item.id);
		getDoc(refProduct).then((product) => {
			if (!product.exists()) {
				renderOrderItems(
					tbody,
					"<s>Item Removed</s>",
					0,
					0,
					null
				);

				return;
			}

			renderOrderItems(
				tbody,
				product.id,
				product.data().productName,
				product.data().price,
				item.data().quantity,
				product.data().thumbnail
			);
		});
	});
}

//function renderOrderItems(tbody, productName, productDetails, price, quantity, thumbnail) {
function renderOrderItems(tbody, productId, productName, price, quantity, thumbnail) {
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

function viewAppointmentsHistory(userId, firstName, lastName) {
	tvUserNameAppointments.innerHTML = firstName + " " + lastName;
	showModal("#modalViewAppointments");

	getDocs(query(collection(db, "appointments"), where("userUid", "==", userId), orderBy("timestamp", "asc"))).then((users) => {
		// clear table
		appointmentsContainer.innerHTML = '';

		console.log("Users size: "+users.size);
		if (users.size == 0) {
			appointmentsContainer.innerHTML = '<div class="col-12 text-center mt-4"><h4>No Orders to Display</h4></div>';
		}
		else {
			appointmentsContainer.innerHTML = '';
		}
			
		users.forEach(appointment => {
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
				appointment.data().timestamp
			);
		});
	});
}

function renderAppointmentCard(appointmentId, userUid, firstName, lastName, mobile, brand, model, serviceType, description, location, schedule, status, timestamp) {
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
	btnLocation.classList = "btn btn-light me-2";
	btnAppointmentAction.classList = "btn btn-primary";

	tvUserId.innerHTML = "User ID: " + userUid;
	tvFullName.innerHTML = firstName + " " + lastName;
	tvVehicle.innerHTML = "Vehicle: " + brand + " " + model;
	tvSchedule.innerHTML = dateFormatter(schedule);
	tvStatus.innerHTML = status;
	tvServiceType.innerHTML = "Service: " + serviceType;
	tvDescription.innerHTML = description;

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
				// cardHeaderLeft.appendChild(tvFullName);
				// cardHeaderLeft.appendChild(tvUserId);
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
					cardBodyFooter.appendChild(btnLocation);
					cardBodyFooter.appendChild(btnAppointmentAction);

	appointmentsContainer.prepend(cardContainer);
	getAppointmentItemsData(appointmentId, tbody);
}

async function getAppointmentItemsData(appointmentId, tbody) {
	const querySnapshot = await getDocs(collection(db, "appointments", appointmentId, "orderItems"));
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