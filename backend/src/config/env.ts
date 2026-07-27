import "dotenv/config";
import crypto from "node:crypto";
import { z } from "zod";

/**
 * Validación de entorno escalonada por feature.
 *
 * El sitio público (textos, fotos, testimonios, contacto) es de solo lectura
 * y no necesita credenciales de admin ni Cloudinary. Antes el server no
 * arrancaba si faltaba cualquiera de esas variables, así que quien clonaba el
 * repo tenía que inventarse una cuenta de Cloudinary para ver una página que
 * no sube nada.
 *
 * Ahora:
 *  - Base (siempre obligatorio): DATABASE_URL, FRONTEND_URL, PORT.
 *  - JWT_SECRET: obligatorio en producción; en desarrollo se genera uno
 *    efímero si falta (las sesiones de admin mueren al reiniciar).
 *  - CLOUDINARY_*: opcionales. Sin ellas el server levanta igual y solo
 *    fallan los endpoints de subida, con un mensaje claro.
 *  - ADMIN_EMAIL / ADMIN_PASSWORD: ya no se validan acá. Las usa únicamente
 *    `prisma/seed.ts`, que es donde ahora se chequean.
 */

// Una variable vacía en .env es lo mismo que no haberla definido. Filtrarlas
// hace que los .optional() de abajo se comporten como uno espera.
const rawEnv = Object.fromEntries(
  Object.entries(process.env).filter(([, value]) => value !== undefined && value !== "")
);

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  PORT: z.coerce.number().default(4000),
  FRONTEND_URL: z.string().url(),
  JWT_SECRET: z.string().min(16, "JWT_SECRET debe tener al menos 16 caracteres").optional(),
  JWT_EXPIRES_IN: z.string().default("8h"),
  CLOUDINARY_CLOUD_NAME: z.string().min(1).optional(),
  CLOUDINARY_API_KEY: z.string().min(1).optional(),
  CLOUDINARY_API_SECRET: z.string().min(1).optional(),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
});

const parsed = envSchema.safeParse(rawEnv);

if (!parsed.success) {
  console.error("❌ Variables de entorno inválidas o faltantes:");
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

const data = parsed.data;
const isProdEnv = data.NODE_ENV === "production";

// --- JWT ---------------------------------------------------------------
if (isProdEnv && !data.JWT_SECRET) {
  console.error("❌ JWT_SECRET es obligatorio con NODE_ENV=production.");
  console.error("   Generalo con:");
  console.error("   node -e \"console.log(require('crypto').randomBytes(64).toString('hex'))\"");
  process.exit(1);
}

if (!data.JWT_SECRET) {
  console.warn("⚠️  JWT_SECRET no definido: uso uno efímero para desarrollo.");
  console.warn("   Las sesiones de admin se cierran cada vez que reinicies el server.");
}

const jwtSecret = data.JWT_SECRET ?? crypto.randomBytes(64).toString("hex");

// --- Cloudinary --------------------------------------------------------
const cloudinaryValues = [
  data.CLOUDINARY_CLOUD_NAME,
  data.CLOUDINARY_API_KEY,
  data.CLOUDINARY_API_SECRET,
];
const cloudinaryConfigured = cloudinaryValues.every(Boolean);
const cloudinaryPartial = !cloudinaryConfigured && cloudinaryValues.some(Boolean);

if (cloudinaryPartial) {
  // Configurarlo a medias siempre es un error de tipeo, no una decisión.
  console.error("❌ Cloudinary está configurado a medias: definí las tres variables o ninguna.");
  console.error("   CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET");
  process.exit(1);
}

if (!cloudinaryConfigured) {
  console.warn("⚠️  Cloudinary no configurado: subir o reemplazar fotos y videos desde el");
  console.warn("   panel admin va a fallar. El resto del sitio funciona normalmente.");
}

export const env = { ...data, JWT_SECRET: jwtSecret };
export const isProd = isProdEnv;
export const isCloudinaryConfigured = cloudinaryConfigured;
