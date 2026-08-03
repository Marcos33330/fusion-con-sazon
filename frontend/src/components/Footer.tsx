import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";
import { ContactInfo } from "../types";

const footerLinks = [
  { to: "/", label: "Inicio" },
  { to: "/nosotros", label: "Nosotros" },
  { to: "/tortas-y-postres", label: "Tortas y Postres" },
  { to: "/catering", label: "Catering" },
  { to: "/eventos", label: "Eventos" },
];

export default function Footer() {
  const [contact, setContact] = useState<ContactInfo | null>(null);

  useEffect(() => {
    api.get<ContactInfo>("/contact").then(setContact).catch(() => setContact(null));
  }, []);

  const waDigits = contact?.whatsapp.replace(/[^\d]/g, "");

  return (
    <footer id="contacto" className="bg-brand-espresso text-white">
      <div className="mx-auto max-w-6xl px-4 py-16">
        {/* Nav grande repetida, como en la referencia. */}
        <ul className="font-display space-y-1 text-4xl italic leading-tight text-white/90 md:text-5xl">
          {footerLinks.map((link) => (
            <li key={link.to}>
              <Link to={link.to} className="transition hover:text-brand-mustard">
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="mt-14 grid gap-10 border-t border-white/10 pt-10 sm:grid-cols-3">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-[0.18em] text-white/50">Contacto</h4>
            {contact ? (
              <ul className="mt-3 space-y-2 text-sm text-white/80">
                <li>
                  <a href={`tel:${contact.phone.replace(/\s/g, "")}`} className="hover:text-white hover:underline">
                    {contact.phone}
                  </a>
                </li>
                {waDigits && (
                  <li>
                    <a href={`https://wa.me/${waDigits}`} target="_blank" rel="noreferrer" className="hover:text-white hover:underline">
                      WhatsApp
                    </a>
                  </li>
                )}
              </ul>
            ) : (
              <p className="mt-3 text-sm text-white/50">Cargando...</p>
            )}
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-[0.18em] text-white/50">Ubicación</h4>
            <p className="mt-3 text-sm text-white/80">{contact?.address}</p>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-[0.18em] text-white/50">Redes</h4>
            <div className="mt-3 flex gap-3">
              {contact?.facebookUrl && (
                <a
                  href={contact.facebookUrl}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Facebook"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 transition hover:bg-white/20"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
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
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 transition hover:bg-white/20"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                    <rect x="3" y="3" width="18" height="18" rx="5" />
                    <circle cx="12" cy="12" r="4" />
                    <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
                  </svg>
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 text-xs text-white/50 sm:flex-row">
          <span>© {new Date().getFullYear()} Fusión con Sazón</span>
          <Link to="/admin/login" className="hover:text-white/80">
            Acceso administrador
          </Link>
        </div>
      </div>
    </footer>
  );
}
