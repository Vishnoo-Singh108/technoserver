import mongoose from "mongoose";
import {removeFromWishlist , getWishlist , addToWishlist} from "../controller/wishlistController.js";
const wishlistSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "users", required: true },
  products: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: "products" },
      addedAt: { type: Date, default: Date.now }
    }
  ]
}, { timestamps: true });

const Wishlist = mongoose.model("wishlist", wishlistSchema);
export default Wishlist;
