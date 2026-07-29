import express from "express";

import protect from "../../middleware/authMiddleware.js";
import authorize from "../../middleware/roleMiddleware.js";

import {
  getAllWFHRequests,
  approveWFH,
  rejectWFH,
} from "../../controllers/admin/wfhController.js";

const router = express.Router();

router.use(protect);
router.use(authorize("admin"));

router.get("/", getAllWFHRequests);

router.put("/:id/approve", approveWFH);

router.put("/:id/reject", rejectWFH);

export default router;