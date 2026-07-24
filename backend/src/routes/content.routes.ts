import { Router } from "express";
import { listContent, upsertContent } from "../controllers/content.controller";
import { requireAdmin } from "../middleware/auth";

const router = Router();

router.get("/", listContent);
router.put("/:key", requireAdmin, upsertContent);

export default router;
