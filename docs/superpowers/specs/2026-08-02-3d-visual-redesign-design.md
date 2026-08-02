# Rediseño visual 3D del frontend público

Fecha: 2026-08-02
Estado: aprobado, pendiente de plan de implementación

## Contexto

Fusión con Sazón (catering, tortas y postres, Montevideo) tiene un sitio funcional:
React 18 + TypeScript + Vite + Tailwind en el frontend, Express + Prisma + SQLite
en el backend, con panel admin completo. Se busca un rediseño visual inspirado en
[senthora.ai](https://senthora.ai/): elementos con sensación de profundidad/3D,
animaciones de scroll, tarjetas con micro-interacciones tipo tilt al pasar el
mouse, manteniendo la identidad visual (paleta fucsia/chocolate/mostaza) y las
fotos reales del negocio.

Este es el primero de tres proyectos relacionados pero independientes:
1. **Este documento** — rediseño visual 3D + confirmación de que se trabaja sobre
   el repo existente
2. Página de Instagram sincronizada con las publicaciones (pendiente, spec propio)
3. Reestructuración general del proyecto con skills/herramientas (pendiente, spec
   propio)

## Decisión: modificar el repo existente, no reescribir

El backend (auth, Zod, Prisma, Cloudinary, rate-limiting, panel admin) está
funcional y documentado. El pedido de "estilos 3D" se resolvió como **3D de
efecto vía CSS/animaciones** (tilt, profundidad, sombras, parallax), no modelos
3D reales — por lo tanto es un cambio de capa de presentación, no de
arquitectura. No hay razón para reescribir el backend ni el modelo de datos.
La "necesidad de reestructurar" del usuario queda cubierta reorganizando
`frontend/src/components/` (ver abajo), no rehaciendo el repo.

## Alcance

- Stack sin cambios: React 18 + TS + Vite + Tailwind + Express/Prisma intactos.
- Única dependencia nueva: **Framer Motion**, para animaciones de scroll, hover
  y transiciones.
- `frontend/src/components/` se reorganiza en:
  - `components/ui/` — primitivas visuales nuevas (ver abajo)
  - resto de `components/` — componentes de contenido existentes (`Navbar`,
    `Footer`, `MediaGrid`, etc.), adaptados para usar las primitivas nuevas
- Las páginas públicas (`Home`, `Nosotros`, `Catering`, `TortasYPostres`,
  `Eventos`) se rediseñan visualmente pero conservan sus fuentes de datos
  actuales: mismos endpoints, mismo hook `useContentBlock`, mismo `MediaGrid`.
- Paleta de marca sin cambios (fucsia `#E80541`, chocolate `#331806`, off-white
  `#FAF8F5`, mostaza `#FFA610`, warm cream `#FDF3E4`). El efecto 3D se logra con
  sombra/profundidad/movimiento, no con un cambio de identidad de color.
- El panel admin (`frontend/src/admin/`) **no se rediseña** en esta etapa — es
  herramienta interna, no cara pública.

## Componentes nuevos (`components/ui/`)

| Componente | Qué hace |
|---|---|
| `TiltCard` | Envuelve una foto/tarjeta; rotación 3D sutil (perspective + rotateX/rotateY) siguiendo el mouse, con sombra dinámica que se mueve acorde. Se desactiva en touch — en mobile queda estática con sombra/profundidad fija. |
| `FloatingElement` | Wrapper para insignias/iconos con animación idle (translateY suave en loop). Generaliza el "spinning badge" que ya existe en el hero. |
| `RevealOnScroll` | Reemplaza el IntersectionObserver hecho a mano por `whileInView` de Framer Motion. Variantes reutilizables: fade+slide, fade+scale. |
| `GlassPanel` | Contenedor con glassmorphism (blur + borde translúcido + sombra), para cards tipo "Cómo trabajamos" o el chip de reseñas. |

## Aplicación por página

- **Home**: hero con collage de fotos usando `TiltCard`; badge girando con
  `FloatingElement`; chip de reseñas con `GlassPanel`; cards de categoría con
  tilt + sombra profunda al hover.
- **Tortas y Postres / Catering**: la grilla cuadrada actual (`MediaGrid`) gana
  `TiltCard` por ítem, sin romper el orden/agrupación por categoría existente.
- **Nosotros**: las cards "Dejarlo todo…" y "¿Por qué…?" pasan a `GlassPanel`
  con `RevealOnScroll`.
- **Eventos**: galería con el mismo tratamiento que Tortas/Catering.

## Performance y accesibilidad

- Todo el movimiento respeta `prefers-reduced-motion` (igual que el sistema de
  scroll-reveal actual).
- `TiltCard` se desactiva en touch — no hay hover real en mobile.
- Framer Motion es la única dependencia nueva; no se agrega Three.js ni assets
  3D pesados (se descartó el 3D con modelos reales por ser mucho más trabajo y
  no usar las fotos reales del negocio).

## Verificación

Cambio visual, no de lógica de negocio — verificación principalmente manual:
- `npm run dev`, revisar cada página en desktop y en viewport mobile.
- Confirmar que con `prefers-reduced-motion` activado las animaciones se
  desactivan.
- Confirmar que el panel admin sigue funcionando (no debería verse afectado
  visualmente, pero el build no debe romperse).
- `npm run typecheck` y `npm run build` deben pasar.
- No se agregan tests automatizados nuevos — el proyecto no los tiene hoy y no
  es el foco de este cambio.
