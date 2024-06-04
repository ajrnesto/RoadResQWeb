import { db, auth, storage } from '../js/firebase.js';
import { onAuthStateChanged } from '../node_modules/firebase/firebase-auth.js';
import { doc, collection, getDoc, getDocs, addDoc, updateDoc, increment, deleteDoc, Timestamp, arrayUnion, deleteField, query, where, orderBy, startAt, endAt, onSnapshot } from 'https://www.gstatic.com/firebasejs/10.5.2/firebase-firestore.js';
import { ref, getDownloadURL, deleteObject, connectStorageEmulator } from "../node_modules/firebase/firebase-storage.js";

// rescue requests this month
const cardRescueRequests = document.querySelector("#cardRescueRequests");
const tvEmptyRescueRequestsThisMonth = document.querySelector("#tvEmptyRescueRequestsThisMonth");
const divRescueRequestsThisMonth = document.querySelector("#divRescueRequestsThisMonth");
let chartRescueRequestsThisMonth = Chart.getChart("chartRescueRequestsThisMonth");

// rescue requests all time
const tvEmptyRescueRequestsAllTime = document.querySelector("#tvEmptyRescueRequestsAllTime");
const divRescueRequestsAllTime = document.querySelector("#divRescueRequestsAllTime");
let chartRescueRequestsAllTime = Chart.getChart("chartRescueRequestsAllTime");

// rescue requests this month
const cardAppointments = document.querySelector("#cardAppointments");
const tvEmptyAppointmentsThisMonth = document.querySelector("#tvEmptyAppointmentsThisMonth");
const divAppointmentsThisMonth = document.querySelector("#divAppointmentsThisMonth");
let chartAppointmentsThisMonth = Chart.getChart("chartAppointmentsThisMonth");

// rescue requests all time
const tvEmptyAppointmentsAllTime = document.querySelector("#tvEmptyAppointmentsAllTime");
const divAppointmentsAllTime = document.querySelector("#divAppointmentsAllTime");
let chartAppointmentsAllTime = Chart.getChart("chartAppointmentsAllTime");

// rescue requests all time
const tvEmptyRevenue = document.querySelector("#tvEmptyRevenue");
const divRevenue = document.querySelector("#divRevenue");
let chartRevenue = Chart.getChart("chartRevenue");

// orders
const cardOrders = document.querySelector("#cardOrders");
const tvPendingOrders = document.querySelector("#tvPendingOrders");
const tvPreparingOrders = document.querySelector("#tvPreparingOrders");
const tvReadyForPickupOrders = document.querySelector("#tvReadyForPickupOrders");
const tvCompletedOrders = document.querySelector("#tvCompletedOrders");

const now = new Date().getTime();
const tomorrow12AM = new Date().setHours(24,0,0,0);
const date = new Date();
const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1).getTime();
const lastDayOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getTime();
const firstDayOfMonth1MonthAgo = new Date(date.getFullYear(), date.getMonth()-1, 1).getTime();
const lastDayOfMonth1MonthAgo = new Date(date.getFullYear(), date.getMonth()-1 + 1, 0).getTime();
const firstDayOfMonth2MonthsAgo = new Date(date.getFullYear(), date.getMonth()-2, 1).getTime();
const lastDayOfMonth2MonthsAgo = new Date(date.getFullYear(), date.getMonth()-2 + 1, 0).getTime();
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

onAuthStateChanged(auth, user => {
});

window.addEventListener("load", function() {
	listenToRescueRequestsAllTime();
	listenToRescueRequestsThisMonth();
	listenToAppointmentsAllTime();
	listenToAppointmentsThisMonth();
	listenToRevenue();
	listenToOrdersThisMonth();
});

cardRescueRequests.addEventListener("click", () => {
	window.location = "rescue.html";
});

cardOrders.addEventListener("click", () => {
	window.location = "orders.html";
});

cardAppointments.addEventListener("click", () => {
	window.location = "appointments.html";
});

