// Crea los archivos .env si todavía no existen. No pisa nada: si ya tenés uno
// configurado, lo deja intacto.
//
// El frontend usa VITE_API_URL="/api" a propósito: Vite reenvía /api al backend
// desde su propio servidor (ver el proxy en frontend/vite.config.ts), así que
// el mismo valor funciona en tu computadora y en Codespaces. Con la URL
// absoluta a localhost:4000 el sitio se rompe en Codespaces, porque el
// navegador corre en tu máquina y no ve el localhost del contenedor.

import { existsSync, copyFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

function crearSiFalta(destino, contenido, origen) {
  const ruta = join(root, destino);
  if (existsSync(ruta)) {
    console.log(`   ya existe, no lo toco: ${destino}`);
    return;
  }
  if (origen) copyFileSync(join(root, origen), ruta);
  else writeFileSync(ruta, contenido);
  console.log(`✅ creado: ${destino}`);
}

console.log("Preparando archivos de entorno...");

crearSiFalta("backend/.env", null, "backend/.env.example");
crearSiFalta("frontend/.env", 'VITE_API_URL="/api"\n');

console.log(
  "\nListo. El sitio público ya funciona así como está.\n" +
    "Para entrar al panel de administrador, completá ADMIN_EMAIL y ADMIN_PASSWORD\n" +
    "en backend/.env y volvé a correr: npm run seed"
);
