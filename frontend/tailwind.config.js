/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // Paleta premium de Fusión con Sazón: chocolate + blanco dominan,
        // fucsia y mostaza se usan solo como acentos (botones, detalles).
        brand: {
          DEFAULT: "#E80541", // fucsia - acento principal (botones, CTA)
          dark: "#331806", // chocolate - texto, títulos, fondos oscuros
          light: "#FAF8F5", // blanco roto - fondo dominante
          mustard: "#FFA610", // mostaza - detalles cálidos
          gray: "#F2F2F2", // gris claro - fondos alternos suaves
        },
      },
      animation: {
        "spin-slow": "spin 7s linear infinite",
      },
    },
  },
  plugins: [],
};
