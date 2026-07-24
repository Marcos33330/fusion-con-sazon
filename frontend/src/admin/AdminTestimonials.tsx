import { FormEvent, useEffect, useState } from "react";
import { api } from "../api/client";
import { Testimonial } from "../types";

export default function AdminTestimonials() {
  const [items, setItems] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [author, setAuthor] = useState("");
  const [text, setText] = useState("");

  async function load() {
    setLoading(true);
    try {
      const data = await api.get<Testimonial[]>("/testimonials/all");
      setItems(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    if (!author.trim() || !text.trim()) return;
    await api.post("/testimonials", { author, text, published: true, order: items.length });
    setAuthor("");
    setText("");
    await load();
  }

  async function togglePublished(item: Testimonial) {
    await api.put(`/testimonials/${item.id}`, { published: !item.published });
    await load();
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar este testimonio?")) return;
    await api.delete(`/testimonials/${id}`);
    await load();
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Testimonios</h2>

      <form onSubmit={handleCreate} className="bg-white rounded-lg shadow p-5 space-y-3">
        <h3 className="font-semibold">Agregar testimonio</h3>
        <input
          type="text"
          placeholder="Nombre del cliente"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          className="w-full border rounded px-3 py-2 text-sm"
        />
        <textarea
          placeholder="Texto del testimonio"
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={3}
          className="w-full border rounded px-3 py-2 text-sm"
        />
        <button type="submit" className="bg-brand text-white px-4 py-2 rounded text-sm font-semibold hover:bg-brand-dark">
          Agregar
        </button>
      </form>

      {loading ? (
        <p>Cargando...</p>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className="bg-white rounded-lg shadow p-4 flex items-start justify-between gap-4">
              <div>
                <p className="text-sm italic text-gray-700">"{item.text}"</p>
                <p className="text-xs font-semibold mt-1">— {item.author}</p>
              </div>
              <div className="flex gap-2 shrink-0">
                <button
                  onClick={() => togglePublished(item)}
                  className={`text-xs px-3 py-1.5 rounded ${
                    item.published ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {item.published ? "Publicado" : "Oculto"}
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="text-xs px-3 py-1.5 rounded bg-red-50 text-red-600 hover:bg-red-100"
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
