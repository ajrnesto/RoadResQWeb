import { db, auth, storage } from '../js/firebase.js';
import { doc, collection, addDoc, setDoc, getDoc, deleteDoc, updateDoc, increment, query, where, orderBy, startAt, endAt, onSnapshot } from 'https://www.gstatic.com/firebasejs/9.16.0/firebase-firestore.js';
import { ref, getDownloadURL } from "../node_modules/firebase/firebase-storage.js";
import { showModal, hideModal, resetValidation, invalidate } from '../js/utils.js';

const tvSearchShop = document.querySelector('#tvSearchShop');
const shopItemsContainer = document.querySelector('#shopItemsContainer');

const btnOpenSearch = document.querySelector('#btnOpenSearch');
// search modal
const etSearchShop = document.querySelector('#etSearchShop');
const menuCategoriesFilter = document.querySelector('#menuCategoriesFilter');
const btnSearchShop = document.querySelector('#btnSearchShop');
let unsubProductsListener = null;

// view product modal
const modalViewProduct = document.querySelector('#modalViewProduct');
const imgViewProductThumbnail = document.querySelector('#imgViewProductThumbnail');
const tvViewProductName = document.querySelector('#tvViewProductName');
const tvViewProductDetails = document.querySelector('#tvViewProductDetails');
const tvViewProductStock = document.querySelector('#tvViewProductStock');
const tvPrice = document.querySelector('#tvPrice');
const btnDecrement = document.querySelector('#btnDecrement');
const etQuantity = document.querySelector('#etQuantity');
const btnIncrement = document.querySelector('#btnIncrement');
const btnAddToCart = document.querySelector('#btnAddToCart');

window.addEventListener("load", function() {
	queryProducts();
});

btnOpenSearch.addEventListener("click", function() {
	showModal("#modalSearch");
	setTimeout(function() {
		etSearchShop.focus()
	}, 500);
});

btnSearchShop.addEventListener("click", function() {
	console.log("Searching for products...");

	hideModal("#modalSearch");

	if (unsubProductsListener != null) {
		unsubProductsListener();
	}

	queryProducts();
});

function queryProducts() {
	const searchKey = etSearchShop.value.toUpperCase();
	const selectedCategory = menuCategoriesFilter.value;

	let qryProducts = null;

	if (selectedCategory == -1) {
		if (searchKey == "") {
			tvSearchShop.classList.toggle("d-none", true);
			qryProducts = query(collection(db, "products"));
		}
		else {
			tvSearchShop.innerHTML = "Search index: \""+etSearchShop.value+"\"";
			tvSearchShop.classList.toggle("d-none", false);
			qryProducts = query(collection(db, "products"), orderBy("productNameAllCaps"), startAt(searchKey), endAt(searchKey+'\uf8ff'));
		}
	}
	else {
		if (searchKey == "") {
			tvSearchShop.innerHTML = "Category:\" "+menuCategoriesFilter.options[menuCategoriesFilter.selectedIndex].text+" \"";
			tvSearchShop.classList.toggle("d-none", false);
			qryProducts = query(collection(db, "products"), where("categoryId", "==", selectedCategory));
		}
		else {
			tvSearchShop.innerHTML = "Category:\" "+menuCategoriesFilter.options[menuCategoriesFilter.selectedIndex].text+" \" Search index: \""+etSearchShop.value+"\"";
			qryProducts = query(collection(db, "products"), orderBy("productNameAllCaps"), startAt(searchKey), endAt(searchKey+'\uf8ff'), where("categoryId", "==", selectedCategory));
		}
	}
	
	unsubProductsListener = onSnapshot(qryProducts, (snapProducts) => {
		// clear table
		shopItemsContainer.innerHTML = '';

		snapProducts.forEach(product => {
            renderProducts(
				product.id,
				product.data().productName,
				product.data().productDetails,
				product.data().categoryId,
				product.data().price,
				product.data().stock,
				product.data().thumbnail
			);
        });
	});

	function renderProducts(id, productName, productDetails, categoryId, price, stock, thumbnail) {
		const divCardContainer = document.createElement('div');
		const divCard = document.createElement('div');
		const imgProductThumbnail = document.createElement('img');
		const tvProductName = document.createElement('h5');
		const tvProductDetails = document.createElement('p');
		const divCardFooter = document.createElement('div');
		const tvProductPrice = document.createElement('p');
		const divAddToCartButtonContainer = document.createElement('div');
		const btnViewProduct = document.createElement('button');
		const iconAddToCart = document.createElement('i');

		divCardContainer.className = "row col p-4 justify-content-center";
		divCard.className = "rounded bg-white col-12 text-center";
		
		imgProductThumbnail.className = "col-12 p-2 pt-3";
		// imgThumbnail.style.width = "50px";
		// imgThumbnail.style.height = "50px";
		imgProductThumbnail.style.objectFit = "fill";
		if (thumbnail == null){
			imgProductThumbnail.src = "https://via.placeholder.com/150?text=Image";
		}
		else {
			getDownloadURL(ref(storage, 'products/'+thumbnail))
				.then((url) => {
					imgProductThumbnail.src = url;
				});
		}
		
		tvProductName.className = "col-12 pt-2 pb-1 text-truncate";
		tvProductName.innerHTML = productName;

		tvProductDetails.className = "col-12 text-truncate";
		tvProductDetails.innerHTML = productDetails;
		
		divCardFooter.className = "row row-cols-2";
		
		tvProductPrice.className = "col my-auto text-primary text-start";
		tvProductPrice.innerHTML = "₱"+parseFloat(price).toFixed(2);
		
		divAddToCartButtonContainer.className = "col";
		
		btnViewProduct.className = "float-end btn btn-primary mb-3";
		btnViewProduct.title = "Order this item";
		btnViewProduct.onclick = function() { viewProduct(id, productName, productDetails, categoryId, price, stock, thumbnail) }
		
		iconAddToCart.className = "bi bi-cart-plus text-light";
		iconAddToCart.style.fontSize = "1.2rem";

		divCardContainer.appendChild(divCard);
			divCard.appendChild(imgProductThumbnail);
			divCard.appendChild(tvProductName);
			divCard.appendChild(tvProductDetails);
			divCard.appendChild(divCardFooter);
				divCardFooter.appendChild(tvProductPrice);
				divCardFooter.appendChild(divAddToCartButtonContainer);
					divAddToCartButtonContainer.appendChild(btnViewProduct);
					btnViewProduct.appendChild(iconAddToCart);
	
		shopItemsContainer.append(divCardContainer);
	}
}

