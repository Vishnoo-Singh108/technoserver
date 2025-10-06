import mongoose from "mongoose";
import Product from "./model/productModel.js";
import 'dotenv/config';

const DB = process.env.MONGODB_URL;

if (!DB) {
  console.error("MONGODB_URL not defined in .env");
  process.exit(1);
}

mongoose.connect(DB, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log("MongoDB connected"))
  .catch(err => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });

const updateImagePaths = async () => {
  try {
    const products = await Product.find({});

    for (const product of products) {
      if (product.image && !product.image.startsWith("http")) {
        product.image = `http://localhost:5000/public/${product.image}`;
        await product.save();
        console.log(`Updated image for ${product.name}`);
      }
    }

    console.log("All local image paths updated!");
    process.exit(0);
  } catch (err) {
    console.error("Error updating image paths:", err);
    process.exit(1);
  }
};

updateImagePaths();
