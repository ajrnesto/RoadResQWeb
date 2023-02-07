import { db, storage } from '../js/firebase.js';
import { doc, collection, addDoc, updateDoc, deleteDoc, onSnapshot } from 'https://www.gstatic.com/firebasejs/9.16.0/firebase-firestore.js';
import { showModal, hideModal, resetValidation, invalidate } from '../js/utils.js';

// table
const tbodyCategories = document.querySelector('#tbodyCategories');
// modal
const btnDelete = document.querySelector('#btnDelete');
const tvConfirmDeleteMessage = document.querySelector('#tvConfirmDeleteMessage');
const btnSaveCategory = document.querySelector('#btnSaveCategory');
// modal form
const etCategoryName = document.querySelector('#etCategoryName');
const categoryNameValidator = document.querySelectorAll('.category-name-validator');
const menuCategory = document.querySelector('#menuCategory');
const menuCategoriesFilter = document.querySelector('#menuCategoriesFilter');


window.addEventListener("load", function() {
	renderCategoriesSelectOptions();
});

window.manageCategory = manageCategory;
window.confirmDeleteCategory = confirmDeleteCategory;

menuCategory.addEventListener("change", () => {
	const ADD_NEW_CATEGORY = -1;
	const SELECTED_MENU_OPTION = menuCategory.value;
	
	if (SELECTED_MENU_OPTION == ADD_NEW_CATEGORY) {
		hideModal('#modalManageProduct');
		showModal('#modalManageCategory');
		manageCategory(null, null);
	}
});

function renderCategoriesSelectOptions() {
	onSnapshot(collection(db, "categories"), (snapCategories) => {
		// clear table
		tbodyCategories.innerHTML = '';

		// clear category select options
		while (menuCategory.length > 2) {
			menuCategory.remove(menuCategory.length - 1);
		}

		snapCategories.forEach(category => {
			const categoryName = category.data().categoryName;
			const products = category.data().products;

			if (categoryName != "Uncategorized") {
				const option = document.createElement("option");
				option.innerHTML = categoryName;
				option.value = category.id;
				menuCategory.appendChild(option);
				menuCategoriesFilter.appendChild(option);
			} 
            renderCategoryTable(
				category.id,
				categoryName,
				products
			);
        });
	});
}

function renderCategoryTable(id, categoryName, products) {
    const newRow = document.createElement('tr');
    const cellCategoryName = document.createElement('td');
    const cellItems = document.createElement('td');
    const cellAction = document.createElement('td');

	if (categoryName != "Uncategorized") {
		const buttonEdit = document.createElement('button');
			const buttonEditIcon = document.createElement('i');
		const buttonDelete = document.createElement('button');
			const buttonDeleteIcon = document.createElement('i');

		buttonEdit.className = "btn btn-no-border btn-primary col me-2";
		buttonEdit.onclick = function() { manageCategory(id, categoryName) };
		buttonEdit.type = 'button';
			buttonEditIcon.className = "bi bi-pencil-fill text-light";
			buttonEditIcon.style.fontSize = "0.8rem";
		
		buttonDelete.className = "btn btn-no-border btn-danger col";
		buttonDelete.onclick = function() { confirmDeleteCategory(id, categoryName) };
		buttonDelete.type = 'button';
			buttonDeleteIcon.className = "bi bi-trash-fill text-light";
			buttonDeleteIcon.style.fontSize = "0.8rem";

		cellAction.appendChild(buttonEdit);
			buttonEdit.appendChild(buttonEditIcon);
		cellAction.appendChild(buttonDelete);
		buttonDelete.appendChild(buttonDeleteIcon);
	}
	
	cellCategoryName.innerHTML = categoryName;
	cellItems.innerHTML = parseInt(products);

    newRow.appendChild(cellCategoryName);
    newRow.appendChild(cellItems);
    newRow.appendChild(cellAction);

	tbodyCategories.append(newRow);
}

function manageCategory(categoryId, categoryName) {
	if (categoryId != null) {
		showModal('#modalManageCategory');
		etCategoryName.value = categoryName;
		tvManageCategoryTitle.textContent = "Edit Category";
		btnSaveCategory.textContent = "Save Category";
	}
	else {
		etCategoryName.value = "";
		tvManageCategoryTitle.textContent = "Add Category";
		btnSaveCategory.textContent = "Add Category";
	}

	btnSaveCategory.onclick = function () {
		saveCategory(categoryId);
	}
	// btnSaveCategory.addEventListener("click", function() {}, {once: true});
}

function saveCategory(categoryId) {
	let categoryName = etCategoryName.value;

	if (categoryName == null || categoryName == "") {
		invalidate(categoryNameValidator);
		return;
	}

	resetValidation(categoryNameValidator);

	if (categoryId == null) {
		addDoc(collection(db, "categories"), {
			categoryName: categoryName,
			products: parseInt(0)
		});
	}
	else {
		updateDoc(doc(db, "categories", categoryId), {
			categoryName: categoryName
		});
	}

	etCategoryName.value = "";
	hideModal('#modalManageCategory');
}

function confirmDeleteCategory(categoryId, categoryName) {
	tvConfirmDeleteMessage.innerHTML = "Delete the category \"" + categoryName + "\"?\n<br>This will mark all items under this category as uncategorized.";
	showModal('#modalConfirmDelete');

	btnDelete.onclick = function() {
		deleteCategory(categoryId)
	};
}

function deleteCategory(categoryId) {
	hideModal("#modalConfirmDelete");
	deleteDoc(doc(db, "categories", categoryId)).then(() => {
		console.log("DELETED PRODUCT: "+ categoryId);
	}).catch((error) => {
		console.log("COULD NOT DELETE DATA: "+ error);
	});
}