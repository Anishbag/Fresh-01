import express from "express";

import protect from "../../middleware/authMiddleware.js";

import {
  mySalarySlips,
  viewSalarySlip,
} from "../../controllers/employee/salaryController.js";

const router = express.Router();

router.use(protect);

router.get("/", mySalarySlips);

router.get("/:id", viewSalarySlip);

export default router;