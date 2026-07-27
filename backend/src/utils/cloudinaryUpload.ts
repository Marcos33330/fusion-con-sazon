import streamifier from "streamifier";
import cloudinary from "../config/cloudinary";
import { UploadApiResponse } from "cloudinary";
import { isCloudinaryConfigured } from "../config/env";
import { HttpError } from "../middleware/errorHandler";

const NOT_CONFIGURED =
  "Cloudinary no está configurado en el servidor, así que no se pueden subir ni " +
  "reemplazar archivos. Definí CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY y " +
  "CLOUDINARY_API_SECRET en backend/.env y reiniciá el backend.";

// 503: el servicio existe pero no está disponible por configuración. No es
// culpa del request, así que no corresponde un 4xx.
function assertCloudinary() {
  if (!isCloudinaryConfigured) throw new HttpError(503, NOT_CONFIGURED);
}

// Sube un buffer (archivo en memoria, viene de multer) a Cloudinary sin
// escribirlo a disco. `resourceType` "auto" deja que Cloudinary detecte si
// es imagen o video.
export function uploadBufferToCloudinary(
  buffer: Buffer,
  folder: string
): Promise<UploadApiResponse> {
  assertCloudinary();

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: "auto" },
      (error, result) => {
        if (error || !result) return reject(error ?? new Error("Falló la subida"));
        resolve(result);
      }
    );
    streamifier.createReadStream(buffer).pipe(stream);
  });
}

export function deleteFromCloudinary(publicId: string, resourceType: "image" | "video") {
  assertCloudinary();
  return cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
}
