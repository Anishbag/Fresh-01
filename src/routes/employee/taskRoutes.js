import express from "express";
import protect from "../../middleware/authMiddleware.js";

import {
  createTask, getMyTasks, getCreatedTasks
} from "../../controllers/employee/taskController.js";

const router = express.Router();

router.use(protect);

// Employee Assign Task
router.post("/", createTask);

router.get("/my-tasks", getMyTasks);

router.get("/my-created", getCreatedTasks);

export default router;