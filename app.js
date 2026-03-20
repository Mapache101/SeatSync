// ==========================================
// SEATSYNC: CORE STATE & FIREBASE SETUP
// ==========================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-app.js";
import { getFirestore, collection, getDocs, doc, setDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-firestore.js";

// Your exact Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCx7R7HlVl-lRdwYbNIvT3lir7K5zcCMBs",
  authDomain: "seatsync2026-3c5d6.firebaseapp.com",
  projectId: "seatsync2026-3c5d6",
  storageBucket: "seatsync2026-3c5d6.firebasestorage.app",
  messagingSenderId: "1062306157823",
  appId: "1:1062306157823:web:5d71900d44305683c468ca"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

let seats = [];
const TOTAL_SEATS = 30;
const PRICE_ADULT = 15.00;
const PRICE_CHILD = 8.00;
let selectedSeatId = null;

// ==========================================
// SUBSYSTEM 4: DATABASE SYNC MODULE
// ==========================================

async function initSystem() {
    console.log("Connecting to Firestore...");
    const seatsCollection = collection(db, "seats");
    const querySnapshot = await getDocs(seatsCollection);

    if (querySnapshot.empty) {
        console.log("Database empty. Generating 30 default seats...");
        for (let i = 1; i <= TOTAL_SEATS; i++) {
            const newSeat = {
                id: i,
                status: "Empty",
                customerName: "",
                ticketType: "None"
            };
            seats.push(newSeat);
            // setDoc creates the document if it doesn't exist
            await setDoc(doc(db, "seats", i.toString()), newSeat);
        }
    } else {
        console.log("Data found! Loading seats from cloud...");
        seats = [];
        querySnapshot.forEach((docSnap) => {
            seats.push(docSnap.data());
        });
        seats.sort((a, b) => a.id - b.id);
    }

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
// SUBSYSTEM 2: BOOKING & VALIDATION ENGINE
// ==========================================

// Added 'async' here because saving to the database takes time
document.getElementById('btn-book').addEventListener('click', async () => {
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

    // 1. Update the local memory first so the UI feels fast
    const seatIndex = seats.findIndex(s => s.id === selectedSeatId);
    seats[seatIndex].status = "Booked";
    seats[seatIndex].customerName = nameInput;
    seats[seatIndex].ticketType = typeInput;

    // 2. Push the exact same update to the cloud database
    const seatRef = doc(db, "seats", selectedSeatId.toString());
    await updateDoc(seatRef, {
        status: "Booked",
        customerName: nameInput,
        ticketType: typeInput
    });

    selectedSeatId = null;
    document.getElementById('display-selected-seat').innerText = "None";
    document.getElementById('input-customer-name').value = "";
    document.getElementById('input-ticket-type').value = "";

    renderGrid();
    updateDashboard();
});

// ==========================================
// SUBSYSTEM 3: FINANCIAL CALCULATOR & WIPE
// ==========================================

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

// Added 'async' here as well to handle the bulk cloud deletions
document.getElementById('btn-clear-all').addEventListener('click', async () => {
    const isSure = confirm("WARNING: Are you absolutely sure you want to delete ALL bookings? This cannot be undone.");
    
    if (isSure) {
        // Change the button text so the user knows it is working
        const btnClear = document.getElementById('btn-clear-all');
        btnClear.innerText = "Clearing Database...";
        btnClear.disabled = true;

        // Loop through all 30 seats to wipe them locally and in the cloud
        for (let i = 0; i < seats.length; i++) {
            seats[i].status = "Empty";
            seats[i].customerName = "";
            seats[i].ticketType = "None";

            const seatRef = doc(db, "seats", seats[i].id.toString());
            await updateDoc(seatRef, {
                status: "Empty",
                customerName: "",
                ticketType: "None"
            });
        }
        
        selectedSeatId = null;
        document.getElementById('display-selected-seat').innerText = "None";
        
        renderGrid();
        updateDashboard();
        
        // Restore the button
        btnClear.innerText = "Clear All Bookings";
        btnClear.disabled = false;
        
        alert("All bookings have been wiped from the cloud.");
    }
});

initSystem();
