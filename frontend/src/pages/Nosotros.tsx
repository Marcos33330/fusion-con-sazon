import { useEffect, useState } from "react";
import { useContent } from "../hooks/useContentBlock";
import { api } from "../api/client";
import { MediaItem } from "../types";
import PublicLayout from "../components/PublicLayout";
import MediaGrid from "../components/MediaGrid";

export default function Nosotros() {
  const { get, loading } = useContent();
  const [photo, setPhoto] = useState<MediaItem | null>(null);

  useEffect(() => {
    api
      .get<MediaItem[]>("/media?page=NOSOTROS")
      .then((items) => setPhoto(items[0] ?? null))
      .catch(() => {});
  }, []);

  return (
    <PublicLayout>
      {/* Encabezado, como el banner de la página original */}
      <section className="bg-gradient-to-br from-brand-dark via-brand to-brand-dark py-16 md:py-20 text-center px-4">
        <h1 className="text-4xl md:text-5xl font-bold text-white">Nosotros</h1>
        <span className="inline-block mt-4 w-24 h-1 bg-white/70 rounded-full" />
      </section>

      {/* Intro: foto de la pareja (fondo transparente) + texto, como el sitio original */}
      <section className="bg-brand-light">
        <div className="grid md:grid-cols-2 items-end max-w-6xl mx-auto">
          <div className="flex justify-center md:justify-start px-6 pt-10 md:pt-0">
            {photo && (
              <img
                src={photo.url}
                alt="Nosotros"
                className="h-[280px] md:h-[440px] w-auto object-contain object-bottom drop-shadow-2xl"
              />
            )}
          </div>
          <div className="bg-white px-6 md:px-14 py-12 md:py-16">
            <p className="uppercase tracking-wide text-brand font-semibold mb-2">¡Hola!</p>
            <h2 className="text-2xl font-bold mb-4">Somos Herminia y Oscar</h2>
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">
              {loading ? "Cargando..." : get("nosotros_page")}
            </p>
          </div>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold text-center mb-8">Nuestro trabajo</h2>
        <MediaGrid page="NOSOTROS" />
      </section>
    </PublicLayout>
  );
}
