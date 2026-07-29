import express from "express";

import protect from "../../middleware/authMiddleware.js";
import authorize from "../../middleware/roleMiddleware.js";

import {
  getAllLeaves,
  approveLeave,
  rejectLeave,
} from "../../controllers/admin/leaveController.js";

const router = express.Router();

router.use(protect);
router.use(authorize("admin"));

router.get("/", getAllLeaves);

router.put("/:id/approve", approveLeave);

router.put("/:id/reject", rejectLeave);

export default router;