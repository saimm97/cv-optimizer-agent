export const theme = {
  bg: "#0d0f12",
  panel: "#15181d",
  panel2: "#1b1f26",
  border: "#272c35",
  text: "#e8eaed",
  dim: "#9aa1ad",
  faint: "#6b7280",
  accent: "#d4a056",
  accent2: "#5b8def",
  green: "#4caf6f",
  red: "#e8675b",
  amber: "#e0a83d",
};

export function scoreColor(score) {
  if (score >= 80) return theme.green;
  if (score >= 65) return "#9bc24a";
  if (score >= 50) return theme.amber;
  if (score >= 35) return "#e08a3d";
  return theme.red;
}
