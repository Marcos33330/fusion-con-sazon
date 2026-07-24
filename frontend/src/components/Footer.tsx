import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";
import { ContactInfo } from "../types";

export default function Footer() {
  const [contact, setContact] = useState<ContactInfo | null>(null);

  useEffect(() => {
    api.get<ContactInfo>("/contact").then(setContact).catch(() => setContact(null));
  }, []);

  const waDigits = contact?.whatsapp.replace(/[^\d]/g, "");

  return (
    <footer id="contacto" className="bg-brand-dark text-white mt-16">
      <div className="max-w-6xl mx-auto px-4 py-10 grid gap-8 md:grid-cols-3">
        <div>
          <h3 className="text-lg font-semibold mb-2">Fusión con Sazón</h3>
          <p className="text-sm text-white/80">
            Un lugar donde cada plato es una experiencia y cada evento es un motivo para celebrar.
          </p>
        </div>
        <div>
          <h4 className="font-semibold mb-2">Contacto</h4>
          {contact ? (
            <ul className="text-sm space-y-2 text-white/80">
              <li>
                <a href={`tel:${contact.phone.replace(/\s/g, "")}`} className="hover:text-white hover:underline">
                  {contact.phone}
                </a>
              </li>
              <li>{contact.address}</li>
              {waDigits && (
                <li>
                  <a
                    href={`https://wa.me/${waDigits}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 hover:text-white hover:underline"
                  >
                    <svg viewBox="0 0 32 32" fill="currentColor" className="w-4 h-4">
                      <path d="M16.001 3C9.373 3 4 8.373 4 15c0 2.386.7 4.605 1.902 6.474L4 29l7.72-1.87A11.94 11.94 0 0 0 16.001 27C22.628 27 28 21.627 28 15S22.628 3 16.001 3Zm.001 21.6c-1.94 0-3.79-.52-5.39-1.51l-.386-.235-4.58 1.11 1.13-4.46-.253-.399A9.55 9.55 0 0 1 5.4 15c0-5.85 4.75-10.6 10.6-10.6S26.6 9.15 26.6 15 21.85 24.6 16.002 24.6Zm5.61-7.94c-.307-.154-1.816-.897-2.098-1-.281-.103-.487-.154-.692.154-.205.307-.795 1-.975 1.205-.179.205-.359.23-.666.077-.307-.154-1.296-.478-2.469-1.523-.912-.813-1.529-1.817-1.708-2.124-.179-.307-.019-.473.135-.626.139-.138.307-.359.461-.538.154-.18.205-.307.307-.512.103-.205.051-.384-.026-.538-.077-.154-.692-1.667-.948-2.283-.25-.6-.505-.519-.692-.529l-.589-.01c-.205 0-.538.077-.82.384-.281.307-1.075 1.05-1.075 2.563 0 1.512 1.1 2.973 1.253 3.178.154.205 2.164 3.305 5.246 4.634.733.316 1.305.505 1.75.646.735.234 1.404.201 1.933.122.59-.088 1.816-.742 2.073-1.459.256-.717.256-1.332.179-1.459-.077-.128-.282-.205-.59-.36Z" />
                    </svg>
                    WhatsApp
                  </a>
                </li>
              )}
            </ul>
          ) : (
            <p className="text-sm text-white/60">Cargando...</p>
          )}
        </div>
        <div>
          <h4 className="font-semibold mb-2">Redes</h4>
          <div className="flex gap-3 text-sm">
            {contact?.facebookUrl && (
              <a
                href={contact.facebookUrl}
                target="_blank"
                rel="noreferrer"
                aria-label="Facebook"
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                  <path d="M22 12a10 10 0 1 0-11.6 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.5h-1.3c-1.2 0-1.6.8-1.6 1.6V12h2.8l-.4 2.9h-2.4v7A10 10 0 0 0 22 12Z" />
                </svg>
              </a>
            )}
            {contact?.instagramUrl && (
              <a
                href={contact.instagramUrl}
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                  <rect x="3" y="3" width="18" height="18" rx="5" />
                  <circle cx="12" cy="12" r="4" />
                  <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
                </svg>
              </a>
            )}
          </div>
          <Link to="/admin/login" className="block mt-4 text-xs text-white/50 hover:text-white/80">
            Acceso administrador
          </Link>
        </div>
      </div>
    </footer>
  );
}
