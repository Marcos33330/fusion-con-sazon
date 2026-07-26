import { useState } from "react";
import PublicLayout from "../components/PublicLayout";
import MediaGrid from "../components/MediaGrid";
import Marquee from "../components/Marquee";

const CATEGORIES = ["Todo", "Comida Venezolana", "Comida Uruguaya", "Comida Internacional"];

export default function Catering() {
  const [active, setActive] = useState("Todo");

  return (
    <PublicLayout>
      {/* Encabezado premium, mismo estilo que Nosotros/Inicio */}
      <section className="bg-brand-dark py-16 md:py-20 text-center px-4">
        <h1 className="text-4xl md:text-5xl font-extrabold uppercase tracking-tight text-white">Catering</h1>
        <span className="inline-block mt-4 w-24 h-1 bg-brand-mustard rounded-full" />
      </section>

      <Marquee items={["Catering a medida", "Sabor y Eventos", "Comida Venezolana", "Comida Uruguaya"]} />

      <section className="max-w-6xl mx-auto px-4 py-16 md:py-20">
        <div className="flex justify-center gap-3 flex-wrap mb-10">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActive(cat)}
              className={`px-5 py-2 rounded-full text-sm font-bold uppercase tracking-wide border-2 transition ${
                active === cat
                  ? "bg-brand text-white border-brand"
                  : "bg-white text-brand-dark border-brand-dark/20 hover:border-brand"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
        <MediaGrid page="CATERING" category={active === "Todo" ? undefined : active} />
      </section>
    </PublicLayout>
  );
}
