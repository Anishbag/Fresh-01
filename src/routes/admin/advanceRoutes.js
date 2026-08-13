import express from "express";

import protect from "../../middleware/authMiddleware.js";
import authorize from "../../middleware/roleMiddleware.js";

import {getAllAdvances,approveAdvance,rejectAdvance,} from "../../controllers/admin/advanceController.js";

const router = express.Router();

router.use(protect);
router.use(authorize("admin"));


router.get("/", getAllAdvances);


router.put("/:id/approve", approveAdvance);


router.put("/:id/reject", rejectAdvance);

export default router;