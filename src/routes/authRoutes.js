import express from "express";
import {loginUser,forgotPassword,verifyResetOtp,resetPassword,} from "../controllers/authController.js";

const router = express.Router();

router.post("/login", loginUser);

router.post("/forgot-password", forgotPassword);

router.post("/verify-reset-otp", verifyResetOtp);

router.post("/reset-password", resetPassword);

export default router;