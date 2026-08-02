# 3D Visual Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give the Fusión con Sazón public frontend a sense of 3D depth (tilt on hover, floating elements, glass panels, smoother scroll reveals) inspired by senthora.ai, without touching the backend or the admin panel.

**Architecture:** Add Framer Motion as the only new dependency. Build four small, reusable primitives in `frontend/src/components/ui/` (`TiltCard`, `FloatingElement`, `RevealOnScroll`, `GlassPanel`), then swap them into the existing public pages (`Home`, `Nosotros`, `TortasYPostres`, `Catering`, `Eventos` via `MediaGrid`) in place of the current hand-rolled `[data-reveal]` IntersectionObserver and static hover effects.

**Tech Stack:** React 18, TypeScript, Vite 5, Tailwind CSS 3, Framer Motion (new).

## Global Constraints

- Only new dependency: `framer-motion` (frontend only — do not touch `backend/`).
- Brand palette stays exactly as-is: fuchsia `#E80541`, chocolate `#331806`, off-white `#FAF8F5`, mustard `#FFA610`, warm cream `#FDF3E4` (already in `frontend/tailwind.config.js` as `brand`, `brand-dark`, `brand-light`, `brand-mustard`).
- All motion must respect `prefers-reduced-motion` — handled globally via `<MotionConfig reducedMotion="user">`, not per-component checks.
- Tilt/hover effects must be inert on touch devices (no real hover) — gate on `window.matchMedia("(hover: hover) and (pointer: fine)")`.
- No Three.js, no 3D model assets — this is CSS-transform "3D of effect", not real 3D rendering.
- The admin panel (`frontend/src/admin/`) is out of scope — do not modify any file under that directory.
- No automated test framework exists in this project (`frontend/package.json` has no test runner) and the spec waives adding one for this change. Verification is `npm run typecheck`, `npm run build`, and manual visual checks in the dev server — described precisely in each task, not skipped.
- Every task must leave `npm run typecheck` passing before it's considered done.

---

### Task 1: Install Framer Motion and wire up global reduced-motion handling

**Files:**
- Modify: `frontend/package.json` (add dependency)
- Modify: `frontend/src/main.tsx`

**Interfaces:**
- Produces: `MotionConfig` wraps `<App />` app-wide, so every later task's `motion.*` component automatically respects `prefers-reduced-motion` with no per-component code.

- [ ] **Step 1: Install the dependency**

Run (inside `frontend/`):

```bash
npm install framer-motion
```

- [ ] **Step 2: Wrap the app in `MotionConfig`**

Edit `frontend/src/main.tsx`:

```tsx
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { MotionConfig } from "framer-motion";
import App from "./App";
import { AuthProvider } from "./context/AuthContext";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <MotionConfig reducedMotion="user">
      <BrowserRouter>
        <AuthProvider>
          <App />
        </AuthProvider>
      </BrowserRouter>
    </MotionConfig>
  </React.StrictMode>
);
```

- [ ] **Step 3: Verify the project still builds**

Run: `npm run typecheck` (inside `frontend/`)
Expected: no errors.

Run: `npm run dev`, open `http://localhost:5173/`
Expected: the home page loads exactly as before (no visible change yet — this task only wires up the provider).

- [ ] **Step 4: Commit**

```bash
git add frontend/package.json frontend/package-lock.json frontend/src/main.tsx
git commit -m "chore: add framer-motion and global reduced-motion config"
```

---

### Task 2: `RevealOnScroll` primitive

**Files:**
- Create: `frontend/src/components/ui/RevealOnScroll.tsx`

**Interfaces:**
- Produces:
  ```ts
  type RevealVariant = "fade-slide" | "fade-scale";
  interface RevealOnScrollProps {
    children: ReactNode;
    variant?: RevealVariant;   // default "fade-slide"
    delay?: number;            // milliseconds, default 0
    className?: string;
  }
  export default function RevealOnScroll(props: RevealOnScrollProps): JSX.Element;
  ```
- Consumes: nothing from earlier tasks besides the `MotionConfig` set up in Task 1.

- [ ] **Step 1: Write the component**

