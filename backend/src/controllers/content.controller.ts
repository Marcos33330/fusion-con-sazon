import { Request, Response } from "express";
import { ContentBlock } from "@prisma/client";
import { prisma } from "../db/prisma";
import { updateContentSchema } from "../validators/content.schema";
import { asyncHandler } from "../utils/asyncHandler";

// Público: devuelve todos los bloques de texto como un diccionario
// { key: { title, body } } para que el frontend los consuma fácil.
export const listContent = asyncHandler(async (_req: Request, res: Response) => {
  const blocks = await prisma.contentBlock.findMany();
  const dict = Object.fromEntries(
    blocks.map((b: ContentBlock) => [b.key, { title: b.title, body: b.body }])
  );
  res.json(dict);
});

// Admin: crea o actualiza un bloque (upsert) para no tener que precrear
// todas las keys de antemano.
export const upsertContent = asyncHandler(async (req: Request, res: Response) => {
  const { key } = req.params;
  const data = updateContentSchema.parse(req.body);

  const block = await prisma.contentBlock.upsert({
    where: { key },
    update: data,
    create: { key, ...data },
  });

  res.json(block);
});
