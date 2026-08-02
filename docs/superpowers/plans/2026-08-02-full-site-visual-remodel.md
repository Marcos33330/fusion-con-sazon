# Full-Site Visual Remodel Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Take the Fusión con Sazón public frontend from "3D effects layered on the existing design" to the premium scale/spacing/depth feel the user actually wanted (inspired by senthora.ai), across all 5 public pages, while keeping the brand palette, typography families, and the 4 existing animation primitives.

**Architecture:** Two new primitives (`ParallaxGroup`, `ParallaxLayer`) replace `TiltCard` specifically in the Home hero collage, giving true multi-depth parallax instead of single-block tilt. Every other change is scale/spacing edits to existing JSX — bigger headings, more vertical padding, fewer/bigger grid cells — applied consistently across Home, Nosotros, TortasYPostres, Catering, Eventos, and the shared `MediaGrid`.

**Tech Stack:** React 18, TypeScript, Vite 5, Tailwind CSS 3, Framer Motion (already installed).

## Global Constraints

- No new dependencies.
- Brand palette unchanged: fuchsia `#E80541`, chocolate `#331806`, off-white `#FAF8F5`, mustard `#FFA610`, warm cream `#FDF3E4`.
- Typography families unchanged: Bricolage Grotesque (display), Manrope (body), Caveat (script accents). Only font **sizes** change, never families.
- The 4 existing primitives (`RevealOnScroll`, `TiltCard`, `FloatingElement`, `GlassPanel` in `frontend/src/components/ui/`) are reused as-is — no changes to their own source files in this plan.
- `TiltCard` is replaced by `ParallaxGroup`/`ParallaxLayer` **only** in the Home hero collage. It stays in use elsewhere (category cards, `MediaGrid`) — do not remove it globally.
- All motion must respect `prefers-reduced-motion` and be inert on touch devices, following the same pattern already used in `TiltCard.tsx` (`useReducedMotion()` + `matchMedia("(hover: hover) and (pointer: fine)")`).
- Admin panel (`frontend/src/admin/`) and `backend/` are out of scope — do not touch them.
- No automated test framework exists and none should be added. Verification is `npm run typecheck`, `npm run build`, and manual checks in the dev server — described precisely in each task.
- Every task must leave `npm run typecheck` passing before it's considered done.
- This plan builds on top of the (not yet merged) `3d-visual-redesign` branch — `RevealOnScroll`, `TiltCard`, `FloatingElement`, `GlassPanel` already exist in the working tree this plan starts from.

---

### Task 1: `ParallaxGroup` and `ParallaxLayer` primitives

**Files:**
- Create: `frontend/src/components/ui/ParallaxGroup.tsx`
- Create: `frontend/src/components/ui/ParallaxLayer.tsx`

**Interfaces:**
- Produces:
  ```ts
  // ParallaxGroup.tsx
  export function useParallaxContext(): { x: MotionValue<number>; y: MotionValue<number>; enabled: boolean } | null;
  interface ParallaxGroupProps { children: ReactNode; className?: string; }
  export default function ParallaxGroup(props: ParallaxGroupProps): JSX.Element;

  // ParallaxLayer.tsx
  interface ParallaxLayerProps {
    children: ReactNode;
    className?: string;
    depth?: number; // 0 = static, 1 = max movement, default 0.5
    range?: number; // max offset in px at depth=1, default 24
  }
  export default function ParallaxLayer(props: ParallaxLayerProps): JSX.Element;
  ```
- Consumes: nothing from other tasks. Standalone, not wired into any page yet (Task 2 does that).

`ParallaxGroup` tracks mouse position within its own bounding box (normalized to `-0.5..0.5` on both axes) and shares it via React context. `ParallaxLayer` reads that context and translates itself by `depth × range` pixels toward the mouse, with a spring for smoothing. Layers with `depth` near 0 barely move; layers near 1 move the most — that's what creates the "depth" illusion instead of a single rigid block rotating (which is what `TiltCard` does).

- [ ] **Step 1: Write `ParallaxGroup.tsx`**

