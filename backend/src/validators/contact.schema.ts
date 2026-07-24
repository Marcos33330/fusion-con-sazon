import { z } from "zod";

export const updateContactSchema = z.object({
  phone: z.string().min(1).max(40),
  whatsapp: z.string().min(1).max(40),
  address: z.string().min(1).max(200),
  facebookUrl: z.string().url().optional().or(z.literal("")),
  instagramUrl: z.string().url().optional().or(z.literal("")),
});
