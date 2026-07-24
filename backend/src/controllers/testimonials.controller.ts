import { Request, Response } from "express";
import { prisma } from "../db/prisma";
import { asyncHandler } from "../utils/asyncHandler";
import { HttpError } from "../middleware/errorHandler";
import { createTestimonialSchema, updateTestimonialSchema } from "../validators/testimonial.schema";

export const listTestimonials = asyncHandler(async (_req: Request, res: Response) => {
  const items = await prisma.testimonial.findMany({
    where: { published: true },
    orderBy: { order: "asc" },
  });
  res.json(items);
});

// Admin: incluye también los no publicados, para poder gestionarlos.
export const listAllTestimonials = asyncHandler(async (_req: Request, res: Response) => {
  const items = await prisma.testimonial.findMany({ orderBy: { order: "asc" } });
  res.json(items);
});

export const createTestimonial = asyncHandler(async (req: Request, res: Response) => {
  const data = createTestimonialSchema.parse(req.body);
  const item = await prisma.testimonial.create({ data });
  res.status(201).json(item);
});

export const updateTestimonial = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const data = updateTestimonialSchema.parse(req.body);
  const existing = await prisma.testimonial.findUnique({ where: { id } });
  if (!existing) throw new HttpError(404, "No encontrado");
  const item = await prisma.testimonial.update({ where: { id }, data });
  res.json(item);
});

export const deleteTestimonial = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const existing = await prisma.testimonial.findUnique({ where: { id } });
  if (!existing) throw new HttpError(404, "No encontrado");
  await prisma.testimonial.delete({ where: { id } });
  res.status(204).send();
});
