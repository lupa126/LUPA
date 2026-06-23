/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          gold: "#A37E2C",
          "gold-light": "#BC9C52",
          brown: "#2E2218",
          charcoal: "#23211F",
          obsidian: "#131211",
          green: "#1C2F22",
          bg: "#FAF9F4",
        }
      },
      fontFamily: {
        serif: ["Dongle", "Playfair Display", "Didot", "Georgia", "serif"],
        sans: ["Dongle", "Cormorant Garamond", "Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "Courier New", "monospace"],
      },
      scale: {
        102: "1.02",
        105: "1.05",
        108: "1.08",
      },
      transitionDuration: {
        250: "250ms",
      },
    },
  },
  plugins: [],
}
