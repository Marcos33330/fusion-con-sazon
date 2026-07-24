import { FormEvent, useEffect, useState } from "react";
import { api } from "../api/client";
import { ContactInfo } from "../types";

export default function AdminContact() {
  const [form, setForm] = useState<Partial<ContactInfo>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api
      .get<ContactInfo | null>("/contact")
      .then((data) => setForm(data ?? {}))
      .finally(() => setLoading(false));
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    try {
      await api.put("/contact", {
        phone: form.phone ?? "",
        whatsapp: form.whatsapp ?? "",
        address: form.address ?? "",
        facebookUrl: form.facebookUrl ?? "",
        instagramUrl: form.instagramUrl ?? "",
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p>Cargando...</p>;

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-5 max-w-lg space-y-4">
      <h2 className="text-xl font-bold">Datos de contacto</h2>

      <div>
        <label className="block text-sm font-medium mb-1">Teléfono</label>
        <input
          value={form.phone ?? ""}
          onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
          className="w-full border rounded px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">WhatsApp (con código de país, ej: +598...)</label>
        <input
          value={form.whatsapp ?? ""}
          onChange={(e) => setForm((f) => ({ ...f, whatsapp: e.target.value }))}
          className="w-full border rounded px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Dirección / zona</label>
        <input
          value={form.address ?? ""}
          onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
          className="w-full border rounded px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Facebook (URL completa)</label>
        <input
          value={form.facebookUrl ?? ""}
          onChange={(e) => setForm((f) => ({ ...f, facebookUrl: e.target.value }))}
          className="w-full border rounded px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Instagram (URL completa)</label>
        <input
          value={form.instagramUrl ?? ""}
          onChange={(e) => setForm((f) => ({ ...f, instagramUrl: e.target.value }))}
          className="w-full border rounded px-3 py-2 text-sm"
        />
      </div>

      <button
        type="submit"
        disabled={saving}
        className="bg-brand text-white px-4 py-2 rounded text-sm font-semibold hover:bg-brand-dark disabled:opacity-50"
      >
        {saving ? "Guardando..." : "Guardar"}
      </button>
      {saved && <span className="text-green-600 text-sm ml-3">✓ Guardado</span>}
    </form>
  );
}
