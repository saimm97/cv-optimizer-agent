import { theme, scoreColor } from "../../styles/theme";

export function ScoreRing({ score, label = "MATCH", size = 160 }) {
  const stroke = size >= 120 ? 12 : 9;
  const r = size / 2 - stroke;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const color = scoreColor(score);
  const gid = `ring-${label}-${size}`;

  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)", filter: `drop-shadow(0 0 6px ${color}44)` }}>
        <defs>
          <linearGradient id={gid} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={color} stopOpacity="0.7" />
            <stop offset="100%" stopColor={color} />
          </linearGradient>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={theme.border} strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={`url(#${gid})`}
          strokeWidth={stroke}
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
            fontSize: size >= 120 ? 44 : size * 0.3,
            fontWeight: 800,
            color,
            lineHeight: 1,
            fontFamily: theme.fontHead,
          }}
        >
          {score}
        </div>
        <div style={{ fontSize: size >= 120 ? 11 : 9, color: theme.faint, letterSpacing: 2, marginTop: 4 }}>
          {label}
        </div>
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
          marginBottom: 6,
          color: theme.dim,
        }}
      >
        <span>{label}</span>
        <span style={{ color: scoreColor(value), fontWeight: 700 }}>{value}</span>
      </div>
      <div style={{ height: 7, background: theme.border, borderRadius: 5, overflow: "hidden" }}>
        <div
          style={{
            height: "100%",
            width: `${value}%`,
            background: `linear-gradient(90deg, ${scoreColor(value)}aa, ${scoreColor(value)})`,
            borderRadius: 5,
            transition: "width 1s ease",
          }}
        />
      </div>
    </div>
  );
}
