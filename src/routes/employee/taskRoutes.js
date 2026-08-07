import express from "express";
import protect from "../../middleware/authMiddleware.js";

import {
  createTask, getMyTasks
} from "../../controllers/employee/taskController.js";

const router = express.Router();

router.use(protect);

// Employee Assign Task
router.post("/", createTask);

router.get("/my-tasks", getMyTasks);

export default router;