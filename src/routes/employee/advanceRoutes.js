import express from "express";

import protect from "../../middleware/authMiddleware.js";

import {requestAdvance,getMyAdvances,} from "../../controllers/employee/advanceController.js";

const router = express.Router();

router.use(protect);

router.post("/", requestAdvance);

router.get("/", getMyAdvances);

export default router;