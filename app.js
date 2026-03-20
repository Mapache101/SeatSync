// ==========================================
// SEATSYNC: CORE STATE & CONFIGURATION
// ==========================================

// We define our 30 seats here. For now, it lives in the browser's memory.
// In Step 3, this will be replaced by data from Firebase.
let seats = [];
const TOTAL_SEATS = 30;
const PRICE_ADULT = 15.00;
const PRICE_CHILD = 8.00;

// This variable remembers which seat the user currently clicked on.
let selectedSeatId = null;

// Initialize the board when the script loads
function initSystem() {
    // Generate 30 empty seats
    for (let i = 1; i <= TOTAL_SEATS; i++) {
        seats.push({
            id: i,
            status: "Empty", // Can be "Empty" or "Booked"
            customerName: "",
            ticketType: "None" // Can be "A", "C", or "None"
        });
    }
    renderGrid();
    updateDashboard();
}

// ==========================================
// SUBSYSTEM 1: UI GRID RENDERER
// ==========================================

function renderGrid() {
    const gridContainer = document.getElementById('seat-grid');
    gridContainer.innerHTML = ''; // Wipe the dummy HTML seat clear

    seats.forEach(seat => {
        // Create a button for each seat
        const btn = document.createElement('button');
        
        // Base styling for all seats
        btn.className = "p-4 rounded-lg font-bold transition border-2 flex flex-col items-center justify-center";
        
        if (seat.status === "Empty") {
            // Styling for an available seat
            btn.classList.add("bg-green-100", "border-green-500", "text-green-700", "hover:bg-green-200");
            btn.innerHTML = `${seat.id} <br><span class="text-xs">[E]</span>`;
            
            // Allow clicking to select the seat
            btn.onclick = () => selectSeat(seat.id);
        } else {
            // Styling for a booked seat
            btn.classList.add("bg-gray-200", "border-gray-400", "text-gray-500", "cursor-not-allowed");
            // Show the letter of the ticket type instead of just [B] for better context
            btn.innerHTML = `${seat.id} <br><span class="text-xs">[${seat.ticketType}]</span>`;
        }

        // Highlight the currently selected seat in blue
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
    renderGrid(); // Redraw the grid to show the blue highlight
}

// ==========================================
// SUBSYSTEM 2: BOOKING & VALIDATION ENGINE
// ==========================================

document.getElementById('btn-book').addEventListener('click', () => {
    // 1. Validate a seat is selected
    if (selectedSeatId === null) {
        alert("Validation Error: Please click on an empty seat from the grid first.");
        return; // Stop execution
    }

    // Grab the inputs
    const nameInput = document.getElementById('input-customer-name').value.trim();
    const typeInput = document.getElementById('input-ticket-type').value;

    // 2. Validate Customer Name is not blank
    if (nameInput === "") {
        alert("Validation Error: Customer Name cannot be blank.");
        return;
    }

    // 3. Validate Ticket Type is selected
    if (typeInput !== "A" && typeInput !== "C") {
        alert("Validation Error: Please select a valid Ticket Type (Adult or Child).");
        return;
    }

    // If we pass validation, update the specific seat in our state
    const seatIndex = seats.findIndex(s => s.id === selectedSeatId);
    seats[seatIndex].status = "Booked";
    seats[seatIndex].customerName = nameInput;
    seats[seatIndex].ticketType = typeInput;

    // Reset the form and selection
    selectedSeatId = null;
    document.getElementById('display-selected-seat').innerText = "None";
    document.getElementById('input-customer-name').value = "";
    document.getElementById('input-ticket-type').value = "";

    // Update the visual UI
    renderGrid();
    updateDashboard();
});

// ==========================================
// SUBSYSTEM 3: FINANCIAL CALCULATOR & WIPE
// ==========================================

function updateDashboard() {
    let adultCount = 0;
    let childCount = 0;

    // Iterate through our data to count tickets
    seats.forEach(seat => {
        if (seat.ticketType === "A") adultCount++;
        if (seat.ticketType === "C") childCount++;
    });

    // Calculate revenue
    const totalRevenue = (adultCount * PRICE_ADULT) + (childCount * PRICE_CHILD);

    // Update the HTML
    document.getElementById('stat-adults').innerText = adultCount;
    document.getElementById('stat-children').innerText = childCount;
    document.getElementById('stat-revenue').innerText = `$${totalRevenue.toFixed(2)}`;
}

// The Danger Zone Button
document.getElementById('btn-clear-all').addEventListener('click', () => {
    // Strict safeguard using the browser's native confirmation dialog
    const isSure = confirm("WARNING: Are you absolutely sure you want to delete ALL bookings? This cannot be undone.");
    
    if (isSure) {
        // Reset all seats back to default
        seats.forEach(seat => {
            seat.status = "Empty";
            seat.customerName = "";
            seat.ticketType = "None";
        });
        
        selectedSeatId = null;
        document.getElementById('display-selected-seat').innerText = "None";
        
        renderGrid();
        updateDashboard();
        alert("All bookings have been cleared.");
    }
});

// Boot up the system!
initSystem();
