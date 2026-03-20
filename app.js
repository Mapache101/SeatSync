// ==========================================
// SEATSYNC: CORE STATE & FIREBASE SETUP
// ==========================================

// 1. Import Firebase v10 Modular functions directly from Google's CDN
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-app.js";
import { getFirestore, collection, getDocs, doc, setDoc } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-firestore.js";

// !!! DANIEL: PASTE YOUR FIREBASE CONFIG OBJECT HERE !!!
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// Initialize Firebase and Firestore
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Application State
let seats = [];
const TOTAL_SEATS = 30;
const PRICE_ADULT = 15.00;
const PRICE_CHILD = 8.00;
let selectedSeatId = null;

// ==========================================
// SUBSYSTEM 4: DATABASE SYNC MODULE (LOADING)
// ==========================================

// Notice the "async" keyword. This tells the browser this function takes time.
async function initSystem() {
    console.log("Connecting to Firestore...");
    const seatsCollection = collection(db, "seats");
    
    // The "await" keyword pauses the code here until Firebase responds
    const querySnapshot = await getDocs(seatsCollection);

    if (querySnapshot.empty) {
        console.log("Database empty. Generating 30 default seats...");
        // If the database is completely empty, build the 30 seats and save them to the cloud
        for (let i = 1; i <= TOTAL_SEATS; i++) {
            const newSeat = {
                id: i,
                status: "Empty",
                customerName: "",
                ticketType: "None"
            };
            seats.push(newSeat);
            // Save each new seat as its own document in the "seats" collection
            await setDoc(doc(db, "seats", i.toString()), newSeat);
        }
    } else {
        console.log("Data found! Loading seats from cloud...");
        // If data exists, grab it and put it into our local array
        seats = [];
        querySnapshot.forEach((docSnap) => {
            seats.push(docSnap.data());
        });
        // Ensure they remain in numeric order 1 to 30
        seats.sort((a, b) => a.id - b.id);
    }

    // Now that we have the data, draw the screen
    renderGrid();
    updateDashboard();
}

// ==========================================
// SUBSYSTEM 1: UI GRID RENDERER
// ==========================================

function renderGrid() {
    const gridContainer = document.getElementById('seat-grid');
    gridContainer.innerHTML = ''; 

    seats.forEach(seat => {
        const btn = document.createElement('button');
        btn.className = "p-4 rounded-lg font-bold transition border-2 flex flex-col items-center justify-center";
        
        if (seat.status === "Empty") {
            btn.classList.add("bg-green-100", "border-green-500", "text-green-700", "hover:bg-green-200");
            btn.innerHTML = `${seat.id} <br><span class="text-xs">[E]</span>`;
            btn.onclick = () => selectSeat(seat.id);
        } else {
            btn.classList.add("bg-gray-200", "border-gray-400", "text-gray-500", "cursor-not-allowed");
            btn.innerHTML = `${seat.id} <br><span class="text-xs">[${seat.ticketType}]</span>`;
        }

        if (seat.id === selectedSeatId) {
            btn.classList.remove("bg-green-100", "border-green-500", "text-green-700");
            btn.classList.add("bg-blue-200", "border-blue-600", "text-blue-800", "ring-2", "ring-blue-400");
        }

        gridContainer.appendChild(btn);
    });
}

function selectSeat(id) {
    selectedSeatId = id;
    document.getElementById('display-selected-seat').innerText = `Seat ${id}`;
    renderGrid(); 
}

// ==========================================
// SUBSYSTEM 2 & 3: BOOKING & DASHBOARD
// ==========================================
// Note: These buttons still only update the LOCAL memory for now. 
// We will wire them up to save to Firebase in Step 4.

document.getElementById('btn-book').addEventListener('click', () => {
    if (selectedSeatId === null) {
        alert("Validation Error: Please click on an empty seat from the grid first.");
        return; 
    }

    const nameInput = document.getElementById('input-customer-name').value.trim();
    const typeInput = document.getElementById('input-ticket-type').value;

    if (nameInput === "") {
        alert("Validation Error: Customer Name cannot be blank.");
        return;
    }
    if (typeInput !== "A" && typeInput !== "C") {
        alert("Validation Error: Please select a valid Ticket Type.");
        return;
    }

    const seatIndex = seats.findIndex(s => s.id === selectedSeatId);
    seats[seatIndex].status = "Booked";
    seats[seatIndex].customerName = nameInput;
    seats[seatIndex].ticketType = typeInput;

    selectedSeatId = null;
    document.getElementById('display-selected-seat').innerText = "None";
    document.getElementById('input-customer-name').value = "";
    document.getElementById('input-ticket-type').value = "";

    renderGrid();
    updateDashboard();
});

function updateDashboard() {
    let adultCount = 0;
    let childCount = 0;

    seats.forEach(seat => {
        if (seat.ticketType === "A") adultCount++;
        if (seat.ticketType === "C") childCount++;
    });

    const totalRevenue = (adultCount * PRICE_ADULT) + (childCount * PRICE_CHILD);

    document.getElementById('stat-adults').innerText = adultCount;
    document.getElementById('stat-children').innerText = childCount;
    document.getElementById('stat-revenue').innerText = `$${totalRevenue.toFixed(2)}`;
}

document.getElementById('btn-clear-all').addEventListener('click', () => {
    const isSure = confirm("WARNING: Are you absolutely sure you want to delete ALL bookings? This cannot be undone.");
    if (isSure) {
        seats.forEach(seat => {
            seat.status = "Empty";
            seat.customerName = "";
            seat.ticketType = "None";
        });
        selectedSeatId = null;
        document.getElementById('display-selected-seat').innerText = "None";
        renderGrid();
        updateDashboard();
        alert("All bookings have been cleared locally.");
    }
});

// Boot up the system!
initSystem();
