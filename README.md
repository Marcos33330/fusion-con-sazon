# Fusión con Sazón — sitio propio con panel de administrador

Réplica de [fusionconsazon.uy](https://fusionconsazon.uy/) con backend, base de
datos y un panel de administrador para subir, reemplazar, reordenar y editar
fotos, videos y textos de todas las páginas (Inicio, Nosotros, Tortas y Postres,
Catering, Eventos, Contacto).

Ver `ARCHITECTURE.md` para el detalle de la arquitectura y `SECURITY-CHECKLIST.md`
antes de pasar a producción.

> **No hace falta ninguna credencial para ver el sitio.** Alcanza con copiar
> `.env.example` a `.env` sin tocar nada, crear la base y correr `npm run seed`:
> precarga los textos, los datos de contacto y las fotos reales del sitio actual.
> Cloudinary y el usuario administrador son **opcionales** y solo habilitan,
> respectivamente, subir archivos nuevos y entrar al panel.

El proyecto tiene dos partes independientes, `backend/` y `frontend/`, y cada
una corre en su propia terminal. **Siempre vas a necesitar dos terminales
abiertas en paralelo.**

No hace falta instalar ninguna base de datos: usamos SQLite, que es un archivo
local que Prisma crea solo.

---

# Opción A — GitHub Codespaces (lo más rápido)

No requiere instalar nada en tu computadora. Abrí el codespace desde el botón
verde **Code → Codespaces** del repositorio en GitHub.

## Primera vez

**No tenés que hacer nada.** El archivo `.devcontainer/devcontainer.json` corre
la instalación completa sola al crearse el codespace: dependencias de las dos
partes, Prisma, la base SQLite y el contenido inicial.

Esperá a que termine (lo ves en la notificación de VS Code) y andá al paso
siguiente.

## Para levantar el sitio

Un solo comando, en una sola terminal:

```bash
npm run dev
```

Arranca el backend y el frontend juntos, con la salida de cada uno en su color.
Esperá el `Local: http://localhost:5173/`; Codespaces te va a ofrecer abrir ese
puerto en el navegador. Para cortar los dos, `Ctrl+C`.

Si preferís tenerlos en terminales separadas: `npm run dev:backend` en una y
`npm run dev:frontend` en otra.

> **Ojo:** el devcontainer solo se aplica a codespaces **nuevos**. Si ya tenías
> uno abierto de antes, o lo reconstruís con `Rebuild Container`, o corrés la
> instalación a mano una vez: `npm install && npm run setup`.

## Compartir el sitio con alguien (demo)

Por defecto los puertos son privados. Para que otra persona pueda abrirlo:

1. Andá a la pestaña **PORTS** del panel inferior.
2. Clic derecho sobre el puerto **5173** → **Port Visibility** → **Public**.
3. Copiá la **Forwarded Address**. Esa URL la puede abrir cualquiera.

Dejá el puerto **4000 en Private**: no hace falta exponerlo, porque Vite reenvía
`/api` internamente.

Tené en cuenta que es un servidor de desarrollo: se cae cuando el codespace se
detiene (a los 30 minutos de inactividad por defecto), va más lento que el sitio
real, y consume horas de tu cuota de Codespaces. Volvé el puerto a **Private**
cuando termines de mostrarlo.

---

# Opción B — En tu computadora

## Qué necesitás instalado

- [Node.js](https://nodejs.org/) versión 20 o superior (`node -v` para verificar)
- [Visual Studio Code](https://code.visualstudio.com/)
- [Git](https://git-scm.com/)

## Paso 1 — Clonar y abrir

```bash
git clone https://github.com/Marcos33330/fusion-con-sazon.git
cd fusion-con-sazon
```

Abrí VS Code → `Archivo > Abrir carpeta...` → seleccioná `fusion-con-sazon`, y
abrí una terminal integrada con `Terminal > Nueva terminal`.

> **Cuidado con la ubicación:** no lo pongas dentro de OneDrive, Dropbox o
> Google Drive. `node_modules` son decenas de miles de archivos y la
> sincronización genera bloqueos que rompen instalaciones y builds. Algo como
> `C:\dev\fusion-con-sazon` va bien.

> **Cuidado con la terminal:** VS Code en Windows puede abrir PowerShell o Git
> Bash. En **Git Bash** las rutas van con barra normal (`cd ../frontend`), no
> con barra invertida (`cd ..\frontend`), y los espacios hay que escaparlos con
> `\`. Si te da `No such file or directory`, es casi siempre esto.

## Paso 2 — Instalar (una sola vez)

Desde la **raíz** del proyecto:

```bash
npm install
npm run setup
```

`npm run setup` crea los dos `.env` (si no existen, no pisa los tuyos), instala
las dependencias de backend y frontend, prepara Prisma, crea la base SQLite y
carga el contenido inicial.

## Paso 3 — Levantar el sitio

```bash
npm run dev
```

Un solo comando levanta los dos servidores. Esperá el
`Local: http://localhost:5173/` y abrí esa URL: ahí está tu sitio. Para cortar
los dos, `Ctrl+C`.

Si los preferís separados: `npm run dev:backend` en una terminal y
`npm run dev:frontend` en otra.

**Probar el backend:** abrí http://localhost:4000/api/health. Tiene que
responder `{"ok":true}`.

---

# Configuración (`backend/.env`)

Copiando `.env.example` tal cual ya funciona todo el sitio público. Estas son
las variables por si querés cambiar algo:

## Obligatorias

| Variable | Para qué |
|---|---|
| `DATABASE_URL` | Ruta del archivo SQLite. Dejala como está en desarrollo. |
| `PORT` | Puerto del backend (4000). |
| `FRONTEND_URL` | Origen permitido por CORS. En desarrollo, `http://localhost:5173` **sin barra al final**. |
| `NODE_ENV` | `development` en local. `production` activa cookies seguras y oculta detalles de errores. |

## Opcionales — panel de administrador

| Variable | Para qué |
|---|---|
| `JWT_SECRET` | Firma la sesión del admin. Si lo dejás vacío en desarrollo se genera uno efímero y **la sesión se cierra en cada reinicio del backend**. En producción es obligatorio. Generalo con:<br>`node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"` |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Credenciales del único administrador. Las lee `npm run seed` para crear el usuario. Si las dejás vacías, el seed carga todo el contenido igual y simplemente no crea admin. La contraseña necesita **8 caracteres o más**. |
| `ADMIN_NAME` | Nombre que se muestra en el panel. |

## Opcionales — Cloudinary

`CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY` y `CLOUDINARY_API_SECRET` solo
hacen falta para **subir o reemplazar** archivos desde el panel. Las fotos que
precarga el seed son URLs públicas del sitio actual, así que se ven sin
configurar nada. Si las definís, tienen que estar las tres. Cuenta gratis en
[cloudinary.com](https://cloudinary.com/users/register/free); los valores están
en el Dashboard.

---

# El panel de administrador

Entrá a `/admin/login` (por ejemplo http://localhost:5173/admin/login) con el
`ADMIN_EMAIL` y `ADMIN_PASSWORD` de tu `.env`. Si nunca los completaste, primero
llenalos y volvé a correr `npm run seed`.

- **Contenido** — los textos de cada página, agrupados por sección. Los campos
  que dejes vacíos muestran el texto por defecto (aparece en gris como
  referencia).
- **Fotos y videos** — subir, reemplazar, eliminar, poner título, asignar
  categoría (en Catering) y **reordenar**.
- **Testimonios** — agregar, publicar/ocultar o borrar.
- **Contacto** — teléfono, WhatsApp, dirección y redes sociales.

Los cambios se ven al instante en el sitio público, sin reiniciar nada.

> **El orden de las fotos importa.** El sitio decide dónde va cada una según su
> posición: la primera de *Tortas y Postres* es la foto grande del hero, la
> primera de *Nosotros* es la de la pareja, y así. El panel te lo indica con una
> etiqueta sobre cada foto y con los botones **← Antes / Después →**.

---

# Comandos útiles

| Comando (desde la **raíz**) | Qué hace |
|---|---|
| `npm run dev` | Levanta backend y frontend juntos |
| `npm run dev:backend` / `npm run dev:frontend` | Levanta uno solo |
| `npm run setup` | Instalación completa: `.env`, dependencias, base y contenido |
| `npm run seed` | Recarga el contenido inicial y crea/actualiza el admin |
| `npm run typecheck` | Verifica el TypeScript de las dos partes |
| `npm run build` | Compila backend y frontend para producción |

| Comando (dentro de `backend/`) | Qué hace |
|---|---|
| `npm run dev` | Levanta el backend en modo desarrollo (recarga sola) |
| `npm run seed` | Recarga el contenido inicial y crea/actualiza el admin |
| `npm run prisma:studio` | Interfaz visual para ver y editar la base de datos |
| `npm run typecheck` | Verifica que el TypeScript no tenga errores |
| `npm run build` / `npm start` | Compila y corre la versión de producción |

| Comando (dentro de `frontend/`) | Qué hace |
|---|---|
| `npm run dev` | Levanta el sitio en modo desarrollo |
| `npm run build` | Genera la versión de producción en `frontend/dist` |
| `npm run preview` | Sirve localmente el build de producción para probarlo |

---

# Errores comunes

**`Could not read package.json`** — estás parado en la raíz del repo. Los
`package.json` viven en `backend/` y en `frontend/`, nunca en la raíz. Hacé `cd`
a la carpeta correcta.

**`No such file or directory` al hacer `cd`** — estás en Git Bash usando barras
invertidas. Usá `cd ../frontend`, y escapá los espacios: `cd mi\ carpeta`.

**La página carga pero sin fotos ni textos** — el backend no está corriendo, o
`frontend/.env` apunta mal. En local tiene que ser
`VITE_API_URL="http://localhost:4000/api"`; en Codespaces, `VITE_API_URL="/api"`.

**Error de CORS en la consola** — `FRONTEND_URL` en `backend/.env` tiene que ser
exactamente el origen del frontend, sin barra al final.

**`"Datos inválidos"` al entrar al panel** — es un error de **formato**, no de
contraseña incorrecta: el email tiene que tener forma de email y la contraseña
al menos 8 caracteres. Si las credenciales están mal, el mensaje es
`"Credenciales inválidas"`.

**`"Credenciales inválidas"` y estás seguro de la contraseña** — puede que el
usuario no exista. Completá `ADMIN_EMAIL` y `ADMIN_PASSWORD` en `backend/.env` y
corré `npm run seed`; tiene que decir `✅ Admin listo: tu@email.com`.

**La sesión del panel se cierra sola al reiniciar el backend** — te falta
definir `JWT_SECRET` en `backend/.env`.

**Falla la subida de fotos o videos** — faltan las tres variables de Cloudinary,
o alguna está mal copiada. El error del panel te lo dice explícitamente.

---

# Cuando quieras pasar esto a producción (internet)

Este README cubre el uso en desarrollo. Para publicarlo vas a necesitar además:

1. **Cambiar la base a PostgreSQL** (`provider` en `backend/prisma/schema.prisma`
   y el `DATABASE_URL`). SQLite es un archivo local y la mayoría de los hosts
   borran el disco en cada despliegue.
2. **Desplegar el backend** en Render, Railway o similar, y el frontend
   (`frontend/dist`, generado con `npm run build`) en Vercel, Netlify o Render
   Static Sites.
3. **`NODE_ENV=production`**, HTTPS con dominio propio, `JWT_SECRET` nuevo y
   distinto al de desarrollo, y `FRONTEND_URL` apuntando al dominio real.
4. Repasar `SECURITY-CHECKLIST.md` completo.

> **Un detalle que conviene prever:** la cookie de sesión del admin usa
> `SameSite=Strict`. Si el frontend queda en un dominio y el backend en otro, el
> navegador no la envía y el panel no funciona. La forma limpia de evitarlo es
> que el backend sirva el `frontend/dist` en producción: un solo servicio, un
> solo dominio, sin CORS.
