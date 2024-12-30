/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html"],
  theme: {
    extend: {
      colors: {
        smog: "#f0f0f0",
        earth: "#3c3830",
        green: "#476039",
      },
      fontFamily: {
        sans: "'Basis Grotesque', 'Basis Grotesque Pro', sans-serif",
        "sans-secondary": "PolySans, sans-serif",
        serif: "Times New Roman, serif",
      },
    },
  },
  corePlugins: {
    preflight: false,
  },
  plugins: [],
  important: "#scrolly",
};
