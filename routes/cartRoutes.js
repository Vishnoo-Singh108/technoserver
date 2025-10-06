import express from "express";
import { addToCart, getCart } from "../controller/cartController.js";

const router = express.Router();

// Add item to cart
router.post("/add", addToCart);

// Get cart of a user
router.get("/:userId", getCart);

export default router;