```tsx
import { motion, Variants } from "framer-motion";
import { ReactNode } from "react";

type RevealVariant = "fade-slide" | "fade-scale";

interface RevealOnScrollProps {
  children: ReactNode;
  variant?: RevealVariant;
  delay?: number;
  className?: string;
}

const REVEAL_VARIANTS: Record<RevealVariant, Variants> = {
  "fade-slide": {
    hidden: { opacity: 0, y: 26 },
    visible: { opacity: 1, y: 0 },
  },
  "fade-scale": {
    hidden: { opacity: 0, scale: 0.94 },
    visible: { opacity: 1, scale: 1 },
  },
};

// Reemplaza al IntersectionObserver manual de [data-reveal]: mismo timing y
// umbral, pero declarativo y sin manejar listeners a mano.
export default function RevealOnScroll({
  children,
  variant = "fade-slide",
  delay = 0,
  className,
}: RevealOnScrollProps) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.06, margin: "0px 0px -8% 0px" }}
      variants={REVEAL_VARIANTS[variant]}
      transition={{ duration: 0.75, delay: delay / 1000, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}
```

- [ ] **Step 2: Verify it compiles**

Run: `npm run typecheck`
Expected: no errors. (The component isn't used anywhere yet, so there's nothing to see visually — that happens in Task 6.)

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/ui/RevealOnScroll.tsx
git commit -m "feat: add RevealOnScroll primitive"
```

---

### Task 3: `TiltCard` primitive

**Files:**
- Create: `frontend/src/components/ui/TiltCard.tsx`

**Interfaces:**
- Produces:
  ```ts
  interface TiltCardProps {
    children: ReactNode;
    className?: string;
    maxTilt?: number; // degrees, default 10
  }
  export default function TiltCard(props: TiltCardProps): JSX.Element;
  ```
- Consumes: nothing from earlier tasks besides `MotionConfig` (Task 1).

- [ ] **Step 1: Write the component**

```tsx
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { ReactNode, useState, MouseEvent } from "react";

interface TiltCardProps {
  children: ReactNode;
  className?: string;
  maxTilt?: number;
}

// Inclina la tarjeta en 3D siguiendo la posición del mouse. Se desactiva en
// touch (no hay hover real) para no dejar la tarjeta "trabada" en un ángulo.
export default function TiltCard({ children, className, maxTilt = 10 }: TiltCardProps) {
  const [canTilt] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(hover: hover) and (pointer: fine)").matches
  );

  const x = useMotionValue(0.5);
  const y = useMotionValue(0.5);
  const rotateX = useSpring(useTransform(y, [0, 1], [maxTilt, -maxTilt]), {
    stiffness: 300,
    damping: 30,
  });
  const rotateY = useSpring(useTransform(x, [0, 1], [-maxTilt, maxTilt]), {
    stiffness: 300,
    damping: 30,
  });

  function handleMouseMove(e: MouseEvent<HTMLDivElement>) {
    if (!canTilt) return;
    const rect = e.currentTarget.getBoundingClientRect();
    x.set((e.clientX - rect.left) / rect.width);
    y.set((e.clientY - rect.top) / rect.height);
  }

  function handleMouseLeave() {
    x.set(0.5);
    y.set(0.5);
  }

  return (
    <motion.div
      className={className}
      style={canTilt ? { rotateX, rotateY, transformPerspective: 800 } : undefined}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </motion.div>
  );
}
```

- [ ] **Step 2: Verify it compiles**

Run: `npm run typecheck`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/ui/TiltCard.tsx
git commit -m "feat: add TiltCard primitive"
```

---

### Task 4: `FloatingElement` primitive

**Files:**
- Create: `frontend/src/components/ui/FloatingElement.tsx`

**Interfaces:**
- Produces:
  ```ts
  interface FloatingElementProps {
    children: ReactNode;
    className?: string;
    distance?: number; // px, default 14
    duration?: number; // seconds, default 7
    delay?: number;    // seconds, default 0
  }
  export default function FloatingElement(props: FloatingElementProps): JSX.Element;
  ```
- Consumes: nothing from earlier tasks besides `MotionConfig` (Task 1).

- [ ] **Step 1: Write the component**

```tsx
import { motion } from "framer-motion";
import { ReactNode } from "react";

interface FloatingElementProps {
  children: ReactNode;
  className?: string;
  distance?: number;
  duration?: number;
  delay?: number;
}

// Generaliza el "animate-float" que hoy vive en tailwind.config.js: mismo
// movimiento idle, pero como componente para usarlo en cualquier insignia
// o ícono sin depender de una clase de utilidad fija.
export default function FloatingElement({
  children,
  className,
  distance = 14,
  duration = 7,
  delay = 0,
}: FloatingElementProps) {
  return (
    <motion.div
      className={className}
      animate={{ y: [0, -distance, 0] }}
      transition={{ duration, delay, repeat: Infinity, ease: "easeInOut" }}
    >
      {children}
    </motion.div>
  );
}
```

