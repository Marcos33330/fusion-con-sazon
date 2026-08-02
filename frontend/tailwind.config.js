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
          // Tonos derivados para profundidad en fondos oscuros.
          espresso: "#1F0E03",
          cocoa: "#4A2810",
        },
      },
      fontFamily: {
        // Body: geométrica cálida y muy legible. Reemplaza a system-ui.
        sans: ["Manrope", "system-ui", "-apple-system", "Segoe UI", "sans-serif"],
        // Display: serif editorial (referencia vineyard.co.za) para títulos grandes.
        display: ['"Playfair Display"', "Georgia", "serif"],
      },
      letterSpacing: {
        tightest: "-0.045em",
      },
      boxShadow: {
        // Sombra cálida (tinte chocolate) en vez del negro plano por defecto.
        warm: "0 24px 60px -20px rgba(51, 24, 6, 0.45)",
        "warm-lg": "0 40px 90px -30px rgba(51, 24, 6, 0.6)",
      },
      animation: {
        "spin-slow": "spin 7s linear infinite",
        // Cinta en loop infinito, inspirada en la referencia Banh Mi World
        marquee: "marquee 22s linear infinite",
        "marquee-slow": "marquee 38s linear infinite",
        float: "float 7s ease-in-out infinite",
        "float-delayed": "float 9s ease-in-out 1.2s infinite",
      },
      keyframes: {
        marquee: {
          "0%": { transform: "translateX(0%)" },
          "100%": { transform: "translateX(-50%)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-14px)" },
        },
      },
    },
  },
  plugins: [],
};
