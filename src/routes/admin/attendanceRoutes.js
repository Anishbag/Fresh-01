import express from "express";
import protect from "../../middleware/authMiddleware.js";
import { getAllAttendance } from "../../controllers/admin/attendanceController.js";

const router = express.Router();

router.use(protect);

router.get("/", getAllAttendance);

export default router;