- [ ] **Step 2: Verify it compiles**

Run: `npm run typecheck`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/ui/FloatingElement.tsx
git commit -m "feat: add FloatingElement primitive"
```

---

### Task 5: `GlassPanel` primitive

**Files:**
- Create: `frontend/src/components/ui/GlassPanel.tsx`

**Interfaces:**
- Produces:
  ```ts
  interface GlassPanelProps {
    children: ReactNode;
    className?: string;
  }
  export default function GlassPanel(props: GlassPanelProps): JSX.Element;
  ```
- Consumes: nothing (pure Tailwind, no Framer Motion).

- [ ] **Step 1: Write the component**

```tsx
import { ReactNode } from "react";

interface GlassPanelProps {
  children: ReactNode;
  className?: string;
}

// Glassmorphism: blur + borde translúcido + sombra cálida existente
// (shadow-warm ya definida en tailwind.config.js). Sin animación propia —
// se combina con RevealOnScroll donde haga falta entrada animada.
export default function GlassPanel({ children, className = "" }: GlassPanelProps) {
  return (
    <div
      className={`rounded-[1.5rem] border border-white/20 bg-white/10 shadow-warm backdrop-blur-md ${className}`}
    >
      {children}
    </div>
  );
}
```

- [ ] **Step 2: Verify it compiles**

Run: `npm run typecheck`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/ui/GlassPanel.tsx
git commit -m "feat: add GlassPanel primitive"
```

---

### Task 6: Apply primitives to `Home.tsx` hero and category cards

**Files:**
- Modify: `frontend/src/pages/Home.tsx`
- Modify: `frontend/src/index.css` (remove the now-unused `[data-reveal]` CSS block)

**Interfaces:**
- Consumes: `RevealOnScroll` (Task 2), `TiltCard` (Task 3), `FloatingElement` (Task 4), `GlassPanel` (Task 5).

This task replaces every `data-reveal` + inline `transitionDelay` pair in `Home.tsx` with `<RevealOnScroll delay={...}>`, wraps the hero's two photos in `TiltCard`, swaps `SpinningBadge`'s `animate-float-delayed` wrapper for `FloatingElement`, and wraps the reviews chip in `GlassPanel`.

- [ ] **Step 1: Import the new primitives**

At the top of `frontend/src/pages/Home.tsx`, add:

```tsx
import RevealOnScroll from "../components/ui/RevealOnScroll";
import TiltCard from "../components/ui/TiltCard";
import FloatingElement from "../components/ui/FloatingElement";
import GlassPanel from "../components/ui/GlassPanel";
```

- [ ] **Step 2: Replace hero text-column reveals**

Replace this block (lines ~237–303, the `<div className="text-center lg:text-left">...</div>` text column):

```tsx
<div className="text-center lg:text-left">
  <span
    data-reveal
    className="inline-flex items-center gap-2.5 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.22em] text-white/70 backdrop-blur-sm"
  >
```

with the `data-reveal`/`transitionDelay` pattern removed from each child and each child wrapped individually, e.g.:

```tsx
<div className="text-center lg:text-left">
  <RevealOnScroll>
    <span className="inline-flex items-center gap-2.5 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.22em] text-white/70 backdrop-blur-sm">
      <span className="h-1.5 w-1.5 rounded-full bg-brand-mustard" />
      Montevideo · La Unión
    </span>
  </RevealOnScroll>

  <RevealOnScroll delay={80}>
    <h1 className="font-display mt-7 text-[clamp(2.5rem,6.4vw,4.75rem)] font-extrabold uppercase leading-[0.92] tracking-tightest">
      <Headline text={heroText} />
    </h1>
  </RevealOnScroll>

  <RevealOnScroll delay={160}>
    <p className="mx-auto mt-7 max-w-md text-lg leading-relaxed text-white/70 lg:mx-0">
      {get(
        "home_hero_sub",
        "Catering, tortas y postres artesanales hechos por una pareja que cocina desde hace más de 20 años. Sabor de hogar, para tu mesa."
      )}
    </p>
  </RevealOnScroll>

  <RevealOnScroll delay={240}>
    <div className="mt-10 flex flex-col gap-3.5 sm:flex-row sm:justify-center lg:justify-start">
      <a
        href={waHref}
        target="_blank"
        rel="noreferrer"
        className="group inline-flex items-center justify-center gap-2.5 rounded-full bg-brand px-8 py-4 text-sm font-extrabold uppercase tracking-wide text-white shadow-warm transition hover:bg-brand-mustard hover:text-brand-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-mustard"
      >
        <IconWhatsApp className="h-5 w-5" />
        Solicitar presupuesto
      </a>
      <Link
        to="/catering"
        className="group inline-flex items-center justify-center gap-2 rounded-full border-2 border-white/25 px-8 py-4 text-sm font-extrabold uppercase tracking-wide text-white transition hover:border-white hover:bg-white hover:text-brand-dark"
      >
        Ver el menú
        <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
      </Link>
    </div>
  </RevealOnScroll>

  <RevealOnScroll delay={320}>
    <dl className="mt-12 flex flex-wrap justify-center gap-x-8 gap-y-5 border-t border-white/10 pt-8 lg:justify-start">
      {stats.map((s) => (
        <div key={s.label} className="text-center lg:text-left">
          <dt className="font-display text-3xl font-extrabold text-brand-mustard">{s.value}</dt>
          <dd className="mt-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/50">
            {s.label}
          </dd>
        </div>
      ))}
    </dl>
  </RevealOnScroll>
</div>
```

