import mongoose from "mongoose";
import Product from "./model/productModel.js"; 
import { products } from "./data/product.js";
import dotenv from "dotenv";
 // your exported products array

// Connect to MongoDB
const DB = "mongodb+srv://singhvishnoo0_db_user:Vishnoo123@cluster0.rqvalj3.mongodb.net/Mernpra1"; 
// replace with your DB URL
mongoose.connect(DB, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log(err));

const importProducts = async () => {
  try {
    // Optional: remove existing products first
    await Product.deleteMany();

    // Map your products array to match mongoose schema
    const formattedProducts = products.map(p => ({
      name: p.name,
      price: p.price,
      originalPrice: p.originalPrice,
      image: p.image,
      category: p.category,
      description: p.description,
      features: p.features,
      inStock: p.inStock,
      rating: p.rating,
      reviews: p.reviews,
    }));

    await Product.insertMany(formattedProducts);
    console.log("Products imported successfully!");
    process.exit();
  } catch (error) {
    console.error("Error importing products:", error);
    process.exit(1);
  }
};

importProducts();
