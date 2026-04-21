import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  "#f0f4ff",
          100: "#dce7ff",
          200: "#b9cffe",
          300: "#84adfd",
          400: "#4d83fa",
          500: "#2563eb",
          600: "#1d4fd8",
          700: "#1e40af",
          800: "#1e3a8a",
          900: "#1e3166",
        },
      },
      fontFamily: {
        serif: ["Georgia", "Cambria", "Times New Roman", "serif"],
      },
    },
  },
  plugins: [],
};

export default config;
