import { db, storage } from '../js/firebase.js';
import { doc, collection, addDoc, setDoc, getDoc, deleteDoc, updateDoc, increment, onSnapshot } from 'https://www.gstatic.com/firebasejs/9.16.0/firebase-firestore.js';
import { ref, uploadBytes, getDownloadURL, deleteObject } from "../node_modules/firebase/firebase-storage.js";
import { showModal, hideModal, resetValidation, invalidate } from '../js/utils.js';

// table
const tbodyProducts = document.querySelector('#tbodyProducts');
// modal
const tvManageProductTitle = document.querySelector('#tvManageProductTitle');
const btnSaveProduct = document.querySelector('#btnSaveProduct');
const btnCancelProductManagement = document.querySelector('#btnCancelProductManagement');
// modal form
const menuCategory = document.querySelector('#menuCategory');
const etProductName = document.querySelector('#etProductName');
const etProductDetails = document.querySelector('#etProductDetails');
const etPrice = document.querySelector('#etPrice');
const etStock = document.querySelector('#etStock');
const imgProduct = document.querySelector("#imgProduct")
const btnUploadImage = document.querySelector("#btnUploadImage")
let selectedProductImage = null;
let productThumbnailWasChanged = false;

// delete modal
const tvConfirmDeleteMessage = document.querySelector('#tvConfirmDeleteMessage');
const btnDelete = document.querySelector('#btnDelete');

const productNameValidator = document.querySelectorAll('.product-name-validator');
const productDetailsValidator = document.querySelectorAll('.product-details-validator');
const priceValidator = document.querySelectorAll('.price-validator');
const stockValidator = document.querySelectorAll('.stock-validator');

window.addEventListener("load", function() {
	autosizeTextareas();
	renderProducts();
});

window.manageProduct = manageProduct;
window.confirmDeleteProduct = confirmDeleteProduct;

btnUploadImage.addEventListener("change", () => {
	selectedProductImage = btnUploadImage.files[0];
	imgProduct.src = URL.createObjectURL(selectedProductImage);
	console.log("CHANGED PRODUCT IMAGE: "+imgProduct.src);
	productThumbnailWasChanged = true;
});

