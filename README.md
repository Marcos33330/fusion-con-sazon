# Fusión con Sazón — sitio propio con panel de administrador

Réplica de [fusionconsazon.uy](https://fusionconsazon.uy/) con backend, base de
datos y un panel de administrador para subir, reemplazar y editar fotos, videos
y textos de todas las páginas (Inicio, Nosotros, Tortas y Postres, Catering,
Eventos, Contacto).

Ver `ARCHITECTURE.md` para el detalle de la arquitectura y `SECURITY-CHECKLIST.md`
antes de pasar a producción.

## Qué necesitás instalado

- [Node.js](https://nodejs.org/) versión 20 o superior (`node -v` para verificar)
- [Visual Studio Code](https://code.visualstudio.com/)
- Una cuenta gratis en [Cloudinary](https://cloudinary.com/users/register/free) (para las fotos/videos)

No necesitás instalar ninguna base de datos: usamos SQLite, que es un archivo
local que Prisma crea solo.

---

## Paso 1 — Abrir el proyecto

1. Descomprimí la carpeta `fusion-con-sazon` donde prefieras.
2. Abrí VS Code → `Archivo > Abrir carpeta...` → seleccioná `fusion-con-sazon`.
3. Abrí una terminal integrada: `Terminal > Nueva terminal` (o `Ctrl+ñ` / `` Ctrl+` ``).

El proyecto tiene dos partes independientes: `backend/` y `frontend/`. Vas a
necesitar **dos terminales abiertas en paralelo** (una por cada una) cuando
lo corras en desarrollo.

---

## Paso 2 — Crear tu cuenta de Cloudinary

1. Andá a https://cloudinary.com/users/register/free y creá una cuenta gratis.
2. Una vez adentro, en el **Dashboard** vas a ver tres datos que necesitás:
   `Cloud name`, `API Key` y `API Secret`. Guardalos, los usamos en el Paso 3.

---

## Paso 3 — Configurar el backend

En la terminal:

```bash
cd backend
npm install
```

Ahora creá tu archivo de variables de entorno copiando el ejemplo:

```bash
# Windows (PowerShell)
copy .env.example .env

# Mac/Linux
cp .env.example .env
```

Abrí `backend/.env` en VS Code y completá:

- `JWT_SECRET`: generá un valor aleatorio corriendo en la terminal:
  ```bash
  node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
  ```
  y pegá el resultado ahí.
- `ADMIN_EMAIL` / `ADMIN_PASSWORD` / `ADMIN_NAME`: el email y contraseña con
  los que vas a entrar al panel de administrador. Usá una contraseña fuerte
  (mínimo 8 caracteres, mejor si son más y con símbolos).
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`:
  los tres datos del Paso 2.
- El resto de los valores (`DATABASE_URL`, `PORT`, `FRONTEND_URL`) podés
  dejarlos como están para desarrollo local.

### Crear la base de datos y cargar el contenido inicial

```bash
npx prisma generate
npx prisma migrate dev --name init
npm run seed
```

`npm run seed` crea tu usuario administrador y precarga los textos, datos de
contacto y fotos/videos de referencia (las mismas URLs que ya usa el sitio
actual), para que la página no arranque vacía. Podés reemplazar cada foto o
video después desde el panel admin.

### Levantar el backend

```bash
npm run dev
```

Deberías ver: `✅ Backend corriendo en http://localhost:4000`. Dejá esta
terminal abierta.

**Probarlo:** abrí http://localhost:4000/api/health en el navegador. Tiene
que responder `{"ok":true}`.

---

## Paso 4 — Configurar y levantar el frontend

Abrí una **segunda terminal** en VS Code (`Terminal > Nueva terminal`):

```bash
cd frontend
npm install
copy .env.example .env    # o "cp .env.example .env" en Mac/Linux
npm run dev
```

Vas a ver algo como `Local: http://localhost:5173/`. Abrí esa URL en el
navegador — ahí está tu sitio.

**Probarlo:** navegá entre Inicio, Nosotros, Tortas y Postres, Catering y
Eventos. Deberías ver las fotos de referencia cargadas por el seed.

---

## Paso 5 — Entrar al panel de administrador

1. Andá a http://localhost:5173/admin/login
2. Ingresá el `ADMIN_EMAIL` y `ADMIN_PASSWORD` que pusiste en `backend/.env`.
3. Desde ahí podés:
   - **Contenido**: editar los textos de cada página.
   - **Fotos y videos**: subir nuevos, reemplazar los existentes (botón
     "Reemplazar"), asignarles categoría (en Catering) o eliminarlos.
   - **Testimonios**: agregar, publicar/ocultar o borrar.
   - **Contacto**: actualizar teléfono, WhatsApp, dirección y redes sociales.

Los cambios se ven al instante en el sitio público, sin reiniciar nada.

---

## Comandos útiles

| Comando (dentro de `backend/`) | Qué hace |
|---|---|
| `npm run dev` | Levanta el backend en modo desarrollo (recarga sola) |
| `npm run prisma:studio` | Abre una interfaz visual para ver/editar la base de datos |
| `npm run typecheck` | Verifica que el código TypeScript no tenga errores |
| `npm run build` / `npm start` | Compila y corre la versión de producción |

| Comando (dentro de `frontend/`) | Qué hace |
|---|---|
| `npm run dev` | Levanta el sitio en modo desarrollo |
| `npm run build` | Genera la versión de producción en `frontend/dist` |
| `npm run preview` | Sirve localmente el build de producción para probarlo |

---

## Errores comunes

- **"No se puede conectar al backend" / la página no carga datos**: confirmá
  que la terminal del backend siga corriendo y que `frontend/.env` tenga
  `VITE_API_URL=http://localhost:4000/api`.
- **Error de CORS en la consola del navegador**: revisá que `FRONTEND_URL`
  en `backend/.env` sea exactamente `http://localhost:5173` (sin barra al
  final).
- **"JWT_SECRET debe tener al menos 16 caracteres"**: te faltó generar y
  pegar el valor del Paso 3.
- **Falla la subida de fotos/videos**: revisá que las tres variables de
  Cloudinary en `backend/.env` sean correctas (copialas de nuevo del
  Dashboard, sin espacios de más).

---

## Cuando quieras pasar esto a producción (internet)

Este README cubre el uso **local**. Para publicarlo en internet vas a
necesitar además:

1. Cambiar la base de datos a PostgreSQL (cambiar `provider` en
   `backend/prisma/schema.prisma` y el `DATABASE_URL`).
2. Desplegar el backend en un servicio como Render o Railway, y el frontend
   (carpeta `frontend/dist` generada con `npm run build`) en Vercel, Netlify
   o Render Static Sites.
3. Configurar `NODE_ENV=production`, un dominio propio con HTTPS, y repasar
   `SECURITY-CHECKLIST.md`.

Si querés, puedo ayudarte con ese paso cuando llegue el momento.