function listenToRescueRequestsAllTime() {
	const qryRescueREquestsAllTIme = query(collection(db, "rescue"));

	onSnapshot(qryRescueREquestsAllTIme, (requests) => {
		let totalRequests = 0;
		let requestsThisMonth = 0;
		let requestsOneMonthAgo = 0;
		let requestsTwoMonthsAgo = 0;

		requests.forEach(request => {
			totalRequests++;

			const status = request.data().status;
			const schedule = request.data().schedule;

			if (schedule >= firstDayOfMonth && schedule <= lastDayOfMonth) {
				requestsThisMonth++;
			}
			else if (schedule >= firstDayOfMonth1MonthAgo && schedule <= lastDayOfMonth1MonthAgo) {
				requestsOneMonthAgo++;
			}
			else if (schedule >= firstDayOfMonth2MonthsAgo && schedule <= lastDayOfMonth2MonthsAgo) {
				requestsTwoMonthsAgo++;
			}
				
			if (chartRescueRequestsAllTime != undefined) {
				chartRescueRequestsAllTime.destroy();
			}

			const d = new Date();
			let month = d.getMonth();
			chartRescueRequestsAllTime = new Chart("chartRescueRequestsAllTime", {
				type: "line",
				data: {
					labels: [
						months[month-2],
						months[month-1],
						months[month]
					],
					datasets: [{
						label: 'Rescue Requests',
						data: [
							requestsTwoMonthsAgo,
							requestsOneMonthAgo,
							requestsThisMonth
						]
					}]
				},
				options: {
					plugins: {
							legend: {
									display: true,
									position: 'bottom',
									align: 'start'
							}
					}
				}
			});
	
			if (totalRequests == 0) {
				tvEmptyRescueRequestsAllTime.classList.toggle("d-none", false);
				divRescueRequestsAllTime.classList.toggle("d-none", true);
			}
			else {
				tvEmptyRescueRequestsAllTime.classList.toggle("d-none", true);
				divRescueRequestsAllTime.classList.toggle("d-none", false);
			}
		});
	})
}

function listenToRescueRequestsThisMonth() {
	const qryRescueREquestsThisMonth = query(collection(db, "rescue"), where("schedule", ">=", firstDayOfMonth), where("schedule", "<", lastDayOfMonth));

	onSnapshot(qryRescueREquestsThisMonth, (requests) => {
		let totalRequests = 0;
		let pendingCount = 0;
		let inServiceCount = 0;
		let completedCount = 0;

		requests.forEach(request => {
			totalRequests++;

			const status = request.data().status;
			const schedule = request.data().schedule;
	
			if (status == "PENDING") {
				pendingCount++;
			}
			if (status == "IN SERVICE") {
				inServiceCount++;
			}
			else if (status == "COMPLETED") {
				completedCount++;
			}
				
			if (chartRescueRequestsThisMonth != undefined) {
				chartRescueRequestsThisMonth.destroy();
			}
			chartRescueRequestsThisMonth = new Chart("chartRescueRequestsThisMonth", {
				type: "pie",
				data: {
					labels: [
						'Pending',
						'In Service',
						'Completed'
					],
					datasets: [{
						data: [
							pendingCount,
							inServiceCount,
							completedCount
						]
					}]
				},
				options: {
					plugins: {
							legend: {
									display: true,
									position: 'bottom',
									align: 'start'
							}
					}
				}
			});
	
			if (totalRequests == 0) {
				tvEmptyRescueRequestsThisMonth.classList.toggle("d-none", false);
				divRescueRequestsThisMonth.classList.toggle("d-none", true);
			}
			else {
				tvEmptyRescueRequestsThisMonth.classList.toggle("d-none", true);
				divRescueRequestsThisMonth.classList.toggle("d-none", false);
			}
		});
	})
}


function listenToAppointmentsAllTime() {
	const qryAppointmentsAllTIme = query(collection(db, "appointments"));

	onSnapshot(qryAppointmentsAllTIme, (requests) => {
		let totalRequests = 0;
		let requestsThisMonth = 0;
		let requestsOneMonthAgo = 0;
		let requestsTwoMonthsAgo = 0;

		requests.forEach(request => {
			totalRequests++;

			const status = request.data().status;
			const schedule = request.data().schedule;

			if (schedule >= firstDayOfMonth && schedule <= lastDayOfMonth) {
				requestsThisMonth++;
			}
			else if (schedule >= firstDayOfMonth1MonthAgo && schedule <= lastDayOfMonth1MonthAgo) {
				requestsOneMonthAgo++;
			}
			else if (schedule >= firstDayOfMonth2MonthsAgo && schedule <= lastDayOfMonth2MonthsAgo) {
				requestsTwoMonthsAgo++;
			}
				
			if (chartAppointmentsAllTime != undefined) {
				chartAppointmentsAllTime.destroy();
			}

			const d = new Date();
			let month = d.getMonth();
			chartAppointmentsAllTime = new Chart("chartAppointmentsAllTime", {
				type: "line",
				data: {
					labels: [
						months[month-2],
						months[month-1],
						months[month]
					],
					datasets: [{
						label: 'Appointments',
						data: [
							requestsTwoMonthsAgo,
							requestsOneMonthAgo,
							requestsThisMonth
						]
					}]
				},
				options: {
					plugins: {
							legend: {
									display: true,
									position: 'bottom',
									align: 'start'
							}
					}
				}
			});
	
			if (totalRequests == 0) {
				tvEmptyAppointmentsAllTime.classList.toggle("d-none", false);
				divAppointmentsAllTime.classList.toggle("d-none", true);
			}
			else {
				tvEmptyAppointmentsAllTime.classList.toggle("d-none", true);
				divAppointmentsAllTime.classList.toggle("d-none", false);
			}
		});
	})
}

