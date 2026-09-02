import express from "express";
import { getTodayHoliday } from "../../controllers/employee/holidayController.js";
import protect from "../../middleware/authMiddleware.js";

const router = express.Router();

router.get("/today", protect, getTodayHoliday);

export default router;