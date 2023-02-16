import { db, auth, storage } from '../js/firebase.js';
import { onAuthStateChanged } from '../node_modules/firebase/firebase-auth.js';
import { doc, collection, getDoc, getDocs, setDoc, addDoc, updateDoc, increment, deleteDoc, Timestamp, arrayUnion, deleteField, query, orderBy, startAt, endAt, onSnapshot } from 'https://www.gstatic.com/firebasejs/9.16.0/firebase-firestore.js';
import { ref, getDownloadURL, deleteObject, connectStorageEmulator } from "../node_modules/firebase/firebase-storage.js";
import { showModal, hideModal, resetValidation, invalidate } from '../js/utils.js';

// table
const tbodyCart = document.querySelector('#tbodyCart');
const btnCheckout = document.querySelector('#btnCheckout');
const btnPlaceOrder = document.querySelector('#btnPlaceOrder');

// checkout modal
const formAddress = document.querySelector("#formAddress");
const radDelivery = document.querySelector("#radDelivery");
const radPickup = document.querySelector("#radPickup");
const etPurok = document.querySelector("#etPurok");
const etBarangay = document.querySelector("#etBarangay");
const etCity = document.querySelector("#etCity");

// validators
const purokValidator = document.querySelectorAll('.purok-validator');
const barangayValidator = document.querySelectorAll('.barangay-validator');
const cityValidator = document.querySelectorAll('.city-validator');

onAuthStateChanged(auth, user => {
	getCartData();
});

window.confirmDeleteCartItem = confirmDeleteCartItem;
window.setAddressFormVisibility = setAddressFormVisibility;

btnCheckout.addEventListener("click", function() {
	const strTotal = document.querySelector('#tvCheckoutTotalPrice').innerHTML;
	const floatTotal = parseFloat(strTotal.substring(8, strTotal.length-1));

	if (floatTotal == 0) {
		return;
	}

	showModal("#modalCheckout");
});

btnPlaceOrder.addEventListener("click", function() {
	if (radDelivery.checked) {
		const purok = etPurok.value;
		const barangay = etBarangay.value;
		const city = etCity.value;
		const strTotal = document.querySelector('#tvCheckoutTotalPrice').innerHTML;
		const total = parseFloat(strTotal.substring(8, strTotal.length-1));

		const PUROK_IS_INVALID = (purok == null || purok == "");
		if (PUROK_IS_INVALID) {
			invalidate(purokValidator);
			return;
		}
		resetValidation(purokValidator);

		const BARANGAY_IS_INVALID = (barangay == null || barangay == "");
		if (BARANGAY_IS_INVALID) {
			invalidate(barangayValidator);
			return;
		}
		resetValidation(barangayValidator);

		const CITY_IS_INVALID = (city == null || city == "");
		if (CITY_IS_INVALID) {
			invalidate(cityValidator);
			return;
		}
		resetValidation(cityValidator);

		const newOrder = collection(db, "orders");
		
		addDoc(newOrder, {
			total: total,
			deliveryOption: "Delivery",
			deliveryAddress: [purok, barangay, city],
			customer: auth.currentUser.uid,
			status: "Pending",
			timestamp: Timestamp.now().toMillis()
		}).then((order) => {
			const qryCartItems = query(collection(db, "carts", auth.currentUser.uid, "items"));
			getDocs(qryCartItems).then((snapCartItems) => {
				snapCartItems.forEach(cartItem => {
					const refProduct = doc(db, "products", cartItem.id);
					getDoc(refProduct).then((product) => {
						setDoc(doc(db, "orders", order.id, "items", product.id), {
							quantity: cartItem.data().quantity
						}).then(() => {
							deleteDoc(doc(db, "carts", auth.currentUser.uid, "items", product.id)).then(() => {
								console.log("DELETED ITEM: "+ product.id);
								window.location = "../track.html";
							}).catch((error) => {
								console.log("COULD NOT DELETE DATA: "+ error);
							});
						});
					});
				});
			});
		});
	}
	else if (radPickup.checked) {
		const newOrder = collection(db, "orders");
		const strTotal = document.querySelector('#tvCheckoutTotalPrice').innerHTML;
		const total = parseFloat(strTotal.substring(8, strTotal.length-1));
		
		addDoc(newOrder, {
			total: total,
			deliveryOption: "Pick-up",
			deliveryAddress: "-",
			customer: auth.currentUser.uid,
			status: "Pending",
			timestamp: Timestamp.now().toMillis()
		}).then((order) => {
			const qryCartItems = query(collection(db, "carts", auth.currentUser.uid, "items"));
			getDocs(qryCartItems).then((snapCartItems) => {
				snapCartItems.forEach(cartItem => {
					const refProduct = doc(db, "products", cartItem.id);
					getDoc(refProduct).then((product) => {
						setDoc(doc(db, "orders", order.id, "items", product.id), {
							quantity: cartItem.data().quantity
						}).then(() => {
							deleteDoc(doc(db, "carts", auth.currentUser.uid, "items", product.id)).then(() => {
								console.log("DELETED ITEM: "+ product.id);
								window.location = "../track.html";
							}).catch((error) => {
								console.log("COULD NOT DELETE DATA: "+ error);
							});
						});
					});
				});
			});
		});
	}

	hideModal("#modalCheckout");
});

