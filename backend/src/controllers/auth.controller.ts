import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { prisma } from "../db/prisma";
import { loginSchema } from "../validators/auth.schema";
import { signAdminToken } from "../utils/jwt";
import { asyncHandler } from "../utils/asyncHandler";
import { HttpError } from "../middleware/errorHandler";
import { ADMIN_COOKIE_NAME } from "../middleware/auth";
import { isProd } from "../config/env";

const COOKIE_MAX_AGE_MS = 8 * 60 * 60 * 1000; // 8 horas

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = loginSchema.parse(req.body);

  const admin = await prisma.adminUser.findUnique({ where: { email } });
  // Mensaje genérico a propósito: no revelamos si falló el email o la
  // contraseña, para no facilitar enumeración de usuarios.
  if (!admin) throw new HttpError(401, "Credenciales inválidas");

  const valid = await bcrypt.compare(password, admin.passwordHash);
  if (!valid) throw new HttpError(401, "Credenciales inválidas");

  const token = signAdminToken({ sub: admin.id, email: admin.email });

  res.cookie(ADMIN_COOKIE_NAME, token, {
    httpOnly: true,
    secure: isProd,
    sameSite: "strict",
    maxAge: COOKIE_MAX_AGE_MS,
  });

  res.json({ id: admin.id, email: admin.email, name: admin.name });
});

export const logout = asyncHandler(async (_req: Request, res: Response) => {
  res.clearCookie(ADMIN_COOKIE_NAME);
  res.status(204).send();
});

export const me = asyncHandler(async (req: Request, res: Response) => {
  const admin = await prisma.adminUser.findUnique({ where: { id: req.admin!.id } });
  if (!admin) throw new HttpError(401, "No autenticado");
  res.json({ id: admin.id, email: admin.email, name: admin.name });
});
