import express from "express";

import protect from "../../middleware/authMiddleware.js";

import {requestReimbursement,getMyReimbursements,} from "../../controllers/employee/reimbursementController.js";

const router = express.Router();

router.use(protect);

router.post("/", requestReimbursement);

router.get("/", getMyReimbursements);

export default router;