// import express from "express";

// import protect from "../../middleware/authMiddleware.js";
// import authorize from "../../middleware/roleMiddleware.js";

// import {
//   getSalaryConfigurations,
//   saveSalaryConfigurations,
  
//   deleteSalaryConfiguration,
// } from "../../controllers/admin/salaryConfigController.js";

// import {
//   generateSalary,
//   generateSingleSalary,
//   getSalarySlips,
//   getSalarySlip,
//   exportSalary,
// } from "../../controllers/admin/salaryController.js";

// const router = express.Router();

// router.use(protect);
// router.use(authorize("admin"));

// router.get("/config", getSalaryConfigurations);

// // router.post("/config", createSalaryConfiguration);

// // router.put("/config/:id", updateSalaryConfiguration);


// router.post("/config", saveSalaryConfigurations);

// router.delete("/config/:id", deleteSalaryConfiguration);




// /* Salary Slip */
// router.post("/generate", generateSalary);
// router.get("/", getSalarySlips);
// router.get("/export", exportSalary);
// router.get("/:id", getSalarySlip);


// router.post("/generate/:employeeId", generateSingleSalary);
// export default router;



import express from "express";

import protect from "../../middleware/authMiddleware.js";
import authorize from "../../middleware/roleMiddleware.js";

import {
  getSalaryConfigurations,
  saveSalaryConfigurations,
  deleteSalaryConfiguration,
} from "../../controllers/admin/salaryConfigController.js";

import {
  generateSalary,
  generateSingleSalary,
  getSalarySlips,
  getSalarySlip,
  exportSalary,
} from "../../controllers/admin/salaryController.js";

const router = express.Router();

router.use(protect);
router.use(authorize("admin"));

// Salary Configuration
router.get("/config", getSalaryConfigurations);
router.post("/config", saveSalaryConfigurations);
router.delete("/config/:id", deleteSalaryConfiguration);

// Salary
router.post("/generate", generateSalary); // Generate All
router.post("/generate/:employeeId", generateSingleSalary); // Generate Single

router.get("/", getSalarySlips);
router.get("/export", exportSalary);
router.get("/:id", getSalarySlip);

export default router;