```tsx
import { createContext, MouseEvent, ReactNode, useContext, useState } from "react";
import { motion, MotionValue, useMotionValue, useReducedMotion } from "framer-motion";

interface ParallaxContextValue {
  x: MotionValue<number>;
  y: MotionValue<number>;
  enabled: boolean;
}

const ParallaxContext = createContext<ParallaxContextValue | null>(null);

export function useParallaxContext() {
  return useContext(ParallaxContext);
}

interface ParallaxGroupProps {
  children: ReactNode;
  className?: string;
}

// Trackea el mouse dentro de su propio recuadro (normalizado a -0.5..0.5) y lo
// comparte por contexto con los ParallaxLayer hijos, cada uno moviéndose a su
// propia profundidad. Reemplaza a TiltCard en el hero: en vez de un bloque
// rígido que rota, varias capas independientes se desplazan a velocidades
// distintas, dando sensación de profundidad real.
export default function ParallaxGroup({ children, className }: ParallaxGroupProps) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const prefersReducedMotion = useReducedMotion();
  const [canHover] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(hover: hover) and (pointer: fine)").matches
  );
  const enabled = canHover && !prefersReducedMotion;

  function handleMouseMove(e: MouseEvent<HTMLDivElement>) {
    if (!enabled) return;
    const rect = e.currentTarget.getBoundingClientRect();
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top) / rect.height - 0.5);
  }

  function handleMouseLeave() {
    x.set(0);
    y.set(0);
  }

  return (
    <motion.div className={className} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
      <ParallaxContext.Provider value={{ x, y, enabled }}>{children}</ParallaxContext.Provider>
    </motion.div>
  );
}
```

- [ ] **Step 2: Write `ParallaxLayer.tsx`**

```tsx
import { ReactNode } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useParallaxContext } from "./ParallaxGroup";

interface ParallaxLayerProps {
  children: ReactNode;
  className?: string;
  depth?: number;
  range?: number;
}

// Una capa dentro de un ParallaxGroup. depth=0 no se mueve, depth=1 se mueve
// range px hacia donde está el mouse. Si se usa fuera de un ParallaxGroup (o
// en touch/reduced-motion), queda estática — nunca lanza error.
export default function ParallaxLayer({ children, className, depth = 0.5, range = 24 }: ParallaxLayerProps) {
  const ctx = useParallaxContext();
  const fallback = useMotionValue(0);
  const maxOffset = range * depth;

  const translateX = useSpring(useTransform(ctx?.x ?? fallback, [-0.5, 0.5], [-maxOffset, maxOffset]), {
    stiffness: 150,
    damping: 20,
  });
  const translateY = useSpring(useTransform(ctx?.y ?? fallback, [-0.5, 0.5], [-maxOffset, maxOffset]), {
    stiffness: 150,
    damping: 20,
  });

  const enabled = ctx?.enabled ?? false;

  return (
    <motion.div className={className} style={enabled ? { x: translateX, y: translateY } : undefined}>
      {children}
    </motion.div>
  );
}
```

- [ ] **Step 3: Verify**

Run: `npm run typecheck` (inside `frontend/`)
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add frontend/src/components/ui/ParallaxGroup.tsx frontend/src/components/ui/ParallaxLayer.tsx
git commit -m "feat: add ParallaxGroup and ParallaxLayer primitives"
```

---

### Task 2: Apply parallax depth to the Home hero collage

**Files:**
- Modify: `frontend/src/pages/Home.tsx`

**Interfaces:**
- Consumes: `ParallaxGroup`, `ParallaxLayer` (Task 1). Still uses `RevealOnScroll`, `FloatingElement`, `GlassPanel` (already present).

This replaces the hero's collage wrapper — currently `RevealOnScroll` directly wrapping a `TiltCard` (main photo) plus a `FloatingElement > TiltCard` (secondary photo) plus a `FloatingElement > SpinningBadge` plus a `GlassPanel` (reviews chip) — with `RevealOnScroll > ParallaxGroup`, where each visual element becomes a `ParallaxLayer` at a different `depth`. The outermost background halos in the hero `<section>` (lines ~176-183, the two blurred radial-gradient circles) are **not** touched — they already read as "barely moving" by being fully static, which satisfies the design spec's depth-0 layer; do not add new halo elements or wire the existing ones into the parallax tracking.

- [ ] **Step 1: Add the two new imports**

At the top of `frontend/src/pages/Home.tsx`, alongside the existing `ui` imports:

```tsx
import ParallaxGroup from "../components/ui/ParallaxGroup";
import ParallaxLayer from "../components/ui/ParallaxLayer";
```

(Keep the existing `TiltCard` import — it's still used in the category cards section further down.)

- [ ] **Step 2: Replace the collage block**

Replace this entire block (currently the `<RevealOnScroll delay={200} className="relative mx-auto w-full max-w-md lg:max-w-none">...</RevealOnScroll>` that contains the collage):

```tsx
<RevealOnScroll delay={200} className="relative mx-auto w-full max-w-md lg:max-w-none">
  <TiltCard maxTilt={6} className="relative aspect-[4/5] w-full overflow-hidden rounded-[2.25rem] bg-white/5 shadow-warm-lg ring-1 ring-white/10">
    {tortasHero?.url && (
      <img
        src={tortasHero.url}
        alt="Tortas artesanales de Fusión con Sazón"
        className="h-full w-full object-cover"
      />
    )}
    <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/55 via-transparent to-transparent" />
  </TiltCard>

  {heroSecondary && (
    <FloatingElement className="absolute -bottom-8 -left-6 hidden sm:block">
      <TiltCard maxTilt={8} className="h-40 w-40 overflow-hidden rounded-3xl shadow-warm-lg ring-4 ring-brand-dark">
        <img src={heroSecondary} alt="Catering de Fusión con Sazón" className="h-full w-full object-cover" />
      </TiltCard>
    </FloatingElement>
  )}

  <FloatingElement delay={1.2} className="absolute -right-3 -top-7 h-24 w-24 md:h-28 md:w-28">
    <SpinningBadge className="h-full w-full" />
  </FloatingElement>

  <GlassPanel className="absolute -bottom-5 right-4 flex items-center gap-2 !border-transparent !bg-white/70 px-4 py-2.5">
    <IconGoogle className="h-4 w-4 shrink-0" />
    <span className="text-sm font-extrabold text-brand-dark">5.0</span>
    <span className="text-xs tracking-tighter text-brand-mustard">★★★★★</span>
  </GlassPanel>
