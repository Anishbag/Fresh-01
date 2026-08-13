import express from "express";

import protect from "../../middleware/authMiddleware.js";
import authorize from "../../middleware/roleMiddleware.js";

import {getAllReimbursements,approveReimbursement,rejectReimbursement,} from "../../controllers/admin/reimbursementController.js";

const router = express.Router();

router.use(protect);
router.use(authorize("admin"));


router.get("/", getAllReimbursements);


router.put("/:id/approve", approveReimbursement);


router.put("/:id/reject", rejectReimbursement);

export default router;