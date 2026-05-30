export const theme = {
  // Surfaces
  bg: "#0a0c10",
  bgElevated: "#0e1117",
  panel: "#14181f",
  panel2: "#1a1f28",
  panelHover: "#1f2530",
  border: "#262c38",
  borderLight: "#333b49",

  // Text
  text: "#eef1f6",
  dim: "#9aa3b2",
  faint: "#646e7e",

  // Accents
  accent: "#e0b15e",
  accentSoft: "rgba(224,177,94,0.14)",
  accent2: "#6aa0ff",
  teal: "#3ed0c0",
  green: "#46c98b",
  red: "#f26d62",
  amber: "#e6b143",
  purple: "#a78bfa",

  // Elevation
  shadow: "0 10px 34px rgba(0,0,0,0.40)",
  shadowSoft: "0 3px 14px rgba(0,0,0,0.28)",
  glow: "0 0 0 1px rgba(224,177,94,0.20), 0 8px 28px rgba(224,177,94,0.10)",

  radius: 16,
  radiusSm: 10,

  fontHead: "'Plus Jakarta Sans', 'Inter', system-ui, sans-serif",
  fontBody: "'Inter', system-ui, sans-serif",

  gradGold: "linear-gradient(135deg, #f0d49a 0%, #d49a44 100%)",
  gradText: "linear-gradient(135deg, #f3dca6 0%, #e0b15e 60%, #cf9a44 100%)",
};

export function scoreColor(score) {
  if (score >= 80) return theme.green;
  if (score >= 65) return "#9bc24a";
  if (score >= 50) return theme.amber;
  if (score >= 35) return "#e08a3d";
  return theme.red;
}

// Reusable gradient-text style for headings/score numbers.
export const gradientText = {
  background: theme.gradText,
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  backgroundClip: "text",
};
