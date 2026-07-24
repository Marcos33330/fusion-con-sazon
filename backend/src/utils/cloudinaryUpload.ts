import streamifier from "streamifier";
import cloudinary from "../config/cloudinary";
import { UploadApiResponse } from "cloudinary";

// Sube un buffer (archivo en memoria, viene de multer) a Cloudinary sin
// escribirlo a disco. `resourceType` "auto" deja que Cloudinary detecte si
// es imagen o video.
export function uploadBufferToCloudinary(
  buffer: Buffer,
  folder: string
): Promise<UploadApiResponse> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: "auto" },
      (error, result) => {
        if (error || !result) return reject(error ?? new Error("Fallo la subida"));
        resolve(result);
      }
    );
    streamifier.createReadStream(buffer).pipe(stream);
  });
}

export function deleteFromCloudinary(publicId: string, resourceType: "image" | "video") {
  return cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
}
