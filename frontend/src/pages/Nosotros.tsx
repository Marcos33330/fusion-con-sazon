import { useEffect, useState } from "react";
import { useContent } from "../hooks/useContentBlock";
import { api } from "../api/client";
import { MediaItem } from "../types";
import PublicLayout from "../components/PublicLayout";
import Marquee from "../components/Marquee";

export default function Nosotros() {
  const { get, loading } = useContent();
  const [photo, setPhoto] = useState<MediaItem | null>(null);
  const [dreamImg, setDreamImg] = useState<MediaItem | null>(null);
  const [whyImg, setWhyImg] = useState<MediaItem | null>(null);

  useEffect(() => {
    api
      .get<MediaItem[]>("/media?page=NOSOTROS")
      .then((items) => {
        setPhoto(items[0] ?? null);
        // Reutilizamos las siguientes fotos del rubro para ilustrar cada
        // tarjeta de la historia, conectadas foto + texto como pidió el cliente.
        setDreamImg(items[1] ?? null);
        setWhyImg(items[2] ?? null);
      })
      .catch(() => {});
  }, []);

  return (
    <PublicLayout>
      {/* Encabezado premium: fondo plano chocolate con acento mostaza */}
      <section className="bg-brand-dark py-16 md:py-20 text-center px-4">
        <h1 className="text-4xl md:text-5xl font-extrabold uppercase tracking-tight text-white">Nosotros</h1>
        <span className="inline-block mt-4 w-24 h-1 bg-brand-mustard rounded-full" />
      </section>

      {/* Cinta en loop infinito, como la de la referencia Banh Mi World */}
      <Marquee items={["20 años de experiencia", "Hecho con amor", "Sabor a hogar", "Familia y amigos"]} />

      {/* La foto de la pareja como protagonista absoluta: grande, centrada, con
          manchas de color detrás que le dan profundidad y le hacen de marco */}
      <section className="relative bg-brand-light py-16 md:py-24 px-4 text-center overflow-hidden">
        <svg
          className="hidden md:block absolute top-10 right-10 w-16 h-16 text-brand/40 rotate-12 pointer-events-none"
          viewBox="0 0 64 64"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
        >
          <path d="M16 52c8-6 8-14 0-20s-8-14 0-20" />
          <path d="M32 52c8-6 8-14 0-20s-8-14 0-20" />
          <path d="M48 52c8-6 8-14 0-20s-8-14 0-20" />
        </svg>

        <p className="font-script text-6xl md:text-7xl text-brand leading-none mb-1 -rotate-2">¡Hola!</p>
        <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-brand-dark mb-10">
          Somos{" "}
          <span className="font-script italic normal-case tracking-normal text-brand-mustard">
            Herminia y Oscar
          </span>
        </h2>

        <div className="relative max-w-lg mx-auto mb-12">
          {/* Manchas de color detrás de la foto, como marco/protagonismo */}
          <span className="absolute -top-6 -left-6 w-28 h-28 md:w-36 md:h-36 rounded-full bg-brand-mustard/90 -z-10" />
          <span className="absolute -bottom-8 -right-4 w-36 h-36 md:w-44 md:h-44 rounded-full bg-brand/90 -z-10" />
          {photo && (
            <img
              src={photo.url}
              alt="Herminia y Oscar"
              className="relative mx-auto h-[360px] sm:h-[460px] md:h-[600px] w-auto object-contain drop-shadow-2xl"
            />
          )}
        </div>

        <div className="relative max-w-3xl mx-auto">
          <span
            aria-hidden="true"
            className="hidden sm:block absolute -top-10 -left-4 md:-left-10 font-script text-8xl md:text-9xl text-brand/20 select-none pointer-events-none"
          >
            "
          </span>
          <p className="relative text-xl md:text-2xl text-brand-dark/90 font-medium leading-relaxed whitespace-pre-line">
            {loading ? "Cargando..." : get("nosotros_page")}
          </p>
          <span className="block mx-auto mt-6 w-16 h-1 bg-brand-mustard rounded-full" />
        </div>
      </section>

      {/* Historia completa: dos tarjetas foto + texto conectadas, a todo el
          ancho de la página, como la referencia Banh Mi World que mandó el
          cliente (mitad foto a sangre, mitad panel de color con el texto) */}
      {/* Tarjeta 1: foto a la izquierda, texto a la derecha */}
      <section className="grid md:grid-cols-2">
        <div className="h-72 md:h-auto md:min-h-[560px]">
          {dreamImg && (
            <img src={dreamImg.url} alt="" className="w-full h-full object-cover" />
          )}
        </div>
        <div className="bg-brand-dark text-white p-8 sm:p-12 md:p-16 flex flex-col justify-center">
          <h3 className="text-2xl md:text-3xl lg:text-4xl font-black uppercase tracking-tight leading-tight mb-5">
            Dejarlo todo para seguir{" "}
            <span className="font-script italic normal-case tracking-normal text-brand-mustard">
              nuestro sueño
            </span>
          </h3>
          <p className="text-white/90 leading-relaxed whitespace-pre-line">
            {loading ? "Cargando..." : get("nosotros_dream")}
          </p>
        </div>
      </section>

      {/* Tarjeta 2: texto a la izquierda, foto a la derecha (alternada) */}
      <section className="grid md:grid-cols-2">
        <div className="bg-brand-dark text-white p-8 sm:p-12 md:p-16 flex flex-col justify-center order-2 md:order-1">
          <h3 className="text-2xl md:text-3xl lg:text-4xl font-black uppercase tracking-tight leading-tight mb-5">
            ¿Por qué{" "}
            <span className="font-script italic normal-case tracking-normal text-brand-mustard">
              Fusión con Sazón
            </span>
            ?
          </h3>
          <p className="text-white/90 leading-relaxed whitespace-pre-line">
            {loading ? "Cargando..." : get("nosotros_why")}
          </p>
        </div>
        <div className="h-72 md:h-auto md:min-h-[560px] order-1 md:order-2">
          {whyImg && <img src={whyImg.url} alt="" className="w-full h-full object-cover" />}
        </div>
      </section>

      <div className="deco-divider" style={{ ["--deco-color" as string]: "#E80541" }} />
    </PublicLayout>
  );
}
