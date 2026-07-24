import { z } from "zod";

export const createTestimonialSchema = z.object({
  author: z.string().min(1).max(120),
  text: z.string().min(1).max(2000),
  published: z.boolean().default(true),
  order: z.number().int().default(0),
});

export const updateTestimonialSchema = createTestimonialSchema.partial();
