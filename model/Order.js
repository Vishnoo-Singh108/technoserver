import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  items: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
      quantity: { type: Number, required: true },
      price: { type: Number, required: true }
    }
  ],
  name: { type: String },
  totalAmount: { type: Number, required: true },
  status: {
    type: String,
    enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
    default: "pending"
  },
  address: { type: String, required: true },
  paymentMethod: { type: String, enum: ["COD", "Card", "UPI" , "google-pay"], default: "COD" },
  paymentStatus: { type: String, enum: ["pending", "paid"], default: "pending" }
}, { timestamps: true });

const Order = mongoose.model("Order", orderSchema);
export default Order;
