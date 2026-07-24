import { z } from "zod";

export const updateContentSchema = z.object({
  title: z.string().max(200).optional(),
  body: z.string().min(1).max(20000),
});
