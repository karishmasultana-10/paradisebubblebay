document.addEventListener("DOMContentLoaded", function () {
  const booking = JSON.parse(localStorage.getItem("bookingDetails"));

  if (!booking) {
    alert("No booking details found. Please complete the booking first.");
    window.location.href = "booking.html";
    return;
  }

  // Helper to format date
  function formatDate(dateStr) {
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-GB", options);
  }

  // User Info
  document.getElementById("name").innerText = booking.name;
  document.getElementById("email").innerText = booking.email;
  document.getElementById("phone").innerText = booking.phone;

  document.getElementById("checkin").innerText = formatDate(booking.checkin);
  document.getElementById("checkout").innerText = formatDate(booking.checkout);

  // Room & Guest Details
  document.getElementById("suiteRooms").innerText = booking.rooms?.suite?.count || 0;
  document.getElementById("suiteGuests").innerText = booking.rooms?.suite?.guests || 0;

  document.getElementById("execRooms").innerText = booking.rooms?.executive?.count || 0;
  document.getElementById("execGuests").innerText = booking.rooms?.executive?.guests || 0;

  document.getElementById("stdRooms").innerText = booking.rooms?.standard?.count || 0;
  document.getElementById("stdGuests").innerText = booking.rooms?.standard?.guests || 0;

  // Extra Guests
  if (booking.extraGuests && Number(booking.extraGuests) > 0) {
    document.getElementById("extraGuests").innerText = booking.extraGuests;
    document.getElementById("extraGuestsSection").style.display = "block";
  }

  // Price
  document.getElementById("totalAmount").innerText = booking.totalAmount;
  document.getElementById("advanceAmount").innerText = booking.advanceAmount;
  document.getElementById("payAtHotel").innerText = booking.remainingAmount;

  // Razorpay Payment
  document.getElementById("payNowBtn").addEventListener("click", function () {
    const options = {
      key: "YOUR_RAZORPAY_KEY", // Replace with your key
      amount: booking.advanceAmount * 100,
      currency: "INR",
      name: "Paradise Bubble Bay",
      description: "Advance Payment",
      handler: function (response) {
        alert("✅ Payment successful!\nPayment ID: " + response.razorpay_payment_id);
        // Optional redirect
        // window.location.href = "confirmation.html";
      },
      prefill: {
        name: booking.name,
        email: booking.email,
        contact: booking.phone
      },
      theme: {
        color: "#007BFF"
      }
    };

    const rzp = new Razorpay(options);
    rzp.open();
  });
});
