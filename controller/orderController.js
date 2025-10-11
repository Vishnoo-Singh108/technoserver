import Order from "../model/Order.js";
import Product from "../model/productModel.js";
import User from "../model/userModel.js";
import Cart from "../model/Cart.js";
import nodemailer from "nodemailer";
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

// Configure transporter (Brevo SMTP)
const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Place an order
export const placeOrder = async (req, res) => {
  console.log("Request body:", req.body);
  try {
    const { userId, items, address, paymentMethod } = req.body;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ success: false, message: "Invalid user ID format" });
    }

    if (!userId || !address) {
      return res.status(400).json({ success: false, message: "User ID and address are required" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    // Fetch items from DB cart if not provided
    let cartItems = items;
    if (!items || !items.length) {
      const cart = await Cart.findOne({ user: userId }).populate("items.productId");
      if (!cart || !cart.items.length) {
        return res.status(400).json({ success: false, message: "Cart is empty" });
      }
      cartItems = cart.items.map(item => ({
        productId: item.product._id,
        quantity: item.quantity,
        price: item.price,
      }));
    }

    let totalAmount = 0;
    const validatedItems = [];

    for (const it of cartItems) {
      const product = await Product.findById(it.productId);
      if (!product) return res.status(404).json({ success: false, message: `Product not found: ${it.productId}` });

      validatedItems.push({
        productId: product._id,
        quantity: it.quantity,
        price: product.price,
      });

      totalAmount += product.price * it.quantity;
    }

    const order = new Order({
      user: user._id,
      items: validatedItems,
      totalAmount,
      address,
      paymentMethod: paymentMethod || "COD",
      status: "pending",
      paymentStatus: "pending",
    });

    await order.save();

    // Clear user cart
    await Cart.findOneAndUpdate({ user: userId }, { items: [], totalAmount: 0 });

    // Prepare items list for email
    const itemsList = validatedItems.map(i => `${i.quantity} x ${i.productId} @ ₹${i.price}`).join("\n");

    // Send email to user
    try {
      await transporter.sendMail({
        from: `"TechStore" <${process.env.SMTP_USER}>`,
        to: user.email,
        subject: "Order Confirmation - TechStore",
        text: `Hello ${user.firstName} ${user.lastName},\n\nThank you for your order!\n\nOrder Details:\n${itemsList}\nTotal: ₹${totalAmount}\n\nDelivery Address:\n${address}\n\nWe’ll notify you once it’s shipped.\n\nBest regards,\nEcommerce Team`,
      });
    } catch (err) {
      console.error("Error sending email to user:", err);
    }

    // Send email to admin
    try {
      await transporter.sendMail({
        from: `"TechStore" <${process.env.SMTP_USER}>`,
        to: process.env.ADMIN_EMAIL,
        subject: "New Order Received",
        text: `New Order Received!\n\nUser: ${user.firstName} ${user.lastName} (${user.email})\n\nOrder Details:\n${itemsList}\nTotal: ₹${totalAmount}\n\nDelivery Address:\n${address}`,
      });
    } catch (err) {
      console.error("Error sending email to admin:", err);
    }

    res.status(201).json({ success: true, message: "Order placed successfully", order });

  } catch (error) {
    console.error("PlaceOrder error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get orders of a user
export const getUserOrders = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ success: false, message: "Invalid user ID" });
    }

    const orders = await Order.find({ user: userId }).populate("items.productId");
    res.status(200).json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update order status (Admin)
export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId, status, paymentStatus } = req.body;
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });

    if (status) order.status = status;
    if (paymentStatus) order.paymentStatus = paymentStatus;

    await order.save();
    res.status(200).json({ success: true, message: "Order updated successfully", order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
