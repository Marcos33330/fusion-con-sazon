import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { api } from "../api/client";
import { ContactInfo } from "../types";

const links = [
  { to: "/", label: "Inicio" },
  { to: "/nosotros", label: "Nosotros" },
  { to: "/tortas-y-postres", label: "Tortas y Postres" },
  { to: "/catering", label: "Catering" },
  { to: "/eventos", label: "Eventos" },
];

export default function Navbar() {
  const [contact, setContact] = useState<ContactInfo | null>(null);

  useEffect(() => {
    api.get<ContactInfo>("/contact").then(setContact).catch(() => setContact(null));
  }, []);

  return (
    <header className="bg-white shadow-sm sticky top-0 z-40">
      <nav className="max-w-6xl mx-auto flex items-center justify-between px-4 py-3 gap-4">
        <NavLink to="/" className="text-xl font-bold text-brand-dark shrink-0">
          Fusión con Sazón
        </NavLink>
        <ul className="hidden md:flex gap-6 text-sm font-medium">
          {links.map((link) => (
            <li key={link.to}>
              <NavLink
                to={link.to}
                end={link.to === "/"}
                className={({ isActive }) =>
                  isActive ? "text-brand" : "text-gray-700 hover:text-brand"
                }
              >
                {link.label}
              </NavLink>
            </li>
          ))}
        </ul>
        {/* Redes sociales, como los botones circulares del sitio original */}
        <div className="flex items-center gap-2 shrink-0">
          {contact?.facebookUrl && (
            <a
              href={contact.facebookUrl}
              target="_blank"
              rel="noreferrer"
              aria-label="Facebook"
              className="w-8 h-8 rounded-full bg-brand text-white flex items-center justify-center hover:bg-brand-dark transition"
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
              className="w-8 h-8 rounded-full bg-brand text-white flex items-center justify-center hover:bg-brand-dark transition"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                <rect x="3" y="3" width="18" height="18" rx="5" />
                <circle cx="12" cy="12" r="4" />
                <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
              </svg>
            </a>
          )}
        </div>
      </nav>
    </header>
  );
}
