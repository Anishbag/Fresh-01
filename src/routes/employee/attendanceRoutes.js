import express from "express";

import {
  checkIn,
  checkOut,
  attendanceHistory,
} from "../../controllers/employee/attendanceController.js";

import protect from "../../middleware/authMiddleware.js";

const router = express.Router();

router.post("/check-in", protect, checkIn);

router.post("/check-out", protect, checkOut);

router.get("/history", protect, attendanceHistory);

export default router;