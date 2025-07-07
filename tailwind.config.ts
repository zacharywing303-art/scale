import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#007AFF", // Unity Blue
        "primary-foreground": "#FFFFFF",
        secondary: "#34C759", // Unity Green
        "secondary-foreground": "#FFFFFF",
        background: "var(--color-background)",
        foreground: "var(--color-foreground)",
      },
    },
  },
  darkMode: "class",
  plugins: [],
};

export default config;
