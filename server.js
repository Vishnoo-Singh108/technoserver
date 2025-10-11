import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './config/mongodb.js';
import authRouter from './routes/authroutes.js';
import wishlistRoutes from './routes/wishlistRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import productRoutes from "./routes/productRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import transporter from './config/nodemailer.js';





// Setup __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const Port = process.env.PORT || 5000;

app.use(express.json());
app.use(cookieParser());

// Fix CORS
app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true
}));


// Serve static files from backend/public
app.use('/images', express.static(path.join(__dirname, 'public')));

connectDB();

app.get('/', (req, res) => {
    res.send('Hello from server');
});

app.use('/api/auth', authRouter);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/orders', orderRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.listen(Port, () => {
    console.log(`Server is running on port ${Port}`);
});
