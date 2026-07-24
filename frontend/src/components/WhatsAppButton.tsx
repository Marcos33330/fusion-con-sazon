import { useEffect, useState } from "react";
import { api } from "../api/client";
import { ContactInfo } from "../types";

export default function WhatsAppButton() {
  const [contact, setContact] = useState<ContactInfo | null>(null);

  useEffect(() => {
    api.get<ContactInfo>("/contact").then(setContact).catch(() => setContact(null));
  }, []);

  if (!contact) return null;

  const digits = contact.whatsapp.replace(/[^\d]/g, "");
  const href = `https://wa.me/${digits}?text=${encodeURIComponent("Hola, ¿en qué podemos ayudarte?")}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="fixed bottom-6 right-6 bg-green-500 hover:bg-green-600 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg text-2xl z-50"
      aria-label="Contactar por WhatsApp"
    >
      💬
    </a>
  );
}
