import { useEffect, useState } from "react";
import { useContent } from "../hooks/useContentBlock";
import { api } from "../api/client";
import { MediaItem } from "../types";
import PublicLayout from "../components/PublicLayout";
import Marquee from "../components/Marquee";

const accents = ["#E80541", "#FFA610", "#331806"];

export default function Nosotros() {
  const { get, loading } = useContent();
  const [photo, setPhoto] = useState<MediaItem | null>(null);
  const [gallery, setGallery] = useState<MediaItem[]>([]);
  const [galleryLoading, setGalleryLoading] = useState(true);

  useEffect(() => {
    api
      .get<MediaItem[]>("/media?page=NOSOTROS")
      .then((items) => {
        setPhoto(items[0] ?? null);
        // La primera foto ya se usa como protagonista arriba, así que en la
        // galería de "Nuestro trabajo" mostramos el resto para no repetirla.
        setGallery(items.slice(1));
      })
      .catch(() => {})
      .finally(() => setGalleryLoading(false));
  }, []);

  return (
    <PublicLayout>
      {/* Encabezado premium: fondo plano chocolate con acento mostaza */}
      <section className="bg-brand-dark py-16 md:py-20 text-center px-4">
        <h1 className="text-4xl md:text-5xl font-extrabold uppercase tracking-tight text-white">Nosotros</h1>
        <span className="inline-block mt-4 w-24 h-1 bg-brand-mustard rounded-full" />
      </section>

      {/* Cinta en loop infinito, como la de la referencia Banh Mi World */}
      <Marquee items={["20 años de experiencia", "Hecho con amor", "Sabor a hogar", "Familia y amigos"]} />

      {/* La foto de la pareja como protagonista absoluta: grande, centrada, con
          manchas de color detrás que le dan profundidad y le hacen de marco */}
      <section className="relative bg-brand-light py-16 md:py-24 px-4 text-center overflow-hidden">
        <svg
          className="hidden md:block absolute top-10 right-10 w-16 h-16 text-brand/40 rotate-12 pointer-events-none"
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

        <p className="uppercase tracking-widest text-brand font-bold mb-2 text-sm">¡Hola!</p>
        <h2 className="text-3xl md:text-4xl font-extrabold text-brand-dark mb-10">Somos Herminia y Oscar</h2>

        <div className="relative max-w-lg mx-auto mb-12">
          {/* Manchas de color detrás de la foto, como marco/protagonismo */}
          <span className="absolute -top-6 -left-6 w-28 h-28 md:w-36 md:h-36 rounded-full bg-brand-mustard/90 -z-10" />
          <span className="absolute -bottom-8 -right-4 w-36 h-36 md:w-44 md:h-44 rounded-full bg-brand/90 -z-10" />
          {photo && (
            <img
              src={photo.url}
              alt="Herminia y Oscar"
              className="relative mx-auto h-[360px] sm:h-[460px] md:h-[600px] w-auto object-contain drop-shadow-2xl"
            />
          )}
        </div>

        <p className="max-w-2xl mx-auto text-gray-700 leading-relaxed text-lg whitespace-pre-line">
          {loading ? "Cargando..." : get("nosotros_page")}
        </p>
      </section>

      <div className="deco-divider" style={{ ["--deco-color" as string]: "#E80541" }} />

      {/* Galería centrada: se acomoda al ancho real de contenido en vez de
          quedar pegada a la izquierda con un hueco vacío al costado */}
      <section className="max-w-5xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold text-center mb-10 text-brand-dark">Nuestro trabajo</h2>
        {galleryLoading ? (
          <p className="text-center text-gray-500">Cargando galería...</p>
        ) : gallery.length > 0 ? (
          <div className="flex flex-wrap justify-center gap-6">
            {gallery.map((item, i) => (
              <div
                key={item.id}
                className="stamp-edge group relative w-56 sm:w-64 aspect-square rounded-lg overflow-hidden shadow-md bg-gray-100"
                style={{
                  ["--stamp-bg" as string]: "#FAF8F5",
                  borderTop: `4px solid ${accents[i % accents.length]}`,
                }}
              >
                {item.type === "IMAGE" ? (
                  <img
                    src={item.url}
                    alt={item.title ?? ""}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                ) : (
                  <video src={item.url} controls className="w-full h-full object-cover" preload="metadata" />
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500">Todavía no hay más fotos cargadas acá.</p>
        )}
      </section>
    </PublicLayout>
  );
}
