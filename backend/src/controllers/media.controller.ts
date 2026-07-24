import { Request, Response } from "express";
import { prisma } from "../db/prisma";
import { asyncHandler } from "../utils/asyncHandler";
import { HttpError } from "../middleware/errorHandler";
import { createMediaSchema, mediaPageEnum, updateMediaSchema } from "../validators/media.schema";
import { deleteFromCloudinary, uploadBufferToCloudinary } from "../utils/cloudinaryUpload";

// Público: lista media filtrable por página y, opcionalmente, categoría
// (usado en Catering: "Comida Venezolana" | "Comida Uruguaya" | "Comida Internacional").
export const listMedia = asyncHandler(async (req: Request, res: Response) => {
  const page = mediaPageEnum.parse(req.query.page);
  const category = typeof req.query.category === "string" ? req.query.category : undefined;

  const items = await prisma.mediaItem.findMany({
    where: { page, ...(category ? { category } : {}) },
    orderBy: { order: "asc" },
  });

  res.json(items);
});

// Admin: sube un archivo nuevo a Cloudinary y crea el registro en la DB.
export const createMedia = asyncHandler(async (req: Request, res: Response) => {
  if (!req.file) throw new HttpError(400, "Falta el archivo");

  const data = createMediaSchema.parse(req.body);
  const folder = `fusion-con-sazon/${data.page.toLowerCase()}`;
  const uploadResult = await uploadBufferToCloudinary(req.file.buffer, folder);

  const item = await prisma.mediaItem.create({
    data: {
      page: data.page,
      category: data.category,
      title: data.title,
      order: data.order,
      type: uploadResult.resource_type === "video" ? "VIDEO" : "IMAGE",
      url: uploadResult.secure_url,
      cloudinaryPublicId: uploadResult.public_id,
    },
  });

  res.status(201).json(item);
});

// Admin: reemplaza el archivo de un item existente (sube el nuevo, borra
// el viejo de Cloudinary, actualiza la URL) y/o edita sus metadatos.
export const updateMedia = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const existing = await prisma.mediaItem.findUnique({ where: { id } });
  if (!existing) throw new HttpError(404, "No encontrado");

  const data = updateMediaSchema.parse(req.body);

  let mediaFields = {};
  if (req.file) {
    const folder = `fusion-con-sazon/${existing.page.toLowerCase()}`;
    const uploadResult = await uploadBufferToCloudinary(req.file.buffer, folder);
    // Si el item fue precargado con una URL externa (contenido semilla del
    // sitio original) no tiene publicId de Cloudinary que borrar.
    if (existing.cloudinaryPublicId) {
      await deleteFromCloudinary(
        existing.cloudinaryPublicId,
        existing.type === "VIDEO" ? "video" : "image"
      );
    }
    mediaFields = {
      url: uploadResult.secure_url,
      cloudinaryPublicId: uploadResult.public_id,
      type: uploadResult.resource_type === "video" ? "VIDEO" : "IMAGE",
    };
  }

  const updated = await prisma.mediaItem.update({
    where: { id },
    data: { ...data, ...mediaFields },
  });

  res.json(updated);
});

export const deleteMedia = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const existing = await prisma.mediaItem.findUnique({ where: { id } });
  if (!existing) throw new HttpError(404, "No encontrado");

  if (existing.cloudinaryPublicId) {
    await deleteFromCloudinary(existing.cloudinaryPublicId, existing.type === "VIDEO" ? "video" : "image");
  }
  await prisma.mediaItem.delete({ where: { id } });

  res.status(204).send();
});
