import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useContent } from "../hooks/useContentBlock";
import { api } from "../api/client";
import { Testimonial, MediaItem, ContactInfo } from "../types";
import PublicLayout from "../components/PublicLayout";
import Marquee from "../components/Marquee";
import ImageMarquee from "../components/ImageMarquee";
import RevealOnScroll from "../components/ui/RevealOnScroll";
import TiltCard from "../components/ui/TiltCard";
import FloatingElement from "../components/ui/FloatingElement";
import GlassPanel from "../components/ui/GlassPanel";
import ParallaxGroup from "../components/ui/ParallaxGroup";
import ParallaxLayer from "../components/ui/ParallaxLayer";

/* Íconos inline: no sumamos dependencias nuevas al proyecto. */
function IconWhatsApp({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="currentColor" className={className} aria-hidden="true">
      <path d="M16.001 3C9.373 3 4 8.373 4 15c0 2.386.7 4.605 1.902 6.474L4 29l7.72-1.87A11.94 11.94 0 0 0 16.001 27C22.628 27 28 21.627 28 15S22.628 3 16.001 3Zm.001 21.6c-1.94 0-3.79-.52-5.39-1.51l-.386-.235-4.58 1.11 1.13-4.46-.253-.399A9.55 9.55 0 0 1 5.4 15c0-5.85 4.75-10.6 10.6-10.6S26.6 9.15 26.6 15 21.85 24.6 16.002 24.6Zm5.61-7.94c-.307-.154-1.816-.897-2.098-1-.281-.103-.487-.154-.692.154-.205.307-.795 1-.975 1.205-.179.205-.359.23-.666.077-.307-.154-1.296-.478-2.469-1.523-.912-.813-1.529-1.817-1.708-2.124-.179-.307-.019-.473.135-.626.139-.138.307-.359.461-.538.154-.18.205-.307.307-.512.103-.205.051-.384-.026-.538-.077-.154-.692-1.667-.948-2.283-.25-.6-.505-.519-.692-.529l-.589-.01c-.205 0-.538.077-.82.384-.281.307-1.075 1.05-1.075 2.563 0 1.512 1.1 2.973 1.253 3.178.154.205 2.164 3.305 5.246 4.634.733.316 1.305.505 1.75.646.735.234 1.404.201 1.933.122.59-.088 1.816-.742 2.073-1.459.256-.717.256-1.332.179-1.459-.077-.128-.282-.205-.59-.36Z" />
    </svg>
  );
}

function IconGoogle({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.26 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09A6.6 6.6 0 0 1 5.5 12c0-.73.13-1.44.34-2.09V7.07H2.18A11 11 0 0 0 1 12c0 1.77.42 3.45 1.18 4.93l3.66-2.84z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1a11 11 0 0 0-9.82 6.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}

/* Sello circular giratorio: activo de marca que ya venía del diseño anterior. */
function SpinningBadge({ className = "" }: { className?: string }) {
  return (
    <div className={className}>
      <svg className="absolute inset-0 w-full h-full animate-spin-slow" viewBox="0 0 100 100" aria-hidden="true">
        <defs>
          <path id="badgeCircle" d="M 50,50 m -38,0 a 38,38 0 1,1 76,0 a 38,38 0 1,1 -76,0" />
        </defs>
        <text fill="#FFA610" fontSize="8.2" fontWeight="700" letterSpacing="2">
          <textPath href="#badgeCircle">• SABOR DE HOGAR • FUSIÓN CON SAZÓN •</textPath>
        </text>
      </svg>
      <div className="absolute inset-3 rounded-full bg-brand flex items-center justify-center text-white text-[11px] font-extrabold text-center leading-tight px-2 shadow-warm">
        100%
        <br />
        CASERO
      </div>
    </div>
  );
}

/* El titular es editable desde el panel admin (clave home_hero). Resaltamos
   la palabra "experiencia" en script si aparece, sin romper el texto si el
   administrador lo reescribe. */
function Headline({ text }: { text: string }) {
  const word = "experiencia";
  const i = text.toLowerCase().indexOf(word);
  if (i === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, i)}
      <span className="font-script italic normal-case tracking-normal text-brand-mustard">
        {text.slice(i, i + word.length)}
      </span>
      {text.slice(i + word.length)}
    </>
  );
}

