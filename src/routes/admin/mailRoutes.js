import express from "express";
import protect from "../../middleware/authMiddleware.js";
import upload from "../../middleware/mailUpload.js";

import {
  sendMail,
  getMailHistory,
} from "../../controllers/admin/mailController.js";

const router = express.Router();

router.use(protect);

router.post("/", upload.single("attachment"), sendMail);

router.get("/", getMailHistory);

export default router;