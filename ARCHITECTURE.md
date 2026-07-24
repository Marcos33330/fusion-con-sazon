# Arquitectura — Fusión con Sazón

## Resumen

Rehacemos el sitio [fusionconsazon.uy](https://fusionconsazon.uy/) (WordPress/Elementor)
como una aplicación propia con panel de administrador para subir, reemplazar y editar
fotos, videos y textos, manteniendo las mismas páginas: Inicio, Nosotros, Tortas y
Postres, Catering, Eventos y Contacto.

## Estructura de carpetas

```
fusion-con-sazon/
├── backend/                 API REST (Node + Express + TypeScript)
│   ├── prisma/
│   │   ├── schema.prisma    Modelo de datos
│   │   └── seed.ts          Carga inicial de contenido (igual al sitio actual)
│   └── src/
│       ├── config/          Variables de entorno y Cloudinary
│       ├── db/               Cliente Prisma
│       ├── middleware/       Auth, rate limiting, manejo de errores, uploads
│       ├── controllers/      Lógica de cada recurso
│       ├── routes/           Definición de endpoints
│       └── validators/       Esquemas Zod (validación de entrada)
│
└── frontend/                 SPA (React + Vite + TypeScript + Tailwind)
    └── src/
        ├── pages/             Inicio, Nosotros, Tortas y Postres, Catering, Eventos
        ├── admin/             Login + panel: Contenido, Media, Testimonios, Contacto
        ├── components/        Navbar, Footer, MediaGrid, WhatsApp, etc.
        ├── context/           Sesión del admin
        └── api/                Cliente HTTP hacia el backend
```

## Cómo se comunican las piezas

```
Navegador (React SPA, puerto 5173)
     │  fetch() con cookies (credentials: include)
     ▼
Backend Express (puerto 4000) ── valida JWT en cookie httpOnly
     │
     ├── Prisma ORM ──► SQLite (backend/prisma/dev.db)
     │                   texto, testimonios, contacto, metadatos de media
     │
     └── Cloudinary API ──► almacena las fotos/videos que sube el admin
```

- El **frontend** nunca habla directo con la base de datos ni con Cloudinary:
  todo pasa por el backend, que es el único que tiene las credenciales.
- La **sesión de admin** viaja en una cookie `httpOnly` + `SameSite=Strict`
  (no accesible desde JavaScript del navegador, mitiga XSS/CSRF).
- Las **fotos y videos** se suben desde el panel admin al backend
  (`multipart/form-data`), el backend los reenvía a Cloudinary y guarda en
  la base de datos solo la URL resultante y el `publicId` (para poder
  reemplazarlos o borrarlos después).

## Modelo de datos (Prisma)

| Modelo | Para qué sirve |
|---|---|
| `AdminUser` | El único administrador del sitio (sin registro público) |
| `ContentBlock` | Bloques de texto editables (hero, "Nosotros", "Entregas", etc.) |
| `MediaItem` | Cada foto/video, con su página (`HOME`, `NOSOTROS`, `TORTAS`, `CATERING`, `EVENTOS_FOTOS`, `EVENTOS_VIDEOS`), categoría opcional y orden |
| `Testimonial` | Testimonios de clientes, publicables/ocultables |
| `ContactInfo` | Teléfono, WhatsApp, dirección, redes sociales (fila única) |

## Decisiones clave y por qué

- **SQLite en vez de Postgres para desarrollo local**: cero instalación —
  Prisma crea el archivo `dev.db` solo. Para producción, cambiás una línea
  (`provider = "postgresql"`) y el `DATABASE_URL` a tu base Postgres
  (Railway, Render, Supabase); el resto del código no cambia.
- **Cloudinary para fotos/videos**: capa gratuita generosa, optimiza y sirve
  las imágenes por CDN, y evita perder archivos si más adelante desplegás en
  un hosting que no persiste disco (como Render o Vercel).
- **Un solo admin sin registro público**: más seguro para un sitio de un
  negocio familiar. El admin se crea con `npm run seed` a partir de las
  variables de entorno, no hay formulario de registro accesible desde la web.
- **Cookie httpOnly en vez de token en localStorage**: localStorage es
  legible por cualquier script (riesgo de XSS); una cookie httpOnly no lo es.
