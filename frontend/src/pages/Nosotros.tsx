import { useContent } from "../hooks/useContentBlock";
import PublicLayout from "../components/PublicLayout";
import MediaGrid from "../components/MediaGrid";

export default function Nosotros() {
  const { get, loading } = useContent();

  return (
    <PublicLayout>
      <section className="max-w-4xl mx-auto px-4 py-16">
        <h1 className="text-3xl font-bold mb-6 text-center">Nosotros</h1>
        <p className="text-gray-700 leading-relaxed text-lg text-center max-w-2xl mx-auto">
          {loading ? "Cargando..." : get("nosotros_page")}
        </p>
      </section>
      <section className="max-w-5xl mx-auto px-4 pb-16">
        <MediaGrid page="NOSOTROS" />
      </section>
    </PublicLayout>
  );
}
