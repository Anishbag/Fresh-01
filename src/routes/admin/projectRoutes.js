import express from "express";

import protect from "../../middleware/authMiddleware.js";
import authorize from "../../middleware/roleMiddleware.js";

import {
  createProject,
  getProjects,
  getProject,
  updateProject,
  deleteProject,
  assignProject,
} from "../../controllers/admin/projectController.js";

const router = express.Router();

router.use(protect);
router.use(authorize("admin"));

router.post("/", createProject);

router.get("/", getProjects);

router.get("/:id", getProject);

router.put("/:id", updateProject);

router.delete("/:id", deleteProject);

router.put("/:id/assign", assignProject);

export default router;