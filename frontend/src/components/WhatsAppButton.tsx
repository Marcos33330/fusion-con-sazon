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
      className="fixed bottom-6 right-6 bg-[#25D366] hover:bg-[#1ebe5b] text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg z-50"
      aria-label="Contactar por WhatsApp"
    >
      <svg viewBox="0 0 32 32" fill="currentColor" className="w-7 h-7">
        <path d="M16.001 3C9.373 3 4 8.373 4 15c0 2.386.7 4.605 1.902 6.474L4 29l7.72-1.87A11.94 11.94 0 0 0 16.001 27C22.628 27 28 21.627 28 15S22.628 3 16.001 3Zm.001 21.6c-1.94 0-3.79-.52-5.39-1.51l-.386-.235-4.58 1.11 1.13-4.46-.253-.399A9.55 9.55 0 0 1 5.4 15c0-5.85 4.75-10.6 10.6-10.6S26.6 9.15 26.6 15 21.85 24.6 16.002 24.6Zm5.61-7.94c-.307-.154-1.816-.897-2.098-1-.281-.103-.487-.154-.692.154-.205.307-.795 1-.975 1.205-.179.205-.359.23-.666.077-.307-.154-1.296-.478-2.469-1.523-.912-.813-1.529-1.817-1.708-2.124-.179-.307-.019-.473.135-.626.139-.138.307-.359.461-.538.154-.18.205-.307.307-.512.103-.205.051-.384-.026-.538-.077-.154-.692-1.667-.948-2.283-.25-.6-.505-.519-.692-.529l-.589-.01c-.205 0-.538.077-.82.384-.281.307-1.075 1.05-1.075 2.563 0 1.512 1.1 2.973 1.253 3.178.154.205 2.164 3.305 5.246 4.634.733.316 1.305.505 1.75.646.735.234 1.404.201 1.933.122.59-.088 1.816-.742 2.073-1.459.256-.717.256-1.332.179-1.459-.077-.128-.282-.205-.59-.36Z" />
      </svg>
    </a>
  );
}
