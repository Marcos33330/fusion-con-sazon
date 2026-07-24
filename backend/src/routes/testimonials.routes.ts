import { Router } from "express";
import {
  createTestimonial,
  deleteTestimonial,
  listAllTestimonials,
  listTestimonials,
  updateTestimonial,
} from "../controllers/testimonials.controller";
import { requireAdmin } from "../middleware/auth";

const router = Router();

router.get("/", listTestimonials);
router.get("/all", requireAdmin, listAllTestimonials);
router.post("/", requireAdmin, createTestimonial);
router.put("/:id", requireAdmin, updateTestimonial);
router.delete("/:id", requireAdmin, deleteTestimonial);

export default router;
