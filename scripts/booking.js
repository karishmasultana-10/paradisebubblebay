const roomRates = {
  suite: { weekday: 6000, weekend: 8000, capacity: 6 },
  executive: { weekday: 3500, weekend: 4500, capacity: 4 },
  standard: { weekday: 1800, weekend: 2500, capacity: 2 },
  extraPerson: 1000
};

/**
 * Checks if a given date is a weekend (Saturday or Sunday).
 * @param {Date} date - The date object to check.
 * @returns {boolean} - True if the date is a weekend, otherwise false.
 */
function isWeekend(date) {
  const day = date.getDay();
  return day === 0 || day === 6;
}

/**
 * Calculates the total price of a hotel stay.
 * If ANY day in the stay is a weekend, the weekend rate is applied to ALL nights.
 * @param {Event} event - The click event from the button.
 */
function calculatePrice(event) {
  if (event) event.preventDefault();

  console.clear();
  console.log("--- Starting New Price Calculation (Weekend Priority Rule) ---");


  const checkinStr = document.getElementById("checkin").value;
  const checkoutStr = document.getElementById("checkout").value;

  const suiteRooms = parseInt(document.getElementById("suiteCount").value) || 0;
  const suiteGuests = parseInt(document.getElementById("suiteGuests").value) || 0;
  const execRooms = parseInt(document.getElementById("executiveCount").value) || 0;
  const execGuests = parseInt(document.getElementById("executiveGuests").value) || 0;
  const stdRooms = parseInt(document.getElementById("standardCount").value) || 0;
  const stdGuests = parseInt(document.getElementById("standardGuests").value) || 0;


  if (!checkinStr || !checkoutStr) {
    alert("❗ Please select both check-in and check-out dates.");
    return;
  }

  const start = new Date(checkinStr + 'T12:00:00');
  const end = new Date(checkoutStr + 'T12:00:00');
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
  if ((suiteRooms + execRooms + stdRooms) === 0) {
    alert("❗ Please select at least one room.");
    return;
  }


  let containsWeekend = false;
  let currentDateForCheck = new Date(start);


  while (currentDateForCheck < end) {
    if (isWeekend(currentDateForCheck)) {
      containsWeekend = true;
      break; 
    }
    currentDateForCheck.setDate(currentDateForCheck.getDate() + 1);
  }

  
  const priceKey = containsWeekend ? "weekend" : "weekday";

  console.log(`Booking Period: ${start.toDateString()} to ${end.toDateString()}`);
  console.log(`Does this booking contain a weekend day? ${containsWeekend}`);
  console.log(`Therefore, applying '${priceKey.toUpperCase()}' rates to ALL nights.`);

  const nights = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

  if (nights <= 0) {
    
      return; 
  }

  // Get the single daily rate based on the priceKey.
  let dailyRate = 0;
  dailyRate += suiteRooms * roomRates.suite[priceKey];
  dailyRate += execRooms * roomRates.executive[priceKey];
  dailyRate += stdRooms * roomRates.standard[priceKey];
  
  // Calculate the total base cost.
  const baseRoomCost = dailyRate * nights;
  
  console.log(`Total Nights: ${nights}`);
  console.log(`Rate per night (using ${priceKey} price): ₹${dailyRate}`);
  console.log(`Total Base Room Cost: ₹${baseRoomCost}`);

  let totalExtraGuests = 0;
  const roomTypes = [
    { rooms: suiteRooms, guests: suiteGuests, capacity: roomRates.suite.capacity },
    { rooms: execRooms, guests: execGuests, capacity: roomRates.executive.capacity },
    { rooms: stdRooms, guests: stdGuests, capacity: roomRates.standard.capacity }
  ];

  roomTypes.forEach((type) => {
    if (type.rooms > 0) {
        const allowedGuests = type.rooms * type.capacity;
        const extraGuests = Math.max(0, type.guests - allowedGuests);
        totalExtraGuests += extraGuests;
    }
  });

  const totalExtraCharges = totalExtraGuests * roomRates.extraPerson * nights;

  if (totalExtraGuests > 0) {
    alert(`⚠️ Extra guests detected!\nExtra guest charge of ₹${totalExtraCharges} (₹${roomRates.extraPerson} x ${totalExtraGuests} guests x ${nights} nights) will be added.`);
  }

  const totalAmount = baseRoomCost + totalExtraCharges;
  const advanceAmount = Math.round(totalAmount * 0.2);
  const remaining = totalAmount - advanceAmount;

  document.getElementById("totalAmount").innerText = totalAmount;
  document.getElementById("advanceAmount").innerText = advanceAmount;
  document.getElementById("payAtHotel").innerText = remaining;
  document.getElementById("priceDisplay").style.display = "block";
  
  const name = document.getElementById("name")?.value || "";
  const email = document.getElementById("email")?.value || "";
  const phone = document.getElementById("phone")?.value || "";

  const bookingInfo = {
    name, email, phone, checkin: checkinStr, checkout: checkoutStr,
    rooms: {
      suite: { count: suiteRooms, guests: suiteGuests },
      executive: { count: execRooms, guests: execGuests },
      standard: { count: stdRooms, guests: stdGuests }
    },
    extraGuests: totalExtraGuests, extraCharges: totalExtraCharges,
    totalAmount, advanceAmount, remainingAmount: remaining
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

document.addEventListener("DOMContentLoaded", displayClosedDates);

document.getElementById("checkPriceBtn").addEventListener("click", function(e) {
  calculatePrice(e);
});

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

    const roomInput = document.getElementById(`${value}Count`);
    const guestInput = document.getElementById(`${value}Guests`);

    if (roomInput) roomInput.value = "0";
    if (guestInput) guestInput.value = "";
  }
}

function getClosedDates() {
    return JSON.parse(localStorage.getItem("closedDates")) || [];
}

function blockClosedDates() {
    const checkInInput = document.getElementById("checkin");
    const checkOutInput = document.getElementById("checkout");

    const closedDates = getClosedDates();

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

document.addEventListener("DOMContentLoaded", function () {
    blockClosedDates();
});

document.addEventListener("DOMContentLoaded", () => {
  
  const selectedRoom = localStorage.getItem("selectedRoom");

  if (selectedRoom) {
    
    const checkbox = document.querySelector(`input[type="checkbox"][value="${selectedRoom}"]`);

    if (checkbox) {
      
      checkbox.checked = true;
      
      toggleRoomOptions(checkbox);
    }
    
    localStorage.removeItem("selectedRoom");
  }
});

