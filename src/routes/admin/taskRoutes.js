import express from "express";

import protect from "../../middleware/authMiddleware.js";
import authorize from "../../middleware/roleMiddleware.js";

import {getAllEmployeeTasks,} from "../../controllers/admin/taskController.js";

const router = express.Router();

router.use(protect);
router.use(authorize("admin"));

router.get("/", getAllEmployeeTasks);

export default router;