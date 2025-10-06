import express from "express";
import {
  addToWishlist,
  getWishlist,
  removeFromWishlist
} from "../controller/wishlistController.js";

const wishlistRoutes = express.Router();

// Add product to wishlist
wishlistRoutes.post("/add", addToWishlist);

// Get user's wishlist
wishlistRoutes.get("/:userId", getWishlist);

// Remove product from wishlist
wishlistRoutes.delete("/remove", removeFromWishlist);

export default wishlistRoutes;
