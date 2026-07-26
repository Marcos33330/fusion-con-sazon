import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useContent } from "../hooks/useContentBlock";
import { api } from "../api/client";
import { Testimonial, MediaItem, ContactInfo } from "../types";
import PublicLayout from "../components/PublicLayout";
import Marquee from "../components/Marquee";

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
        setTortasPreview(items.slice(0, 4));
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

      {/* Nosotros preview: foto de la pareja (fondo transparente) sobre panel de color */}
      <section className="bg-gradient-to-br from-brand-dark via-brand to-brand-dark">
        <div className="grid md:grid-cols-2 items-end max-w-6xl mx-auto">
          <div className="flex justify-center md:justify-start px-6 pt-10 md:pt-0">
            {nosotrosPhoto && (
              <img
                src={nosotrosPhoto.url}
                alt="Nosotros"
                className="h-[260px] md:h-[400px] w-auto object-contain object-bottom drop-shadow-2xl"
              />
            )}
          </div>
          <div className="bg-white px-6 md:px-14 py-12 md:py-16">
            <h2 className="text-2xl font-bold mb-4 text-brand-dark">Nosotros</h2>
            <p className="text-gray-700 leading-relaxed">{get("home_nosotros_preview")}</p>
            <Link to="/nosotros" className="inline-block mt-4 text-brand font-semibold hover:underline w-fit">
              Leer más →
            </Link>
          </div>
        </div>
      </section>

      {/* Preview fotos de tortas */}
      {tortasPreview.length > 0 && (
        <section className="grid grid-cols-2 md:grid-cols-4">
          {tortasPreview.map((item) => (
            <div key={item.id} className="aspect-square overflow-hidden group">
              <img
                src={item.url}
                alt=""
                loading="lazy"
                className="w-full h-full object-cover group-hover:scale-110 group-hover:opacity-90 transition-all duration-500"
              />
            </div>
          ))}
        </section>
      )}

      {/* Entregas */}
      <section className="bg-brand-gray py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-4 text-brand-dark">ENTREGAS</h2>
          <p className="text-gray-700 leading-relaxed">{get("home_entregas")}</p>
        </div>
      </section>

      {/* Testimonios: tarjetas tipo sello, con acento mostaza */}
      <section id="testimonios" className="max-w-5xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold text-center mb-10 text-brand-dark">Testimonios</h2>
        <div className="grid md:grid-cols-2 gap-8">
          {testimonials.map((t) => (
            <blockquote
              key={t.id}
              className="stamp-edge bg-white shadow-md rounded-lg p-6 border-t-4 border-brand-mustard"
              style={{ ["--stamp-bg" as string]: "#FAF8F5" }}
            >
              <p className="text-gray-700 italic">"{t.text}"</p>
              <footer className="mt-3 text-sm font-semibold text-brand-dark">— {t.author}</footer>
            </blockquote>
          ))}
        </div>
      </section>
    </PublicLayout>
  );
}
