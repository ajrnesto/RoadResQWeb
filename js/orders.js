import { db, auth, storage } from '../js/firebase.js';
import { onAuthStateChanged } from '../node_modules/firebase/firebase-auth.js';
import { doc, collection, getDoc, onSnapshot, getDocs, setDoc, updateDoc, increment, query, where, orderBy } from 'https://www.gstatic.com/firebasejs/10.5.2/firebase-firestore.js';
import { ref, getDownloadURL } from "../node_modules/firebase/firebase-storage.js";
import { parseOrderButtonAction, parseButtonAction, capitalizeFirstLetter } from '../js/utils.js';

// chips
const btnPendingLabel = document.querySelector("#btnPendingLabel");
const btnPreparingLabel = document.querySelector("#btnPreparingLabel");
const btnReadyForPickupLabel = document.querySelector("#btnReadyForPickupLabel"); 
const btnCompletedLabel = document.querySelector("#btnCompletedLabel");

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

const ordersContainer = document.querySelector("#ordersContainer");

onAuthStateChanged(auth, user => {
	const docRef = doc(db, "users", user.uid);
	getDoc(docRef).then(userSnap => {
		const userType = userSnap.data().userType;
	});
});

window.addEventListener("load", function() {
	getOrdersData("Pending");
	btnPendingLabel.style.color = "white";
});

btnPendingLabel.addEventListener("click", function() {
	getOrdersData("Pending");
	btnPendingLabel.style.color = "white";
	btnPreparingLabel.style.color = "#A22C29";
	btnReadyForPickupLabel.style.color = "#A22C29";
	btnCompletedLabel.style.color = "#A22C29";
});

btnPreparingLabel.addEventListener("click", function() {
	getOrdersData("Preparing");
	btnPendingLabel.style.color = "#A22C29";
	btnPreparingLabel.style.color = "white";
	btnReadyForPickupLabel.style.color = "#A22C29";
	btnCompletedLabel.style.color = "#A22C29";
});

btnReadyForPickupLabel.addEventListener("click", function() {
	getOrdersData("Ready for Pick-up");
	btnPendingLabel.style.color = "#A22C29";
	btnPreparingLabel.style.color = "#A22C29";
	btnReadyForPickupLabel.style.color = "white";
	btnCompletedLabel.style.color = "#A22C29";
});

btnCompletedLabel.addEventListener("click", function() {
	getOrdersData("Completed");
	btnPendingLabel.style.color = "#A22C29";
	btnPreparingLabel.style.color = "#A22C29";
	btnReadyForPickupLabel.style.color = "#A22C29";
	btnCompletedLabel.style.color = "white";
});

btnFilter.addEventListener("click", function(){
	let filterStatus = null;

	if (window.getComputedStyle(btnPendingLabel, null).getPropertyValue("color") == "rgb(255, 255, 255)") {
		filterStatus = "Pending";
	}
	else if (window.getComputedStyle(btnPreparingLabel, null).getPropertyValue("color") == "rgb(255, 255, 255)") {
		filterStatus = "Preparing";
	}
	else if (window.getComputedStyle(btnReadyForPickupLabel, null).getPropertyValue("color") == "rgb(255, 255, 255)") {
		filterStatus = "Ready for Pick-up";
	}
	else if (window.getComputedStyle(btnCompletedLabel, null).getPropertyValue("color") == "rgb(255, 255, 255)") {
		filterStatus = "Completed";
	}

	getOrdersData(filterStatus);
});

