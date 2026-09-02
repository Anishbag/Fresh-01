import express from "express";

import protect from "../../middleware/authMiddleware.js";
import authorize from "../../middleware/roleMiddleware.js";

import {
  createHoliday,
  getHolidays,
  deleteHoliday,
} from "../../controllers/admin/holidayController.js";

const router = express.Router();

router.use(protect);
router.use(authorize("admin"));

router.get("/", getHolidays);

router.post("/", createHoliday);

router.delete("/:id", deleteHoliday);

export default router;