import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        playfair: ["var(--font-playfair)", "Georgia", "serif"],
        arabic: ["var(--font-arabic)", "Traditional Arabic", "serif"],
      },
      colors: {
        green: {
          islamic: "#1a6b3c",
          light: "#4ade80",
        },
        gold: {
          islamic: "#c9a84c",
          light: "#f0d080",
        },
      },
    },
  },
  plugins: [],
};

export default config;
