import express from "express";
import {
  getCode,
  updateCode,
  deleteCode,
  getCodeStats,
  getMySnippets,
} from "../controllers/codeController.js";
import { createLimiter } from "../middleware/rateLimiter.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

// Must come before "/:id" — otherwise "mine" would be treated as a room id.
router.get("/mine", requireAuth, getMySnippets);

router.get("/:id/stats", getCodeStats);
router.get("/:id", getCode);
router.put("/:id", createLimiter, updateCode);
router.delete("/:id", deleteCode);

export default router;
