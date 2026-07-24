import { FormEvent, useEffect, useRef, useState } from "react";
import { api, ApiError } from "../api/client";
import { MediaItem, MediaPage } from "../types";

const PAGES: { value: MediaPage; label: string; hasCategory?: boolean }[] = [
  { value: "HOME", label: "Inicio" },
  { value: "NOSOTROS", label: "Nosotros" },
  { value: "TORTAS", label: "Tortas y Postres" },
  { value: "CATERING", label: "Catering", hasCategory: true },
  { value: "EVENTOS_FOTOS", label: "Eventos - Fotos" },
  { value: "EVENTOS_VIDEOS", label: "Eventos - Videos" },
];

const CATERING_CATEGORIES = ["Comida Venezolana", "Comida Uruguaya", "Comida Internacional"];

export default function AdminMedia() {
  const [page, setPage] = useState<MediaPage>("TORTAS");
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [category, setCategory] = useState("");
  const [title, setTitle] = useState("");
  const replaceInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const currentPageMeta = PAGES.find((p) => p.value === page)!;

  async function loadItems() {
    setLoading(true);
    try {
      const data = await api.get<MediaItem[]>(`/media?page=${page}`);
      setItems(data);
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

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold mb-2">Fotos y videos</h2>
        <div className="flex gap-2 flex-wrap">
          {PAGES.map((p) => (
            <button
              key={p.value}
              onClick={() => setPage(p.value)}
              className={`px-3 py-1.5 rounded-full text-sm border ${
                page === p.value ? "bg-brand text-white border-brand" : "bg-white border-gray-300"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Formulario de subida */}
      <form onSubmit={handleUpload} className="bg-white rounded-lg shadow p-5 space-y-3">
        <h3 className="font-semibold">Subir nueva foto o video a "{currentPageMeta.label}"</h3>
        {error && <p className="bg-red-50 text-red-600 text-sm rounded p-2">{error}</p>}
        <input ref={fileInputRef} type="file" accept="image/*,video/*" className="block text-sm" />
        <input
          type="text"
          placeholder="Título / descripción (opcional)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full border rounded px-3 py-2 text-sm"
        />
        {currentPageMeta.hasCategory && (
          <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full border rounded px-3 py-2 text-sm">
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
          className="bg-brand text-white px-4 py-2 rounded text-sm font-semibold hover:bg-brand-dark disabled:opacity-50"
        >
          {uploading ? "Subiendo..." : "Subir"}
        </button>
      </form>

      {/* Grilla de items existentes */}
      {loading ? (
        <p>Cargando...</p>
      ) : items.length === 0 ? (
        <p className="text-gray-500">No hay archivos en esta página todavía.</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {items.map((item) => (
            <div key={item.id} className="bg-white rounded-lg shadow overflow-hidden">
              <div className="aspect-square bg-gray-100">
                {item.type === "IMAGE" ? (
                  <img src={item.url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <video src={item.url} className="w-full h-full object-cover" muted />
                )}
              </div>
              <div className="p-3 space-y-2">
                {currentPageMeta.hasCategory && (
                  <select
                    value={item.category ?? ""}
                    onChange={(e) => handleCategoryChange(item.id, e.target.value)}
                    className="w-full border rounded px-2 py-1 text-xs"
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
                    className="flex-1 text-xs bg-gray-100 hover:bg-gray-200 rounded py-1.5"
                  >
                    Reemplazar
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="flex-1 text-xs bg-red-50 text-red-600 hover:bg-red-100 rounded py-1.5"
                  >
                    Eliminar
                  </button>
                </div>
                <input
                  ref={(el) => (replaceInputRefs.current[item.id] = el)}
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
          ))}
        </div>
      )}
    </div>
  );
}
