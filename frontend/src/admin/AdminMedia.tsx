import { FormEvent, useEffect, useRef, useState } from "react";
import { api, ApiError } from "../api/client";
import { MediaItem, MediaPage } from "../types";

interface PageMeta {
  value: MediaPage;
  label: string;
  hasCategory?: boolean;
  /** Qué hace el sitio con cada posición. El índice del array = la posición. */
  roles?: string[];
  /** Qué pasa con el resto de las fotos de esta sección. */
  restNote?: string;
}

// Ojo con el orden: el sitio usa la POSICIÓN de cada foto para decidir dónde
// va. La primera de Tortas es la foto grande del hero, la primera de Nosotros
// es la de la pareja, etc. Por eso el panel deja reordenar y avisa qué ocupa
// cada lugar.
const PAGES: PageMeta[] = [
  {
    value: "TORTAS",
    label: "Tortas y Postres",
    roles: ["Foto grande del hero (Inicio)", "Foto chica flotante del hero (Inicio)"],
    restNote: "Todas aparecen además en el carrusel del inicio y en la galería de Tortas y Postres.",
  },
  {
    value: "NOSOTROS",
    label: "Nosotros",
    roles: [
      "Foto de la pareja (Inicio y Nosotros)",
      'Tarjeta "Dejarlo todo para seguir nuestro sueño"',
      'Tarjeta "¿Por qué Fusión con Sazón?"',
    ],
    restNote: "Las que sigan a partir de la cuarta no se muestran en ningún lado.",
  },
  {
    value: "CATERING",
    label: "Catering",
    hasCategory: true,
    roles: ["Tarjeta de Catering (Inicio)"],
    restNote: "Todas aparecen en la galería de Catering, agrupadas por categoría.",
  },
  {
    value: "EVENTOS_FOTOS",
    label: "Eventos · Fotos",
    roles: ["Tarjeta de Eventos (Inicio)"],
    restNote: "Todas aparecen en la galería de Eventos.",
  },
  {
    value: "EVENTOS_VIDEOS",
    label: "Eventos · Videos",
    restNote: "Todos aparecen en la sección de videos de Eventos.",
  },
];

const CATERING_CATEGORIES = ["Comida Venezolana", "Comida Uruguaya", "Comida Internacional"];