- [ ] **Step 3: Wrap the collage photos in `TiltCard` and the badge in `FloatingElement`**

Replace the collage block (the `<div data-reveal ... className="relative mx-auto w-full max-w-md lg:max-w-none">...</div>`) with:

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

  <GlassPanel className="absolute -bottom-5 right-4 flex items-center gap-2 !bg-white px-4 py-2.5 !border-transparent">
    <IconGoogle className="h-4 w-4 shrink-0" />
    <span className="text-sm font-extrabold text-brand-dark">5.0</span>
    <span className="text-xs tracking-tighter text-brand-mustard">★★★★★</span>
  </GlassPanel>
</RevealOnScroll>
```

Note: `SpinningBadge` keeps its own internal `absolute inset-0` SVG, so its wrapper no longer needs `animate-float-delayed` or explicit positioning classes — `FloatingElement` now owns the position (`absolute -right-3 -top-7 ...`) and the float animation.

- [ ] **Step 4: Replace remaining `data-reveal` spots in the same file**

Do the same replacement (`data-reveal` + `style={{ transitionDelay: "Xms" }}` → `<RevealOnScroll delay={X}>...</RevealOnScroll>`) for:
- The "Elegí tu / Experiencia" section heading (3 spans/h2)
- Each category card in `foodCards.map(...)` — wrap the `<Link>` itself in `<RevealOnScroll delay={i * 110}>`, and additionally wrap the card's image area in `<TiltCard maxTilt={4}>` so the category cards get a subtle tilt on hover
- The "Nosotros" split section heading and paragraph
- The "Cómo trabajamos" heading and each `<li>` step
- The testimonials heading, rating chip (wrap in `GlassPanel` instead of the current `rounded-full bg-white` div), and each testimonial `<blockquote>`
- The final CTA section's heading, paragraph, and button

For each, follow the exact pattern from Step 2: remove `data-reveal` and the inline `transitionDelay` style, wrap the element in `<RevealOnScroll delay={N}>` (keeping the same millisecond values already in the file).

- [ ] **Step 5: Remove the now-unused manual scroll-reveal `useEffect`**

Delete this block from `Home.tsx` (no longer needed — `RevealOnScroll` handles it per-element via Framer Motion's `whileInView`):

```tsx
useEffect(() => {
  const els = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));
  if (typeof IntersectionObserver === "undefined") {
    els.forEach((el) => el.classList.add("is-visible"));
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    },
    { rootMargin: "0px 0px -8% 0px", threshold: 0.06 }
  );
  els.forEach((el) => {
    if (!el.classList.contains("is-visible")) io.observe(el);
  });
  return () => io.disconnect();
}, [loading, testimonials.length, tortasPreview.length, nosotrosPhoto, cateringHero, eventosHero]);
```

- [ ] **Step 6: Remove the now-unused `[data-reveal]` CSS**

In `frontend/src/index.css`, delete this block (Framer Motion now owns entry animation, so this CSS has no more consumers anywhere in the codebase after this task):

```css
[data-reveal] {
  opacity: 0;
  transform: translateY(26px);
  transition: opacity 0.75s cubic-bezier(0.16, 1, 0.3, 1),
    transform 0.75s cubic-bezier(0.16, 1, 0.3, 1);
  will-change: opacity, transform;
}
[data-reveal].is-visible {
  opacity: 1;
  transform: none;
}
```

Also remove the `[data-reveal]` reset from the `prefers-reduced-motion` media query block, since there's nothing left to reset:

```css
[data-reveal] {
  opacity: 1;
  transform: none;
  transition: none;
}
```

(leave the rest of that media query block — the `animation: none !important` rules for `.animate-marquee` etc. — untouched, they still apply to `Marquee`/`ImageMarquee`, which this task doesn't touch).

- [ ] **Step 7: Verify**

Run: `npm run typecheck`
Expected: no errors — in particular, confirm there is no leftover reference to `data-reveal`, `IntersectionObserver`, or the deleted `useEffect`'s dependencies.

Run: `npm run dev`, open `http://localhost:5173/` in a desktop-width window:
- Scroll down: every section that used to fade in should still fade in, in the same order and with the same stagger.
- Move the mouse over the two hero photos: they should tilt slightly toward the cursor.
- The small floating photo and the spinning badge should bob up and down continuously.
- Hover a category card ("Tortas y Postres", "Catering", "Eventos"): it should tilt slightly in addition to the existing zoom/shadow effect.
- Resize the window to a narrow (mobile) width or use dev tools' touch emulation: hovering a category card should NOT tilt (touch is excluded).
- In OS accessibility settings, enable "reduce motion" (Windows: Settings → Accessibility → Visual effects → Animation effects, off), reload the page: content should appear immediately with no fade/slide, and the badge/photo should not bob.

