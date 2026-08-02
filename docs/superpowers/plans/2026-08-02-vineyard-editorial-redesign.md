# Vineyard-Inspired Editorial Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the Home page (plus the shared Navbar and Footer) in an editorial, photography-and-typography-led style inspired by vineyard.co.za — full-bleed photo breaks, a serif display font, plain (non-card) testimonials, a mega footer — replacing the tilt/float/glass treatment from the previous iteration.

**Architecture:** Add one new font (Playfair Display) and a couple of small CSS utilities (arch-shaped image mask). Every other change is a rewrite of existing JSX sections in `Home.tsx`, `Navbar.tsx`, and `Footer.tsx` — no new component primitives are needed; `RevealOnScroll` (simple fade-in) is kept, `TiltCard`/`FloatingElement`/`GlassPanel` are dropped from every section this plan touches.

**Tech Stack:** React 18, TypeScript, Vite 5, Tailwind CSS 3, Framer Motion (only via the already-existing `RevealOnScroll`).

## Global Constraints

- No new dependencies (Playfair Display loads via the existing Google Fonts `@import` in `index.css`, same mechanism already used for the other 3 fonts).
- Brand palette unchanged: fuchsia `#E80541`, chocolate `#331806`, off-white `#FAF8F5`, mustard `#FFA610`. Do not adopt Vineyard's own cream/navy/terracotta palette.
- `TiltCard`, `FloatingElement`, `GlassPanel` are **not deleted** (other branches/pages may still reference them) but must **not be used** in any section this plan touches. `RevealOnScroll` stays in use for simple scroll fade-ins.
- Manrope remains the body font. Bricolage Grotesque is replaced by **Playfair Display** as the `font-display` family (used for all section headings, `h1`/`h2`/`h3`).
- Scope is **Home.tsx, Navbar.tsx, Footer.tsx only** — no other page. Admin panel and backend untouched.
- No automated test framework exists and none should be added. Verification is `npm run typecheck`, `npm run build`, and manual checks in the dev server.
- Every task must leave `npm run typecheck` passing before it's considered done.
- This is an experimental trial branch (`vineyard-editorial-redesign`) forked from `main` — it does not build on the other two visual-redesign branches.

---

### Task 1: Typography and CSS foundations

**Files:**
- Modify: `frontend/src/index.css`
- Modify: `frontend/tailwind.config.js`

**Interfaces:**
- Produces: `.font-display` now renders in Playfair Display; a new `.arch-mask` utility class any later task can apply to an `<img>` for the arch/dome crop.

- [ ] **Step 1: Add Playfair Display to the Google Fonts import**

In `frontend/src/index.css`, replace:

```css
@import url("https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,600;12..96,700;12..96,800&family=Manrope:wght@400;500;600;700;800&family=Caveat:wght@600;700&display=swap");
```

with:

```css
@import url("https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,600;12..96,700;12..96,800&family=Manrope:wght@400;500;600;700;800&family=Caveat:wght@600;700&family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&display=swap");
```

- [ ] **Step 2: Point `.font-display` at Playfair Display**

Replace:

```css
/* Títulos grandes: grotesca con carácter, apretada y en mayúsculas. */
.font-display {
  font-family: "Bricolage Grotesque", "Manrope", system-ui, sans-serif;
  font-optical-sizing: auto;
}
```

with:

```css
/* Títulos grandes: serif editorial, en vez de la grotesca en mayúsculas del
   diseño anterior — referencia: vineyard.co.za. */
.font-display {
  font-family: "Playfair Display", Georgia, "Times New Roman", serif;
}
```

- [ ] **Step 3: Add the arch-mask utility**

At the end of `frontend/src/index.css`, add:

```css
/* Recorte en arco/domo para una foto clave, motivo visual tomado de
   vineyard.co.za. border-radius asimétrico: esquinas superiores muy
   redondeadas, inferiores rectas. */
.arch-mask {
  border-radius: 999px 999px 0 0;
}
```

- [ ] **Step 4: Update `tailwind.config.js` display font fallback**

In `frontend/tailwind.config.js`, replace:

```js
      fontFamily: {
        // Body: geométrica cálida y muy legible. Reemplaza a system-ui.
        sans: ["Manrope", "system-ui", "-apple-system", "Segoe UI", "sans-serif"],
        // Display: grotesca con carácter para títulos grandes en mayúsculas.
        display: ['"Bricolage Grotesque"', "Manrope", "system-ui", "sans-serif"],
      },
```

with:

```js
      fontFamily: {
        // Body: geométrica cálida y muy legible. Reemplaza a system-ui.
        sans: ["Manrope", "system-ui", "-apple-system", "Segoe UI", "sans-serif"],
        // Display: serif editorial (referencia vineyard.co.za) para títulos grandes.
        display: ['"Playfair Display"', "Georgia", "serif"],
      },
```

