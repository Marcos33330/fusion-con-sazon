import { useEffect, useState } from "react";
import { api } from "../api/client";
import { MediaItem, MediaPage } from "../types";

interface Props {
  page: MediaPage;
  category?: string;
}

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
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
      {items.map((item, i) => (
        <div
          key={item.id}
          className="stamp-edge group relative aspect-square overflow-hidden rounded-lg bg-gray-100 shadow-md"
          style={{
            ["--stamp-bg" as string]: "#FAF8F5",
            borderTop: `4px solid ${accents[i % accents.length]}`,
          }}
        >
          {item.type === "IMAGE" ? (
            <>
              <img
                src={item.url}
                alt={item.title ?? ""}
                loading="lazy"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              {/* Overlay oscuro semitransparente al pasar el mouse, como la galería del sitio original */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300 flex items-end">
                {item.title && (
                  <p className="w-full p-2 text-white text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-t from-black/70 to-transparent">
                    {item.title}
                  </p>
                )}
              </div>
            </>
          ) : (
            <video src={item.url} controls className="w-full h-full object-cover" preload="metadata" />
          )}
        </div>
      ))}
    </div>
  );
}
