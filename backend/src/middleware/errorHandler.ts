import { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { isProd } from "../config/env";

export class HttpError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

// Middleware central de errores: nunca filtra stack traces ni detalles
// internos al cliente en producción.
export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ZodError) {
    return res.status(400).json({ error: "Datos inválidos", details: err.flatten() });
  }

  if (err instanceof HttpError) {
    return res.status(err.status).json({ error: err.message });
  }

  console.error(err);
  return res.status(500).json({
    error: "Error interno del servidor",
    ...(isProd ? {} : { detail: err instanceof Error ? err.message : String(err) }),
  });
}

export function notFoundHandler(_req: Request, res: Response) {
  res.status(404).json({ error: "Ruta no encontrada" });
}
