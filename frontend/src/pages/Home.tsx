import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useContent } from "../hooks/useContentBlock";
import { api } from "../api/client";
import { Testimonial, MediaItem, ContactInfo } from "../types";
import PublicLayout from "../components/PublicLayout";

export default function Home() {
  const { get, loading } = useContent();
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [tortasPreview, setTortasPreview] = useState<MediaItem[]>([]);
  const [tortasHero, setTortasHero] = useState<MediaItem | null>(null);
  const [cateringHero, setCateringHero] = useState<MediaItem | null>(null);
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
      .get<MediaItem[]>("/media?page=NOSOTROS")
      .then((items) => setNosotrosPhoto(items[0] ?? null))
      .catch(() => {});
  }, []);

  const waHref = contact
    ? `https://wa.me/${contact.whatsapp.replace(/[^\d]/g, "")}?text=${encodeURIComponent(
        "Hola, quisiera solicitar un presupuesto."
      )}`
    : "#";

  return (
    <PublicLayout>
      {/* Hero premium: fondo plano chocolate, sello girando y dos CTA, como
          la referencia Banh Mi World que pidió el cliente */}
      <section className="relative bg-brand-dark overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 py-20 md:py-28 flex flex-col items-center text-center">
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

          <h1 className="text-white text-3xl md:text-5xl font-extrabold uppercase tracking-tight leading-[1.1] max-w-2xl">
            {loading ? "Cargando..." : get("home_hero")}
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
        <div className="deco-divider" style={{ ["--deco-color" as string]: "#FFA610" }} />
      </section>

      {/* Fotos grandes: Tortas y Postres / Catering */}
      <section className="grid sm:grid-cols-2">
        <Link
          to="/tortas-y-postres"
          className="group relative h-[46vh] min-h-[280px] flex items-center justify-center overflow-hidden bg-brand-dark"
        >
          {tortasHero && (
            <img
              src={tortasHero.url}
              alt=""
              className="absolute inset-0 w-full h-full object-cover opacity-70 group-hover:opacity-80 group-hover:scale-105 transition-all duration-500"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/10" />
          <div className="relative text-center px-4">
            <h2 className="text-white text-3xl md:text-4xl font-extrabold tracking-wide drop-shadow-lg">
              TORTAS Y POSTRES
            </h2>
            <span className="inline-block mt-4 text-white border border-white/80 px-5 py-2 rounded-full text-sm font-semibold group-hover:bg-white group-hover:text-brand-dark transition">
              Ver más
            </span>
          </div>
        </Link>

        <Link
          to="/catering"
          className="group relative h-[46vh] min-h-[280px] flex items-center justify-center overflow-hidden bg-brand-dark"
        >
          {cateringHero && (
            <img
              src={cateringHero.url}
              alt=""
              className="absolute inset-0 w-full h-full object-cover opacity-70 group-hover:opacity-80 group-hover:scale-105 transition-all duration-500"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/10" />
          <div className="relative text-center px-4">
            <h2 className="text-white text-3xl md:text-4xl font-extrabold tracking-wide drop-shadow-lg">
              CATERING
            </h2>
            <span className="inline-block mt-4 text-white border border-white/80 px-5 py-2 rounded-full text-sm font-semibold group-hover:bg-white group-hover:text-brand-dark transition">
              Ver platos
            </span>
          </div>
        </Link>
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
