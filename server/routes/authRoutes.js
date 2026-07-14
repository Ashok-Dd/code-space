import express from "express";
import { signupHandler, loginHandler, logoutHandler, meHandler } from "../controllers/authController.js";
import { optionalAuth, requireAuth } from "../middleware/auth.js";
import { loginLimiter } from "../middleware/rateLimiter.js";

const router = express.Router();

router.post("/signup", loginLimiter, signupHandler);
router.post("/login", loginLimiter, loginHandler);
router.post("/logout", logoutHandler);
router.get("/me", optionalAuth, requireAuth, meHandler);

export default router;
