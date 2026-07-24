import { useState } from "react";
import PublicLayout from "../components/PublicLayout";
import MediaGrid from "../components/MediaGrid";

const CATEGORIES = ["Todo", "Comida Venezolana", "Comida Uruguaya", "Comida Internacional"];

export default function Catering() {
  const [active, setActive] = useState("Todo");

  return (
    <PublicLayout>
      <section className="max-w-6xl mx-auto px-4 py-16">
        <h1 className="text-3xl font-bold mb-6 text-center">Catering</h1>
        <div className="flex justify-center gap-3 flex-wrap mb-10">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActive(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium border transition ${
                active === cat
                  ? "bg-brand text-white border-brand"
                  : "bg-white text-gray-700 border-gray-300 hover:border-brand"
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
