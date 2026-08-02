# Remodelación visual completa del sitio público

Fecha: 2026-08-02
Estado: aprobado, pendiente de plan de implementación

## Contexto

El primer intento de traer estilo "3D" desde senthora.ai ([spec anterior](2026-08-02-3d-visual-redesign-design.md), PR `3d-visual-redesign`) resultó insuficiente: agregó tilt/float/glassmorphism sobre el diseño existente, pero no cambió la sensación general del sitio. El usuario aclaró que lo que buscaba era mucho más grande: **"casi una remodelación completa"** de la identidad visual, inspirada en la escala tipográfica y el espacio en blanco de senthora.ai — no solo micro-interacciones.

Este documento reemplaza el enfoque "capa de efectos" por un rediseño real de escala y espaciado en las 5 páginas públicas, construido sobre lo que ya existe (paleta, tipografías, primitivas de animación) en vez de tirarlo.

## Decisión de alcance

Aplica a las **5 páginas públicas**: Home, Nosotros, Tortas y Postres, Catering, Eventos. El panel admin (`frontend/src/admin/`) y el backend quedan fuera de alcance, igual que en el intento anterior — este es un cambio de presentación, no de arquitectura ni de datos.

## Qué se mantiene

- **Paleta de marca**: fucsia `#E80541`, chocolate `#331806`, off-white `#FAF8F5`, mostaza `#FFA610`, warm cream `#FDF3E4` — es la identidad del cliente, no se toca.
- **Tipografías**: Bricolage Grotesque (display/títulos) + Manrope (cuerpo) + Caveat (acentos script). Ya tienen personalidad propia y fueron aprobadas por el cliente en el rediseño anterior — el cambio es de **escala**, no de familia tipográfica.
- **Las 4 primitivas existentes**: `RevealOnScroll`, `TiltCard`, `FloatingElement`, `GlassPanel` (en `frontend/src/components/ui/`) se conservan y se siguen usando en tarjetas y paneles — lo que cambia es el tamaño/espaciado del contenido que envuelven, no su comportamiento.
- Fotos reales del negocio, sin renders 3D ni assets nuevos.

## Qué cambia: el principio general

No es un cambio de color ni de fuente — es un cambio de **escala y espacio**:
- Títulos de sección considerablemente más grandes (~50-60% más que el tamaño actual)
- Menos columnas por fila en grillas de contenido (donde hoy hay 3 columnas apretadas, pasan a 1-2 con más espacio, o las tarjetas se agrandan)
- Mucho más padding vertical entre secciones y dentro de las tarjetas

Esta misma receta se aplica de forma consistente en las 5 páginas — no es exclusiva del Home.

## Hero (Home): profundidad en capas

Se mantiene la estructura split (columna de texto + collage de fotos a la derecha), pero el collage pasa de "una tarjeta con tilt" a **varias capas independientes a distinta profundidad**, cada una reaccionando al mouse/scroll a velocidad distinta (parallax real):

| Capa | Contenido | Comportamiento |
|---|---|---|
| 0 (más lejana) | Halo de fondo (blur radial, ya existe hoy como decoración estática) | Casi no se mueve |
| 1 | Sombra proyectada del collage | Se mueve muy poco |
| 2 | Foto principal | Movimiento moderado |
| 3 | Foto secundaria flotante | Movimiento más marcado |
| 4 (más cercana) | Chip/badge (reseñas o sello giratorio) | El que más se mueve |

Esto **reemplaza** el uso de `TiltCard` en el hero (que rota todo el collage como un bloque rígido) por un primitivo nuevo, `ParallaxLayer`, que mueve cada capa a una velocidad (`depth`) distinta según la posición del mouse. `TiltCard` se conserva para otros usos (tarjetas de categoría, galería) donde el efecto de bloque rígido sigue teniendo sentido.

## Resto de las secciones — aplicación de la escala premium

Mismo criterio en cada bloque de contenido de las 5 páginas: Cómo trabajamos, tarjetas de categoría, testimonios, galerías (Tortas/Catering/Eventos vía `MediaGrid`), historia de Nosotros. Concretamente:
- Grillas de 3 columnas en desktop pasan a 2 columnas o a lista vertical con más aire, según el contenido
- Tamaño de fuente de títulos de sección (`h2`) sube de la escala actual (`text-4xl md:text-5xl`, ~36-48px) a `text-5xl md:text-7xl` (~48-72px) — mismo salto de escala en las 5 páginas
- Padding vertical de secciones sube de `py-20 md:py-28` (80-112px) a `py-28 md:py-36` (112-144px)
- Padding interno de tarjetas/paneles sube proporcionalmente (ej. de `p-8` a `p-10 md:p-12`)

## Verificación

Igual que en el intento anterior: sin tests automatizados (el proyecto no los tiene y no es el foco de este cambio). Verificación manual:
- `npm run dev`, revisar las 5 páginas en desktop y en viewport mobile
- Confirmar `prefers-reduced-motion` sigue desactivando el movimiento (incluyendo las nuevas capas de `ParallaxLayer`)
- `npm run typecheck` y `npm run build` deben pasar
