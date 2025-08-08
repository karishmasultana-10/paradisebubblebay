const roomRates = {
  suite: { weekday: 6000, weekend: 8000, capacity: 6 },
  executive: { weekday: 3500, weekend: 4500, capacity: 4 },
  standard: { weekday: 1800, weekend: 2500, capacity: 2 },
  extraPerson: 1000
};

function isWeekend(date) {
  const day = new Date(date).getDay();
  return day === 0 || day === 6;
}


function calculatePrice(event) {
  if (event) event.preventDefault();

  const checkin = document.getElementById("checkin").value;
  const checkout = document.getElementById("checkout").value;

  const suiteRooms = parseInt(document.getElementById("suiteCount").value) || 0;
  const suiteGuests = parseInt(document.getElementById("suiteGuests").value) || 0;

  const execRooms = parseInt(document.getElementById("executiveCount").value) || 0;
  const execGuests = parseInt(document.getElementById("executiveGuests").value) || 0;

  const stdRooms = parseInt(document.getElementById("standardCount").value) || 0;
  const stdGuests = parseInt(document.getElementById("standardGuests").value) || 0;

  // Validation
  if (!checkin || !checkout) {
    alert("❗ Please select both check-in and check-out dates.");
    return;
  }

  const start = new Date(checkin);
  const end = new Date(checkout);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (start < today) {
    alert("❗ Check-in date cannot be in the past.");
    return;
  }

  if (end <= start) {
    alert("❗ Check-out date must be after check-in date.");
    return;
  }

  if ((suiteRooms + execRooms + stdRooms) === 0 || (suiteGuests + execGuests + stdGuests) === 0) {
    alert("❗ Please select at least one room and enter number of guests.");
    return;
  }

  // ---- Pricing Calculation ----
  let totalAmount = 0;
  let totalExtraGuests = 0;
  let totalExtraCharges = 0;
  let nights = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
  let currentDate = new Date(start);

  // Calculate room base price
  for (let i = 0; i < nights; i++) {
    const dayKey = isWeekend(currentDate) ? "weekend" : "weekday";
    totalAmount += suiteRooms * roomRates.suite[dayKey];
    totalAmount += execRooms * roomRates.executive[dayKey];
    totalAmount += stdRooms * roomRates.standard[dayKey];
    currentDate.setDate(currentDate.getDate() + 1);
  }

  // ---- Extra Guest Charges Recalculation ----
  const roomTypes = [
    {
      name: "suite",
      rooms: suiteRooms,
      guests: suiteGuests,
      capacity: roomRates.suite.capacity
    },
    {
      name: "executive",
      rooms: execRooms,
      guests: execGuests,
      capacity: roomRates.executive.capacity
    },
    {
      name: "standard",
      rooms: stdRooms,
      guests: stdGuests,
      capacity: roomRates.standard.capacity
    }
  ];

  roomTypes.forEach((type) => {
    const allowedGuests = type.rooms * type.capacity;
    const extraGuests = Math.max(0, type.guests - allowedGuests);
    totalExtraGuests += extraGuests;
    totalExtraCharges += extraGuests * roomRates.extraPerson*suiteCount*nights;
  });

  // Add extra charges if any
  if (totalExtraGuests > 0) {
    alert(`⚠️ Extra guests detected!\nExtra guest charge (₹${roomRates.extraPerson} x ${totalExtraGuests}) will be added.`);
  }

  totalAmount += totalExtraCharges;

  // Final billing
  const advanceAmount = Math.round(totalAmount * 0.2);
  const remaining = totalAmount - advanceAmount;

  // Update UI
  document.getElementById("totalAmount").innerText = totalAmount;
  document.getElementById("advanceAmount").innerText = advanceAmount;
  document.getElementById("payAtHotel").innerText = remaining;
  document.getElementById("priceDisplay").style.display = "block";

  // Save to localStorage
  const name = document.getElementById("name")?.value || "";
  const email = document.getElementById("email")?.value || "";
  const phone = document.getElementById("phone")?.value || "";

  const bookingInfo = {
    name,
    email,
    phone,
    checkin,
    checkout,
    rooms: {
      suite: { count: suiteRooms, guests: suiteGuests },
      executive: { count: execRooms, guests: execGuests },
      standard: { count: stdRooms, guests: stdGuests }
    },
    extraGuests: totalExtraGuests,
    extraCharges: totalExtraCharges,
    totalAmount,
    advanceAmount,
    remainingAmount: remaining
  };

  localStorage.setItem("bookingDetails", JSON.stringify(bookingInfo));
}



