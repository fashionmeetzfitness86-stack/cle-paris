/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // ── Luxury off-white editorial palette ─────────────────────
        "lux-bg":        "#F4EFE8",   // Main background — warm beige
        "lux-bg-2":      "#EFE7DD",   // Secondary / alternate sections
        "lux-bg-3":      "#E7DDD1",   // Section accent background
        "lux-surface":   "#FAF7F2",   // Card background — warm ivory
        "lux-border":    "rgba(0,0,0,0.08)", // Subtle border
        // ── Typography ─────────────────────────────────────────────
        "lux-ink":       "#111111",   // Headings
        "lux-body":      "#3A3A3A",   // Body text
        "lux-muted":     "#6F6F6F",   // Muted / secondary text
        // ── Accent ─────────────────────────────────────────────────
        "lux-gold":      "#C8A97E",   // Champagne gold accent
        // ── Footer / dark ──────────────────────────────────────────
        "lux-footer":    "#2C2825",   // Dark taupe footer
        "lux-footer-2":  "#3D3832",   // Footer secondary
        // ── Legacy tokens (admin uses these) ───────────────────────
        "void-black":    "#0a0a0a",
        "midnight-onyx": "#15161a",
        "desert-sand":   "#c8b89a",
        bone:            "#e8e2d6",
      },
      fontFamily: {
        sans:    ['"Inter"', "system-ui", "sans-serif"],
        display: ['"Inter Tight"', "system-ui", "sans-serif"],
      },
      letterSpacing: {
        widest: "0.25em",
      },
      boxShadow: {
        "lux-card": "0 2px 16px rgba(0,0,0,0.06), 0 1px 4px rgba(0,0,0,0.04)",
        "lux-card-hover": "0 8px 32px rgba(0,0,0,0.10), 0 2px 8px rgba(0,0,0,0.06)",
      },
    },
  },
  plugins: [],
};