function getOrdersData(filterStatus) {
	const id = etSearchId.value;
	const firstName = etFirstName.value.toUpperCase();
	const lastName = etLastName.value.toUpperCase();

	let qryOrders = null;
	let arrCustomers = [];

	// if (!firstName && !lastName) {
	// 	if (filterStatus == "Completed") {
	// 		qryOrders = query(collection(db, "orders"), where("status", "==", "Completed"), orderBy("timestamp", "asc"));
	// 	}
	// 	else {
	// 		qryOrders = query(collection(db, "orders"), where("status", "==", filterStatus), orderBy("timestamp", "desc"));
	// 	}
		
		// onSnapshot(qryOrders, (orders) => {
		// 	// clear table
		// 	ordersContainer.innerHTML = '';
				
		// 	orders.forEach(order => {
		// 		renderOrderCard(
		// 			order.id,
		// 			order.data().customer,
		// 			order.data().deliveryOption,
		// 			order.data().deliveryAddress,
		// 			order.data().status,
		// 			order.data().timestamp,
		// 			order.data().total
		// 		);
		// 	});
		// });
	// }
	// else if (firstName != "" && lastName == "") {
	// 	const queryCustomers = query(collection(db, "users"), where("firstName", "==", capitalizeFirstLetter(firstName)));
		
	// 	getDocs(queryCustomers).then((customers) => {

	// 		customers.forEach(customer => {
	// 			arrCustomers.push(customer.id);
	// 		});

	// 		if (arrCustomers.length) {
	// 			if (filterStatus == "Completed") {
	// 				qryOrders = query(collection(db, "orders"), where("status", "==", "Completed"), where("customer", "in", arrCustomers), orderBy("timestamp", "asc"));
	// 			}
	// 			else {
	// 				qryOrders = query(collection(db, "orders"), where("status", "==", filterStatus), where("customer", "in", arrCustomers), orderBy("timestamp", "desc"));
	// 			}
	// 		}
	// 		else {
	// 			if (filterStatus == "Completed") {
	// 				qryOrders = query(collection(db, "orders"), where("status", "==", "Completed"), where("customer", "==", null), orderBy("timestamp", "asc"));
	// 			}
	// 			else {
	// 				qryOrders = query(collection(db, "orders"), where("status", "==", filterStatus), where("customer", "==", null), orderBy("timestamp", "desc"));
	// 			}
	// 		}

	// 		onSnapshot(qryOrders, (orders) => {
	// 			// clear table
	// 			ordersContainer.innerHTML = '';
					
	// 			orders.forEach(order => {
	// 				renderOrderCard(
	// 					order.id,
	// 					order.data().customer,
	// 					order.data().deliveryOption,
	// 					order.data().deliveryAddress,
	// 					order.data().status,
	// 					order.data().timestamp,
	// 					order.data().total
	// 				);
	// 			});
	// 		});
	// 	})
	// }
	// else if (firstName == "" && lastName != "") {
	// 	const queryCustomers = query(collection(db, "users"), where("lastName", "==", capitalizeFirstLetter(lastName)));
		
	// 	getDocs(queryCustomers).then((customers) => {

	// 		customers.forEach(customer => {
	// 			arrCustomers.push(customer.id);
	// 		});
			
	// 		if (arrCustomers.length) {
	// 			if (filterStatus == "Completed") {
	// 				qryOrders = query(collection(db, "orders"), where("status", "==", "Completed"), where("customer", "in", arrCustomers), orderBy("timestamp", "asc"));
	// 			}
	// 			else {
	// 				qryOrders = query(collection(db, "orders"), where("status", "==", filterStatus), where("customer", "in", arrCustomers), orderBy("timestamp", "desc"));
	// 			}
	// 		}
	// 		else {
	// 			if (filterStatus == "Completed") {
	// 				qryOrders = query(collection(db, "orders"), where("status", "==", "Completed"), where("customer", "==", null), orderBy("timestamp", "asc"));
	// 			}
	// 			else {
	// 				qryOrders = query(collection(db, "orders"), where("status", "==", filterStatus), where("customer", "==", null), orderBy("timestamp", "desc"));
	// 			}
	// 		}

	// 		onSnapshot(qryOrders, (orders) => {
	// 			// clear table
	// 			ordersContainer.innerHTML = '';
					
	// 			orders.forEach(order => {
	// 				renderOrderCard(
	// 					order.id,
	// 					order.data().customer,
	// 					order.data().deliveryOption,
	// 					order.data().deliveryAddress,
	// 					order.data().status,
	// 					order.data().timestamp,
	// 					order.data().total
	// 				);
	// 			});
	// 		});
	// 	})
	// }
	// else if (firstName != "" && lastName != "") {
	// 	const queryCustomers = query(collection(db, "users"), where("firstName", "==", capitalizeFirstLetter(firstName)), where("lastName", "==", capitalizeFirstLetter(lastName)));
		
	// 	getDocs(queryCustomers).then((customers) => {

	// 		customers.forEach(customer => {
	// 			arrCustomers.push(customer.id);
	// 		});

	// 		if (arrCustomers.length) {
	// 			qryOrders = query(collection(db, "orders"), where("status", "==", filterStatus), where("customer", "in", arrCustomers), orderBy("timestamp", "desc"));
	// 		}
	// 		else {
	// 			qryOrders = query(collection(db, "orders"), where("status", "==", filterStatus), where("customer", "==", null), orderBy("timestamp", "desc"));
	// 		}

	// 		onSnapshot(qryOrders, (orders) => {
	// 			// clear table
	// 			ordersContainer.innerHTML = '';
					
	// 			orders.forEach(order => {
	// 				renderOrderCard(
	// 					order.id,
	// 					order.data().customer,
	// 					order.data().deliveryOption,
	// 					order.data().deliveryAddress,
	// 					order.data().status,
	// 					order.data().timestamp,
	// 					order.data().total
	// 				);
	// 			});
	// 		});
	// 	})
	// }

	if (!id && !firstName && !lastName) {
		qryOrders = query(collection(db, "orders"), where("status", "==", filterStatus), orderBy("timestamp", "desc"));
		queryOrders(qryOrders, filterStatus);
	}
	else if (id && !firstName && !lastName) {
		getDocs(query(collection(db, "users"), where("uidReadable", "==", id))).then((users) => {
		
			users.forEach(user => {
				qryOrders = query(collection(db, "orders"), where("status", "==", filterStatus), where("customer", "==", user.id), orderBy("timestamp", "desc"));
				queryOrders(qryOrders, filterStatus);
			});
		});
	}
	else if (!id && firstName && !lastName) {
		qryOrders = query(collection(db, "orders"), where("status", "==", filterStatus), where("firstName", "==", firstName));	
	}
	else if (!id && !firstName && lastName) {
		qryOrders = query(collection(db, "orders"), where("status", "==", filterStatus), where("lastName", "==", lastName));	
	} 
	else if (!id && firstName && lastName) {
		qryOrders = query(collection(db, "orders"), where("status", "==", filterStatus), where("firstName", "==", firstName), where("lastName", "==", lastName));	
	} 

}

function queryOrders(qryOrders) {
	onSnapshot(qryOrders, (orders) => {
		// clear table
		ordersContainer.innerHTML = '';
			
		orders.forEach(order => {
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
		

		if (!user.data()) {
			tvCustomerName.innerHTML = "User " + user.id + " not found";
		}
		else {
			const firstName = user.data().firstName;
			const lastName = user.data().lastName;
			//const mobile = user.data().mobile;
			
			tvCustomerId.innerHTML = "User ID: " + user.data().uidReadable;
			tvCustomerName.innerHTML = "Customer: " + firstName + " " + lastName;
		}
	});

	tvDeliveryAddress.innerHTML = "Delivery Address: " + deliveryAddress;
	tvTotal.innerHTML = "Total: ₱"+Number((total)).toFixed(2);

	cardContainer.appendChild(card);
		card.appendChild(cardHeader);
			cardHeader.appendChild(tvTimestamp);
			cardHeader.appendChild(tvStatus);
			cardHeader.appendChild(tvCustomerName);
			cardHeader.appendChild(tvCustomerId);
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

	ordersContainer.append(cardContainer);

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