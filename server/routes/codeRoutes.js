import express from "express";
import {
  createCode,
  updateCode,
  getCode,
  checkIdAvailability,
  deleteCode,
  getCodeStats,
} from "../controllers/codeController.js";

const router = express.Router();

// ✅ Routes
router.post("/", createCode);
router.put("/update", updateCode);
router.get("/check/:id", checkIdAvailability);
router.get("/stats/:id", getCodeStats); // Optional
router.get("/:id", getCode);
router.delete("/:id", deleteCode); // Optional

export default router;

