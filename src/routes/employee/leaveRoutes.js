import express from "express";

import protect from "../../middleware/authMiddleware.js";

import {
  applyLeave,
  myLeaveHistory,
} from "../../controllers/employee/leaveController.js";

const router = express.Router();

router.use(protect);

router.post("/", applyLeave);

router.get("/", myLeaveHistory);

export default router;