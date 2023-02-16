import { db, auth, storage } from '../js/firebase.js';
import { onAuthStateChanged } from '../node_modules/firebase/firebase-auth.js';
import { doc, collection, getDoc, getDocs, addDoc, updateDoc, increment, deleteDoc, Timestamp, arrayUnion, deleteField, query, where, orderBy, startAt, endAt, onSnapshot } from 'https://www.gstatic.com/firebasejs/9.16.0/firebase-firestore.js';
import { ref, getDownloadURL, deleteObject, connectStorageEmulator } from "../node_modules/firebase/firebase-storage.js";
import { showModal, hideModal, resetValidation, invalidate } from '../js/utils.js';

const ordersContainer = document.querySelector("#ordersContainer");

onAuthStateChanged(auth, user => {
	getOrdersData();
});

function getOrdersData() {
	const qryMyOrders = query(collection(db, "orders"), where("customer", "==", auth.currentUser.uid));
	
	onSnapshot(qryMyOrders, (myOrders) => {
		// clear table
		ordersContainer.innerHTML = '';
	
		myOrders.forEach(order => {
			renderOrderCard(
				order.id,
				order.data().deliveryAddress,
				order.data().deliveryOption,
				order.data().status,
				order.data().timestamp,
				order.data().total
			);
        });
	});
}

function renderOrderCard(orderId, deliveryAddress, deliveryOption, status, timestamp, total) {
    const cardContainer = document.createElement('div');
    	const card = document.createElement('div');
    		const cardHeader = document.createElement('div');
    			const tvTimestamp = document.createElement('p');
    			const tvStatus = document.createElement('p');
    			const tvDeliveryOption = document.createElement('h6');
    			const tvDeliveryAddress = document.createElement('p');
    			const tvItems = document.createElement('h6');
			const cardBody = document.createElement('div');
				const table = document.createElement('table');
					const thead = document.createElement('thead');
						const tr = document.createElement('tr');
							const thImage = document.createElement('th');
							const thProduct = document.createElement('th');
							const thQuantity = document.createElement('th');
							const thDetails = document.createElement('th');
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
	tvDeliveryOption.className = "text-primary col-12 text-start";
	tvDeliveryAddress.className = "col-12 text-start text-dark fs-6";
	tvItems.className = "text-primary col-12 text-start mt-2";
	cardBody.className = "row";
	table.className = "table align-middle";
	thImage.className = "col-1 invisible";
	thProduct.className = "col-2";
	thDetails.className = "col-2";
	thPrice.className = "col-1";
	thQuantity.className = "col-1";
	thSubtotal.className = "col-1";
	cardFooter.className = "row";
	tvTotal.className = "text-primary col-12 text-end mt-2";

	tvItems.innerHTML = "Items";
	thProduct.innerHTML = "Product";
	thDetails.innerHTML = "Details";
	thPrice.innerHTML = "Unit Price";
	thQuantity.innerHTML = "Quantity";
	thSubtotal.innerHTML = "Subtotal";

	const date = new Date(timestamp);
	tvTimestamp.innerHTML = date.toLocaleString();
	tvStatus.innerHTML = "Status: "+status;
	tvDeliveryOption.innerHTML = "Delivery Option: " + deliveryOption;
	tvDeliveryAddress.innerHTML = "Delivery Address: " + deliveryAddress;
	tvTotal.innerHTML = "Total: ₱"+Number(parseInt(total)).toFixed(2);

	cardContainer.appendChild(card);
		card.appendChild(cardHeader);
			cardHeader.appendChild(tvTimestamp);
			cardHeader.appendChild(tvStatus);
			cardHeader.appendChild(tvDeliveryOption);
			cardHeader.appendChild(tvDeliveryAddress);
			cardHeader.appendChild(tvItems);
		card.appendChild(cardBody);
			card.appendChild(table);
				table.appendChild(thead);
					thead.appendChild(tr);
						tr.appendChild(thImage);
						tr.appendChild(thProduct);
						tr.appendChild(thDetails);
						tr.appendChild(thPrice);
						tr.appendChild(thQuantity);
						tr.appendChild(thSubtotal);
				table.appendChild(tbody);
		card.appendChild(cardFooter);
			cardFooter.appendChild(tvTotal);

	ordersContainer.prepend(cardContainer);

	getOrderItemsData(orderId, tbody);
}

async function getOrderItemsData(orderId, tbody) {
	const querySnapshot = await getDocs(collection(db, "orders", orderId, "items"));
	querySnapshot.forEach((item) => {
		// renderOrderItems
		
		const refProduct = doc(db, "products", item.id);
		getDoc(refProduct).then((product) => {
			renderOrderItems(
				tbody,
				product.data().productName,
				product.data().productDetails,
				product.data().price,
				item.data().quantity,
				product.data().thumbnail
			);
		});
	});
}

function renderOrderItems(tbody, productName, productDetails, price, quantity, thumbnail) {
	const newRow = document.createElement('tr');
	const cellProductThumbnail = document.createElement('td');
		const imgThumbnail = document.createElement('img');
	const cellProductName = document.createElement('td');
	const cellProductDetails = document.createElement('td');
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
	imgThumbnail.style.objectFit = "fill";

	cellProductName.innerHTML = productName;
	cellProductDetails.innerHTML = productDetails;
	cellUnitPrice.innerHTML = "₱"+Number(price).toFixed(2);
	cellQuantity.innerHTML = quantity;
	cellSubtotal.innerHTML = "₱"+Number(parseFloat(price) * parseFloat(quantity)).toFixed(2);

	newRow.appendChild(cellProductThumbnail);
		cellProductThumbnail.appendChild(imgThumbnail);
	newRow.appendChild(cellProductName);
	newRow.appendChild(cellProductDetails);
	newRow.appendChild(cellUnitPrice);
	newRow.appendChild(cellQuantity);
	newRow.appendChild(cellSubtotal);

	tbody.append(newRow);
}