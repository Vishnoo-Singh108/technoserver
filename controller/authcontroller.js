import jwt from "jsonwebtoken";
import User from "../model/userModel.js";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import transporter from "../config/nodemailer.js";

dotenv.config();

// Email validation helper
const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

// Cookie options
const cookieConfig = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax", // changed from strict to lax for easier dev cross-origin
  maxAge: 24 * 60 * 60 * 1000, // 1 day
};

// ================= REGISTER =================
export const register = async (req, res) => {
  try {
    const { name, email, password, phone, latitude, longitude } = req.body;
    if (!name || !email || !password || !phone)
      return res.status(400).json({ success: false, message: "All fields are required" });

    if (!validateEmail(email))
      return res.status(400).json({ success: false, message: "Invalid email format" });

    const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
    if (existingUser)
      return res.status(400).json({ success: false, message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const user = new User({ name, email, password: hashedPassword, phone, latitude, longitude, verifyOtp: otp, isVerified: false });
    await user.save();

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Verify your email",
      text: `Your OTP for email verification is ${otp}`,
    });

    // JWT cookie
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });
    res.cookie("token", token, cookieConfig);

    res.status(201).json({
      success: true,
      message: "User registered successfully. Please verify your email.",
      user: { id: user._id, name: user.name, email: user.email, phone: user.phone },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ================= VERIFY EMAIL =================
export const verifyEmail = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ success: false, message: "User not found" });

    if (user.isVerified) return res.status(400).json({ success: false, message: "User already verified" });
    if (user.verifyOtp !== otp.toString()) return res.status(400).json({ success: false, message: "Invalid OTP" });

    user.isVerified = true;
    user.verifyOtp = null;
    await user.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });
    res.cookie("token", token, cookieConfig);

    res.status(200).json({
      success: true,
      message: "Email verified successfully. Logged in automatically.",
      user: { id: user._id, name: user.name, email: user.email, phone: user.phone },
    });

    await transporter.sendMail({
      from: `"Ecommerce Store" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Registration Successful",
      text: "Your account has been successfully created. Welcome!",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ================= LOGIN =================
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ success: false, message: "User not found" });

    if (!user.isVerified) return res.status(400).json({ success: false, message: "Please verify your email to login" });

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return res.status(400).json({ success: false, message: "Invalid password" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });
    res.cookie("token", token, cookieConfig);

    res.status(200).json({
      success: true,
      message: "Login successful",
      user: { id: user._id, name: user.name, email: user.email, phone: user.phone, isAdmin: user.isAdmin },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ================= LOGOUT =================
export const logout = (req, res) => {
  try {
    res.clearCookie("token", cookieConfig);
    res.status(200).json({ success: true, message: "Logout successful" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
