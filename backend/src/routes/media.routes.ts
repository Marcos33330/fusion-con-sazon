import { Router } from "express";
import { createMedia, deleteMedia, listMedia, updateMedia } from "../controllers/media.controller";
import { requireAdmin } from "../middleware/auth";
import { upload } from "../middleware/upload";
import { uploadRateLimiter } from "../middleware/rateLimiters";

const router = Router();

router.get("/", listMedia);
router.post("/", requireAdmin, uploadRateLimiter, upload.single("file"), createMedia);
router.put("/:id", requireAdmin, uploadRateLimiter, upload.single("file"), updateMedia);
router.delete("/:id", requireAdmin, deleteMedia);

export default router;
