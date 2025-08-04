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

function toggleRoomOptions(checkbox) {
  const value = checkbox.value;
  const optionsDiv = document.getElementById(`${value}Options`);
  optionsDiv.style.display = checkbox.checked ? "block" : "none";
}

function calculatePrice(event) {
  // Prevent form from submitting
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

  if (suiteRooms + execRooms + stdRooms === 0 || suiteGuests + execGuests + stdGuests === 0) {
    alert("❗ Please select at least one room and enter the number of guests.");
    return;
  }

  let totalAmount = 0;
  let currentDate = new Date(start);
  while (currentDate < end) {
    const dayKey = isWeekend(currentDate) ? "weekend" : "weekday";
    totalAmount += suiteRooms * roomRates.suite[dayKey];
    totalAmount += execRooms * roomRates.executive[dayKey];
    totalAmount += stdRooms * roomRates.standard[dayKey];
    currentDate.setDate(currentDate.getDate() + 1);
  }

  const totalGuests = suiteGuests + execGuests + stdGuests;
  const allowedGuests = 
    suiteRooms * roomRates.suite.capacity + 
    execRooms * roomRates.executive.capacity + 
    stdRooms * roomRates.standard.capacity;

  let extraGuests = 0;
  if (totalGuests > allowedGuests) {
    extraGuests = totalGuests - allowedGuests;
    alert(`⚠️ Guest limit exceeded!
You selected rooms for ${allowedGuests} guests, but entered ${totalGuests} guests.
Extra guest charge (₹${roomRates.extraPerson} x ${extraGuests}) will be added.`);
    totalAmount += extraGuests * roomRates.extraPerson;
  }

  const advanceAmount = Math.round(totalAmount * 0.2);
  const remaining = totalAmount - advanceAmount;

  document.getElementById("totalAmount").innerText = totalAmount;
  document.getElementById("advanceAmount").innerText = advanceAmount;
  document.getElementById("payAtHotel").innerText = remaining;
  document.getElementById("priceDisplay").style.display = "block";
  document.getElementById("proceedToPaymentBtn").style.display = "inline-block";
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
