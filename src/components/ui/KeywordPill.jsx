import { CheckCircle2, XCircle } from "lucide-react";

const styles = {
  matched: {
    bg: "var(--pill-matched-bg)",
    bd: "var(--pill-matched-bd)",
    c: "var(--pill-matched-c)",
  },
  missing: {
    bg: "var(--pill-missing-bg)",
    bd: "var(--pill-missing-bd)",
    c: "var(--pill-missing-c)",
  },
};

export function KeywordPill({ text, kind }) {
  const style = styles[kind];

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        fontSize: 12.5,
        background: style.bg,
        border: `1px solid ${style.bd}`,
        color: style.c,
        padding: "5px 11px",
        borderRadius: 7,
        margin: "0 6px 6px 0",
      }}
    >
      {kind === "matched" ? <CheckCircle2 size={13} /> : <XCircle size={13} />}
      {text}
    </span>
  );
}
