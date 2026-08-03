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
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    api.get<ContactInfo>("/contact").then(setContact).catch(() => setContact(null));
  }, []);

  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 24);
    }
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      className={`sticky top-0 z-40 flex justify-center pt-0 transition-[padding] duration-300 ${
        scrolled ? "px-4" : "px-0"
      }`}
      style={{ paddingTop: scrolled ? "0.75rem" : "0" }}
    >
      <header
        className={`w-full transition-all duration-300 ${
          scrolled
            ? "max-w-4xl rounded-full bg-white/95 px-2 shadow-warm backdrop-blur"
            : "max-w-none rounded-none bg-white shadow-sm"
        }`}
      >
        <nav className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <NavLink to="/" className="flex shrink-0 items-center gap-3">
            <img
              src="https://fusionconsazon.uy/wp-content/uploads/2024/09/LOGO-PNG-1024x862.png"
              alt="Fusión con Sazón"
              className={`w-auto transition-all duration-300 ${scrolled ? "h-8" : "h-11"}`}
            />
            {!scrolled && (
              <span className="hidden flex-col leading-none sm:flex">
                <span className="font-display text-lg font-semibold text-brand-dark">Fusión con Sazón</span>
                <span className="mt-0.5 text-[11px] font-semibold uppercase tracking-wide text-brand">
                  Experiencias para compartir
                </span>
              </span>
            )}
          </NavLink>
          <ul className="hidden gap-6 text-sm font-medium md:flex">
            {links.map((link) => (
              <li key={link.to}>
                <NavLink
                  to={link.to}
                  end={link.to === "/"}
                  className={({ isActive }) => (isActive ? "text-brand" : "text-gray-700 hover:text-brand")}
                >
                  {link.label}
                </NavLink>
              </li>
            ))}
          </ul>
          {/* CTA + redes sociales */}
          <div className="flex shrink-0 items-center gap-3">
            {contact?.whatsapp && (
              <a
                href={`https://wa.me/${contact.whatsapp.replace(/[^\d]/g, "")}`}
                target="_blank"
                rel="noreferrer"
                className="hidden rounded-full bg-brand px-4 py-2 text-xs font-bold uppercase tracking-wide text-white transition hover:bg-brand-dark sm:inline-block"
              >
                Solicitar presupuesto
              </a>
            )}
            {contact?.facebookUrl && (
              <a
                href={contact.facebookUrl}
                target="_blank"
                rel="noreferrer"
                aria-label="Facebook"
                className="flex h-8 w-8 items-center justify-center rounded-full bg-brand text-white transition hover:bg-brand-dark"
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
                className="flex h-8 w-8 items-center justify-center rounded-full bg-brand text-white transition hover:bg-brand-dark"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                  <rect x="3" y="3" width="18" height="18" rx="5" />
                  <circle cx="12" cy="12" r="4" />
                  <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
                </svg>
              </a>
            )}

            {/* Acceso administrador */}
            <NavLink
              to="/admin/login"
              aria-label="Acceso administrador"
              title="Acceso administrador"
              className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 text-gray-500 transition hover:border-brand hover:text-brand"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                <rect x="5" y="11" width="14" height="9" rx="2" />
                <path d="M8 11V7a4 4 0 0 1 8 0v4" />
              </svg>
            </NavLink>
          </div>
        </nav>
      </header>
    </div>
  );
}
