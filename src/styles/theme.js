// Surface/text/elevation/accent tokens resolve to CSS variables so the whole
// app can switch between dark and light themes via a `data-theme` attribute on
// <html> (see index.css). Semantic colors (green/red/amber) stay static hex so
// the few `${color}+alpha` concatenations in components remain valid CSS.
export const theme = {
  // Surfaces
  bg: "var(--bg)",
  bgElevated: "var(--bg-elevated)",
  panel: "var(--panel)",
  panel2: "var(--panel2)",
  panelHover: "var(--panel-hover)",
  border: "var(--border)",
  borderLight: "var(--border-light)",

  // Text
  text: "var(--text)",
  dim: "var(--dim)",
  faint: "var(--faint)",

  // Primary accent — indigo / violet (adapts per theme for contrast)
  accent: "var(--accent)",
  accentStrong: "var(--accent-strong)",
  accentSoft: "var(--accent-soft)",
  accent2: "#38bdf8",

  // Semantic (static — valid in both themes, safe to concatenate alpha)
  teal: "#2dd4bf",
  green: "#34d399",
  red: "#f87171",
  amber: "#f59e0b",
  purple: "#a78bfa",

  // Elevation
  shadow: "var(--shadow)",
  shadowSoft: "var(--shadow-soft)",
  glow: "var(--glow)",

  radius: 16,
  radiusSm: 10,

  fontHead: "'Plus Jakarta Sans', 'Inter', system-ui, sans-serif",
  fontBody: "'Inter', system-ui, sans-serif",

  // Gradients
  gradPrimary: "linear-gradient(135deg, #7b86ff 0%, #9a6bff 100%)",
  gradText: "var(--grad-text)",

  // Text color that sits on the primary gradient (buttons, active tabs)
  onPrimary: "#0a0c12",
};

export function scoreColor(score) {
  if (score >= 80) return "#34d399";
  if (score >= 65) return "#84cc16";
  if (score >= 50) return "#fbbf24";
  if (score >= 35) return "#fb923c";
  return "#f87171";
}

// Reusable gradient-text style for headings/score numbers.
export const gradientText = {
  background: theme.gradText,
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  backgroundClip: "text",
};
