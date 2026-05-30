import { theme, scoreColor } from "../../styles/theme";

export function ScoreRing({ score, label = "MATCH" }) {
  const r = 64;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const color = scoreColor(score);

  return (
    <div style={{ position: "relative", width: 160, height: 160 }}>
      <svg width="160" height="160" style={{ transform: "rotate(-90deg)" }}>
        <circle cx="80" cy="80" r={r} fill="none" stroke={theme.border} strokeWidth="12" />
        <circle
          cx="80"
          cy="80"
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="12"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(.4,0,.2,1)" }}
        />
      </svg>
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            fontSize: 44,
            fontWeight: 700,
            color,
            lineHeight: 1,
            fontFamily: "Georgia, serif",
          }}
        >
          {score}
        </div>
        <div style={{ fontSize: 11, color: theme.faint, letterSpacing: 2, marginTop: 4 }}>{label}</div>
      </div>
    </div>
  );
}

export function ScoreBar({ label, value }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: 12.5,
          marginBottom: 5,
          color: theme.dim,
        }}
      >
        <span>{label}</span>
        <span style={{ color: scoreColor(value), fontWeight: 600 }}>{value}</span>
      </div>
      <div style={{ height: 6, background: theme.border, borderRadius: 4, overflow: "hidden" }}>
        <div
          style={{
            height: "100%",
            width: `${value}%`,
            background: scoreColor(value),
            borderRadius: 4,
            transition: "width 1s ease",
          }}
        />
      </div>
    </div>
  );
}
