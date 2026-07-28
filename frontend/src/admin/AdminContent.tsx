import { useEffect, useRef, useState } from "react";
import { api } from "../api/client";
import { ContentDict } from "../types";

interface Block {
  key: string;
  label: string;
  help?: string;
  /** Texto que muestra el sitio si este campo queda vacío (el fallback del código). */
  fallback?: string;
  rows?: number;
}

interface Group {
  page: string;
  blocks: Block[];
}

// Estas son exactamente las claves que consumen las páginas públicas. Si
// agregás un get("...") nuevo en el sitio, sumalo también acá o el admin no
// va a poder editarlo.
const GROUPS: Group[] = [
  {
    page: "Inicio",
    blocks: [
      {
        key: "home_hero",
        label: "Titular principal",
        help: 'La palabra "experiencia" se resalta sola en cursiva. Si la sacás, el titular queda todo parejo.',
        fallback: "Convertimos cada celebración en una experiencia para recordar.",
        rows: 3,
      },
      {
        key: "home_hero_sub",
        label: "Texto debajo del titular",
        fallback:
          "Catering, tortas y postres artesanales hechos por una pareja que cocina desde hace más de 20 años. Sabor de hogar, para tu mesa.",
        rows: 3,
      },
      {
        key: "home_nosotros_preview",
        label: "Resumen de la sección Nosotros",
        help: "Es el texto corto que acompaña la foto de ustedes en el inicio.",
        rows: 5,
      },
      {
        key: "home_paso_1_titulo",
        label: "Cómo trabajamos · Paso 1 — título",
        fallback: "Contanos tu evento",
        rows: 1,
      },
      {
        key: "home_paso_1_texto",
        label: "Cómo trabajamos · Paso 1 — texto",
        fallback: "Escribinos por WhatsApp con la fecha, la cantidad de personas y qué te imaginás.",
        rows: 3,
      },
      {
        key: "home_paso_2_titulo",
        label: "Cómo trabajamos · Paso 2 — título",
        fallback: "Armamos la propuesta",
        rows: 1,
      },
      {
        key: "home_paso_2_texto",
        label: "Cómo trabajamos · Paso 2 — texto",
        fallback: "Te pasamos un menú a medida con opciones dulces y saladas, y el presupuesto cerrado.",
        rows: 3,
      },
      {
        key: "home_paso_3_titulo",
        label: "Cómo trabajamos · Paso 3 — título",
        fallback: "Nos ocupamos de todo",
        rows: 1,
      },
      {
        key: "home_paso_3_texto",
        label: "Cómo trabajamos · Paso 3 — texto",
        fallback: "Cocinamos, entregamos y montamos. Vos solo tenés que disfrutar de tu celebración.",
        rows: 3,
      },
      {
        key: "home_cta_final",
        label: "Invitación final (banda fucsia)",
        fallback: "Escribinos por WhatsApp y te armamos una propuesta a medida, sin compromiso.",
        rows: 3,
      },
    ],
  },
  {
    page: "Nosotros",
    blocks: [
      {
        key: "nosotros_page",
        label: "Texto principal de la página",
        help: "El párrafo grande que va debajo de la foto.",
        rows: 8,
      },
      {
        key: "nosotros_dream",
        label: 'Tarjeta 1 — "Dejarlo todo para seguir nuestro sueño"',
        rows: 8,
      },
      {
        key: "nosotros_why",
        label: 'Tarjeta 2 — "¿Por qué Fusión con Sazón?"',
        rows: 8,
      },
    ],
  },
  {
    page: "Tortas y Postres",
    blocks: [
      {
        key: "tortas_combos_title",
        label: "Texto de la sección Combos",
        rows: 3,
      },
    ],
  },
];

export default function AdminContent() {
  const contentRef = useRef<ContentDict>({});
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [savedKey, setSavedKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const allBlocks = GROUPS.flatMap((g) => g.blocks);

  useEffect(() => {
    api
      .get<ContentDict>("/content")
      .then((data) => {
        contentRef.current = data;
        const initialDrafts: Record<string, string> = {};
        for (const block of allBlocks) {
          initialDrafts[block.key] = data[block.key]?.body ?? "";
        }
        setDrafts(initialDrafts);
      })
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    <div className="space-y-10">
      <div>
        <h2 className="text-xl font-bold">Textos del sitio</h2>
        <p className="mt-1 text-sm text-gray-500">
          Editá cada texto y guardá. Los cambios se ven al instante en el sitio público, sin reiniciar nada.
        </p>
        <p className="mt-1 text-sm text-gray-500">
          Si dejás un campo <strong>vacío</strong>, el sitio muestra el texto por defecto que aparece en gris.
        </p>
      </div>

      {GROUPS.map((group) => (
        <section key={group.page} className="space-y-4">
          <h3 className="border-b pb-2 text-sm font-bold uppercase tracking-wide text-brand">{group.page}</h3>

          {group.blocks.map((block) => {
            const value = drafts[block.key] ?? "";
            const usingFallback = value.trim() === "" && !!block.fallback;

            return (
              <div key={block.key} className="rounded-lg bg-white p-5 shadow">
                <label htmlFor={`content-${block.key}`} className="block font-semibold">
                  {block.label}
                </label>
                {block.help && <p className="mt-1 text-xs text-gray-500">{block.help}</p>}

                <textarea
                  id={`content-${block.key}`}
                  value={value}
                  placeholder={block.fallback}
                  onChange={(e) => setDrafts((d) => ({ ...d, [block.key]: e.target.value }))}
                  rows={block.rows ?? 4}
                  className="mt-2 w-full rounded border px-3 py-2 text-sm"
                />

                <div className="mt-2 flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => handleSave(block.key)}
                    disabled={savingKey === block.key}
                    className="rounded bg-brand px-4 py-2 text-sm text-white hover:bg-brand-dark disabled:opacity-50"
                  >
                    {savingKey === block.key ? "Guardando..." : "Guardar"}
                  </button>
                  {savedKey === block.key && <span className="text-sm text-green-600">✓ Guardado</span>}
                  {usingFallback && (
                    <span className="text-xs text-gray-400">Vacío: el sitio usa el texto por defecto</span>
                  )}
                </div>
              </div>
            );
          })}
        </section>
      ))}
    </div>
  );
}
