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

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
      {items.map((item) => (
        <div key={item.id} className="aspect-square overflow-hidden rounded-lg bg-gray-100">
          {item.type === "IMAGE" ? (
            <img
              src={item.url}
              alt={item.title ?? ""}
              loading="lazy"
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <video src={item.url} controls className="w-full h-full object-cover" preload="metadata" />
          )}
        </div>
      ))}
    </div>
  );
}
