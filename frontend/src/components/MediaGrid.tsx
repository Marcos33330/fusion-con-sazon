import { useEffect, useState } from "react";
import { api } from "../api/client";
import { MediaItem, MediaPage } from "../types";
import TiltCard from "./ui/TiltCard";

interface Props {
  page: MediaPage;
  category?: string;
}

// Galería de grilla pareja, todas las tarjetas del mismo tamaño.
//
// El formato es cuadrado por una razón concreta: las fotos de producto vienen
// verticales (1125x2000) y los combos son cuadrados exactos (1080x1080).
// Con tarjetas 4:5 los combos perdían los costados, que es justo donde están
// el precio y el logo. En cuadrado los combos entran completos y las tortas
// quedan centradas, que es el recorte natural para un producto centrado.
//
// El orden agrupa por categoría: primero lo que no tiene categoría, después
// cada categoría en el orden en que aparece, y dentro de cada grupo se respeta
// el `order` que fijó el admin. Así los combos quedan juntos al final en vez
// de intercalados entre las tortas.
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

  const cats = Array.from(new Set(items.map((it) => it.category ?? "")));
  const ordered = ["", ...cats.filter((c) => c !== "")].flatMap((g) =>
    items.filter((it) => (it.category ?? "") === g).sort((a, b) => a.order - b.order)
  );

  const accents = ["#E80541", "#FFA610", "#331806"];

  return (
    <div className="grid grid-cols-2 gap-7 sm:grid-cols-3 md:gap-10">
      {ordered.map((item, i) => (
        <figure
          key={item.id}
          className="group relative aspect-square overflow-hidden rounded-2xl bg-brand-gray shadow-warm transition-shadow duration-300 hover:shadow-warm-lg"
        >
          <TiltCard maxTilt={5} className="h-full w-full">
            {item.type === "IMAGE" ? (
              <img
                src={item.url}
                alt={item.title ?? ""}
                loading="lazy"
                className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-[1.04]"
              />
            ) : (
              <video src={item.url} controls className="h-full w-full object-cover" preload="metadata" />
            )}

            {/* Acento de color fino, rotando por foto */}
            <span
              className="absolute inset-x-0 bottom-0 h-1.5"
              style={{ backgroundColor: accents[i % accents.length] }}
            />
          </TiltCard>

          {/* Título como overlay al pasar el mouse, sin ocupar espacio fijo */}
          {item.title && (
            <figcaption className="pointer-events-none absolute inset-0 flex items-end bg-gradient-to-t from-brand-espresso/80 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              <p className="w-full p-4 text-sm font-semibold text-white">{item.title}</p>
            </figcaption>
          )}
        </figure>
      ))}
    </div>
  );
}