export default function AdminMedia() {
  const [page, setPage] = useState<MediaPage>("TORTAS");
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [reordering, setReordering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [category, setCategory] = useState("");
  const [title, setTitle] = useState("");
  const [titleDrafts, setTitleDrafts] = useState<Record<string, string>>({});
  const replaceInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const currentPageMeta = PAGES.find((p) => p.value === page)!;

  async function loadItems() {
    setLoading(true);
    try {
      const data = await api.get<MediaItem[]>(`/media?page=${page}`);
      setItems(data);
      setTitleDrafts(Object.fromEntries(data.map((it) => [it.id, it.title ?? ""])));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadItems();
    setCategory("");
    setTitle("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  async function handleUpload(e: FormEvent) {
    e.preventDefault();
    setError(null);
    const file = fileInputRef.current?.files?.[0];
    if (!file) {
      setError("Elegí un archivo primero");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("page", page);
    // Se sube al final de la lista para no desordenar lo que ya está puesto.
    formData.append("order", String(items.length));
    if (category) formData.append("category", category);
    if (title) formData.append("title", title);

    setUploading(true);
    try {
      await api.post("/media", formData);
      if (fileInputRef.current) fileInputRef.current.value = "";
      setTitle("");
      await loadItems();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Error al subir el archivo");
    } finally {
      setUploading(false);
    }
  }

  async function handleReplace(id: string, file: File) {
    const formData = new FormData();
    formData.append("file", file);
    await api.put(`/media/${id}`, formData);
    await loadItems();
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Seguro que querés eliminar este archivo? No se puede deshacer.")) return;
    await api.delete(`/media/${id}`);
    await loadItems();
  }

  async function handleCategoryChange(id: string, newCategory: string) {
    await api.put(`/media/${id}`, { category: newCategory });
    await loadItems();
  }

  async function handleTitleSave(id: string) {
    await api.put(`/media/${id}`, { title: titleDrafts[id] ?? "" });
    await loadItems();
  }

  // Mueve una foto y renumera todas para que el orden quede 0,1,2... sin
  // huecos ni repetidos, que es de lo que depende el sitio.
  async function move(index: number, dir: -1 | 1) {
    const target = index + dir;
    if (target < 0 || target >= items.length) return;

    const next = [...items];
    [next[index], next[target]] = [next[target], next[index]];
    setItems(next);

    setReordering(true);
    try {
      await Promise.all(
        next.map((it, i) => (it.order === i ? null : api.put(`/media/${it.id}`, { order: i })))
      );
      await loadItems();
    } finally {
      setReordering(false);
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="mb-2 text-xl font-bold">Fotos y videos</h2>
        <div className="flex flex-wrap gap-2">
          {PAGES.map((p) => (
            <button
              key={p.value}
              onClick={() => setPage(p.value)}
              className={`rounded-full border px-3 py-1.5 text-sm ${
                page === p.value ? "border-brand bg-brand text-white" : "border-gray-300 bg-white"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Explicación de qué hace el sitio con cada posición */}
      {(currentPageMeta.roles || currentPageMeta.restNote) && (
        <div className="rounded-lg border border-brand-mustard/40 bg-brand-mustard/10 p-4 text-sm">
          <p className="font-semibold text-brand-dark">Dónde se usa cada foto de esta sección</p>
          {currentPageMeta.roles && (
            <ol className="mt-2 list-inside list-decimal space-y-1 text-brand-dark/80">
              {currentPageMeta.roles.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ol>
          )}
          {currentPageMeta.restNote && (
            <p className="mt-2 text-brand-dark/70">{currentPageMeta.restNote}</p>
          )}
          <p className="mt-2 text-brand-dark/70">
            El orden importa: usá las flechas de cada foto para moverla de lugar.
          </p>
        </div>
      )}

      {/* Formulario de subida */}
      <form onSubmit={handleUpload} className="space-y-3 rounded-lg bg-white p-5 shadow">
        <h3 className="font-semibold">Subir nueva foto o video a "{currentPageMeta.label}"</h3>
        {error && <p className="rounded bg-red-50 p-2 text-sm text-red-600">{error}</p>}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*"
          aria-label="Seleccionar archivo para subir"
          className="block text-sm"
        />
        <input
          type="text"
          placeholder="Título / descripción (opcional)"
          aria-label="Título o descripción de la foto o video"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full rounded border px-3 py-2 text-sm"
        />
        {currentPageMeta.hasCategory && (
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            aria-label="Categoría del plato"
            className="w-full rounded border px-3 py-2 text-sm"
          >
            <option value="">Sin categoría</option>
            {CATERING_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        )}
        <button
          type="submit"
          disabled={uploading}
          className="rounded bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-50"
        >
          {uploading ? "Subiendo..." : "Subir"}
        </button>
      </form>

      {/* Grilla de items existentes */}
      {loading ? (
        <p>Cargando...</p>
      ) : items.length === 0 ? (
        <p className="text-gray-500">No hay archivos en esta sección todavía.</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {items.map((item, index) => {
            const role = currentPageMeta.roles?.[index];
            return (
              <div key={item.id} className="overflow-hidden rounded-lg bg-white shadow">
                <div className="relative aspect-square bg-gray-100">
                  {item.type === "IMAGE" ? (
                    <img src={item.url} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <video src={item.url} className="h-full w-full object-cover" muted />
                  )}
                  <span className="absolute left-2 top-2 rounded-full bg-brand-dark/80 px-2 py-0.5 text-xs font-bold text-white">
                    {index + 1}
                  </span>
                </div>

                {role && (
                  <p className="bg-brand-mustard/20 px-3 py-1.5 text-[11px] font-semibold leading-snug text-brand-dark">
                    {role}
                  </p>
                )}

                <div className="space-y-2 p-3">
                  {/* Reordenar */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => move(index, -1)}
                      disabled={index === 0 || reordering}
                      title="Mover antes"
                      className="flex-1 rounded bg-gray-100 py-1.5 text-xs hover:bg-gray-200 disabled:opacity-40"
                    >
                      ← Antes
                    </button>
                    <button
                      onClick={() => move(index, 1)}
                      disabled={index === items.length - 1 || reordering}
                      title="Mover después"
                      className="flex-1 rounded bg-gray-100 py-1.5 text-xs hover:bg-gray-200 disabled:opacity-40"
                    >
                      Después →
                    </button>
                  </div>

                  {/* Título */}
                  <div className="flex gap-1">
                    <input
                      type="text"
                      value={titleDrafts[item.id] ?? ""}
                      onChange={(e) => setTitleDrafts((d) => ({ ...d, [item.id]: e.target.value }))}
                      placeholder="Título (opcional)"
                      aria-label="Título de la foto"
                      className="min-w-0 flex-1 rounded border px-2 py-1 text-xs"
                    />
                    <button
                      onClick={() => handleTitleSave(item.id)}
                      disabled={(titleDrafts[item.id] ?? "") === (item.title ?? "")}
                      className="rounded bg-gray-100 px-2 text-xs hover:bg-gray-200 disabled:opacity-40"
                    >
                      ✓
                    </button>
                  </div>

                  {currentPageMeta.hasCategory && (
                    <select
                      value={item.category ?? ""}
                      onChange={(e) => handleCategoryChange(item.id, e.target.value)}
                      aria-label="Cambiar categoría"
                      className="w-full rounded border px-2 py-1 text-xs"
                    >
                      <option value="">Sin categoría</option>
                      {CATERING_CATEGORIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  )}

                  <div className="flex gap-2">
                    <button
                      onClick={() => replaceInputRefs.current[item.id]?.click()}
                      className="flex-1 rounded bg-gray-100 py-1.5 text-xs hover:bg-gray-200"
                    >
                      Reemplazar
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="flex-1 rounded bg-red-50 py-1.5 text-xs text-red-600 hover:bg-red-100"
                    >
                      Eliminar
                    </button>
                  </div>

                  <input
                    ref={(el) => {
                      replaceInputRefs.current[item.id] = el;
                    }}
                    aria-label="Reemplazar archivo"
                    type="file"
                    accept="image/*,video/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleReplace(item.id, file);
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
