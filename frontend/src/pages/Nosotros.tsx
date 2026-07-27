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
        <h1 className="font-display text-4xl md:text-5xl font-extrabold uppercase tracking-tightest text-white">
          Nosotros
        </h1>
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
        <h2 className="font-display text-3xl md:text-5xl font-black uppercase tracking-tightest text-brand-dark mb-10">
          Somos{" "}
          <span className="font-script italic normal-case tracking-normal text-brand-mustard">
            Herminia y Oscar
          </span>
        </h2>

        <div className="relative max-w-lg mx-auto mb-12">
          {/* Manchas de color detrás de la foto. Iban con -z-10, que las mandaba
              detrás del fondo de la sección y no se veían nunca; ahora quedan
              entre el fondo y la foto. */}
          <span className="absolute -top-6 -left-6 w-28 h-28 md:w-36 md:h-36 rounded-full bg-brand-mustard/90 z-0" />
          <span className="absolute -bottom-8 -right-4 w-36 h-36 md:w-44 md:h-44 rounded-full bg-brand/90 z-0" />
          {photo && (
            <img
              src={photo.url}
              alt="Herminia y Oscar"
              className="relative z-10 mx-auto h-[360px] sm:h-[460px] md:h-[600px] w-auto object-contain drop-shadow-2xl"
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

      {/* Historia completa: dos tarjetas foto + texto a todo el ancho.
          Tarjeta 1: foto a la izquierda, panel chocolate a la derecha. */}
      <section className="grid md:grid-cols-2">
        <div className="relative h-72 overflow-hidden md:h-auto md:min-h-[600px]">
          {dreamImg && <img src={dreamImg.url} alt="" className="h-full w-full object-cover" />}
          {/* Degradé en la costura para que la foto no choque contra el panel. */}
          <span className="pointer-events-none absolute inset-y-0 right-0 hidden w-24 bg-gradient-to-l from-brand-dark to-transparent md:block" />
        </div>
        <div className="relative flex flex-col justify-center overflow-hidden bg-brand-dark p-8 text-white sm:p-12 md:p-16">
          <span
            aria-hidden="true"
            className="font-display pointer-events-none absolute right-6 top-2 text-[7rem] font-extrabold leading-none text-white/5 md:text-[10rem]"
          >
            01
          </span>
          <p className="font-script relative -rotate-2 text-4xl leading-none text-brand-mustard md:text-5xl">
            Dejarlo todo
          </p>
          <h3 className="font-display relative mt-2 text-3xl font-extrabold uppercase leading-[0.95] tracking-tightest md:text-4xl lg:text-5xl">
            para seguir nuestro sueño
          </h3>
          <span className="relative mt-5 block h-1 w-16 rounded-full bg-brand" />
          <p className="relative mt-6 max-w-prose whitespace-pre-line leading-relaxed text-white/75">
            {get("nosotros_dream")}
          </p>
        </div>
      </section>

      {/* Tarjeta 2: alterna lado y color. El panel claro corta la monotonía
          del chocolate y le devuelve aire a la página. */}
      <section className="grid md:grid-cols-2">
        <div
          className="relative order-2 flex flex-col justify-center overflow-hidden p-8 sm:p-12 md:order-1 md:p-16"
          style={{ background: "linear-gradient(180deg,#FDF3E4 0%,#FAF8F5 100%)" }}
        >
          <span
            aria-hidden="true"
            className="font-display pointer-events-none absolute right-6 top-2 text-[7rem] font-extrabold leading-none text-brand-dark/5 md:text-[10rem]"
          >
            02
          </span>
          <p className="font-script relative -rotate-2 text-4xl leading-none text-brand md:text-5xl">¿Por qué</p>
          <h3 className="font-display relative mt-2 text-3xl font-extrabold uppercase leading-[0.95] tracking-tightest text-brand-dark md:text-4xl lg:text-5xl">
            Fusión con Sazón?
          </h3>
          <span className="relative mt-5 block h-1 w-16 rounded-full bg-brand-mustard" />
          <p className="relative mt-6 max-w-prose whitespace-pre-line leading-relaxed text-brand-dark/70">
            {get("nosotros_why")}
          </p>
        </div>
        <div className="relative order-1 h-72 overflow-hidden md:order-2 md:h-auto md:min-h-[600px]">
          {whyImg && <img src={whyImg.url} alt="" className="h-full w-full object-cover" />}
          <span className="pointer-events-none absolute inset-y-0 left-0 hidden w-24 bg-gradient-to-r from-[#FDF3E4] to-transparent md:block" />
        </div>
      </section>

      <div className="deco-divider" style={{ ["--deco-color" as string]: "#E80541" }} />
    </PublicLayout>
  );
}
