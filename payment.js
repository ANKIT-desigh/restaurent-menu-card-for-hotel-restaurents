document.getElementById("payButton").addEventListener("click", async () => {
    const order = JSON.parse(localStorage.getItem("orderDetails"));
    if (!order) {
        alert("Please place an order first!");
        return;
    }

    const amountInPaise = order.price * 100;

    const response = await fetch("http://localhost:3000/create-razorpay-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: amountInPaise, currency: "INR" })
    });

    const { orderId } = await response.json();

    const options = {
        key: "your_razorpay_key", // Replace this with your actual Razorpay key
        amount: amountInPaise,
        currency: "INR",
        name: "Restaurant",
        description: `${order.itemName} for Table ${order.tableNumber}`,
        order_id: orderId,
        handler: function (response) {
            alert(`✅ Payment successful!\nPayment ID: ${response.razorpay_payment_id}`);
            localStorage.removeItem("orderDetails");
        },
        prefill: {
            name: order.customerName,
            email: order.email,
            contact: "9999999999", // Optional: Ask for phone number during order
        },
        theme: { color: "#16a083" },
    };

    const rzp = new Razorpay(options);
    rzp.open();
});