(Both the `.font-display` CSS class and Tailwind's `font-display` utility class now agree — components use whichever one they already used, no JSX changes needed in this task.)

- [ ] **Step 5: Verify**

Run: `npm run typecheck` (inside `frontend/`)
Expected: no errors.

Run: `npm run dev`, open `http://localhost:5173/`
Expected: all existing `font-display` headings (h1 "Fusión con Sazón", h2 "Experiencia", etc.) now render in a serif typeface instead of the bold grotesque — this is expected and desired; later tasks refine the sections around it.

- [ ] **Step 6: Commit**

```bash
git add frontend/src/index.css frontend/tailwind.config.js
git commit -m "feat: switch display font to Playfair Display, add arch-mask utility"
```

---

### Task 2: Navbar scroll-shrink pill

**Files:**
- Modify: `frontend/src/components/Navbar.tsx`

**Interfaces:**
- No new props/exports — internal state only.

Currently the navbar is a plain sticky full-width white bar. This task makes it shrink into a rounded pill with a soft shadow once the user scrolls past the hero, matching Vineyard's nav behavior.

- [ ] **Step 1: Add scroll tracking and conditional classes**

Add a `scrolled` state that flips to `true` past 24px of scroll, and use it to switch the header's classes between "full-width flat bar" (top of page) and "narrower rounded pill with shadow" (scrolled):

```tsx
import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { api } from "../api/client";
import { ContactInfo } from "../types";

const links = [
  { to: "/", label: "Inicio" },
  { to: "/nosotros", label: "Nosotros" },
  { to: "/tortas-y-postres", label: "Tortas y Postres" },
  { to: "/catering", label: "Catering" },
  { to: "/eventos", label: "Eventos" },
];

export default function Navbar() {
  const [contact, setContact] = useState<ContactInfo | null>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    api.get<ContactInfo>("/contact").then(setContact).catch(() => setContact(null));
  }, []);

  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 24);
    }
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="sticky top-0 z-40 flex justify-center px-4 pt-0 transition-[padding] duration-300" style={{ paddingTop: scrolled ? "0.75rem" : "0" }}>
      <header
        className={`w-full transition-all duration-300 ${
          scrolled
            ? "max-w-4xl rounded-full bg-white/95 px-2 shadow-warm backdrop-blur"
            : "max-w-none rounded-none bg-white shadow-sm"
        }`}
      >
        <nav className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <NavLink to="/" className="flex shrink-0 items-center gap-3">
            <img
              src="https://fusionconsazon.uy/wp-content/uploads/2024/09/LOGO-PNG-1024x862.png"
              alt="Fusión con Sazón"
              className={`w-auto transition-all duration-300 ${scrolled ? "h-8" : "h-11"}`}
            />
            <span className="hidden flex-col leading-none sm:flex">
              <span className="font-display text-lg font-semibold text-brand-dark">Fusión con Sazón</span>
              <span className="mt-0.5 text-[11px] font-semibold uppercase tracking-wide text-brand">
                Experiencias para compartir
              </span>
            </span>
          </NavLink>
          <ul className="hidden gap-6 text-sm font-medium md:flex">
            {links.map((link) => (
              <li key={link.to}>
                <NavLink
                  to={link.to}
                  end={link.to === "/"}
                  className={({ isActive }) => (isActive ? "text-brand" : "text-gray-700 hover:text-brand")}
                >
                  {link.label}
                </NavLink>
              </li>
            ))}
          </ul>
          {/* CTA + redes sociales */}
          <div className="flex shrink-0 items-center gap-3">
            {contact?.whatsapp && (
              <a
                href={`https://wa.me/${contact.whatsapp.replace(/[^\d]/g, "")}`}
                target="_blank"
                rel="noreferrer"
                className="hidden rounded-full bg-brand px-4 py-2 text-xs font-bold uppercase tracking-wide text-white transition hover:bg-brand-dark sm:inline-block"
              >
                Solicitar presupuesto
              </a>
            )}
            {contact?.facebookUrl && (
              <a
                href={contact.facebookUrl}
                target="_blank"
                rel="noreferrer"
                aria-label="Facebook"
                className="flex h-8 w-8 items-center justify-center rounded-full bg-brand text-white transition hover:bg-brand-dark"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                  <path d="M22 12a10 10 0 1 0-11.6 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.5h-1.3c-1.2 0-1.6.8-1.6 1.6V12h2.8l-.4 2.9h-2.4v7A10 10 0 0 0 22 12Z" />
                </svg>
              </a>
            )}
            {contact?.instagramUrl && (
              <a
                href={contact.instagramUrl}
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
                className="flex h-8 w-8 items-center justify-center rounded-full bg-brand text-white transition hover:bg-brand-dark"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                  <rect x="3" y="3" width="18" height="18" rx="5" />
                  <circle cx="12" cy="12" r="4" />
                  <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
                </svg>
              </a>
            )}

            {/* Acceso administrador */}
            <NavLink
              to="/admin/login"
              aria-label="Acceso administrador"
              title="Acceso administrador"
              className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 text-gray-500 transition hover:border-brand hover:text-brand"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                <rect x="5" y="11" width="14" height="9" rx="2" />
                <path d="M8 11V7a4 4 0 0 1 8 0v4" />
              </svg>
            </NavLink>
          </div>
        </nav>
      </header>
    </div>
  );
}
```

This keeps every existing behavior (contact-driven WhatsApp/social links, admin access icon, active-link highlighting) — only the wrapper structure and the `scrolled` state are new.

- [ ] **Step 2: Verify**

Run: `npm run typecheck`
Expected: no errors.

Run: `npm run dev`, open `http://localhost:5173/`, scroll down:
- At the top, the nav spans full width with a flat white background.
- After scrolling ~24px, the nav visibly narrows into a centered rounded pill with a shadow, logo shrinks slightly, with a smooth transition.
- All links, the WhatsApp button, social icons, and the admin icon still work.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/Navbar.tsx
git commit -m "feat: navbar shrinks into a pill on scroll"
```

---

### Task 3: Rebuild the hero — full-bleed photo, no tilt

**Files:**
- Modify: `frontend/src/pages/Home.tsx`

**Interfaces:**
- Consumes: `RevealOnScroll` (kept). Drops `TiltCard`, `FloatingElement`, `GlassPanel` imports and usage **in the hero only** — Task 4 removes them from the rest of the file.

Replaces the split hero (text column + tilted photo collage) with a single full-bleed photo, a dark gradient overlay for legibility, a centered headline, and a floating contact bar pinned near the bottom of the hero (replacing Vineyard's booking-date bar, which doesn't apply here).

- [ ] **Step 1: Replace the entire hero `<section>`**

Replace everything from `{/* HERO ... */}` through its closing `</section>` (including the two halo `<div>`s, the two decorative doodle `<svg>`s, the two-column grid, and the `deco-divider`) with:

```tsx
      {/* ================================================================
          HERO — foto real a pantalla completa con overlay oscuro, titular
          centrado en serif, barra flotante de contacto. Referencia:
          vineyard.co.za — sin tilt ni collage, una sola foto protagonista.
      ================================================================= */}
      <section className="relative flex min-h-[85vh] items-center justify-center overflow-hidden text-white">
        {tortasHero?.url && (
          <img
            src={tortasHero.url}
            alt="Tortas artesanales de Fusión con Sazón"
            className="absolute inset-0 h-full w-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-brand-espresso via-brand-espresso/50 to-brand-espresso/20" />

        <div className="relative mx-auto max-w-3xl px-4 pb-24 pt-32 text-center">
          <RevealOnScroll>
            <span className="inline-flex items-center gap-2.5 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.22em] backdrop-blur-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-mustard" />
              Montevideo · La Unión
            </span>
          </RevealOnScroll>

          <RevealOnScroll delay={100}>
            <h1 className="font-display mt-8 text-5xl italic leading-[1.05] md:text-7xl">
              <Headline text={heroText} />
            </h1>
          </RevealOnScroll>

          <RevealOnScroll delay={200}>
            <p className="mx-auto mt-7 max-w-lg text-lg leading-relaxed text-white/80">
              {get(
                "home_hero_sub",
                "Catering, tortas y postres artesanales hechos por una pareja que cocina desde hace más de 20 años. Sabor de hogar, para tu mesa."
              )}
            </p>
          </RevealOnScroll>
        </div>

        {/* Barra flotante de contacto, pegada al borde inferior del hero. */}
        <RevealOnScroll delay={280} className="absolute inset-x-4 bottom-6 mx-auto max-w-2xl md:inset-x-0">
          <div className="flex flex-col items-stretch gap-3 rounded-2xl bg-white px-5 py-4 text-brand-dark shadow-warm-lg sm:flex-row sm:items-center sm:justify-between">
            <div className="text-center sm:text-left">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-mustard">+20 años · 5.0 en Google</p>
              <p className="mt-1 text-sm text-brand-dark/70">100% casero, sin atajos</p>
            </div>
            <a
              href={waHref}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2.5 rounded-full bg-brand px-6 py-3 text-sm font-extrabold uppercase tracking-wide text-white transition hover:bg-brand-mustard hover:text-brand-dark"
            >
              <IconWhatsApp className="h-5 w-5" />
              Solicitar presupuesto
            </a>
          </div>
        </RevealOnScroll>
      </section>
```

- [ ] **Step 2: Remove now-unused imports and code, if any become unused**

`TiltCard`, `FloatingElement`, `GlassPanel` are still used later in the file (category cards, testimonials) until Task 4/6 run — **do not remove their imports yet**. `SpinningBadge` and `stats` are no longer referenced by the new hero; leave them defined for now if Task 4 or later still needs `stats`, otherwise this task may see a TypeScript "unused variable" situation only if nothing else in the file uses them — check with typecheck in Step 3 and only remove what the compiler actually flags as unused, nothing else (don't guess ahead of later tasks).

- [ ] **Step 3: Verify**

Run: `npm run typecheck`
Expected: no errors. If `stats` or `SpinningBadge` are flagged unused, remove exactly those (not `TiltCard`/`FloatingElement`/`GlassPanel`, which remain used further down the file).

Run: `npm run dev`, open `http://localhost:5173/`:
- Hero is a single full-bleed photo with a dark gradient at the bottom for text contrast.
- Headline renders in italic serif, centered.
- A floating white contact bar sits near the bottom of the hero with a WhatsApp button.
- No tilt/rotation effects anywhere in the hero.

- [ ] **Step 4: Commit**

```bash
git add frontend/src/pages/Home.tsx
git commit -m "feat: rebuild hero as full-bleed photo with floating contact bar"
```

---

### Task 4: Simplify the Categorías cards (drop tilt)

**Files:**
- Modify: `frontend/src/pages/Home.tsx`

**Interfaces:**
- Consumes: `RevealOnScroll` only. Removes `TiltCard` usage from this section (still used nowhere else after this task — Task 6 removes the last usage in Testimonios, so don't remove the import yet unless typecheck says so).

- [ ] **Step 1: Remove the `TiltCard` wrapper from each category card**

Replace:

```tsx
            <RevealOnScroll key={c.to} delay={i * 110}>
              <TiltCard
                maxTilt={4}
                className="group relative aspect-[4/5] overflow-hidden rounded-[1.75rem] bg-brand-dark shadow-warm transition-shadow duration-500 hover:shadow-warm-lg"
              >
                <Link
                  to={c.to}
                  className="absolute inset-0 flex flex-col justify-end focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand"
                >
```

with:

```tsx
            <RevealOnScroll key={c.to} delay={i * 110}>
              <Link
                to={c.to}
                className="group relative flex aspect-[4/5] flex-col justify-end overflow-hidden rounded-[1.75rem] bg-brand-dark shadow-warm transition-shadow duration-500 hover:shadow-warm-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand"
              >
```

Then, at the end of that same card block, replace the closing tags:

```tsx
                </Link>
              </TiltCard>
            </RevealOnScroll>
```

with:

```tsx
              </Link>
            </RevealOnScroll>
```

(Everything between the opening and closing tags — the image, gradient overlay, index number, tag/title/copy/arrow — stays exactly as-is.)

- [ ] **Step 2: Switch the section heading to serif italic**

Replace:

```tsx
          <RevealOnScroll delay={70}>
            <h2 className="font-display mt-1 text-4xl font-extrabold uppercase tracking-tightest text-brand-dark md:text-5xl">
              Experiencia
            </h2>
          </RevealOnScroll>
```

with:

```tsx
          <RevealOnScroll delay={70}>
            <h2 className="font-display mt-1 text-4xl italic text-brand-dark md:text-5xl">
              Experiencia
            </h2>
          </RevealOnScroll>
```

(Drops `font-extrabold uppercase tracking-tightest` — Playfair Display reads as a display face on its own without the grotesque-style heavy weight/all-caps treatment; the serif looks better in italic mixed-case, matching Vineyard's headings.)

- [ ] **Step 3: Verify**

Run: `npm run typecheck`
Expected: no errors. If `TiltCard` is now flagged as an unused import, remove it from the import list — but check first, since Testimonios (Task 6) still uses `GlassPanel`, not `TiltCard`, so `TiltCard` likely does become unused after this task; confirm via the compiler, don't assume.

Run: `npm run dev`, open `http://localhost:5173/`:
- The 3 category cards no longer tilt on hover — they keep the existing photo zoom-in and shadow-lift effects.
- "Experiencia" heading renders in italic serif.

- [ ] **Step 4: Commit**

```bash
git add frontend/src/pages/Home.tsx
git commit -m "feat: drop tilt from category cards, serif italic heading"
```

---

### Task 5: Arch-shaped photo in Nosotros-preview, serif headings site-wide on Home

**Files:**
- Modify: `frontend/src/pages/Home.tsx`

**Interfaces:**
- Consumes: `.arch-mask` CSS utility (Task 1).

- [ ] **Step 1: Apply the arch mask to the Nosotros-preview photo**

Replace:

```tsx
            {nosotrosPhoto?.url && (
              <img
                src={nosotrosPhoto.url}
                alt="Herminia y Oscar, fundadores de Fusión con Sazón"
                className="relative mx-auto h-[420px] w-auto object-contain object-bottom drop-shadow-2xl md:h-[540px]"
              />
            )}
```

with:

```tsx
            {nosotrosPhoto?.url && (
              <img
                src={nosotrosPhoto.url}
                alt="Herminia y Oscar, fundadores de Fusión con Sazón"
                className="arch-mask relative mx-auto h-[420px] w-[85%] object-cover object-top drop-shadow-2xl md:h-[540px]"
              />
            )}
```

(Switches from `object-contain`/`w-auto` to `object-cover`/`w-[85%]` because the arch crop needs a defined rectangular box to round — a contain-fit image with transparent/variable width can't take a clean arch silhouette. If this photo is the background-removed cutout described in earlier project notes, confirm during manual verification that `object-cover` still frames the couple acceptably; if it crops awkwardly, that's a legitimate concern to flag back, not something to silently paper over.)

- [ ] **Step 2: Switch the "Nosotros" heading to serif italic**

Replace:

```tsx
            <RevealOnScroll>
              <h2 className="font-display text-5xl font-extrabold uppercase leading-[0.9] tracking-tightest text-brand-dark md:text-6xl lg:text-7xl">
                Nosotros
              </h2>
            </RevealOnScroll>
```

with:

```tsx
            <RevealOnScroll>
              <h2 className="font-display text-5xl italic leading-[1.05] text-brand-dark md:text-6xl lg:text-7xl">
                Nosotros
              </h2>
            </RevealOnScroll>
```

- [ ] **Step 3: Switch the "Cómo trabajamos" heading to serif italic**

Replace:

```tsx
          <RevealOnScroll delay={70}>
            <h2 className="font-display mt-1 text-4xl font-extrabold uppercase tracking-tightest text-brand-dark md:text-5xl">
              Cómo trabajamos
            </h2>
          </RevealOnScroll>
```

with:

```tsx
          <RevealOnScroll delay={70}>
            <h2 className="font-display mt-1 text-4xl italic text-brand-dark md:text-5xl">
              Cómo trabajamos
            </h2>
          </RevealOnScroll>
```

- [ ] **Step 4: Verify**

Run: `npm run typecheck`
Expected: no errors.

Run: `npm run dev`, open `http://localhost:5173/`:
- The Nosotros-preview photo now has a rounded-arch top edge instead of a free-floating cutout shape.
- "Nosotros" and "Cómo trabajamos" headings render in italic serif, mixed case.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/pages/Home.tsx
git commit -m "feat: arch-mask the Nosotros photo, serif italic headings"
```

---

### Task 6: Rebuild Testimonios as plain text on a tinted band

**Files:**
- Modify: `frontend/src/pages/Home.tsx`

**Interfaces:**
- Consumes: `RevealOnScroll` only. Removes the last usages of `GlassPanel` and confirms `TiltCard`/`FloatingElement` have no remaining usages in the file (they don't, after Tasks 3-4) — this task should leave `frontend/src/pages/Home.tsx` with **zero** imports of `TiltCard`, `FloatingElement`, `GlassPanel`.

Replaces the boxed, shadowed testimonial cards with plain text in columns over a mustard-tinted background band, matching Vineyard's "What Our Guest's Say" section.

- [ ] **Step 1: Replace the whole Testimonios section**

Replace the entire section (from `{/* TESTIMONIOS */}` through its closing `</section>`):

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
            <RevealOnScroll delay={130}>
              <GlassPanel className="mt-6 inline-flex items-center gap-2 !border-transparent !bg-white/70 px-5 py-2.5">
                <IconGoogle className="h-5 w-5 shrink-0" />
                <span className="font-extrabold text-brand-dark">5.0</span>
                <span className="text-sm tracking-tighter text-brand-mustard">★★★★★</span>
                <span className="text-sm text-brand-dark/50">· 52 reseñas de Google</span>
              </GlassPanel>
            </RevealOnScroll>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {testimonials.map((t, i) => {
              const [name, source] = t.author.split(" · ");
              return (
                <RevealOnScroll key={t.id} delay={i * 110}>
                  <blockquote className="relative rounded-[1.5rem] bg-white p-7 pt-10 shadow-warm transition-transform duration-500 hover:-translate-y-1.5">
                    <span className="font-display absolute -top-5 left-7 flex h-11 w-11 items-center justify-center rounded-full bg-brand-mustard text-2xl font-black leading-none text-white shadow-warm">
                      &ldquo;
                    </span>
                    <div className="mb-3 text-sm tracking-tighter text-brand-mustard">★★★★★</div>
                    <p className="leading-relaxed text-brand-dark/75">{t.text}</p>
                    <footer className="mt-5 flex items-center gap-2">
                      <span className="font-bold text-brand-dark">{name}</span>
                      {source && (
                        <span className="inline-flex items-center gap-1 text-xs text-brand-dark/40">
                          <IconGoogle className="h-3.5 w-3.5 shrink-0" />
                          {source}
                        </span>
                      )}
                    </footer>
                  </blockquote>
                </RevealOnScroll>
              );
            })}
          </div>

          <div className="mt-10 text-center">
            <a
              href="https://www.google.com/search?q=Fusi%C3%B3n+con+Saz%C3%B3n+Opiniones"
              target="_blank"
              rel="noreferrer"
              className="group inline-flex items-center gap-2 text-sm font-extrabold uppercase tracking-wide text-brand hover:underline"
            >
              Ver todas las reseñas en Google
              <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
            </a>
          </div>
        </div>
      </section>
```

with:

```tsx
      <section id="testimonios" className="bg-brand-mustard/15 px-4 py-24 md:py-28">
        <div className="mx-auto max-w-6xl">
          <RevealOnScroll className="mb-16 text-center">
            <h2 className="font-display text-4xl italic text-brand-dark md:text-5xl">
              Lo que dicen de nosotros
            </h2>
          </RevealOnScroll>

          <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
            {testimonials.map((t, i) => {
              const [name, source] = t.author.split(" · ");
              return (
                <RevealOnScroll key={t.id} delay={i * 90}>
                  <div className="mb-3 text-sm tracking-tighter text-brand-mustard">★★★★★</div>
                  <p className="text-[15px] leading-relaxed text-brand-dark/80">{t.text}</p>
                  <p className="mt-4 text-sm font-bold text-brand-dark">
                    {name}
                    {source && <span className="font-normal text-brand-dark/50"> · {source}</span>}
                  </p>
                </RevealOnScroll>
              );
            })}
          </div>

          <div className="mt-14 text-center">
            <a
              href="https://www.google.com/search?q=Fusi%C3%B3n+con+Saz%C3%B3n+Opiniones"
              target="_blank"
              rel="noreferrer"
              className="group inline-flex items-center gap-2 text-sm font-extrabold uppercase tracking-wide text-brand hover:underline"
            >
              Ver todas las reseñas en Google
              <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
            </a>
          </div>
        </div>
      </section>
```

(The 5.0-rating chip that used `GlassPanel` and `IconGoogle` is dropped from the heading area — the per-testimonial star ratings already communicate quality, matching Vineyard's plainer treatment. `IconGoogle` may become unused by the file after this — check in Step 2, don't remove speculatively.)

- [ ] **Step 2: Remove now-unused imports**

Run typecheck (Step 3) first and let the compiler tell you what's actually unused. Expected candidates: `TiltCard`, `FloatingElement`, `GlassPanel` (all should have zero remaining usages in `Home.tsx` after this task), possibly `IconGoogle` and `SpinningBadge` if nothing else in the file references them. Remove only what the compiler flags — if `IconGoogle` or `SpinningBadge` are still used elsewhere in the file (e.g. `SpinningBadge`'s function definition existing unused is fine, functions don't trigger unused-import errors the way imports do — but an unused top-level function may still be flagged depending on `tsconfig` settings; check and remove only if confirmed unused).

- [ ] **Step 3: Verify**

Run: `npm run typecheck`
Expected: no errors, and no unused-import warnings for `TiltCard`, `FloatingElement`, `GlassPanel`.

Run: `npm run dev`, open `http://localhost:5173/`:
- Testimonials render as plain text (no white card, no shadow, no quote-mark badge) in up to 4 columns on a mustard-tinted background band.
- Star ratings still show per testimonial.

- [ ] **Step 4: Commit**

```bash
git add frontend/src/pages/Home.tsx
git commit -m "feat: rebuild testimonios as plain text on a tinted band"
```

---

### Task 7: Add an Instagram strip and a "Cómo llegar" block

**Files:**
- Modify: `frontend/src/pages/Home.tsx`

**Interfaces:**
- Consumes: `RevealOnScroll`, existing `contact` and `tortasPreview`/`cateringHero`/`eventosHero` state already in the component (no new API calls).

Two new sections, inserted between the existing "Cómo trabajamos" section and the Testimonios section: a horizontal photo strip styled like an Instagram grid (using photos already loaded via the existing `/media` calls — no real Instagram API integration, that's a separate future project) with a "Ver nuestro Instagram" button, and a simple address block.

- [ ] **Step 1: Build the photo list for the strip**

Near the top of the component, alongside the existing `stats`/`foodCards`/`steps` constant declarations (wherever those still exist after earlier tasks — if `stats` was removed in Task 3, add this next to `foodCards`), add:

```tsx
  // Fotos para la tira estilo Instagram: tomamos lo que ya está cargado de
  // cada rubro. No es una integración real con la API de Instagram — eso
  // queda para un proyecto aparte.
  const instaPhotos = [tortasHero, ...tortasPreview.slice(1, 4), cateringHero, eventosHero].filter(
    (item): item is MediaItem => Boolean(item?.url)
  );
```

- [ ] **Step 2: Insert the Instagram strip section**

Immediately after the closing `</section>` of "Cómo trabajamos" and before the Testimonios `<section id="testimonios" ...>`, insert:

```tsx
      {/* ================================================================
          INSTAGRAM — tira de fotos ya cargadas, estilo grid de Instagram.
          No es una integración real con la API; eso es un proyecto aparte.
      ================================================================= */}
      <section className="px-4 py-20 md:py-24">
        <RevealOnScroll className="mb-10 text-center">
          <h2 className="font-display text-4xl italic text-brand-dark md:text-5xl">Seguinos en Instagram</h2>
        </RevealOnScroll>

        <div className="mx-auto flex max-w-6xl gap-3 overflow-x-auto pb-2">
          {instaPhotos.map((item, i) => (
            <RevealOnScroll key={item.id} delay={i * 60} className="h-40 w-40 shrink-0 overflow-hidden rounded-xl sm:h-52 sm:w-52">
              <img src={item.url} alt="" loading="lazy" className="h-full w-full object-cover" />
            </RevealOnScroll>
          ))}
        </div>

        {contact?.instagramUrl && (
          <div className="mt-8 text-center">
            <a
              href={contact.instagramUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2.5 rounded-full bg-brand px-7 py-3.5 text-sm font-extrabold uppercase tracking-wide text-white transition hover:bg-brand-dark"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                <rect x="3" y="3" width="18" height="18" rx="5" />
                <circle cx="12" cy="12" r="4" />
                <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
              </svg>
              Ver nuestro Instagram
            </a>
          </div>
        )}
      </section>
```

- [ ] **Step 3: Insert the "Cómo llegar" block**

Immediately after the Instagram section (still before Testimonios), insert:

```tsx
      {/* ================================================================
          CÓMO LLEGAR — bloque simple de dirección. Reemplaza al mapa
          interactivo de propiedad de la referencia, que no aplica acá.
      ================================================================= */}
      {contact?.address && (
        <section className="bg-brand-dark px-4 py-16 text-center text-white">
          <RevealOnScroll>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-mustard">Cómo llegar</p>
            <p className="font-display mt-3 text-2xl italic md:text-3xl">{contact.address}</p>
          </RevealOnScroll>
        </section>
      )}
```

- [ ] **Step 4: Verify**

Run: `npm run typecheck`
Expected: no errors.

Run: `npm run dev`, open `http://localhost:5173/`:
- Between "Cómo trabajamos" and the testimonials, a horizontally-scrollable photo strip appears with a "Seguinos en Instagram" heading and (if the contact record has an Instagram URL) a button linking out.
- Right after it, a dark band shows "Cómo llegar" and the business address.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/pages/Home.tsx
git commit -m "feat: add Instagram photo strip and cómo llegar block"
```

---

### Task 8: Full-bleed CTA photo and mega footer

**Files:**
- Modify: `frontend/src/pages/Home.tsx`
- Modify: `frontend/src/components/Footer.tsx`

**Interfaces:**
- No new props. `Footer` keeps fetching `ContactInfo` the same way; only its rendered markup changes.

- [ ] **Step 1: Replace the CTA final section with a full-bleed photo version**

Replace the entire CTA section (from `{/* CTA FINAL ... */}` through its closing `</section>`):

```tsx
      <section className="grain relative -mb-16 overflow-hidden bg-brand">
        <div
          className="pointer-events-none absolute -top-32 right-0 h-[26rem] w-[26rem] rounded-full opacity-40 blur-3xl"
          style={{ background: "radial-gradient(circle, rgba(255,166,16,0.7) 0%, transparent 65%)" }}
        />
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
          <RevealOnScroll delay={130}>
            <p className="mt-6 max-w-lg text-lg text-white/80">
              {get(
                "home_cta_final",
                "Escribinos por WhatsApp y te armamos una propuesta a medida, sin compromiso."
              )}
            </p>
          </RevealOnScroll>
          <RevealOnScroll delay={190}>
            <a
              href={waHref}
              target="_blank"
              rel="noreferrer"
              className="mt-9 inline-flex items-center gap-2.5 rounded-full bg-white px-9 py-4 text-sm font-extrabold uppercase tracking-wide text-brand-dark shadow-warm-lg transition hover:bg-brand-dark hover:text-white"
            >
              <IconWhatsApp className="h-5 w-5" />
              Escribinos por WhatsApp
            </a>
          </RevealOnScroll>
          {contact?.phone && (
            <RevealOnScroll delay={240}>
              <a
                href={`tel:${contact.phone.replace(/\s/g, "")}`}
                className="mt-5 text-sm font-semibold text-white/70 transition hover:text-white"
              >
                o llamanos al {contact.phone}
              </a>
            </RevealOnScroll>
          )}
        </div>
      </section>
```

with:

```tsx
      <section className="relative flex min-h-[60vh] items-center justify-center overflow-hidden text-white">
        {cateringHero?.url && (
          <img src={cateringHero.url} alt="" className="absolute inset-0 h-full w-full object-cover" />
        )}
        <div className="absolute inset-0 bg-brand-espresso/60" />
        <div className="relative mx-auto flex max-w-2xl flex-col items-center px-4 py-20 text-center">
          <RevealOnScroll>
            <h2 className="font-display text-4xl italic leading-tight md:text-6xl">¿Armamos algo rico?</h2>
          </RevealOnScroll>
          <RevealOnScroll delay={90}>
            <p className="mt-6 max-w-lg text-lg text-white/85">
              {get(
                "home_cta_final",
                "Escribinos por WhatsApp y te armamos una propuesta a medida, sin compromiso."
              )}
            </p>
          </RevealOnScroll>
          <RevealOnScroll delay={170}>
            <a
              href={waHref}
              target="_blank"
              rel="noreferrer"
              className="mt-9 inline-flex items-center gap-2.5 rounded-full bg-white px-9 py-4 text-sm font-extrabold uppercase tracking-wide text-brand-dark shadow-warm-lg transition hover:bg-brand-dark hover:text-white"
            >
              <IconWhatsApp className="h-5 w-5" />
              Escribinos por WhatsApp
            </a>
          </RevealOnScroll>
        </div>
      </section>
```

(The `phone` call-out link is dropped in favor of the single WhatsApp CTA, matching Vineyard's single-button final section. The `-mb-16`/`grain` treatment is dropped since it existed only to butt up against the old, simpler footer — Step 2 replaces the footer entirely, so this coupling goes away.)

- [ ] **Step 2: Rewrite `Footer.tsx` as a mega footer**

Replace the entire file content (keep the same imports and the `contact`/`waDigits` state logic — only the returned JSX changes):

```tsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";
import { ContactInfo } from "../types";

const footerLinks = [
  { to: "/", label: "Inicio" },
  { to: "/nosotros", label: "Nosotros" },
  { to: "/tortas-y-postres", label: "Tortas y Postres" },
  { to: "/catering", label: "Catering" },
  { to: "/eventos", label: "Eventos" },
];

export default function Footer() {
  const [contact, setContact] = useState<ContactInfo | null>(null);

  useEffect(() => {
    api.get<ContactInfo>("/contact").then(setContact).catch(() => setContact(null));
  }, []);

  const waDigits = contact?.whatsapp.replace(/[^\d]/g, "");

  return (
    <footer id="contacto" className="bg-brand-espresso text-white">
      <div className="mx-auto max-w-6xl px-4 py-16">
        {/* Nav grande repetida, como en la referencia. */}
        <ul className="font-display space-y-1 text-4xl italic leading-tight text-white/90 md:text-5xl">
          {footerLinks.map((link) => (
            <li key={link.to}>
              <Link to={link.to} className="transition hover:text-brand-mustard">
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="mt-14 grid gap-10 border-t border-white/10 pt-10 sm:grid-cols-3">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-[0.18em] text-white/50">Contacto</h4>
            {contact ? (
              <ul className="mt-3 space-y-2 text-sm text-white/80">
                <li>
                  <a href={`tel:${contact.phone.replace(/\s/g, "")}`} className="hover:text-white hover:underline">
                    {contact.phone}
                  </a>
                </li>
                {waDigits && (
                  <li>
                    <a href={`https://wa.me/${waDigits}`} target="_blank" rel="noreferrer" className="hover:text-white hover:underline">
                      WhatsApp
                    </a>
                  </li>
                )}
              </ul>
            ) : (
              <p className="mt-3 text-sm text-white/50">Cargando...</p>
            )}
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-[0.18em] text-white/50">Ubicación</h4>
            <p className="mt-3 text-sm text-white/80">{contact?.address}</p>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-[0.18em] text-white/50">Redes</h4>
            <div className="mt-3 flex gap-3">
              {contact?.facebookUrl && (
                <a
                  href={contact.facebookUrl}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Facebook"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 transition hover:bg-white/20"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                    <path d="M22 12a10 10 0 1 0-11.6 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.5h-1.3c-1.2 0-1.6.8-1.6 1.6V12h2.8l-.4 2.9h-2.4v7A10 10 0 0 0 22 12Z" />
                  </svg>
                </a>
              )}
              {contact?.instagramUrl && (
                <a
                  href={contact.instagramUrl}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Instagram"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 transition hover:bg-white/20"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                    <rect x="3" y="3" width="18" height="18" rx="5" />
                    <circle cx="12" cy="12" r="4" />
                    <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
                  </svg>
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 text-xs text-white/50 sm:flex-row">
          <span>© {new Date().getFullYear()} Fusión con Sazón</span>
          <Link to="/admin/login" className="hover:text-white/80">
            Acceso administrador
          </Link>
        </div>
      </div>
    </footer>
  );
}
```

- [ ] **Step 3: Verify**

Run: `npm run typecheck`
Expected: no errors.

Run: `npm run dev`, open `http://localhost:5173/`, scroll to the bottom:
- CTA section is now a full-bleed photo with a dark overlay and a single WhatsApp button.
- Footer is dark (espresso), with the 5 nav links repeated large in italic serif, a 3-column block (contact/ubicación/redes), and a copyright row.
- Confirm the footer renders correctly on other pages too (it's shared) — spot-check `/nosotros` or `/catering`.

- [ ] **Step 4: Commit**

```bash
git add frontend/src/pages/Home.tsx frontend/src/components/Footer.tsx
git commit -m "feat: full-bleed CTA photo and mega footer"
```

---

## Self-review notes

- **Spec coverage:** Task 1 covers typography/CSS foundations. Task 2 covers the Navbar. Task 3 covers the hero. Tasks 4-8 cover every remaining Home section named in the spec's mapping table (Categorías, Nosotros-preview arch photo, Cómo trabajamos heading, Testimonios, Instagram strip, Cómo llegar, CTA, Footer). The spec's explicitly descoped items (blog grid, property map) are not implemented anywhere in this plan.
- **TiltCard/FloatingElement/GlassPanel removal:** tracked explicitly across Tasks 3, 4, and 6 — by the end of Task 6, `Home.tsx` has zero remaining imports of any of the three, verified by the compiler rather than assumed.
- **Type consistency:** `MediaItem` type (already defined in `frontend/src/types/`) is reused for `instaPhotos` in Task 7 rather than inventing a new shape.
- **Testing:** no automated tests added, per the approved spec. Each task has a concrete manual verification script.
