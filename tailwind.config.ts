import type { Config } from "tailwindcss";
export default { darkMode: "class", content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: { extend: { colors: { bg: "var(--bg)", surface: "var(--surface)", ink: "var(--ink)", brand: "var(--brand)", muted: "var(--muted)", line: "var(--line)" },
    fontFamily: { arabic: ["var(--font-arabic)", "serif"] } } }, plugins: [] } satisfies Config;
