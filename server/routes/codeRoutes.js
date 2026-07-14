import express from "express";
import {
  getCode,
  updateCode,
  deleteCode,
  getCodeStats,
} from "../controllers/codeController.js";
import { createLimiter } from "../middleware/rateLimiter.js";

const router = express.Router();

router.get("/:id/stats", getCodeStats);
router.get("/:id", getCode);
router.put("/:id", createLimiter, updateCode);
router.delete("/:id", deleteCode);

export default router;
