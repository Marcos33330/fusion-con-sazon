import { useState } from "react";
import PublicLayout from "../components/PublicLayout";
import MediaGrid from "../components/MediaGrid";

export default function Eventos() {
  const [tab, setTab] = useState<"fotos" | "videos">("fotos");

  return (
    <PublicLayout>
      <section className="max-w-6xl mx-auto px-4 py-16">
        <h1 className="text-3xl font-bold mb-6 text-center">Eventos</h1>
        <div className="flex justify-center gap-3 mb-10">
          <button
            onClick={() => setTab("fotos")}
            className={`px-5 py-2 rounded-full font-medium border transition ${
              tab === "fotos" ? "bg-brand text-white border-brand" : "bg-white text-gray-700 border-gray-300"
            }`}
          >
            Fotos
          </button>
          <button
            onClick={() => setTab("videos")}
            className={`px-5 py-2 rounded-full font-medium border transition ${
              tab === "videos" ? "bg-brand text-white border-brand" : "bg-white text-gray-700 border-gray-300"
            }`}
          >
            Videos
          </button>
        </div>
        <MediaGrid page={tab === "fotos" ? "EVENTOS_FOTOS" : "EVENTOS_VIDEOS"} />
      </section>
    </PublicLayout>
  );
}
