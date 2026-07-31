import express from "express";
import protect from "../../middleware/authMiddleware.js";
import { getMyProjects } from "../../controllers/employee/projectController.js";

const router = express.Router();

router.use(protect);

router.get("/my-projects", getMyProjects);

export default router;