- [ ] **Step 8: Commit**

```bash
git add frontend/src/pages/Home.tsx frontend/src/index.css
git commit -m "feat: apply 3D primitives to Home hero and category cards"
```

---

### Task 7: Apply `TiltCard` to `MediaGrid`

**Files:**
- Modify: `frontend/src/components/MediaGrid.tsx`

**Interfaces:**
- Consumes: `TiltCard` (Task 3).

`MediaGrid` is shared by `TortasYPostres`, `Catering`, and `Eventos` — this one change covers all three pages' galleries at once.

- [ ] **Step 1: Import `TiltCard`**

At the top of `frontend/src/components/MediaGrid.tsx`:

```tsx
import TiltCard from "./ui/TiltCard";
```

- [ ] **Step 2: Wrap each grid item**

Replace the `<figure>` element inside `ordered.map(...)`:

```tsx
<figure
  key={item.id}
  className="group relative aspect-square overflow-hidden rounded-2xl bg-brand-gray shadow-warm transition-shadow duration-300 hover:shadow-warm-lg"
>
```

with:

```tsx
<TiltCard
  key={item.id}
  maxTilt={5}
  className="group relative aspect-square overflow-hidden rounded-2xl bg-brand-gray shadow-warm transition-shadow duration-300 hover:shadow-warm-lg"
>
```

and change the closing `</figure>` at the end of that block to `</TiltCard>`. Everything inside (the `<img>`/`<video>`, the accent bar, the `<figcaption>`) stays exactly as-is — `TiltCard` renders a `motion.div`, which accepts the same children and `className` a `<figure>` did.

- [ ] **Step 3: Verify**

Run: `npm run typecheck`
Expected: no errors.

Run: `npm run dev`, open `http://localhost:5173/tortas-y-postres`:
- The gallery grid should look identical at rest.
- Hovering a photo should tilt it slightly toward the cursor, in addition to the existing zoom-in and title-overlay effects.
- Repeat on `/catering` and `/eventos` — same behavior, since all three use `MediaGrid`.

- [ ] **Step 4: Commit**

```bash
git add frontend/src/components/MediaGrid.tsx
git commit -m "feat: apply TiltCard to MediaGrid gallery items"
```

---

### Task 8: Apply `GlassPanel` and `RevealOnScroll` to `Nosotros.tsx` story cards

**Files:**
- Modify: `frontend/src/pages/Nosotros.tsx`

**Interfaces:**
- Consumes: `RevealOnScroll` (Task 2), `GlassPanel` (Task 5).

- [ ] **Step 1: Import the primitives**

At the top of `frontend/src/pages/Nosotros.tsx`:

```tsx
import RevealOnScroll from "../components/ui/RevealOnScroll";
import GlassPanel from "../components/ui/GlassPanel";
```

- [ ] **Step 2: Wrap the "Dejarlo todo" card**

Replace this `<section>` (the first of the two story cards, dark chocolate background):

