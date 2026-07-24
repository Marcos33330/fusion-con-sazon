import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";
import { ContactInfo } from "../types";

export default function Footer() {
  const [contact, setContact] = useState<ContactInfo | null>(null);

  useEffect(() => {
    api.get<ContactInfo>("/contact").then(setContact).catch(() => setContact(null));
  }, []);

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
            <ul className="text-sm space-y-1 text-white/80">
              <li>{contact.phone}</li>
              <li>{contact.address}</li>
            </ul>
          ) : (
            <p className="text-sm text-white/60">Cargando...</p>
          )}
        </div>
        <div>
          <h4 className="font-semibold mb-2">Redes</h4>
          <div className="flex gap-4 text-sm">
            {contact?.facebookUrl && (
              <a href={contact.facebookUrl} target="_blank" rel="noreferrer" className="hover:underline">
                Facebook
              </a>
            )}
            {contact?.instagramUrl && (
              <a href={contact.instagramUrl} target="_blank" rel="noreferrer" className="hover:underline">
                Instagram
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
