import express from "express";

import {
  createEmployee,
  getEmployees,
  getEmployeeById,
  updateEmployee,
  deleteEmployee,
} from "../../controllers/admin/employeeController.js";

import protect from "../../middleware/authMiddleware.js";
import authorize from "../../middleware/roleMiddleware.js";
import upload from "../../middleware/uploadMiddleware.js";

const router = express.Router();

router.post("/", protect, authorize("admin"), createEmployee);

router.get("/", protect, authorize("admin"), getEmployees);

router.get("/:id", protect, authorize("admin"), getEmployeeById);

router.put("/:id", protect, authorize("admin"),upload.single("profileImage"), updateEmployee);

router.delete("/:id", protect, authorize("admin"), deleteEmployee);

// router.post("/",protect,upload.single("profileImage"),createEmployee);

// router.put("/:id",protect,upload.single("profileImage"),updateEmployee);

router.post("/with-photo",protect,authorize("admin"),upload.single("profileImage"),createEmployee);

export default router;