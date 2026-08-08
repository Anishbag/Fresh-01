import express from "express";
import protect from "../../middleware/authMiddleware.js";

import {
  createTask, getMyTasks, getCreatedTasks, updateTask, getEmployeesForTask
} from "../../controllers/employee/taskController.js";

const router = express.Router();

router.use(protect);


router.post("/", createTask);

router.get("/my-tasks", getMyTasks);

router.get("/my-created", getCreatedTasks);

router.put("/:id", updateTask);

router.get("/employees", getEmployeesForTask);

export default router;