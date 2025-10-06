import express from "express"
import { register, login, logout, verifyEmail } from "../controller/authcontroller.js"

const authRouter = express.Router();

authRouter.post("/register", register)
authRouter.post("/login", login)

authRouter.post("/logout", logout)
authRouter.post("/verify-email", verifyEmail);


export default authRouter;
