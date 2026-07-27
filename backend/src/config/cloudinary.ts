import { v2 as cloudinary } from "cloudinary";
import { env, isCloudinaryConfigured } from "./env";

// Cloudinary es opcional: solo hace falta para subir o reemplazar archivos
// desde el panel admin. Si no está configurado no lo inicializamos, y los
// helpers de `utils/cloudinaryUpload.ts` responden con un error explicativo
// en vez de dejar que el SDK falle con un mensaje críptico.
if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
    secure: true,
  });
}

export default cloudinary;
