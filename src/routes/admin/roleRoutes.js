import express from "express";
import protect from "../../middleware/authMiddleware.js";
import authorize from "../../middleware/roleMiddleware.js";

import {
  createRole,
  getRoles,
  updateRole,
  deleteRole,
} from "../../controllers/admin/roleController.js";

const router = express.Router();

router.use(protect);
router.use(authorize("admin"));

router.post("/", createRole);
router.get("/", getRoles);
router.put("/:id", updateRole);
router.delete("/:id", deleteRole);

export default router;