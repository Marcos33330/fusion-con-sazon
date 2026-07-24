import { Request, Response } from "express";
import { prisma } from "../db/prisma";
import { asyncHandler } from "../utils/asyncHandler";
import { updateContactSchema } from "../validators/contact.schema";

const SINGLETON_ID = "contact-info-singleton";

export const getContact = asyncHandler(async (_req: Request, res: Response) => {
  const info = await prisma.contactInfo.findUnique({ where: { id: SINGLETON_ID } });
  res.json(info);
});

export const updateContact = asyncHandler(async (req: Request, res: Response) => {
  const data = updateContactSchema.parse(req.body);
  const info = await prisma.contactInfo.upsert({
    where: { id: SINGLETON_ID },
    update: data,
    create: { id: SINGLETON_ID, ...data },
  });
  res.json(info);
});
