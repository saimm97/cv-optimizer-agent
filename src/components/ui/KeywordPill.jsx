import { CheckCircle2, XCircle } from "lucide-react";

const styles = {
  matched: { bg: "rgba(76,175,111,.12)", bd: "rgba(76,175,111,.4)", c: "#6fd49a" },
  missing: { bg: "rgba(232,103,91,.1)", bd: "rgba(232,103,91,.4)", c: "#f0918a" },
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
