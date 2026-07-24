import { Router } from "express";
import { login, logout, me } from "../controllers/auth.controller";
import { requireAdmin } from "../middleware/auth";
import { loginRateLimiter } from "../middleware/rateLimiters";

const router = Router();

router.post("/login", loginRateLimiter, login);
router.post("/logout", logout);
router.get("/me", requireAdmin, me);

export default router;
