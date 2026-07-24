/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#b3452b",
          dark: "#7a2e1c",
          light: "#f4e3d3",
        },
      },
    },
  },
  plugins: [],
};
