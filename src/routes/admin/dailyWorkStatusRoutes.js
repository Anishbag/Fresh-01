import express from "express";
import protect from "../../middleware/authMiddleware.js";
import authorize from "../../middleware/roleMiddleware.js";

import {
  getDailyWorkReports,
} from "../../controllers/admin/dailyWorkStatusController.js";

const router = express.Router();

router.use(protect);
router.use(authorize("admin"));

router.get("/", getDailyWorkReports);

export default router;