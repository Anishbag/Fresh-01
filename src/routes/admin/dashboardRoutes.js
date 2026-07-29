import express from "express";

import protect from "../../middleware/authMiddleware.js";
import authorize from "../../middleware/roleMiddleware.js";

import {
  adminDashboard,
} from "../../controllers/admin/dashboardController.js";

const router = express.Router();

router.use(protect);
router.use(authorize("admin"));

router.get("/", adminDashboard);

export default router;