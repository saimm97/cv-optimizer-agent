import { Target, ShieldCheck, Tag, BadgeCheck } from "lucide-react";
import { theme, scoreColor } from "../../styles/theme";

function Card({ icon: Icon, label, value, suffix, color }) {
  return (
    <div
      style={{
        background: theme.panel,
        border: `1px solid ${theme.border}`,
        borderRadius: 14,
        padding: "16px 18px",
        boxShadow: theme.shadowSoft,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 8 }}>
        <Icon size={14} style={{ color }} />
        <span style={{ fontSize: 11.5, color: theme.dim, letterSpacing: 0.3, textTransform: "uppercase" }}>
          {label}
        </span>
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
        <span style={{ fontSize: 28, fontWeight: 800, color, fontFamily: theme.fontHead, lineHeight: 1 }}>
          {value}
        </span>
        {suffix && <span style={{ fontSize: 13, color: theme.faint }}>{suffix}</span>}
      </div>
    </div>
  );
}

export function Scorecards({ result }) {
  const matched = result.matchedKeywords?.length || 0;
  const total = matched + (result.missingKeywords?.length || 0);

  return (
    <div
      className="scorecards"
      style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 20 }}
    >
      <Card
        icon={Target}
        label="Overall Match"
        value={result.matchScore}
        suffix="/100"
        color={scoreColor(result.matchScore)}
      />
      <Card
        icon={ShieldCheck}
        label="ATS Score"
        value={result.ats ? result.ats.score : "—"}
        suffix={result.ats ? "/100" : ""}
        color={result.ats ? scoreColor(result.ats.score) : theme.faint}
      />
      <Card
        icon={Tag}
        label="Keywords"
        value={matched}
        suffix={`/ ${total}`}
        color={theme.accent2}
      />
      <Card
        icon={BadgeCheck}
        label="Integrity"
        value={result.integrity ? result.integrity.score : "—"}
        suffix={result.integrity ? "/100" : ""}
        color={result.integrity ? scoreColor(result.integrity.score) : theme.faint}
      />
    </div>
  );
}