function getCartData() {
	const qryCartItems = query(collection(db, "carts", auth.currentUser.uid, "items"));
	
	getDocs(qryCartItems).then((snapCartItems) => {
		// clear table
		tbodyCart.innerHTML = '';
		
		document.querySelector('#tvCheckoutTotalItems').innerHTML = snapCartItems.size + " items";

		snapCartItems.forEach(cartItem => {
			const refProduct = doc(db, "products", cartItem.id);
			getDoc(refProduct).then((product) => {
				renderCartTable(
					product.id,
					product.data().productName,
					product.data().productDetails,
					product.data().price,
					product.data().stock,
					cartItem.data().quantity,
					product.data().thumbnail
				);
				calculateTotal();
			});
        });
	});
}

function renderCartTable(productId, productName, productDetails, price, stock, quantity, thumbnail) {
    const newRow = document.createElement('tr');
    const cellProductThumbnail = document.createElement('td');
		const imgThumbnail = document.createElement('img');
    const cellProductName = document.createElement('td');
    const cellProductDetails = document.createElement('td');
    const cellUnitPrice = document.createElement('td');
    const cellStock = document.createElement('td');
    const cellQuantity = document.createElement('td');
		const divQuantity = document.createElement('div');
			const btnDecrement = document.createElement('button');
				const iconDecrement = document.createElement('i');
			const etQuantity = document.createElement('input');
			const btnIncrement = document.createElement('button');
				const iconIncrement = document.createElement('i');
    const cellTotal = document.createElement('td');
    const cellAction = document.createElement('td');
		const buttonDelete = document.createElement('button');
			const buttonDeleteIcon = document.createElement('i');

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
	imgThumbnail.style.objectFit = "fill";

	cellProductName.innerHTML = productName;
	cellProductDetails.innerHTML = productDetails;
	cellUnitPrice.innerHTML = "₱"+Number(price).toFixed(2);

	cellStock.innerHTML = stock;

	divQuantity.className = "input-group";
		btnDecrement.className = "btn btn-primary";
		btnDecrement.type = 'button';
		btnDecrement.onclick = function() { decrementCartItemQuantity(productId, price, etQuantity, cellTotal) };
			iconDecrement.className = "bi bi-dash-lg text-white";
			iconDecrement.style.fontSize = "1rem";
		etQuantity.className = "form-control text-center";
		etQuantity.type = "number";
		etQuantity.min = "0";
		etQuantity.placeholder = "Quantity";
		etQuantity.value = quantity;
		btnIncrement.className = "btn btn-primary";
		btnIncrement.type = 'button';
		btnIncrement.onclick = function() { incrementCartItemQuantity(productId, price, stock, etQuantity, cellTotal) };
			iconIncrement.className = "bi bi-plus-lg text-white";
			iconIncrement.style.fontSize = "1rem";

	cellTotal.innerHTML = "₱"+ Number((parseFloat(quantity) * parseFloat(price))).toFixed(2);
	cellTotal.className = "cell-total text-primary";
	
	buttonDelete.className = "btn btn-no-border btn-danger col";
	buttonDelete.onclick = function() { confirmDeleteCartItem(productId, productName) };
	buttonDelete.type = 'button';
		buttonDeleteIcon.className = "bi bi-trash-fill text-light";
		buttonDeleteIcon.style.fontSize = "0.8rem";

	cellAction.appendChild(buttonDelete);
	buttonDelete.appendChild(buttonDeleteIcon);

    newRow.appendChild(cellProductThumbnail);
		cellProductThumbnail.appendChild(imgThumbnail);
    newRow.appendChild(cellProductName);
    newRow.appendChild(cellProductDetails);
    newRow.appendChild(cellUnitPrice);
    newRow.appendChild(cellStock);
    newRow.appendChild(cellQuantity);
    	cellQuantity.appendChild(divQuantity);
    		divQuantity.appendChild(btnDecrement);
				btnDecrement.appendChild(iconDecrement);
			divQuantity.appendChild(etQuantity);
    		divQuantity.appendChild(btnIncrement);
				btnIncrement.appendChild(iconIncrement);
	newRow.appendChild(cellTotal);
    newRow.appendChild(cellAction);
    	cellAction.appendChild(buttonDelete);

	tbodyCart.prepend(newRow);
}