function viewProduct(productId, productName, productDetails, categoryId, price, stock, thumbnail) {
	showModal('#modalViewProduct');

	if (stock < 1) {
		etQuantity.value = 0;
		btnDecrement.classList.toggle("disabled", true);
		etQuantity.classList.toggle("disabled", true);
		btnIncrement.classList.toggle("disabled", true);
		btnAddToCart.classList.toggle("disabled", true);
	}
	else {
		etQuantity.value = 1;
		btnDecrement.classList.toggle("disabled", false);
		etQuantity.classList.toggle("disabled", false);
		btnIncrement.classList.toggle("disabled", false);
		btnAddToCart.classList.toggle("disabled", false);
	}
	
	if (thumbnail == null){
		imgViewProductThumbnail.src = "https://via.placeholder.com/150?text=Image";
	}
	else {
		getDownloadURL(ref(storage, 'products/'+thumbnail))
			.then((url) => {
				imgViewProductThumbnail.src = url;
			});
	}
	tvViewProductName.innerHTML = productName;
	tvViewProductDetails.innerHTML = productDetails;
	tvViewProductStock.innerHTML = "Items left: "+stock;
	tvPrice.innerHTML = "₱"+parseFloat(price).toFixed(2);

	btnDecrement.onclick = function() {
		let quantity = parseInt(etQuantity.value);

		if (quantity > 0) {
			quantity-=1;
		}

		etQuantity.value = quantity;
	}

	btnIncrement.onclick = function() {
		let quantity = parseInt(etQuantity.value);

		if (quantity < stock) {
			quantity+=1;
		}

		etQuantity.value = quantity;
	}

	etQuantity.oninput = function() {
		const quantity = parseInt(etQuantity.value);

		if (quantity > stock) {
			etQuantity.value = stock;
		}
		if (quantity < 0) {
			etQuantity.value = 0;
		}
	}
	
	btnAddToCart.onclick = function() {
		const quantity = parseInt(etQuantity.value);
		if (quantity < 1) {
			invalidate(document.querySelectorAll("#etQuantity"));
			return;
		}
		resetValidation(document.querySelectorAll("#etQuantity"));

		hideModal("#modalViewProduct");

		const refCartItem = doc(db, "carts", auth.currentUser.uid, "items", productId);
		getDoc(refCartItem).then((cartItem) => {
			if (cartItem.exists()) {
				updateDoc(refCartItem, {
					quantity: increment(quantity)
				});
			}
			else {
				setDoc(refCartItem, {
					quantity: quantity
				});
			}

			const product = doc(db, "products", productId);
			updateDoc(product, {
				stock: increment(-quantity)
			})
		});

		console.log("code reached here");
	}
}