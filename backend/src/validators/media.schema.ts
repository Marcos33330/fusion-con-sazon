import { z } from "zod";

export const mediaPageEnum = z.enum([
  "HOME",
  "NOSOTROS",
  "TORTAS",
  "CATERING",
  "EVENTOS_FOTOS",
  "EVENTOS_VIDEOS",
]);

export const createMediaSchema = z.object({
  page: mediaPageEnum,
  category: z.string().max(100).optional(),
  title: z.string().max(200).optional(),
  order: z.coerce.number().int().default(0),
});

export const updateMediaSchema = z.object({
  category: z.string().max(100).optional(),
  title: z.string().max(200).optional(),
  order: z.coerce.number().int().optional(),
});