function renderProducts() {
	onSnapshot(collection(db, "products"), (snapProducts) => {
		// clear table
		tbodyProducts.innerHTML = '';

		snapProducts.forEach(product => {
            renderProductsTable(
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
}

async function renderProductsTable(id, productName, productDetails, categoryId, price, stock, thumbnail) {
    const newRow = document.createElement('tr');
    const cellThumbnail = document.createElement('td');
    	const imgThumbnail = document.createElement('img');
    const cellProductName = document.createElement('td');
    const cellProductDetails = document.createElement('td');
    const cellPrice = document.createElement('td');
    const cellCategory = document.createElement('td');
    const cellStock = document.createElement('td');
    const cellAction = document.createElement('td');
		const buttonEdit = document.createElement('button');
			const buttonEditIcon = document.createElement('i');
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
	cellPrice.innerHTML = "₱"+Number(price).toFixed(2);
	getDoc(doc(db, "categories", categoryId)).then((category) => {
		cellCategory.innerHTML = category.data().categoryName;
	});
	cellStock.innerHTML = stock;

    buttonEdit.className = "btn btn-no-border btn-primary col me-2";
    buttonEdit.onclick = function() { manageProduct(id, productName, productDetails, categoryId, price, stock, thumbnail) };
	buttonEdit.type = 'button';
		buttonEditIcon.className = "bi bi-pencil-fill text-light";
		buttonEditIcon.style.fontSize = "0.8rem";

	buttonDelete.className = "btn btn-no-border btn-danger col";
	buttonDelete.onclick = function() { confirmDeleteProduct(id, productName, thumbnail, categoryId) };
	buttonDelete.type = 'button';
		buttonDeleteIcon.className = "bi bi-trash-fill text-light";
		buttonDeleteIcon.style.fontSize = "0.8rem";

    newRow.appendChild(cellThumbnail);
		cellThumbnail.appendChild(imgThumbnail);
    newRow.appendChild(cellProductName);
    newRow.appendChild(cellProductDetails);
    newRow.appendChild(cellPrice);
    newRow.appendChild(cellCategory);
    newRow.appendChild(cellStock);
    newRow.appendChild(cellAction);
		cellAction.appendChild(buttonEdit);
			buttonEdit.appendChild(buttonEditIcon);
		cellAction.appendChild(buttonDelete);
			buttonDelete.appendChild(buttonDeleteIcon);

	tbodyProducts.append(newRow);
}

function manageProduct(id, productName, productDetails, categoryId, price, stock, oldThumbnail) {
	selectedProductImage = null;
	resetCategorySelection();

	console.log("SELECTED PRODUCT ID: "+id);

	const NEW_PRODUCT = (id == null);
	if (!NEW_PRODUCT) {
		showModal('#modalManageProduct');
		tvManageProductTitle.textContent = "Edit Product";
		btnSaveProduct.textContent = "Save Product";

		etProductName.value = productName;
		etProductDetails.value = productDetails;
		etPrice.value = Number(price).toFixed(2);
		etStock.value = Number(stock);
		menuCategory.value = categoryId;

		if (oldThumbnail == null) {
			imgProduct.src = "https://via.placeholder.com/150?text=Image";
		}
		else {
			getDownloadURL(ref(storage, 'products/'+oldThumbnail)).then((url) => {
				imgProduct.src = url;
			});
		}
	}
	else if (NEW_PRODUCT) {
		imgProduct.src = "https://via.placeholder.com/150?text=Image";
		tvManageProductTitle.textContent = "Add Product";
		btnSaveProduct.textContent = "Add Product";
	}

	btnSaveProduct.onclick = function() {
		saveProduct(id, oldThumbnail);
	}
}

function saveProduct(productId, oldThumbnail) {
	const category = menuCategory.value;
	const productName = etProductName.value;
	const productDetails = etProductDetails.value;
	const price = etPrice.value;
	const stock = etStock.value;

	const PRODUCT_NAME_IS_INVALID = (productName == null || productName == "");
	if (PRODUCT_NAME_IS_INVALID) {
		invalidate(productNameValidator);
		return;
	}
	resetValidation(productNameValidator);

	const PRODUCT_DETAILS_ARE_INVALID = (productDetails == null || productDetails == "");
	if (PRODUCT_DETAILS_ARE_INVALID) {
		invalidate(productDetailsValidator);
		return;
	}
	resetValidation(productDetailsValidator);

	const PRICE_IS_INVALID = (price == null || price == "");
	if (PRICE_IS_INVALID) {
		invalidate(priceValidator);
		return;
	}
	resetValidation(priceValidator);

	const STOCK_IS_INVALID = (stock == null || stock == "");
	if (STOCK_IS_INVALID) {
		invalidate(stockValidator);
		return;
	}
	resetValidation(stockValidator);

	let productImageFileName = null;
	if (selectedProductImage != null) {
		productImageFileName = Date.now();

		uploadBytes(ref(storage, "products/"+productImageFileName), selectedProductImage).then((snapshot) => {
			uploadProductData(productId, productName, productDetails, price, stock, category, productImageFileName, oldThumbnail);
		});
	}
	else {
		uploadProductData(productId, productName, productDetails, price, stock, category, productImageFileName, oldThumbnail);
	}
}

function uploadProductData(productId, productName, productDetails, price, stock, category, productImageFileName, oldThumbnail) {
	console.log("Product image was changed?: " + productThumbnailWasChanged);
	const NEW_PRODUCT = (productId == null);
	if (NEW_PRODUCT) {
		addDoc(collection(db, "products"), {
			productName: productName,
			productDetails: productDetails,
			price: parseFloat(price),
			stock: parseInt(stock),
			categoryId: category,
			thumbnail: productImageFileName
		});
		updateDoc(doc(db, "categories", category), {
			products: increment(1)
		});
	}
	else if (!NEW_PRODUCT) {
		if (productThumbnailWasChanged) {
			deleteObject(ref(storage, 'products/'+oldThumbnail)).then(() => {
				setDoc(doc(db, "products", productId), {
					productName: productName,
					productDetails: productDetails,
					price: parseFloat(price),
					stock: parseInt(stock),
					categoryId: category,
					thumbnail: productImageFileName
				});
			}).catch((error) => {
				console.log("FAILED TO CHANGE THUMBNAIL: "+error);
			});			  

			// reset variable
			productThumbnailWasChanged = false;
		}
		else if (!productThumbnailWasChanged) {
			updateDoc(doc(db, "products", productId), {
				productName: productName,
				productDetails: productDetails,
				price: parseFloat(price),
				stock: parseInt(stock),
				categoryId: category
			});
		}
	}

	etProductName.value = "";
	etProductDetails.value = "";
	etPrice.value = "";
	etStock.value = "";
	console.log("SAVED PRODUCT ID: "+productId);
	hideModal('#modalManageProduct');
}

function confirmDeleteProduct(productId, productName, thumbnail, categoryId) {
	tvConfirmDeleteMessage.textContent = "Delete the product \"" + productName + "\"?";
	showModal('#modalConfirmDelete');

	btnDelete.onclick = function() {
		deleteProduct(productId, categoryId);
	};
}

function deleteProduct(productId, categoryId) {
	hideModal("#modalConfirmDelete");
	deleteDoc(doc(db, "products", productId)).then(() => {
		updateDoc(doc(db, "categories", categoryId), {
			products: increment(-1)
		});
	}).catch((error) => {
		console.log("COULD NOT DELETE DATA: "+ error);
	});
}

function resetCategorySelection() {
	if (menuCategory.value == -1) {
		menuCategory.value = "Uncategorized";
	}
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