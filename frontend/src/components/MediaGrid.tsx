import { useEffect, useState } from "react";
import { api } from "../api/client";
import { MediaItem, MediaPage } from "../types";

interface Props {
  page: MediaPage;
  category?: string;
}

// Galería tipo mosaico: cada foto conserva su proporción real.
//
// Antes la grilla forzaba aspect-[4/5] con object-cover, así que las piezas
// anchas (los combos, que son banners horizontales) se recortaban y perdían
// el precio y el logo. Con columnas CSS cada imagen entra completa y la
// altura de la fila deja de imponerse sobre el contenido.
export default function MediaGrid({ page, category }: Props) {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const query = category ? `?page=${page}&category=${encodeURIComponent(category)}` : `?page=${page}`;
    api
      .get<MediaItem[]>(`/media${query}`)
      .then(setItems)
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [page, category]);

  if (loading) {
    return <p className="py-8 text-center text-brand-dark/50">Cargando galería...</p>;
  }

  if (items.length === 0) {
    return <p className="py-8 text-center text-brand-dark/50">Todavía no hay contenido cargado acá.</p>;
  }

  const accents = ["#E80541", "#FFA610", "#331806"];

  return (
    <div className="columns-1 gap-5 sm:columns-2 md:gap-7 lg:columns-3">
      {items.map((item, i) => (
        <figure
          key={item.id}
          className="group relative mb-5 break-inside-avoid overflow-hidden rounded-2xl bg-brand-gray shadow-warm transition-shadow duration-300 hover:shadow-warm-lg md:mb-7"
        >
          {item.type === "IMAGE" ? (
            <img
              src={item.url}
              alt={item.title ?? ""}
              loading="lazy"
              className="block h-auto w-full transition-transform duration-500 group-hover:scale-[1.04]"
            />
          ) : (
            <video src={item.url} controls className="block h-auto w-full" preload="metadata" />
          )}

          {/* Acento de color fino, rotando por foto */}
          <span
            className="absolute inset-x-0 bottom-0 h-1.5"
            style={{ backgroundColor: accents[i % accents.length] }}
          />

          {/* Título como overlay al pasar el mouse, sin ocupar espacio fijo */}
          {item.title && (
            <figcaption className="absolute inset-0 flex items-end bg-gradient-to-t from-brand-espresso/80 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              <p className="w-full p-4 text-sm font-semibold text-white">{item.title}</p>
            </figcaption>
          )}
        </figure>
      ))}
    </div>
  );
}
