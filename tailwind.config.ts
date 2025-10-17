import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/app/**/*.{ts,tsx}", "./src/components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#4C5FD5",
          dark: "#3C4CB0",
          light: "#E4E6FB"
        }
      }
    }
  },
  plugins: []
};

export default config;