function decrementCartItemQuantity(productId, price, etQuantity, cellTotal) {
	let quantity = parseFloat(etQuantity.value);
	if (quantity > 1) {
		quantity--;
		etQuantity.value = quantity;

		const refCartItem = doc(db, "carts", auth.currentUser.uid, "items", productId);
		updateDoc(refCartItem, {
			quantity: increment(-1)
		});

		cellTotal.innerHTML = "₱"+ Number((parseFloat(quantity) * parseFloat(price))).toFixed(2);
	}
}

function incrementCartItemQuantity(productId, price, stock, etQuantity, cellTotal) {
	let quantity = parseFloat(etQuantity.value);
	if (quantity < stock) {
		quantity++;
		etQuantity.value = quantity;

		const refCartItem = doc(db, "carts", auth.currentUser.uid, "items", productId);
		updateDoc(refCartItem, {
			quantity: increment(1)
		});

		cellTotal.innerHTML = "₱"+ Number((parseFloat(quantity) * parseFloat(price))).toFixed(2);
	}
}

function confirmDeleteCartItem(productId, productName) {
	tvConfirmDeleteMessage.textContent = "Remove \"" + productName + "\" from your cart?";
	showModal('#modalConfirmDelete');

	btnDelete.onclick = function() {
		deleteCartItem(productId);
	};
}

function deleteCartItem(productId, productName) {
	hideModal("#modalConfirmDelete");

	deleteDoc(doc(db, "carts", auth.currentUser.uid, "items", productId)).then(() => {
		console.log("DELETED ITEM: "+ productName);
		getCartData();
	}).catch((error) => {
		console.log("COULD NOT DELETE DATA: "+ error);
	});
}

function setAddressFormVisibility(isVisible) {
	formAddress.classList.toggle("d-none", !isVisible);
	
	if (isVisible) {
		radDelivery.checked = true;
		radPickup.checked = false;
	}
	else {
		radPickup.checked = true;
		radDelivery.checked = false;
	}
};

function calculateTotal() {
	const collectionAllCellTotals = document.querySelectorAll('.cell-total');

	let totalSum = 0;
	collectionAllCellTotals.forEach((thisCellTotal) => {
		const cellText = thisCellTotal.innerHTML;
		totalSum += parseInt(cellText.substring(1, cellText.length-1));
		console.log(cellText.substring(1, cellText.length-1));
	});

	document.querySelector('#tvTotal').innerHTML = "Total: ₱"+Number(parseInt(totalSum)).toFixed(2);
	document.querySelector('#tvCheckoutTotalPrice').innerHTML = "Total: ₱"+Number(parseInt(totalSum)).toFixed(2);
}