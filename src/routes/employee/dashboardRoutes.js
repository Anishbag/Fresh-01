import express from "express";

import protect from "../../middleware/authMiddleware.js";

import {
  employeeDashboard,
} from "../../controllers/employee/dashboardController.js";

const router = express.Router();

router.use(protect);

router.get("/", employeeDashboard);

export default router;