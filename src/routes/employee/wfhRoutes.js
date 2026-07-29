import express from "express";
import protect from "../../middleware/authMiddleware.js";

import {
  applyWFH,
  myWFHHistory,
} from "../../controllers/employee/wfhController.js";

const router = express.Router();

router.use(protect);

router.post("/", applyWFH);

router.get("/", myWFHHistory);

export default router;