function listenToAppointmentsThisMonth() {
	const qryAppointmentsThisMonth = query(collection(db, "appointments"), where("schedule", ">=", firstDayOfMonth), where("schedule", "<", lastDayOfMonth));

	onSnapshot(qryAppointmentsThisMonth, (requests) => {
		let totalRequests = 0;
		let pendingCount = 0;
		let inServiceCount = 0;
		let completedCount = 0;

		requests.forEach(request => {
			totalRequests++;

			const status = request.data().status;
			const schedule = request.data().schedule;
	
			if (status == "PENDING") {
				pendingCount++;
			}
			if (status == "IN SERVICE") {
				inServiceCount++;
			}
			else if (status == "COMPLETED") {
				completedCount++;
			}
				
			if (chartAppointmentsThisMonth != undefined) {
				chartAppointmentsThisMonth.destroy();
			}
			chartAppointmentsThisMonth = new Chart("chartAppointmentsThisMonth", {
				type: "pie",
				data: {
					labels: [
						'Pending',
						'In Service',
						'Completed'
					],
					datasets: [{
						data: [
							pendingCount,
							inServiceCount,
							completedCount
						]
					}]
				},
				options: {
					plugins: {
							legend: {
									display: true,
									position: 'bottom',
									align: 'start'
							}
					}
				}
			});
	
			if (totalRequests == 0) {
				tvEmptyAppointmentsThisMonth.classList.toggle("d-none", false);
				divAppointmentsThisMonth.classList.toggle("d-none", true);
			}
			else {
				tvEmptyAppointmentsThisMonth.classList.toggle("d-none", true);
				divAppointmentsThisMonth.classList.toggle("d-none", false);
			}
		});
	})
}

function listenToRevenue() {
	const qryRevenue = query(collection(db, "orders"));

	onSnapshot(qryRevenue, (requests) => {
		let totalRequests = 0;
		let revenueThisMonth = 0;
		let revenueOneMonthAgo = 0;
		let revenueTwoMonthsAgo = 0;

		requests.forEach(request => {
			totalRequests++;

			const status = request.data().status;
			const schedule = request.data().timestamp;
			const total = request.data().total;

			if (schedule >= firstDayOfMonth && schedule <= lastDayOfMonth) {
				revenueThisMonth += total;
			}
			else if (schedule >= firstDayOfMonth1MonthAgo && schedule <= lastDayOfMonth1MonthAgo) {
				revenueOneMonthAgo += total;
			}
			else if (schedule >= firstDayOfMonth2MonthsAgo && schedule <= lastDayOfMonth2MonthsAgo) {
				revenueTwoMonthsAgo += total;
			}
				
			if (chartRevenue != undefined) {
				chartRevenue.destroy();
			}

			const d = new Date();
			let month = d.getMonth();
			chartRevenue = new Chart("chartRevenue", {
				type: "line",
				data: {
					labels: [
						months[month-2],
						months[month-1],
						months[month]
					],
					datasets: [{
						label: 'Revenue',
						data: [
							revenueTwoMonthsAgo,
							revenueOneMonthAgo,
							revenueThisMonth
						]
					}]
				},
				options: {
					plugins: {
							legend: {
									display: true,
									position: 'bottom',
									align: 'start'
							}
					}
				}
			});
	
			if (totalRequests == 0) {
				tvEmptyRevenue.classList.toggle("d-none", false);
				divRevenue.classList.toggle("d-none", true);
			}
			else {
				tvEmptyRevenue.classList.toggle("d-none", true);
				divRevenue.classList.toggle("d-none", false);
			}
		});
	})
}

function listenToOrdersThisMonth() {
	// const qryOrdersThisMonth = query(collection(db, "orders"), where("schedule", ">=", firstDayOfMonth), where("schedule", "<", lastDayOfMonth));
	const qryOrdersThisMonth = query(collection(db, "orders"));

	onSnapshot(qryOrdersThisMonth, (orders) => {
		let totalOrders = 0;
		let pendingCount = 0;
		let preparingCount = 0;
		let readyForPickupCount = 0;
		let completedCount = 0;

		orders.forEach(order => {
			totalOrders++;

			const status = order.data().status;

			if (status == "Pending") {
				pendingCount++;
			}
			else if (status == "Preparing") {
				preparingCount++;
			}
			else if (status == "Ready for Pick-up") {
				readyForPickupCount++;
			}
			else if (status == "Completed") {
				completedCount++;
			}
		});
			
		tvPendingOrders.innerHTML = pendingCount;
		tvPreparingOrders.innerHTML = preparingCount;
		tvReadyForPickupOrders.innerHTML = readyForPickupCount;
		tvCompletedOrders.innerHTML = completedCount;
	})
}