export default function Home() {
  const { get } = useContent();
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [tortasPreview, setTortasPreview] = useState<MediaItem[]>([]);
  const [tortasHero, setTortasHero] = useState<MediaItem | null>(null);
  const [cateringHero, setCateringHero] = useState<MediaItem | null>(null);
  const [eventosHero, setEventosHero] = useState<MediaItem | null>(null);
  const [nosotrosPhoto, setNosotrosPhoto] = useState<MediaItem | null>(null);
  const [contact, setContact] = useState<ContactInfo | null>(null);

  useEffect(() => {
    api.get<Testimonial[]>("/testimonials").then(setTestimonials).catch(() => {});
    api.get<ContactInfo>("/contact").then(setContact).catch(() => {});
    api
      .get<MediaItem[]>("/media?page=TORTAS")
      .then((items) => {
        setTortasPreview(items);
        setTortasHero(items[0] ?? null);
      })
      .catch(() => {});
    api
      .get<MediaItem[]>("/media?page=CATERING")
      .then((items) => setCateringHero(items[0] ?? null))
      .catch(() => {});
    api
      .get<MediaItem[]>("/media?page=EVENTOS_FOTOS")
      .then((items) => setEventosHero(items[0] ?? null))
      .catch(() => {});
    api
      .get<MediaItem[]>("/media?page=NOSOTROS")
      .then((items) => setNosotrosPhoto(items[0] ?? null))
      .catch(() => {});
  }, []);

  const waHref = contact
    ? `https://wa.me/${contact.whatsapp.replace(/[^\d]/g, "")}?text=${encodeURIComponent(
        "Hola, quisiera solicitar un presupuesto."
      )}`
    : "#";

  const heroText = get("home_hero", "Convertimos cada celebración en una experiencia para recordar.");

  /* Segunda foto del collage del hero: usamos la siguiente de tortas y, si no
     hay, caemos a catering para que el bloque nunca quede vacío. */
  const heroSecondary = tortasPreview[1]?.url ?? cateringHero?.url;

  const stats = [
    { value: "+20", label: "años de oficio" },
    { value: "5.0", label: "52 reseñas en Google" },
    { value: "100%", label: "casero, sin atajos" },
  ];

  // Tarjetas de categorías con foto real, cada una lleva a su página.
  const foodCards = [
    {
      to: "/tortas-y-postres",
      label: "Tortas y Postres",
      tag: "Dulce · Casero",
      copy: "Tortas de cumpleaños, mesas dulces y combos para compartir.",
      img: tortasHero?.url,
      accent: "#E80541",
    },
    {
      to: "/catering",
      label: "Catering",
      tag: "Sabor · Eventos",
      copy: "Cocina venezolana, uruguaya e internacional para tu mesa.",
      img: cateringHero?.url,
      accent: "#FFA610",
    },
    {
      to: "/eventos",
      label: "Eventos",
      tag: "Celebrar · Compartir",
      copy: "Nos ocupamos de todo para que vos disfrutes tu celebración.",
      img: eventosHero?.url,
      accent: "#FAF8F5",
    },
  ];

  const steps = [
    {
      title: get("home_paso_1_titulo", "Contanos tu evento"),
      body: get("home_paso_1_texto", "Escribinos por WhatsApp con la fecha, la cantidad de personas y qué te imaginás."),
    },
    {
      title: get("home_paso_2_titulo", "Armamos la propuesta"),
      body: get("home_paso_2_texto", "Te pasamos un menú a medida con opciones dulces y saladas, y el presupuesto cerrado."),
    },
    {
      title: get("home_paso_3_titulo", "Nos ocupamos de todo"),
      body: get("home_paso_3_texto", "Cocinamos, entregamos y montamos. Vos solo tenés que disfrutar de tu celebración."),
    },
  ];

  return (
    <PublicLayout>
      {/* ================================================================
          HERO — fondo chocolate con grano, titular grande y collage de
          fotos reales. Reemplaza al hero centrado plano anterior.
      ================================================================= */}
      <section className="grain relative overflow-hidden bg-brand-dark text-white">
        {/* Halos cálidos: dan profundidad sin usar un gradiente agresivo. */}
        <div
          className="pointer-events-none absolute -top-40 -left-32 h-[34rem] w-[34rem] rounded-full opacity-40 blur-3xl"
          style={{ background: "radial-gradient(circle, rgba(255,166,16,0.55) 0%, transparent 65%)" }}
        />
        <div
          className="pointer-events-none absolute -bottom-52 right-[-10rem] h-[38rem] w-[38rem] rounded-full opacity-35 blur-3xl"
          style={{ background: "radial-gradient(circle, rgba(232,5,65,0.6) 0%, transparent 65%)" }}
        />

        {/* Doodles dibujados a mano, heredados del diseño anterior. */}
        <svg
          className="pointer-events-none absolute top-24 left-8 hidden w-14 h-14 -rotate-12 text-brand-mustard/40 lg:block"
          viewBox="0 0 64 64"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M14 6v18c0 3.5 2.7 5.5 5.5 5.5S25 27.5 25 24V6M19.5 6v13.5M14 34v24" />
          <path d="M40 6c-6 0-9.5 6-9.5 13 0 5.5 3 8.5 6.5 9.5L35 58" />
        </svg>
        <svg
          className="pointer-events-none absolute bottom-28 left-16 hidden w-16 h-16 rotate-6 text-white/15 lg:block"
          viewBox="0 0 64 64"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          aria-hidden="true"
        >
          <path d="M16 52c8-6 8-14 0-20s-8-14 0-20" />
          <path d="M32 52c8-6 8-14 0-20s-8-14 0-20" />
          <path d="M48 52c8-6 8-14 0-20s-8-14 0-20" />
        </svg>

        <div className="relative mx-auto grid max-w-6xl items-center gap-14 px-4 py-20 md:py-28 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10">
          {/* --- Columna de texto --- */}
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

            {/* Datos duros: dan credibilidad justo debajo del CTA. */}
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

          {/* --- Collage de fotos --- */}
          <RevealOnScroll delay={200}>
            <ParallaxGroup className="relative mx-auto w-full max-w-md lg:max-w-none">
              {/* Capa: sombra proyectada, casi no se mueve */}
              <ParallaxLayer
                depth={0.1}
                range={16}
                className="pointer-events-none absolute inset-x-6 -bottom-4 top-10 rounded-[2.25rem] bg-black/30 blur-2xl"
              >
                {null}
              </ParallaxLayer>

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
        </div>

        <div className="deco-divider" style={{ ["--deco-color" as string]: "#FFA610" }} />
      </section>

      {/* Cinta en loop infinito */}
      <Marquee items={["Catering", "Tortas y Postres", "Eventos", "100% Casero", "Sabor de Hogar"]} />

      {/* ================================================================
          CATEGORÍAS — tarjetas editoriales con foto a sangre.
      ================================================================= */}
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
          {foodCards.map((c, i) => (
            <RevealOnScroll key={c.to} delay={i * 110}>
              <TiltCard
                maxTilt={4}
                className="group relative aspect-[4/5] overflow-hidden rounded-[1.75rem] bg-brand-dark shadow-warm transition-shadow duration-500 hover:shadow-warm-lg"
              >
                <Link
                  to={c.to}
                  className="absolute inset-0 flex flex-col justify-end focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand"
                >
                  {c.img && (
                    <img
                      src={c.img}
                      alt={c.label}
                      loading="lazy"
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-110"
                    />
                  )}
                  {/* Gradiente de protección: garantiza legibilidad sobre cualquier foto. */}
                  <div className="absolute inset-0 bg-gradient-to-t from-brand-espresso via-brand-espresso/55 to-transparent opacity-90 transition-opacity duration-500 group-hover:opacity-95" />

                  <span
                    className="absolute left-6 top-6 font-display text-5xl font-extrabold leading-none opacity-70 transition-opacity duration-500 group-hover:opacity-100"
                    style={{ color: c.accent }}
                  >
                    0{i + 1}
                  </span>

                  <div className="relative p-6 md:p-7">
                    <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-brand-mustard">{c.tag}</span>
                    <h3 className="font-display mt-2 text-2xl font-extrabold uppercase leading-tight tracking-tight text-white md:text-[1.7rem]">
                      {c.label}
                    </h3>
                    <p className="mt-2.5 text-sm leading-relaxed text-white/70">{c.copy}</p>
                    <span className="mt-4 inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-white">
                      Ver más
                      <span className="transition-transform duration-300 group-hover:translate-x-1.5">→</span>
                    </span>
                  </div>
                </Link>
              </TiltCard>
            </RevealOnScroll>
          ))}
        </div>
      </section>

      {/* ================================================================
          NOSOTROS — split con foto enmarcada y bloque de texto cálido.
      ================================================================= */}
      <section className="relative overflow-hidden" style={{ background: "linear-gradient(180deg, #FDF3E4 0%, #FAF8F5 100%)" }}>
        {/* Halo cálido muy suave: da profundidad sin ensuciar el fondo claro. */}
        <div
          className="pointer-events-none absolute -top-24 left-1/4 h-[28rem] w-[28rem] rounded-full opacity-45 blur-3xl"
          style={{ background: "radial-gradient(circle, rgba(255,166,16,0.32) 0%, transparent 65%)" }}
        />

        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 py-20 md:py-24 lg:grid-cols-2 lg:gap-16">
          <RevealOnScroll className="relative mx-auto w-full max-w-sm lg:mx-0">
            {/* Resplandor cálido detrás del recorte. Va sin tarjeta a propósito:
                encajonar un PNG transparente en un rectángulo blanco anula el
                recorte y se ve igual que la foto original. */}
            <div
              className="pointer-events-none absolute inset-x-0 bottom-10 top-10 rounded-full opacity-70 blur-2xl"
              style={{ background: "radial-gradient(ellipse at 50% 55%, rgba(255,166,16,0.38) 0%, rgba(232,5,65,0.10) 45%, transparent 72%)" }}
            />
            {nosotrosPhoto?.url && (
              <img
                src={nosotrosPhoto.url}
                alt="Herminia y Oscar, fundadores de Fusión con Sazón"
                className="relative mx-auto h-[420px] w-auto object-contain object-bottom drop-shadow-2xl md:h-[540px]"
              />
            )}
          </RevealOnScroll>

          <div className="text-center lg:text-left">
            <RevealOnScroll>
              <h2 className="font-display text-5xl font-extrabold uppercase leading-[0.9] tracking-tightest text-brand-dark md:text-6xl lg:text-7xl">
                Nosotros
              </h2>
            </RevealOnScroll>
            <RevealOnScroll delay={80}>
              <span className="mx-auto mt-6 block h-1.5 w-20 rounded-full bg-brand lg:mx-0" />
            </RevealOnScroll>
            <RevealOnScroll delay={140}>
              <p className="mt-7 text-lg leading-relaxed text-brand-dark/70">
                {get("home_nosotros_preview")}
              </p>
            </RevealOnScroll>
            <RevealOnScroll delay={200}>
              <Link
                to="/nosotros"
                className="group mt-8 inline-flex w-fit items-center gap-2 rounded-full bg-brand px-7 py-3.5 text-sm font-extrabold uppercase tracking-wide text-white transition hover:bg-brand-dark"
              >
                Leer nuestra historia
                <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
              </Link>
            </RevealOnScroll>
          </div>
        </div>
      </section>

      {/* Preview fotos de tortas: carrusel infinito */}
      <ImageMarquee items={tortasPreview} />

      {/* ================================================================
          CÓMO TRABAJAMOS — sección nueva. Los textos salen de las claves
          home_paso_*, editables desde el panel admin (con fallback).
      ================================================================= */}
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

      {/* ================================================================
          TESTIMONIOS
      ================================================================= */}
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

      {/* ================================================================
          CTA FINAL — el -mb-16 cancela el mt-16 del Footer para que la
          banda quede pegada al pie, sin franja de fondo entre medio.
      ================================================================= */}
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
    </PublicLayout>
  );
}
