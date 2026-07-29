import express from "express";
import protect from "../../middleware/authMiddleware.js";

import {
  saveDailyWork,
  getMyReports,
} from "../../controllers/employee/dailyWorkStatusController.js";

const router = express.Router();

router.use(protect);

router.post("/", saveDailyWork);

router.get("/", getMyReports);

export default router;