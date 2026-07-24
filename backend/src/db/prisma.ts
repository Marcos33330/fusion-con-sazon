import { PrismaClient } from "@prisma/client";

// Instancia única de Prisma reutilizada en toda la app (evita agotar
// conexiones a la base de datos en desarrollo con hot-reload).
export const prisma = new PrismaClient();
