# Rediseño editorial inspirado en vineyard.co.za (prueba)

Fecha: 2026-08-02
Estado: aprobado, pendiente de plan de implementación

## Contexto

Después de dos intentos con estilo "3D" (efectos tilt/float/glass, y luego escala/parallax premium — ambos en ramas separadas, `3d-visual-redesign` ya mergeada a `main`, `full-site-visual-remodel` sin mergear), el usuario pidió una dirección completamente distinta: replicar el sistema visual de [vineyard.co.za](https://www.vineyard.co.za/) (The Vineyard Hotel, Cape Town). Es explícitamente **una prueba de otro diseño** — no una continuación de lo anterior.

El sitio de referencia se recorrió completo en el navegador del usuario (Claude in Chrome). Elementos identificados y su traducción a Fusión con Sazón:

| Elemento de Vineyard | Traducción para Fusión con Sazón |
|---|---|
| Hero a pantalla completa con overlay oscuro, logo centrado, nav fina, barra flotante | Igual, con foto real de comida. La barra flotante usa WhatsApp/presupuesto en vez de check-in/check-out |
| Nav que se vuelve píldora con fondo al hacer scroll | Igual |
| Serif editorial para títulos + sans para cuerpo | Se agrega una tipografía serif (Playfair Display) para títulos grandes, reemplazando la grotesca bold actual. Manrope se mantiene para el cuerpo |
| Fotos a sangre completa entre secciones | Igual, con fotos reales del negocio |
| Recorte en arco/domo en una foto clave | Se aplica a la foto de Herminia y Oscar |
| Testimonios sin tarjetas, sobre fondo con tinte de color | Igual, tinte mostaza/crema en vez de verde salvia |
| Carrusel de "ofertas" sin bordes, con flechas | Se convierte en carrusel de combos/promos |
| Grilla de noticias/blog | **Descartada** — no hay backend de blog, fuera de alcance |
| Carrusel + botón de Instagram | Versión estática con fotos ya cargadas (no hay sincronización real con Instagram todavía — eso es un proyecto aparte) |
| Mapa interactivo de la propiedad | **Descartado** (específico de hotel) — se simplifica a un bloque de dirección/"cómo llegar" |
| Footer mega oscuro con nav grande repetida + columnas + rating + contacto | Igual, en chocolate/espresso en vez de azul marino |
| Foto final a sangre + CTA flotante antes del footer | Igual |

## Decisión explícita: se abandona el efecto 3D/tilt

Vineyard no usa micro-interacciones de tilt, parallax ni glassmorphism en ningún lado — es un diseño editorial de fotografía y tipografía, estático y elegante. Este spec **reemplaza** el tratamiento visual del hero y las tarjetas que usaban `TiltCard`/`FloatingElement`/`GlassPanel` (de la rama ya mergeada `3d-visual-redesign`) por el tratamiento plano/editorial de Vineyard. `RevealOnScroll` se conserva donde tenga sentido (fade-in simple al hacer scroll, sin exagerar).

## Qué se mantiene

- **Paleta de marca**: fucsia `#E80541`, chocolate `#331806`, off-white `#FAF8F5`, mostaza `#FFA610` — es la identidad del cliente, no se toca. No se adopta la paleta crema/navy/terracota/verde de Vineyard.
- Fotos reales del negocio, mismo backend/API/modelo de datos.
- El panel admin (`frontend/src/admin/`) y `backend/` quedan fuera de alcance.

## Qué cambia

- **Tipografía**: se agrega **Playfair Display** (serif editorial) como nueva fuente `display`, reemplazando a Bricolage Grotesque en títulos de sección. Manrope se mantiene para cuerpo. Bricolage Grotesque puede quedar disponible pero deja de ser la fuente de títulos.
- **Hero**: se simplifica — sin `TiltCard`/`FloatingElement` en el collage. Una sola foto a pantalla completa con overlay oscuro para legibilidad, título en serif centrado o alineado, y una barra flotante con CTA de WhatsApp/presupuesto cerca del borde inferior del hero (reemplaza el check-in/check-out de Vineyard, que no aplica).
- **Navbar**: al hacer scroll, se contrae y adopta forma de píldora con fondo (`bg-brand-light` o similar), en vez de quedar como barra completa fija.
- **Testimonios**: se sacan de tarjetas con sombra; pasan a texto plano en columnas sobre una sección con fondo mostaza/crema tintado.
- **Combos/promos**: nuevo carrusel horizontal sin bordes de tarjeta, con flechas de navegación, para reemplazar o complementar la sección de combos existente en Tortas y Postres.
- **Instagram (estático)**: carrusel de fotos horizontal + botón "Ver nuestro Instagram" que linkea al perfil real. Usa `MediaItem`s ya existentes como fuente (sin integración de API de Instagram — eso es un proyecto aparte).
- **Cómo llegar**: bloque simple con dirección de Montevideo, La Unión (reemplaza el mapa interactivo de propiedad de Vineyard, que no aplica a un local de catering).
- **Footer**: se rediseña como "mega footer" oscuro (fondo `brand-espresso` o `brand-dark`) con los links de navegación repetidos en tipografía grande, columnas de enlaces, rating + redes sociales, y bloque de contacto — reemplaza al footer actual (más simple).
- **Foto final + CTA**: sección de cierre con foto real a sangre completa y un botón flotante centrado antes del footer.
- **Foto en arco**: la foto de Herminia y Oscar (ya usada en Home y Nosotros) se recorta con un borde superior en arco/domo como motivo visual distintivo, en al menos un lugar.

## Efectos de scroll (inspeccionados en el sitio real)

Se inspeccionó el DOM y los estilos computados de vineyard.co.za directamente. Hallazgos:

- **No usa ninguna librería de animación** (ni GSAP, ni Lenis, ni Locomotive, ni AOS). Todo es código propio, así que se puede replicar con Framer Motion (ya instalado) o CSS puro sin sumar dependencias.
- **Parallax en imágenes** (`data-parallax-speed="15"`): el marco exterior mide 770px con `overflow: hidden`, y la imagen dentro mide 1000px con `object-fit: cover` — o sea la imagen es ~30% más alta que su contenedor. Al scrollear, la imagen se desplaza verticalmente dentro del marco, revelando distinta porción. Efecto: la foto se mueve más lento que la página.
- **Revelado de títulos por líneas enmascaradas** (`data-title-animate` / `data-split`): cada título se parte en líneas; la línea exterior tiene `overflow: hidden` y la interior se traslada verticalmente. Cada línea "sube" desde detrás de la máscara, escalonada. Es el efecto que le da la sensación editorial/premium a los títulos.
- **Nav píldora al scrollear**: ya cubierto por el rediseño de Navbar descrito arriba.

Estos tres efectos se suman al alcance de esta prueba, aplicados a la Home.

## Alcance de esta prueba

Es una prueba — se aplica **solo a la página Home** (`frontend/src/pages/Home.tsx`) más los componentes compartidos que la afectan directamente (`Navbar.tsx`, `Footer.tsx`). Las demás páginas públicas (Nosotros, Tortas y Postres, Catering, Eventos) **no se tocan** en esta iteración — si el resultado convence, se extiende después en un plan aparte.

## Verificación

Sin tests automatizados (el proyecto no los tiene). Verificación manual: `npm run dev`, revisar Home en desktop y mobile, confirmar que `prefers-reduced-motion` sigue respetado en las animaciones que se conserven, `npm run typecheck` y `npm run build` deben pasar.
