import express from "express";
import {
  placeOrder,
  getUserOrders,
  updateOrderStatus
} from "../controller/orderController.js";

const orderRoutes = express.Router();

orderRoutes.post("/", placeOrder);               // Place order
orderRoutes.get("/user/:userId", getUserOrders); // Get orders of a user
orderRoutes.put("/:orderId/status", updateOrderStatus); // Update order status


export default orderRoutes;
