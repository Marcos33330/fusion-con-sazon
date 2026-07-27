import { useEffect, useRef, useState } from "react";
import { api } from "../api/client";
import { ContentDict } from "../types";

// Las mismas keys que consumen las páginas públicas (Home.tsx, Nosotros.tsx, etc.)
const EDITABLE_BLOCKS: { key: string; label: string; page: string }[] = [
  { key: "home_hero", label: "Frase principal (hero)", page: "Inicio" },
  { key: "home_nosotros_preview", label: "Resumen 'Nosotros' en inicio", page: "Inicio" },
  { key: "home_entregas", label: "Texto de Entregas", page: "Inicio" },
  { key: "nosotros_page", label: "Texto completo de 'Nosotros'", page: "Nosotros" },
  { key: "tortas_combos_title", label: "Título y texto de Combos", page: "Tortas y Postres" },
];

export default function AdminContent() {
  const contentRef = useRef<ContentDict>({});
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [savedKey, setSavedKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<ContentDict>("/content")
      .then((data) => {
        contentRef.current = data;
        const initialDrafts: Record<string, string> = {};
        for (const block of EDITABLE_BLOCKS) {
          initialDrafts[block.key] = data[block.key]?.body ?? "";
        }
        setDrafts(initialDrafts);
      })
      .finally(() => setLoading(false));
  }, []);

  async function handleSave(key: string) {
    setSavingKey(key);
    setSavedKey(null);
    try {
      await api.put(`/content/${key}`, { body: drafts[key] });
      setSavedKey(key);
      setTimeout(() => setSavedKey(null), 2000);
    } finally {
      setSavingKey(null);
    }
  }

  if (loading) return <p>Cargando contenido...</p>;

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Textos del sitio</h2>
      <p className="text-sm text-gray-500">
        Editá el texto de cada sección y guardá. Los cambios se reflejan al instante en el sitio público.
      </p>
      {EDITABLE_BLOCKS.map((block) => (
        <div key={block.key} className="bg-white rounded-lg shadow p-5">
          <div className="flex items-center justify-between mb-2">
            <label htmlFor={`content-${block.key}`} className="font-semibold">{block.label}</label>
            <span className="text-xs text-gray-400">Página: {block.page}</span>
          </div>
          <textarea
            id={`content-${block.key}`}
            value={drafts[block.key] ?? ""}
            onChange={(e) => setDrafts((d) => ({ ...d, [block.key]: e.target.value }))}
            rows={4}
            className="w-full border rounded px-3 py-2 text-sm"
          />
          <div className="flex items-center gap-3 mt-2">
            <button
              onClick={() => handleSave(block.key)}
              disabled={savingKey === block.key}
              className="bg-brand text-white text-sm px-4 py-2 rounded hover:bg-brand-dark disabled:opacity-50"
            >
              {savingKey === block.key ? "Guardando..." : "Guardar"}
            </button>
            {savedKey === block.key && <span className="text-green-600 text-sm">✓ Guardado</span>}
          </div>
        </div>
      ))}
    </div>
  );
}
