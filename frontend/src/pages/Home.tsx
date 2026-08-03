import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useContent } from "../hooks/useContentBlock";
import { api } from "../api/client";
import { Testimonial, MediaItem, ContactInfo } from "../types";
import PublicLayout from "../components/PublicLayout";
import Marquee from "../components/Marquee";
import ImageMarquee from "../components/ImageMarquee";
import RevealOnScroll from "../components/ui/RevealOnScroll";

/* Íconos inline: no sumamos dependencias nuevas al proyecto. */
function IconWhatsApp({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="currentColor" className={className} aria-hidden="true">
      <path d="M16.001 3C9.373 3 4 8.373 4 15c0 2.386.7 4.605 1.902 6.474L4 29l7.72-1.87A11.94 11.94 0 0 0 16.001 27C22.628 27 28 21.627 28 15S22.628 3 16.001 3Zm.001 21.6c-1.94 0-3.79-.52-5.39-1.51l-.386-.235-4.58 1.11 1.13-4.46-.253-.399A9.55 9.55 0 0 1 5.4 15c0-5.85 4.75-10.6 10.6-10.6S26.6 9.15 26.6 15 21.85 24.6 16.002 24.6Zm5.61-7.94c-.307-.154-1.816-.897-2.098-1-.281-.103-.487-.154-.692.154-.205.307-.795 1-.975 1.205-.179.205-.359.23-.666.077-.307-.154-1.296-.478-2.469-1.523-.912-.813-1.529-1.817-1.708-2.124-.179-.307-.019-.473.135-.626.139-.138.307-.359.461-.538.154-.18.205-.307.307-.512.103-.205.051-.384-.026-.538-.077-.154-.692-1.667-.948-2.283-.25-.6-.505-.519-.692-.529l-.589-.01c-.205 0-.538.077-.82.384-.281.307-1.075 1.05-1.075 2.563 0 1.512 1.1 2.973 1.253 3.178.154.205 2.164 3.305 5.246 4.634.733.316 1.305.505 1.75.646.735.234 1.404.201 1.933.122.59-.088 1.816-.742 2.073-1.459.256-.717.256-1.332.179-1.459-.077-.128-.282-.205-.59-.36Z" />
    </svg>
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

  // Fotos para la tira estilo Instagram: tomamos lo que ya está cargado de
  // cada rubro. No es una integración real con la API de Instagram — eso
  // queda para un proyecto aparte.
  const instaPhotos = [tortasHero, ...tortasPreview.slice(1, 4), cateringHero, eventosHero].filter(
    (item): item is MediaItem => Boolean(item?.url)
  );

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
            <h2 className="font-display mt-1 text-4xl italic text-brand-dark md:text-5xl">
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
              <Link
                to={c.to}
                className="group relative flex aspect-[4/5] flex-col justify-end overflow-hidden rounded-[1.75rem] bg-brand-dark shadow-warm transition-shadow duration-500 hover:shadow-warm-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand"
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
                className="arch-mask relative mx-auto h-[420px] w-[85%] object-cover object-top drop-shadow-2xl md:h-[540px]"
              />
            )}
          </RevealOnScroll>

          <div className="text-center lg:text-left">
            <RevealOnScroll>
              <h2 className="font-display text-5xl italic leading-[1.05] text-brand-dark md:text-6xl lg:text-7xl">
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
            <h2 className="font-display mt-1 text-4xl italic text-brand-dark md:text-5xl">
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

      {/* ================================================================
          TESTIMONIOS
      ================================================================= */}
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
    </PublicLayout>
  );
}