function displayClosedDates() {
  const closedDatesList = document.getElementById("closedDatesList");
  const noticeBox = document.getElementById("closedDatesNotice");

  if (!closedDatesList || !noticeBox) return;

  closedDatesList.innerHTML = "";

  const closedDates = JSON.parse(localStorage.getItem("closedDates")) || [];

  if (closedDates.length === 0) {
    noticeBox.style.display = "none";
    return;
  }

  closedDates.forEach((date) => {
    const li = document.createElement("li");
    li.textContent = `📅 ${date}`;
    closedDatesList.appendChild(li);
  });

  noticeBox.style.display = "block";
}

// Run it after DOM is loaded
document.addEventListener("DOMContentLoaded", displayClosedDates);

document.getElementById("checkPriceBtn").addEventListener("click", function(e) {
  calculatePrice(e);
});

// ✅ Save user and booking details on clicking Proceed to Pay
// document.querySelector(".btn").addEventListener("click", function () {
//   const name = document.getElementById("name").value.trim();
//   const email = document.getElementById("email").value.trim();
//   const phone = document.getElementById("phone").value.trim();

//   const checkin = document.getElementById("checkin").value;
//   const checkout = document.getElementById("checkout").value;

//   const suiteRooms = parseInt(document.getElementById("suiteCount").value) || 0;
//   const suiteGuests = parseInt(document.getElementById("suiteGuests").value) || 0;

//   const execRooms = parseInt(document.getElementById("executiveCount").value) || 0;
//   const execGuests = parseInt(document.getElementById("executiveGuests").value) || 0;

//   const stdRooms = parseInt(document.getElementById("standardCount").value) || 0;
//   const stdGuests = parseInt(document.getElementById("standardGuests").value) || 0;

//   const totalAmount = document.getElementById("totalAmount")?.textContent || 0;
//   const advanceAmount = document.getElementById("advanceAmount")?.textContent || 0;
//   const payAtHotel = document.getElementById("payAtHotel")?.textContent || 0;

//   localStorage.setItem("bookingDetails", JSON.stringify({
//     name,
//     email,
//     phone,
//     checkin,
//     checkout,
//     suiteRooms,
//     suiteGuests,
//     execRooms,
//     execGuests,
//     stdRooms,
//     stdGuests,
//     totalAmount,
//     advanceAmount,
//     payAtHotel
//   }));
// });
function toggleRoomOptions(checkbox) {
  const value = checkbox.value;
  const optionsDiv = document.getElementById(`${value}Options`);

  if (!optionsDiv) {
    console.error(`❌ Element with ID '${value}Options' not found`);
    return;
  }

  if (checkbox.checked) {
    optionsDiv.style.display = "block";
  } else {
    optionsDiv.style.display = "none";

    // Reset the values
    const roomInput = document.getElementById(`${value}Count`);
    const guestInput = document.getElementById(`${value}Guests`);

    if (roomInput) roomInput.value = "0";
    if (guestInput) guestInput.value = "";
  }
}

// Load closed dates from localStorage
function getClosedDates() {
    return JSON.parse(localStorage.getItem("closedDates")) || [];
}

// Disable closed dates in check-in and check-out
function blockClosedDates() {
    const checkInInput = document.getElementById("checkin");
    const checkOutInput = document.getElementById("checkout");

    const closedDates = getClosedDates();

    // Add event listeners to validate on change
    checkInInput.addEventListener("change", function () {
        if (closedDates.includes(this.value)) {
            alert("This check-in date is not available. Please choose another date.");
            this.value = "";
        }
    });

    checkOutInput.addEventListener("change", function () {
        if (closedDates.includes(this.value)) {
            alert("This check-out date is not available. Please choose another date.");
            this.value = "";
        }
    });
}

// Call it when DOM is ready
document.addEventListener("DOMContentLoaded", function () {
    blockClosedDates();
});