```tsx
<section className="grid md:grid-cols-2">
  <div className="relative h-72 overflow-hidden md:h-auto md:min-h-[600px]">
    {dreamImg && <img src={dreamImg.url} alt="" className="h-full w-full object-cover" />}
    <span className="pointer-events-none absolute inset-y-0 right-0 hidden w-24 bg-gradient-to-l from-brand-dark to-transparent md:block" />
  </div>
  <div className="relative flex flex-col justify-center overflow-hidden bg-brand-dark p-8 text-white sm:p-12 md:p-16">
```

with the text panel becoming a `GlassPanel` wrapped in `RevealOnScroll`, keeping `bg-brand-dark` as a fallback background behind the glass (glass alone would be too transparent against arbitrary photo colors on the left):

```tsx
<section className="grid bg-brand-dark md:grid-cols-2">
  <div className="relative h-72 overflow-hidden md:h-auto md:min-h-[600px]">
    {dreamImg && <img src={dreamImg.url} alt="" className="h-full w-full object-cover" />}
    <span className="pointer-events-none absolute inset-y-0 right-0 hidden w-24 bg-gradient-to-l from-brand-dark to-transparent md:block" />
  </div>
  <RevealOnScroll variant="fade-scale">
    <GlassPanel className="relative flex h-full flex-col justify-center overflow-hidden !rounded-none !border-0 p-8 text-white sm:p-12 md:p-16">
```

(keep everything inside — the `01` watermark span, the `"Dejarlo todo"` script text, the heading, the divider, and the paragraph — unchanged), and close with:

```tsx
    </GlassPanel>
  </RevealOnScroll>
</section>
```

- [ ] **Step 3: Wrap the "¿Por qué Fusión con Sazón?" card the same way**

Apply the same transformation to the second story `<section>` (the light cream one): replace its inner `<div className="relative order-2 flex flex-col justify-center overflow-hidden p-8 sm:p-12 md:order-1 md:p-16" style={{ background: "linear-gradient(180deg,#FDF3E4 0%,#FAF8F5 100%)" }}>` with `<RevealOnScroll variant="fade-scale"><GlassPanel className="relative order-2 flex h-full flex-col justify-center overflow-hidden !rounded-none !border-0 p-8 sm:p-12 md:order-1 md:p-16" ...>` keeping the same inline `background` gradient as a style prop on `GlassPanel` (pass it through `style={{ background: "linear-gradient(180deg,#FDF3E4 0%,#FAF8F5 100%)" }}` on the `GlassPanel` element), and close with `</GlassPanel></RevealOnScroll>`.

- [ ] **Step 4: Verify**

Run: `npm run typecheck`
Expected: no errors.

Run: `npm run dev`, open `http://localhost:5173/nosotros`:
- Both story sections should look visually the same as before at first glance (same colors, same layout) but now have a subtle glass/blur edge and animate in (scale+fade) as you scroll to them.
- Confirm text is still fully legible against both the dark and light backgrounds — if the blur makes the mustard/brand-colored `font-script` accents or body text hard to read, reduce `bg-white/10` to `bg-white/5` in `GlassPanel`'s className override on this page and re-check.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/pages/Nosotros.tsx
git commit -m "feat: apply GlassPanel and RevealOnScroll to Nosotros story cards"
```

---

## Self-review notes

- **Spec coverage:** Task 1 covers the Framer Motion dependency and global `prefers-reduced-motion` handling. Tasks 2–5 cover the four primitives (`RevealOnScroll`, `TiltCard`, `FloatingElement`, `GlassPanel`) from the spec's "Componentes nuevos" table. Task 6 covers Home (hero collage tilt, badge float, reviews chip glass, category card tilt, all `data-reveal` spots). Task 7 covers Tortas/Catering/Eventos via the shared `MediaGrid`. Task 8 covers the two Nosotros cards. The admin panel is explicitly out of scope per the spec and untouched by every task.
- **Touch/reduced-motion:** handled once globally (Task 1's `MotionConfig`) and once per-primitive (`TiltCard`'s `matchMedia` gate in Task 3), rather than re-implemented per page — matches the spec's accessibility section without duplicating logic.
- **Type consistency:** `TiltCard`, `FloatingElement`, `RevealOnScroll`, and `GlassPanel` prop names/types are defined once in Tasks 2–5 and referenced identically in Tasks 6–8 (`delay` in ms for `RevealOnScroll`, `maxTilt` in degrees for `TiltCard`).
- **Testing:** no automated tests are added, per the approved spec (this project has no test runner configured). Each task instead has an explicit, concrete manual verification script — not "add appropriate tests" placeholders.
