import { useEffect, useState } from "react";
import { api } from "../api/client";
import { MediaItem, MediaPage } from "../types";

interface Props {
  page: MediaPage;
  category?: string;
}

// Galería de grilla pareja.
//
// Todas las fotos de producto usan la misma tarjeta 4:5: eso es lo que da
// prolijidad y era el problema del mosaico anterior, donde cada foto tenía
// una altura distinta. La única excepción son las piezas anchas —los combos
// son banners horizontales, no fotos de producto—: recortadas a 4:5 perdían
// el precio y el logo, así que ocupan dos columnas y conservan su proporción.
//
// El orden agrupa por categoría: primero lo que no tiene categoría, después
// cada categoría en el orden en que aparece, y dentro de cada grupo se
// respeta el `order` que fijó el admin. Así los combos quedan juntos al final
// en vez de intercalados entre las tortas.
export default function MediaGrid({ page, category }: Props) {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [ratios, setRatios] = useState<Record<string, number>>({});

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

  // Ancha = bastante más ancha que alta. Se mide al cargar, así vale para
  // cualquier foto que suban después sin tener que marcarla a mano.
  const isWide = (id: string) => (ratios[id] ?? 0) > 1.25;

  const accents = ["#E80541", "#FFA610", "#331806"];

  return (
    <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 md:gap-7">
      {ordered.map((item, i) => {
        const wide = isWide(item.id);
        return (
          <figure
            key={item.id}
            className={`group relative overflow-hidden rounded-2xl bg-brand-gray shadow-warm transition-shadow duration-300 hover:shadow-warm-lg ${
              wide ? "col-span-2" : "aspect-[4/5]"
            }`}
            style={wide ? { aspectRatio: String(ratios[item.id]) } : undefined}
          >
            {item.type === "IMAGE" ? (
              <img
                src={item.url}
                alt={item.title ?? ""}
                loading="lazy"
                onLoad={(e) => {
                  const el = e.currentTarget;
                  if (!el.naturalHeight) return;
                  const r = el.naturalWidth / el.naturalHeight;
                  setRatios((prev) => (prev[item.id] === r ? prev : { ...prev, [item.id]: r }));
                }}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
              />
            ) : (
              <video src={item.url} controls className="h-full w-full object-cover" preload="metadata" />
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
        );
      })}
    </div>
  );
}
