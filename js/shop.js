import { showModal, hideModal, resetValidation, invalidate } from '../js/utils.js';

const btnSearchShop = document.querySelector('#btnSearchShop');
const etSearchShop = document.querySelector('#etSearchShop');

btnSearchShop.addEventListener("click", function() {
	showModal("#modalSearch");
	setTimeout(function() {
		etSearchShop.focus()
	}, 500);
});