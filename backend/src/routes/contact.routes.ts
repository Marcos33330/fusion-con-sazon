import { Router } from "express";
import { getContact, updateContact } from "../controllers/contact.controller";
import { requireAdmin } from "../middleware/auth";

const router = Router();

router.get("/", getContact);
router.put("/", requireAdmin, updateContact);

export default router;
