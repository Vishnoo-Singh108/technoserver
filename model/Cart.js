import mongoose from "mongoose";
import { addToCart , getCart } from "../controller/cartController.js";

const cartSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "users", required: true },
  items: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: "products" },
      quantity: { type: Number, default: 1 },
      price: { type: Number, required: true } // snapshot of price at time of adding
    }
  ],
  totalAmount: { type: Number, default: 0 }
}, { timestamps: true });

const Cart = mongoose.model("cart", cartSchema);
export default Cart;
