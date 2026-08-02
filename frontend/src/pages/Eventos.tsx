import { useState } from "react";
import PublicLayout from "../components/PublicLayout";
import MediaGrid from "../components/MediaGrid";
import Marquee from "../components/Marquee";

export default function Eventos() {
  const [tab, setTab] = useState<"fotos" | "videos">("fotos");

  return (
    <PublicLayout>
      {/* Encabezado premium, mismo estilo que Nosotros/Inicio */}
      <section className="bg-brand-dark py-24 md:py-32 text-center px-4">
        <h1 className="text-5xl md:text-7xl font-extrabold uppercase tracking-tight text-white">Eventos</h1>
        <span className="inline-block mt-6 w-24 h-1 bg-brand-mustard rounded-full" />
      </section>

      <Marquee items={["Celebrar y Compartir", "Eventos a medida", "Fotos y Videos", "Momentos Inolvidables"]} />

      <section className="max-w-6xl mx-auto px-4 py-20 md:py-28">
        <div className="flex justify-center gap-3 mb-10">
          <button
            onClick={() => setTab("fotos")}
            className={`px-6 py-2 rounded-full font-bold uppercase tracking-wide border-2 transition ${tab === "fotos" ? "bg-brand text-white border-brand" : "bg-white text-brand-dark border-brand-dark/20 hover:border-brand"}`}
          >
            Fotos
          </button>
          <button
            onClick={() => setTab("videos")}
            className={`px-6 py-2 rounded-full font-bold uppercase tracking-wide border-2 transition ${tab === "videos" ? "bg-brand text-white border-brand" : "bg-white text-brand-dark border-brand-dark/20 hover:border-brand"}`}
          >
            Videos
          </button>
        </div>
        <MediaGrid page={tab === "fotos" ? "EVENTOS_FOTOS" : "EVENTOS_VIDEOS"} />
      </section>
    </PublicLayout>
  );
}
