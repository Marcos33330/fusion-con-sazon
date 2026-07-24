import { useContent } from "../hooks/useContentBlock";
import PublicLayout from "../components/PublicLayout";
import MediaGrid from "../components/MediaGrid";

export default function TortasYPostres() {
  const { get } = useContent();

  return (
    <PublicLayout>
      <section className="max-w-6xl mx-auto px-4 py-16">
        <h1 className="text-3xl font-bold mb-10 text-center">Tortas y Postres</h1>
        <MediaGrid page="TORTAS" />
      </section>
      <section className="bg-brand-light py-16 px-4 text-center">
        <h2 className="text-2xl font-bold mb-4">{get("tortas_combos_title", "¡Deleitate con nuestros Combos!")}</h2>
        <p className="max-w-xl mx-auto text-gray-700 mb-8">
          {get("tortas_combos_title")}
        </p>
        <a
          href="https://wa.me/59891842491"
          target="_blank"
          rel="noreferrer"
          className="bg-brand text-white px-6 py-3 rounded-full font-semibold hover:bg-brand-dark transition inline-block"
        >
          Cotiza con nosotros
        </a>
      </section>
    </PublicLayout>
  );
}