</RevealOnScroll>
```

with:

```tsx
<RevealOnScroll delay={200}>
  <ParallaxGroup className="relative mx-auto w-full max-w-md lg:max-w-none">
    {/* Capa: sombra proyectada, casi no se mueve */}
    <ParallaxLayer
      depth={0.1}
      range={16}
      className="pointer-events-none absolute inset-x-6 -bottom-4 top-10 rounded-[2.25rem] bg-black/30 blur-2xl"
    />

    {/* Capa: foto principal */}
    <ParallaxLayer
      depth={0.3}
      className="relative aspect-[4/5] w-full overflow-hidden rounded-[2.25rem] bg-white/5 shadow-warm-lg ring-1 ring-white/10"
    >
      {tortasHero?.url && (
        <img
          src={tortasHero.url}
          alt="Tortas artesanales de Fusión con Sazón"
          className="h-full w-full object-cover"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/55 via-transparent to-transparent" />
    </ParallaxLayer>

    {/* Capa: foto secundaria flotante */}
    {heroSecondary && (
      <FloatingElement className="absolute -bottom-8 -left-6 hidden sm:block">
        <ParallaxLayer depth={0.6} className="h-40 w-40 overflow-hidden rounded-3xl shadow-warm-lg ring-4 ring-brand-dark">
          <img src={heroSecondary} alt="Catering de Fusión con Sazón" className="h-full w-full object-cover" />
        </ParallaxLayer>
      </FloatingElement>
    )}

    {/* Capa: sello giratorio, la que más se mueve */}
    <FloatingElement delay={1.2} className="absolute -right-3 -top-7 h-24 w-24 md:h-28 md:w-28">
      <ParallaxLayer depth={1} className="h-full w-full">
        <SpinningBadge className="h-full w-full" />
      </ParallaxLayer>
    </FloatingElement>

    {/* Capa: chip de reseñas, también la más cercana */}
    <ParallaxLayer depth={1} className="absolute -bottom-5 right-4">
      <GlassPanel className="flex items-center gap-2 !border-transparent !bg-white/70 px-4 py-2.5">
        <IconGoogle className="h-4 w-4 shrink-0" />
        <span className="text-sm font-extrabold text-brand-dark">5.0</span>
        <span className="text-xs tracking-tighter text-brand-mustard">★★★★★</span>
      </GlassPanel>
    </ParallaxLayer>
  </ParallaxGroup>
</RevealOnScroll>
```

Note the shadow layer (`bg-black/30 blur-2xl`) is new — it did not exist before. It's a soft blob behind the main photo card that gives the collage a projected-shadow feel. `pointer-events-none` keeps it from ever intercepting the mouse events `ParallaxGroup` needs.

- [ ] **Step 3: Verify**

Run: `npm run typecheck`
Expected: no errors — in particular, confirm `TiltCard` is still imported (used later in the file) and there's no unused-import warning for it.

Run: `npm run dev`, open `http://localhost:5173/`:
- The hero collage should look visually similar at rest (same photos, same rounded corners, same chip/badge positions).
- Moving the mouse over the hero should make the badge and reviews chip drift the most, the secondary photo drift less, the main photo drift only slightly, and the new soft shadow blob barely move at all — each at a visibly different speed, not all together as one block.
- On a touch device / narrow viewport, nothing should drift (parallax disabled).
- With OS "reduce motion" enabled, nothing should drift either.

- [ ] **Step 4: Commit**

```bash
git add frontend/src/pages/Home.tsx
git commit -m "feat: replace hero collage tilt with layered parallax depth"
```

---

### Task 3: Scale up Home's "Categorías" and "Cómo trabajamos" sections

**Files:**
- Modify: `frontend/src/pages/Home.tsx`

**Interfaces:**
- Consumes: `RevealOnScroll`, `TiltCard` (already imported).

Two changes in this task:
1. **Categorías**: bigger heading, more section padding, bigger card padding. Column count stays at 3 (not reduced to 2) because there are always exactly 3 hardcoded cards (`foodCards`) — dropping to 2 columns would leave one card alone on its own row, which looks broken rather than premium. Instead this satisfies the spec's "o las tarjetas se agrandan" alternative.
2. **Cómo trabajamos**: restructured from a 3-column grid of boxed cards into a vertical list (icon circle + text, stacked), matching the "premium spacious" mockup approved during brainstorming. The large background watermark number is dropped — it doesn't fit the new list layout and wasn't part of the approved mockup.

- [ ] **Step 1: Scale up the Categorías section**

Replace:

```tsx
      <section className="mx-auto max-w-6xl px-4 py-20 md:py-28">
        <div className="mb-12 max-w-2xl">
          <RevealOnScroll>
            <p className="font-script -rotate-2 text-4xl leading-none text-brand md:text-5xl">
              Elegí tu
            </p>
          </RevealOnScroll>
          <RevealOnScroll delay={70}>
            <h2 className="font-display mt-1 text-4xl font-extrabold uppercase tracking-tightest text-brand-dark md:text-5xl">
              Experiencia
            </h2>
          </RevealOnScroll>
          <RevealOnScroll delay={110}>
            <span className="mt-5 block h-1 w-16 rounded-full bg-brand-mustard" />
          </RevealOnScroll>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
```

with:

```tsx
      <section className="mx-auto max-w-6xl px-4 py-28 md:py-36">
        <div className="mb-16 max-w-2xl">
          <RevealOnScroll>
            <p className="font-script -rotate-2 text-4xl leading-none text-brand md:text-5xl">
              Elegí tu
            </p>
          </RevealOnScroll>
          <RevealOnScroll delay={70}>
            <h2 className="font-display mt-2 text-5xl font-extrabold uppercase tracking-tightest text-brand-dark md:text-7xl">
              Experiencia
            </h2>
          </RevealOnScroll>
          <RevealOnScroll delay={110}>
            <span className="mt-6 block h-1 w-16 rounded-full bg-brand-mustard" />
          </RevealOnScroll>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
```

Then, inside the same section, in the card body (still within the `foodCards.map(...)` block), replace:

```tsx
                  <div className="relative p-6 md:p-7">
```

with:

```tsx
                  <div className="relative p-8 md:p-10">
```

(Leave everything else in the card — the `0{i+1}` index, the tag/title/copy/arrow, the `TiltCard maxTilt={4}` wrapper — unchanged.)

- [ ] **Step 2: Restructure "Cómo trabajamos" into a vertical list**

Replace the entire section (from `{/* CÓMO TRABAJAMOS ... */}` comment through its closing `</section>`):

```tsx
      <section className="mx-auto max-w-6xl px-4 py-20 md:py-24">
        <div className="mb-12 max-w-2xl">
          <RevealOnScroll>
            <p className="font-script -rotate-2 text-4xl leading-none text-brand md:text-5xl">
              Así de simple
            </p>
          </RevealOnScroll>
          <RevealOnScroll delay={70}>
            <h2 className="font-display mt-1 text-4xl font-extrabold uppercase tracking-tightest text-brand-dark md:text-5xl">
              Cómo trabajamos
            </h2>
          </RevealOnScroll>
          <RevealOnScroll delay={110}>
            <span className="mt-5 block h-1 w-16 rounded-full bg-brand-mustard" />
          </RevealOnScroll>
        </div>

        <ol className="grid gap-6 md:grid-cols-3">
          {steps.map((s, i) => (
            <li
              key={s.title}
              className="group relative overflow-hidden rounded-[1.5rem] border border-brand-dark/10 bg-white p-8 transition-transform duration-500 hover:-translate-y-1.5"
            >
              <span className="font-display pointer-events-none absolute -right-2 -top-4 text-[7rem] font-extrabold leading-none text-brand-dark/5 transition-colors duration-500 group-hover:text-brand/10">
                {i + 1}
              </span>
              <RevealOnScroll delay={i * 110}>
                <span className="relative flex h-11 w-11 items-center justify-center rounded-full bg-brand-mustard font-display text-lg font-extrabold text-brand-dark">
                  {i + 1}
                </span>
                <h3 className="font-display relative mt-5 text-xl font-extrabold uppercase tracking-tight text-brand-dark">
                  {s.title}
                </h3>
                <p className="relative mt-3 leading-relaxed text-brand-dark/70">{s.body}</p>
              </RevealOnScroll>
            </li>
          ))}
        </ol>
      </section>
```

with:

```tsx
      <section className="mx-auto max-w-4xl px-4 py-28 md:py-36">
        <div className="mb-16 max-w-2xl">
          <RevealOnScroll>
            <p className="font-script -rotate-2 text-4xl leading-none text-brand md:text-5xl">
              Así de simple
            </p>
          </RevealOnScroll>
          <RevealOnScroll delay={70}>
            <h2 className="font-display mt-2 text-5xl font-extrabold uppercase tracking-tightest text-brand-dark md:text-7xl">
              Cómo trabajamos
            </h2>
          </RevealOnScroll>
          <RevealOnScroll delay={110}>
            <span className="mt-6 block h-1 w-16 rounded-full bg-brand-mustard" />
          </RevealOnScroll>
        </div>

        <ol className="flex flex-col gap-10 md:gap-12">
          {steps.map((s, i) => (
            <li key={s.title} className="flex items-start gap-6 md:gap-8">
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-brand-mustard font-display text-xl font-extrabold text-brand-dark md:h-16 md:w-16 md:text-2xl">
                {i + 1}
              </span>
              <RevealOnScroll delay={i * 110} className="pt-1">
                <h3 className="font-display text-2xl font-extrabold uppercase tracking-tight text-brand-dark md:text-3xl">
                  {s.title}
                </h3>
                <p className="mt-3 max-w-xl text-lg leading-relaxed text-brand-dark/70">{s.body}</p>
              </RevealOnScroll>
            </li>
          ))}
        </ol>
      </section>
```

(The section switches from `max-w-6xl` to `max-w-4xl` because a vertical list of text reads better narrower than a 3-column card grid did — this is intentional, not a typo.)

- [ ] **Step 3: Verify**

Run: `npm run typecheck`
Expected: no errors.

Run: `npm run dev`, open `http://localhost:5173/`:
- Categorías: 3 cards still side by side on desktop, visibly bigger internal padding.
- Cómo trabajamos: now a vertical list of 3 rows (number circle + title + body), not a 3-column grid of boxed cards, with generous spacing between rows.
- Both headings are noticeably larger than before.

- [ ] **Step 4: Commit**

```bash
git add frontend/src/pages/Home.tsx
git commit -m "feat: scale up Home categorías and restructure cómo trabajamos as a list"
```

---

### Task 4: Scale up Home's Nosotros-preview, Testimonios, and CTA final sections

**Files:**
- Modify: `frontend/src/pages/Home.tsx`

**Interfaces:**
- Consumes: `RevealOnScroll`, `GlassPanel` (already imported).

Testimonials drop from 3 to 2 columns (their count is dynamic — driven by the admin panel — so "fewer columns" is the safer default here, unlike the hardcoded 3-item Categorías grid in Task 3).

- [ ] **Step 1: Scale up the Nosotros-preview section padding**

Replace:

```tsx
        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 py-20 md:py-24 lg:grid-cols-2 lg:gap-16">
```

with:

```tsx
        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 py-28 md:py-36 lg:grid-cols-2 lg:gap-16">
```

(Leave the rest of that section — the photo, the "Nosotros" heading which is already `text-5xl md:text-6xl lg:text-7xl`, the paragraph, the link — unchanged. It's already at the premium scale.)

- [ ] **Step 2: Scale up Testimonios**

Replace:

```tsx
      <section id="testimonios" className="bg-brand-gray px-4 py-20 md:py-24">
        <div className="mx-auto max-w-5xl">
          <div className="mb-12 text-center">
            <RevealOnScroll>
              <p className="font-script -rotate-2 text-4xl leading-none text-brand md:text-5xl">
                Lo que dicen
              </p>
            </RevealOnScroll>
            <RevealOnScroll delay={70}>
              <h2 className="font-display mt-1 text-4xl font-extrabold uppercase tracking-tightest text-brand-dark md:text-5xl">
                de nosotros
              </h2>
            </RevealOnScroll>
```

with:

```tsx
      <section id="testimonios" className="bg-brand-gray px-4 py-28 md:py-36">
        <div className="mx-auto max-w-5xl">
          <div className="mb-16 text-center">
            <RevealOnScroll>
              <p className="font-script -rotate-2 text-4xl leading-none text-brand md:text-5xl">
                Lo que dicen
              </p>
            </RevealOnScroll>
            <RevealOnScroll delay={70}>
              <h2 className="font-display mt-2 text-5xl font-extrabold uppercase tracking-tightest text-brand-dark md:text-7xl">
                de nosotros
              </h2>
            </RevealOnScroll>
```

Then, further down in the same section, replace:

```tsx
          <div className="grid gap-6 md:grid-cols-3">
            {testimonials.map((t, i) => {
```

with:

```tsx
          <div className="grid gap-8 md:grid-cols-2">
            {testimonials.map((t, i) => {
```

(Leave the `blockquote` internals, the rating chip `GlassPanel`, and the "Ver todas las reseñas" link unchanged.)

- [ ] **Step 3: Scale up the CTA final section**

Replace:

```tsx
        <div className="relative mx-auto flex max-w-4xl flex-col items-center px-4 py-20 text-center md:py-24">
          <RevealOnScroll>
            <p className="font-script -rotate-2 text-4xl leading-none text-white/90 md:text-5xl">
              ¿Armamos algo rico?
            </p>
          </RevealOnScroll>
          <RevealOnScroll delay={70}>
            <h2 className="font-display mt-2 max-w-2xl text-4xl font-extrabold uppercase leading-[0.95] tracking-tightest text-white md:text-6xl">
              Contanos tu evento
            </h2>
          </RevealOnScroll>
```

with:

```tsx
        <div className="relative mx-auto flex max-w-4xl flex-col items-center px-4 py-28 text-center md:py-36">
          <RevealOnScroll>
            <p className="font-script -rotate-2 text-4xl leading-none text-white/90 md:text-5xl">
              ¿Armamos algo rico?
            </p>
          </RevealOnScroll>
          <RevealOnScroll delay={70}>
            <h2 className="font-display mt-2 max-w-2xl text-5xl font-extrabold uppercase leading-[0.95] tracking-tightest text-white md:text-7xl">
              Contanos tu evento
            </h2>
          </RevealOnScroll>
```

(Leave the paragraph, the WhatsApp button, and the phone link unchanged.)

- [ ] **Step 4: Verify**

Run: `npm run typecheck`
Expected: no errors.

Run: `npm run dev`, open `http://localhost:5173/` and scroll through the whole page:
- Nosotros-preview, Testimonios, and CTA final sections all have noticeably more vertical breathing room than before.
- Testimonials now show 2 per row on desktop instead of 3 (wraps to a 3rd row if there are more than 2 published testimonials).
- Both "de nosotros" and "Contanos tu evento" headings are visibly bigger.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/pages/Home.tsx
git commit -m "feat: scale up Home nosotros-preview, testimonios, and CTA sections"
```

---

### Task 5: Scale up `MediaGrid` spacing

**Files:**
- Modify: `frontend/src/components/MediaGrid.tsx`

**Interfaces:**
- No new consumers/producers — purely a class-name change to the shared gallery grid used by `TortasYPostres`, `Catering`, and `Eventos`.

Column count stays the same (photo galleries need enough density to browse many items) — the "more air" principle here is satisfied by significantly bigger gaps between cards, per the spec's explicit alternative to reducing columns.

- [ ] **Step 1: Widen the grid gaps**

Replace:

```tsx
    <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 md:gap-7">
```

with:

```tsx
    <div className="grid grid-cols-2 gap-7 sm:grid-cols-3 md:gap-10">
```

- [ ] **Step 2: Verify**

Run: `npm run typecheck`
Expected: no errors.

Run: `npm run dev`, open `http://localhost:5173/tortas-y-postres` (and `/catering`, `/eventos`):
- Same number of columns as before, visibly more space between photos.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/MediaGrid.tsx
git commit -m "feat: widen MediaGrid gaps for more breathing room"
```

---

### Task 6: Scale up TortasYPostres, Catering, and Eventos page headers/sections

**Files:**
- Modify: `frontend/src/pages/TortasYPostres.tsx`
- Modify: `frontend/src/pages/Catering.tsx`
- Modify: `frontend/src/pages/Eventos.tsx`

**Interfaces:**
- No new consumers/producers — class-name changes only. These 3 files share the same header pattern almost verbatim; apply the same edit to each.

- [ ] **Step 1: Scale up `TortasYPostres.tsx`**

Replace:

```tsx
      <section className="bg-brand-dark py-16 md:py-20 text-center px-4">
        <h1 className="text-4xl md:text-5xl font-extrabold uppercase tracking-tight text-white">
          Tortas y Postres
        </h1>
        <span className="inline-block mt-4 w-24 h-1 bg-brand-mustard rounded-full" />
      </section>

      <Marquee items={["Tortas a medida", "Postres artesanales", "100% Casero", "Dulce y Casero"]} />

      <section className="max-w-6xl mx-auto px-4 py-16 md:py-20">
        <MediaGrid page="TORTAS" />
      </section>

      <section className="bg-brand-gray py-16 px-4 text-center">
        <h2 className="text-2xl md:text-3xl font-extrabold mb-4 text-brand-dark">
          {get("tortas_combos_title", "¡Deleitate con nuestros Combos!")}
        </h2>
```

with:

```tsx
      <section className="bg-brand-dark py-24 md:py-32 text-center px-4">
        <h1 className="text-5xl md:text-7xl font-extrabold uppercase tracking-tight text-white">
          Tortas y Postres
        </h1>
        <span className="inline-block mt-6 w-24 h-1 bg-brand-mustard rounded-full" />
      </section>

      <Marquee items={["Tortas a medida", "Postres artesanales", "100% Casero", "Dulce y Casero"]} />

      <section className="max-w-6xl mx-auto px-4 py-20 md:py-28">
        <MediaGrid page="TORTAS" />
      </section>

      <section className="bg-brand-gray py-24 md:py-28 px-4 text-center">
        <h2 className="text-3xl md:text-4xl font-extrabold mb-4 text-brand-dark">
          {get("tortas_combos_title", "¡Deleitate con nuestros Combos!")}
        </h2>
```

- [ ] **Step 2: Scale up `Catering.tsx`**

Replace:

```tsx
      <section className="bg-brand-dark py-16 md:py-20 text-center px-4">
        <h1 className="text-4xl md:text-5xl font-extrabold uppercase tracking-tight text-white">Catering</h1>
        <span className="inline-block mt-4 w-24 h-1 bg-brand-mustard rounded-full" />
      </section>

      <Marquee items={["Catering a medida", "Sabor y Eventos", "Comida Venezolana", "Comida Uruguaya"]} />

      <section className="max-w-6xl mx-auto px-4 py-16 md:py-20">
```

with:

```tsx
      <section className="bg-brand-dark py-24 md:py-32 text-center px-4">
        <h1 className="text-5xl md:text-7xl font-extrabold uppercase tracking-tight text-white">Catering</h1>
        <span className="inline-block mt-6 w-24 h-1 bg-brand-mustard rounded-full" />
      </section>

      <Marquee items={["Catering a medida", "Sabor y Eventos", "Comida Venezolana", "Comida Uruguaya"]} />

      <section className="max-w-6xl mx-auto px-4 py-20 md:py-28">
```

(Leave the category filter buttons and `MediaGrid` call unchanged — only the section padding and `h1` size change.)

- [ ] **Step 3: Scale up `Eventos.tsx`**

Replace:

```tsx
      <section className="bg-brand-dark py-16 md:py-20 text-center px-4">
        <h1 className="text-4xl md:text-5xl font-extrabold uppercase tracking-tight text-white">Eventos</h1>
        <span className="inline-block mt-4 w-24 h-1 bg-brand-mustard rounded-full" />
      </section>

      <Marquee items={["Celebrar y Compartir", "Eventos a medida", "Fotos y Videos", "Momentos Inolvidables"]} />

      <section className="max-w-6xl mx-auto px-4 py-16 md:py-20">
```

with:

```tsx
      <section className="bg-brand-dark py-24 md:py-32 text-center px-4">
        <h1 className="text-5xl md:text-7xl font-extrabold uppercase tracking-tight text-white">Eventos</h1>
        <span className="inline-block mt-6 w-24 h-1 bg-brand-mustard rounded-full" />
      </section>

      <Marquee items={["Celebrar y Compartir", "Eventos a medida", "Fotos y Videos", "Momentos Inolvidables"]} />

      <section className="max-w-6xl mx-auto px-4 py-20 md:py-28">
```

- [ ] **Step 4: Verify**

Run: `npm run typecheck`
Expected: no errors.

Run: `npm run dev`, open `/tortas-y-postres`, `/catering`, `/eventos`:
- Each page's dark header band is visibly taller, with a much bigger page title.
- The gallery section below has more padding around it.
- Tortas' combos band at the bottom has a bigger heading too.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/pages/TortasYPostres.tsx frontend/src/pages/Catering.tsx frontend/src/pages/Eventos.tsx
git commit -m "feat: scale up TortasYPostres, Catering, and Eventos page headers"
```

---

### Task 7: Scale up Nosotros.tsx

**Files:**
- Modify: `frontend/src/pages/Nosotros.tsx`

**Interfaces:**
- No new consumers/producers — class-name changes only. This file already got `GlassPanel`/`RevealOnScroll` treatment on its two story cards in the previous plan; this task only changes sizing, not structure.

- [ ] **Step 1: Scale up the page header**

Replace:

```tsx
      <section className="bg-brand-dark py-16 md:py-20 text-center px-4">
        <h1 className="font-display text-4xl md:text-5xl font-extrabold uppercase tracking-tightest text-white">
          Nosotros
        </h1>
        <span className="inline-block mt-4 w-24 h-1 bg-brand-mustard rounded-full" />
      </section>
```

with:

```tsx
      <section className="bg-brand-dark py-24 md:py-32 text-center px-4">
        <h1 className="font-display text-5xl md:text-7xl font-extrabold uppercase tracking-tightest text-white">
          Nosotros
        </h1>
        <span className="inline-block mt-6 w-24 h-1 bg-brand-mustard rounded-full" />
      </section>
```

- [ ] **Step 2: Scale up the photo/quote section**

Replace:

```tsx
      <section className="relative bg-brand-light py-16 md:py-24 px-4 text-center overflow-hidden">
```

with:

```tsx
      <section className="relative bg-brand-light py-24 md:py-32 px-4 text-center overflow-hidden">
```

Then, further down in the same section, replace:

```tsx
        <h2 className="font-display text-3xl md:text-5xl font-black uppercase tracking-tightest text-brand-dark mb-10">
```

with:

```tsx
        <h2 className="font-display text-4xl md:text-6xl font-black uppercase tracking-tightest text-brand-dark mb-10">
```

And replace:

```tsx
          <p className="relative text-xl md:text-2xl text-brand-dark/90 font-medium leading-relaxed whitespace-pre-line">
```

with:

```tsx
          <p className="relative text-2xl md:text-3xl text-brand-dark/90 font-medium leading-relaxed whitespace-pre-line">
```

- [ ] **Step 3: Scale up the two story card panels**

In the first story card ("Dejarlo todo"), replace:

```tsx
        <RevealOnScroll variant="fade-scale">
          <GlassPanel className="relative flex h-full flex-col justify-center overflow-hidden !rounded-none !border-0 bg-brand-dark p-8 text-white sm:p-12 md:p-16">
```

with:

```tsx
        <RevealOnScroll variant="fade-scale">
          <GlassPanel className="relative flex h-full flex-col justify-center overflow-hidden !rounded-none !border-0 bg-brand-dark p-10 text-white sm:p-14 md:p-20">
```

(If the exact className string in the file differs slightly from the snippet above — e.g. class order — locate the `GlassPanel` opening tag for the "Dejarlo todo" card by its content and apply the same padding change: `p-8` → `p-10`, `sm:p-12` → `sm:p-14`, `md:p-16` → `md:p-20`, leaving every other class untouched.)

Then, inside that same card, replace:

```tsx
          <h3 className="font-display relative mt-2 text-3xl font-extrabold uppercase leading-[0.95] tracking-tightest md:text-4xl lg:text-5xl">
            para seguir nuestro sueño
          </h3>
```

with:

```tsx
          <h3 className="font-display relative mt-2 text-4xl font-extrabold uppercase leading-[0.95] tracking-tightest md:text-5xl lg:text-6xl">
            para seguir nuestro sueño
          </h3>
```

Repeat both changes (padding and heading size) on the second story card ("¿Por qué Fusión con Sazón?") — locate its `GlassPanel` (the one with the `style={{ background: "linear-gradient(180deg,#FDF3E4 0%,#FAF8F5 100%)" }}` prop) and its `h3` containing "Fusión con Sazón?", applying the identical `p-8`→`p-10`, `sm:p-12`→`sm:p-14`, `md:p-16`→`md:p-20` and `text-3xl`→`text-4xl`, `md:text-4xl`→`md:text-5xl`, `lg:text-5xl`→`lg:text-6xl` changes.

- [ ] **Step 4: Verify**

Run: `npm run typecheck`
Expected: no errors.

Run: `npm run dev`, open `http://localhost:5173/nosotros`:
- Header band taller, title bigger.
- Photo/quote section has more padding, bigger "Somos Herminia y Oscar" heading and bigger quote text.
- Both story cards have more internal padding and a bigger heading than before.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/pages/Nosotros.tsx
git commit -m "feat: scale up Nosotros page header, quote section, and story cards"
```

---

## Self-review notes

- **Spec coverage:** Task 1-2 cover the hero's layered parallax depth (replacing `TiltCard` there specifically, per the spec). Tasks 3-4 cover all of Home's remaining sections. Task 5 covers the shared gallery grid (Tortas/Catering/Eventos). Task 6 covers those 3 pages' own headers/sections. Task 7 covers Nosotros. All 5 public pages are touched; admin and backend are not.
- **TiltCard scope:** explicitly kept in category cards and `MediaGrid` (Task 3, Task 5 don't remove it) — only removed from the hero collage (Task 2), matching the Global Constraints.
- **Column-count decisions:** Categorías (Task 3) keeps 3 columns because the array is hardcoded at exactly 3 items — reducing to 2 would leave an orphaned card. Testimonios (Task 4) drops to 2 columns because its count is dynamic (admin-managed) and doesn't have that constraint. `MediaGrid` (Task 5) keeps its column count and only widens gaps, since galleries need enough density to browse many photos. Each decision is stated explicitly in its task so a reviewer doesn't flag it as an inconsistency.
- **Type consistency:** `ParallaxGroup`/`ParallaxLayer` prop names (`depth`, `range`, `className`, `children`) are defined once in Task 1 and used identically in Task 2 — the only task that consumes them.
- **Testing:** no automated tests added, per the approved spec (project has no test runner). Each task has a concrete manual verification script instead of a placeholder.
