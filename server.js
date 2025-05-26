const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const nodemailer = require("nodemailer");
const Razorpay = require("razorpay");
const Stripe = require("stripe");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

// ✅ Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("✅ Connected to MongoDB"))
.catch((err) => console.error("❌ MongoDB connection error:", err));

// ✅ Define Order Schema
const orderSchema = new mongoose.Schema({
  itemId: Number,
  itemName: String,
  customerName: String,
  email: String,
  price: Number,
  orderDate: { type: Date, default: Date.now },
  paymentStatus: { type: String, default: "pending" },
});

const Order = mongoose.model("Order", orderSchema);

// ✅ Razorpay Setup
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ✅ Nodemailer Setup
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ✅ Stripe Setup
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

// ✅ Create Razorpay Order
app.post("/create-razorpay-order", async (req, res) => {
  const { amount, currency } = req.body;

  try {
    const options = {
      amount: amount, // already in paise
      currency,
      payment_capture: 1,
    };

    const order = await razorpay.orders.create(options);
    res.json({ orderId: order.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ✅ Create Stripe Payment Intent
app.post("/create-payment-intent", async (req, res) => {
  const { itemId, itemName, customerName, email, price } = req.body;

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: price * 100,
      currency: "INR",
      payment_method_types: ["card"],
      receipt_email: email,
    });

    const newOrder = new Order({
      itemId,
      itemName,
      customerName,
      email,
      price,
      paymentStatus: "pending",
    });

    await newOrder.save();
    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ✅ Confirm Stripe Payment & Send Email
app.post("/confirm-payment", async (req, res) => {
  const { paymentIntentId } = req.body;

  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status === "succeeded") {
      await Order.findOneAndUpdate(
        { email: paymentIntent.receipt_email },
        { paymentStatus: "Paid" }
      );

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: paymentIntent.receipt_email,
        subject: "Payment Confirmation",
        html: `<h2>Payment Successful!</h2>
               <p>Thank you for your order.</p>
               <p>Amount Paid: ₹${paymentIntent.amount / 100}</p>`,
      };

      transporter.sendMail(mailOptions);
      res.json({ message: "Payment confirmed and email sent!" });
    } else {
      res.status(400).json({ error: "Payment failed" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ✅ Start Server
app.listen(3000, () => console.log("✅ Server running on http://localhost:3000"));
