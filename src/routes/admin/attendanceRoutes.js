import express from "express";
import protect from "../../middleware/authMiddleware.js";
import authorize from "../../middleware/roleMiddleware.js";
import { getAllAttendance, adminOverrideAttendance } from "../../controllers/admin/attendanceController.js";

const router = express.Router();

router.use(protect);
router.use(authorize("admin"));

router.get("/", getAllAttendance);
router.put("/:id/override", adminOverrideAttendance);

export default router;