import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useContent } from "../hooks/useContentBlock";
import { api } from "../api/client";
import { Testimonial, MediaItem } from "../types";
import PublicLayout from "../components/PublicLayout";

export default function Home() {
  const { get, loading } = useContent();
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [tortasPreview, setTortasPreview] = useState<MediaItem[]>([]);
  const [tortasHero, setTortasHero] = useState<MediaItem | null>(null);
  const [cateringHero, setCateringHero] = useState<MediaItem | null>(null);
  const [nosotrosPhoto, setNosotrosPhoto] = useState<MediaItem | null>(null);

  useEffect(() => {
    api.get<Testimonial[]>("/testimonials").then(setTestimonials).catch(() => {});
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

  return (
    <PublicLayout>
      {/* Hero: dos tarjetas grandes con foto de fondo + overlay oscuro, como el sitio original */}
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

      {/* Frase principal */}
      <section className="bg-brand-light py-14 text-center px-4">
        <h1 className="text-2xl md:text-4xl font-bold text-brand-dark max-w-3xl mx-auto leading-snug">
          {loading ? "Cargando..." : get("home_hero")}
        </h1>
      </section>

      {/* Nosotros preview: foto de la pareja (fondo transparente) sobre panel de color, como el sitio original */}
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
            <h2 className="text-2xl font-bold mb-4">Nosotros</h2>
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
      <section className="bg-gray-50 py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-4">ENTREGAS</h2>
          <p className="text-gray-700 leading-relaxed">{get("home_entregas")}</p>
        </div>
      </section>

      {/* Testimonios */}
      <section id="testimonios" className="max-w-5xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold text-center mb-10">Testimonios</h2>
        <div className="grid md:grid-cols-2 gap-6">
          {testimonials.map((t) => (
            <blockquote key={t.id} className="bg-white shadow rounded-lg p-6">
              <p className="text-gray-700 italic">"{t.text}"</p>
              <footer className="mt-3 text-sm font-semibold text-brand-dark">— {t.author}</footer>
            </blockquote>
          ))}
        </div>
      </section>
    </PublicLayout>
  );
}
