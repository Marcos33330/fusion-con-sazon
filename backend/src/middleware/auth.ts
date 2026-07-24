import { NextFunction, Request, Response } from "express";
import { verifyAdminToken } from "../utils/jwt";

declare global {
  namespace Express {
    interface Request {
      admin?: { id: string; email: string };
    }
  }
}

const COOKIE_NAME = "fcs_admin_token";

// El token viaja en una cookie httpOnly (no accesible desde JS del browser,
// lo que mitiga robo de token vía XSS) con SameSite=Strict (mitiga CSRF
// básico ya que el navegador no la envía en requests cross-site).
export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies?.[COOKIE_NAME];

  if (!token) {
    return res.status(401).json({ error: "No autenticado" });
  }

  try {
    const payload = verifyAdminToken(token);
    req.admin = { id: payload.sub, email: payload.email };
    next();
  } catch {
    return res.status(401).json({ error: "Sesión inválida o expirada" });
  }
}

export const ADMIN_COOKIE_NAME = COOKIE_NAME;
