import rateLimit from "express-rate-limit";

// Login: máximo 10 intentos cada 15 min por IP. Frena ataques de fuerza bruta
// contra la única cuenta admin.
export const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Demasiados intentos de login. Probá de nuevo en unos minutos." },
});

// Subida de archivos: evita abuso/consumo excesivo de banda y de tu cuota
// gratuita de Cloudinary.
export const uploadRateLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Demasiadas subidas en poco tiempo. Esperá un momento." },
});

// Límite general para toda la API pública.
export const generalRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 120,
  standardHeaders: true,
  legacyHeaders: false,
});
