import { useContent } from "../hooks/useContentBlock";
import PublicLayout from "../components/PublicLayout";
import MediaGrid from "../components/MediaGrid";
import Marquee from "../components/Marquee";

export default function TortasYPostres() {
  const { get } = useContent();

  return (
    <PublicLayout>
      {/* Encabezado premium, mismo estilo que Nosotros/Inicio */}
      <section className="bg-brand-dark py-16 md:py-20 text-center px-4">
        <h1 className="text-4xl md:text-5xl font-extrabold uppercase tracking-tight text-white">
          Tortas y Postres
        </h1>
        <span className="inline-block mt-4 w-24 h-1 bg-brand-mustard rounded-full" />
      </section>

      <Marquee items={["Tortas a medida", "Postres artesanales", "100% Casero", "Dulce y Casero"]} />

      <section className="max-w-6xl mx-auto px-4 py-16 md:py-20">
        <MediaGrid page="TORTAS" />
      </section>

      <section className="bg-brand-gray py-16 px-4 text-center">
        <h2 className="text-2xl md:text-3xl font-extrabold mb-4 text-brand-dark">
          {get("tortas_combos_title", "¡Deleitate con nuestros Combos!")}
        </h2>
        <p className="max-w-xl mx-auto text-gray-700 mb-8">{get("tortas_combos_title")}</p>
        <a
          href="https://wa.me/59891842491"
          target="_blank"
          rel="noreferrer"
          className="bg-brand hover:bg-brand-mustard hover:text-brand-dark text-white font-bold uppercase tracking-wide px-8 py-4 rounded-full transition text-sm inline-block"
        >
          Cotiza con nosotros
        </a>
      </section>
    </PublicLayout>
  );
}
