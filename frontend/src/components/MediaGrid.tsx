import { useEffect, useState } from "react";
import { api } from "../api/client";
import { MediaItem, MediaPage } from "../types";

interface Props {
  page: MediaPage;
  category?: string;
}

// Galería sin "tarjeta": la foto es la protagonista, sin panel blanco ni
// marco que le reste protagonismo. Solo un borde redondeado sutil, sombra
// suave y un acento de color fino abajo, con el título (si existe) apareciendo
// como overlay al pasar el mouse.
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
    return <p className="text-center text-gray-500 py-8">Cargando galería...</p>;
  }

  if (items.length === 0) {
    return <p className="text-center text-gray-500 py-8">Todavía no hay contenido cargado acá.</p>;
  }

  const accents = ["#E80541", "#FFA610", "#331806"];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 md:gap-8">
      {items.map((item, i) => (
        <div
          key={item.id}
          className="group relative aspect-[4/5] w-full rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300"
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

          {/* Acento de color fino, rotando por foto */}
          <span
            className="absolute inset-x-0 bottom-0 h-1.5"
            style={{ backgroundColor: accents[i % accents.length] }}
          />

          {/* Título como overlay al pasar el mouse, sin ocupar espacio fijo */}
          {item.title && (
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/0 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
              <p className="w-full p-3 text-white text-xs sm:text-sm font-semibold">{item.title}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
