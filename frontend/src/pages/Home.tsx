import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useContent } from "../hooks/useContentBlock";
import { api } from "../api/client";
import { Testimonial, MediaItem, ContactInfo } from "../types";
import PublicLayout from "../components/PublicLayout";
import Marquee from "../components/Marquee";
import ImageMarquee from "../components/ImageMarquee";

export default function Home() {
  const { get, loading } = useContent();
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

  // Tarjetas de categorías con foto real, cada una lleva a su página — como
  // pidió el cliente, reemplazando los bloques genéricos anteriores.
  const foodCards = [
    {
      to: "/tortas-y-postres",
      label: "Tortas y Postres",
      tag: "#DULCE  #CASERO",
      bg: "bg-brand",
      stamp: "#E80541",
      img: tortasHero?.url,
    },
    {
      to: "/catering",
      label: "Catering",
      tag: "#SABOR  #EVENTOS",
      bg: "bg-brand-mustard",
      stamp: "#FFA610",
      img: cateringHero?.url,
    },
    {
      to: "/eventos",
      label: "Eventos",
      tag: "#CELEBRAR  #COMPARTIR",
      bg: "bg-brand-dark",
      stamp: "#331806",
      img: eventosHero?.url,
    },
  ];

  return (
    <PublicLayout>
      {/* Hero premium: fondo plano chocolate, doodles dibujados a mano, sello
          girando y tipografía grande con acento script — como la referencia
          Banh Mi World que pidió el cliente */}
      <section className="relative bg-brand-dark overflow-hidden">
        <svg
          className="hidden md:block absolute top-14 left-10 w-16 h-16 text-brand-mustard/60 -rotate-12 pointer-events-none"
          viewBox="0 0 64 64"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M14 6v18c0 3.5 2.7 5.5 5.5 5.5S25 27.5 25 24V6M19.5 6v13.5M14 34v24" />
          <path d="M40 6c-6 0-9.5 6-9.5 13 0 5.5 3 8.5 6.5 9.5L35 58" />
        </svg>
        <svg
          className="hidden md:block absolute bottom-10 right-12 w-20 h-20 text-brand/60 rotate-6 pointer-events-none"
          viewBox="0 0 64 64"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
        >
          <path d="M16 52c8-6 8-14 0-20s-8-14 0-20" />
          <path d="M32 52c8-6 8-14 0-20s-8-14 0-20" />
          <path d="M48 52c8-6 8-14 0-20s-8-14 0-20" />
        </svg>

        <div className="relative max-w-4xl mx-auto px-4 py-20 md:py-28 flex flex-col items-center text-center">
          <div className="relative w-24 h-24 md:w-28 md:h-28 mb-8 shrink-0">
            <svg className="absolute inset-0 w-full h-full animate-spin-slow" viewBox="0 0 100 100">
              <defs>
                <path id="badgeCircle" d="M 50,50 m -38,0 a 38,38 0 1,1 76,0 a 38,38 0 1,1 -76,0" />
              </defs>
              <text fill="#FFA610" fontSize="8.2" fontWeight="700" letterSpacing="2">
                <textPath href="#badgeCircle">
                  • SABOR DE HOGAR • FUSIÓN CON SAZÓN •
                </textPath>
              </text>
            </svg>
            <div className="absolute inset-3 rounded-full bg-brand flex items-center justify-center text-white text-[11px] font-extrabold text-center leading-tight px-2">
              100%
              <br />
              CASERO
            </div>
          </div>

          <h1 className="text-white font-black uppercase tracking-tight leading-[0.95] text-4xl sm:text-5xl md:text-7xl max-w-3xl">
            {loading ? (
              "Cargando..."
            ) : (
              <>
                Convertimos cada celebración en una{" "}
                <span className="font-script italic normal-case tracking-normal text-brand-mustard">
                  experiencia
                </span>{" "}
                para recordar.
              </>
            )}
          </h1>

          <div className="flex flex-col sm:flex-row gap-4 mt-10">
            <a
              href={waHref}
              target="_blank"
              rel="noreferrer"
              className="bg-brand hover:bg-brand-mustard hover:text-brand-dark text-white font-bold uppercase tracking-wide px-8 py-4 rounded-full transition text-sm"
            >
              Solicitar presupuesto
            </a>
            <Link
              to="/catering"
              className="border-2 border-white text-white hover:bg-white hover:text-brand-dark font-bold uppercase tracking-wide px-8 py-4 rounded-full transition text-sm"
            >
              Ver nuestros servicios
            </Link>
          </div>
        </div>
      </section>

      {/* Cinta en loop infinito, como la de la referencia Banh Mi World */}
      <Marquee items={["Catering", "Tortas y Postres", "Eventos", "100% Casero", "Sabor de Hogar"]} />

      {/* Tarjetas de categorías: foto real de cada rubro, cada una lleva a su página */}
      <section className="max-w-6xl mx-auto px-4 py-16 md:py-20">
        <h2 className="text-2xl md:text-3xl font-extrabold text-center mb-10 text-brand-dark">
          Elegí tu experiencia
        </h2>
        <div className="grid sm:grid-cols-3 gap-6">
          {foodCards.map((c) => (
            <Link
              key={c.to}
              to={c.to}
              className={`stamp-edge group relative flex flex-col items-center text-center p-6 rounded-lg shadow-lg transition-transform hover:-translate-y-1 ${c.bg}`}
              style={{ ["--stamp-bg" as string]: c.stamp }}
            >
              <div className="w-full aspect-square rounded-md overflow-hidden shadow-md mb-5 bg-black/10">
                {c.img && (
                  <img
                    src={c.img}
                    alt={c.label}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                )}
              </div>
              <h3 className="text-white text-xl md:text-2xl font-extrabold uppercase tracking-wide">{c.label}</h3>
              <span className="mt-3 text-white/90 text-xs font-bold uppercase tracking-widest">{c.tag}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Nosotros preview: foto de la pareja sobre fondo chocolate premium */}
      <section className="relative bg-brand-dark overflow-hidden">
        <div className="grid md:grid-cols-2 items-end max-w-6xl mx-auto">
          <div className="flex justify-center md:justify-start px-6 pt-10 md:pt-0">
            {nosotrosPhoto && (
              <img
                src={nosotrosPhoto.url}
                alt="Nosotros"
                className="h-[340px] md:h-[560px] w-auto object-contain object-bottom drop-shadow-2xl"
              />
            )}
          </div>
          <div className="bg-brand-light px-6 md:px-14 py-12 md:py-16">
            <p className="font-script text-4xl md:text-5xl text-brand leading-none mb-1 -rotate-2">Conocé a</p>
            <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight text-brand-dark mb-2">
              Nosotros
            </h2>
            <span className="block w-16 h-1 bg-brand-mustard rounded-full mb-5" />
            <p className="text-gray-700 text-lg leading-relaxed">{get("home_nosotros_preview")}</p>
            <Link
              to="/nosotros"
              className="inline-flex items-center gap-2 mt-6 bg-brand hover:bg-brand-mustard hover:text-brand-dark text-white font-bold uppercase tracking-wide text-sm px-6 py-3 rounded-full transition w-fit"
            >
              Leer más →
            </Link>
          </div>
        </div>
      </section>

      {/* Preview fotos de tortas: carrusel infinito */}
      <ImageMarquee items={tortasPreview} />

      {/* Testimonios: reseñas reales de Google, destacadas con estrellas y sello */}
      <section id="testimonios" className="bg-brand-gray py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="font-script text-4xl md:text-5xl text-brand leading-none mb-1 -rotate-2">Lo que dicen</p>
            <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight text-brand-dark mb-4">de nosotros</h2>
            <div className="inline-flex items-center gap-2 bg-white rounded-full shadow-md px-5 py-2.5">
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.26 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09A6.6 6.6 0 0 1 5.5 12c0-.73.13-1.44.34-2.09V7.07H2.18A11 11 0 0 0 1 12c0 1.77.42 3.45 1.18 4.93l3.66-2.84z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1a11 11 0 0 0-9.82 6.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              <span className="font-bold text-brand-dark">5.0</span>
              <span className="text-brand-mustard text-sm tracking-tighter">★★★★★</span>
              <span className="text-gray-500 text-sm">· 52 reseñas de Google</span>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t) => {
              const [name, source] = t.author.split(" · ");
              return (
                <blockquote
                  key={t.id}
                  className="relative bg-white rounded-2xl shadow-xl p-7 pt-10 hover:-translate-y-1 transition-transform duration-300"
                >
                  <span className="absolute -top-5 left-7 w-10 h-10 rounded-full bg-brand-mustard text-white flex items-center justify-center text-2xl font-black shadow-md">
                    "
                  </span>
                  <div className="text-brand-mustard text-sm tracking-tighter mb-3">★★★★★</div>
                  <p className="text-gray-700 leading-relaxed">{t.text}</p>
                  <footer className="mt-5 flex items-center gap-2">
                    <span className="font-bold text-brand-dark">{name}</span>
                    {source && (
                      <span className="inline-flex items-center gap-1 text-xs text-gray-400">
                        <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
                          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.26 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z" />
                          <path fill="#FBBC05" d="M5.84 14.09A6.6 6.6 0 0 1 5.5 12c0-.73.13-1.44.34-2.09V7.07H2.18A11 11 0 0 0 1 12c0 1.77.42 3.45 1.18 4.93l3.66-2.84z" />
                          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1a11 11 0 0 0-9.82 6.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        {source}
                      </span>
                    )}
                  </footer>
                </blockquote>
              );
            })}
          </div>

          <div className="text-center mt-10">
            <a
              href="https://www.google.com/search?q=Fusi%C3%B3n+con+Saz%C3%B3n+Opiniones"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 text-brand font-bold uppercase tracking-wide text-sm hover:underline"
            >
              Ver todas las reseñas en Google →
            </a>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
