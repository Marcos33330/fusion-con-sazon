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

  useEffect(() => {
    api.get<Testimonial[]>("/testimonials").then(setTestimonials).catch(() => {});
    api
      .get<MediaItem[]>("/media?page=TORTAS")
      .then((items) => setTortasPreview(items.slice(0, 4)))
      .catch(() => {});
  }, []);

  return (
    <PublicLayout>
      {/* Hero */}
      <section className="bg-brand-light py-20 text-center px-4">
        <h1 className="text-3xl md:text-5xl font-bold text-brand-dark max-w-3xl mx-auto">
          {loading ? "Cargando..." : get("home_hero")}
        </h1>
        <div className="mt-8 flex justify-center gap-4 flex-wrap">
          <Link to="/tortas-y-postres" className="bg-brand text-white px-6 py-3 rounded-full font-semibold hover:bg-brand-dark transition">
            Ver Tortas y Postres
          </Link>
          <Link to="/catering" className="bg-white text-brand border border-brand px-6 py-3 rounded-full font-semibold hover:bg-brand-light transition">
            Ver Catering
          </Link>
        </div>
      </section>

      {/* Nosotros preview */}
      <section className="max-w-5xl mx-auto px-4 py-16 grid md:grid-cols-2 gap-8 items-center">
        <div>
          <h2 className="text-2xl font-bold mb-4">{get("home_nosotros_preview", "Nosotros")}</h2>
          <p className="text-gray-700 leading-relaxed">
            {get("home_nosotros_preview")}
          </p>
          <Link to="/nosotros" className="inline-block mt-4 text-brand font-semibold hover:underline">
            Leer más →
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {tortasPreview.map((item) => (
            <img key={item.id} src={item.url} alt="" className="rounded-lg aspect-square object-cover" loading="lazy" />
          ))}
        </div>
      </section>

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
