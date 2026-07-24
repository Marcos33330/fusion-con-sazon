import multer from "multer";
import { HttpError } from "./errorHandler";

const ALLOWED_MIME = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "video/mp4",
  "video/quicktime",
  "video/webm",
]);

// Guarda el archivo en memoria (buffer) en vez de disco: de ahí lo subimos
// directo a Cloudinary sin dejar residuos en el servidor. Límite 50MB
// (suficiente para fotos y videos cortos de celular).
export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_MIME.has(file.mimetype)) {
      return cb(new HttpError(400, "Tipo de archivo no permitido. Solo imágenes o videos."));
    }
    cb(null, true);
  },
});
