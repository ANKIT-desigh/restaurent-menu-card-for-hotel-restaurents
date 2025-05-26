$(document).ready(function () {
    // Add smooth scrolling to all links
    $("a").on("click", function (event) {
        // Make sure this.hash has a value before overriding default behavior
        if (this.hash !== "") {
            // Prevent default anchor click behavior
            event.preventDefault();
            // Store hash
            var hash = this.hash;
            // Using jQuery's animate() method to add smooth page scroll
            // The optional number (800) specifies the number of milliseconds it takes to scroll to the specified area
            $("html, body").animate(
                {
                    scrollTop: $(hash).offset().top,
                },
                800,
                function () {
                    // Add hash (#) to URL when done scrolling (default click behavior)
                    window.location.hash = hash;
                }
            );
        } // End if
    });
});




document.querySelectorAll(".order-btn").forEach((button) => {
    button.addEventListener("click", () => {
        const foodItem = button.closest(".food-menu-item");
        const itemName = foodItem.querySelector(".food-titile").textContent;
        const price = parseInt(foodItem.querySelector(".food-price").textContent.match(/\d+/)[0]);

        const customerName = prompt("Enter your name:");
        if (!customerName) return;

        const email = prompt("Enter your email for order confirmation:");
        if (!email) return;

        const tableNumber = prompt("Enter your table number (1-8):");
        if (!tableNumber) return;

        // Save order in localStorage
        localStorage.setItem("orderDetails", JSON.stringify({
            itemName,
            customerName,
            email,
            tableNumber,
            price
        }));

        alert("Order placed! Proceed to payment section.");
        window.location.href = "#payment";
    });
});

document.getElementById("payButton").addEventListener("click", () => {
    const order = JSON.parse(localStorage.getItem("orderDetails"));
    if (!order) {
        alert("Please select a menu item first.");
        return;
    }

    // Example: you could integrate Stripe here
    alert(`Proceeding to payment for:
    ${order.itemName} - ₹${order.price}
    Name: ${order.customerName}
    Email: ${order.email}
    Table: ${order.tableNumber}`);

    // Here, redirect to Stripe payment (fake or real)
    // Simulate payment
    setTimeout(() => {
        alert("Payment successful! Enjoy your meal 😋");
        localStorage.removeItem("orderDetails");
    }, 1000);
});
