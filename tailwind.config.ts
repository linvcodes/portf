import type { Config } from "tailwindcss";

export default {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./content/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "sky-main": "var(--sky-main)",
        "sky-edge": "var(--sky-edge)",
        grass: "var(--grass)",
        ink: "var(--ink)",
        "ink-soft": "var(--ink-soft)",
        shadow: "var(--shadow)",
        paper: "var(--paper)",
        orange: "var(--orange)",
      },
      fontFamily: {
        display: "var(--f-display)",
        body: "var(--f-body)",
        mono: "var(--f-mono)",
      },
    },
  },
  plugins: [],
} satisfies Config;
