import { MediaItem } from "../types";

interface Props {
  items: MediaItem[];
}

// Carrusel de fotos en loop infinito: mismo mecanismo que el Marquee de texto
// (duplicamos la lista y animamos con translateX(-50%) para que el reinicio
// sea perfectamente continuo). Cualquier foto nueva subida a "Tortas y
// Postres" desde el panel de admin entra automáticamente a la cinta.
export default function ImageMarquee({ items }: Props) {
  if (items.length === 0) return null;

  return (
    <div className="overflow-hidden bg-brand-light py-4">
      <div className="flex w-max animate-marquee-slow">
        {[0, 1].map((rep) => (
          <div key={rep} className="flex shrink-0">
            {items.map((item, i) => (
              <div
                key={`${rep}-${item.id}-${i}`}
                className="w-[200px] sm:w-[240px] md:w-[280px] aspect-square overflow-hidden shrink-0 mx-2 rounded-2xl shadow-md"
              >
                <img
                  src={item.url}
                  alt={item.title ?? ""}
                  loading="lazy"
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
