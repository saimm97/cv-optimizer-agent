import { ShieldCheck, CheckCircle2, AlertTriangle, XCircle, Lightbulb } from "lucide-react";
import { theme, scoreColor } from "../styles/theme";
import { Section } from "./ui/Section";
import { ScoreRing, ScoreBar } from "./ui/ScoreRing";

const STATUS = {
  pass: { color: theme.green, Icon: CheckCircle2, label: "PASS" },
  warn: { color: theme.amber, Icon: AlertTriangle, label: "REVIEW" },
  fail: { color: theme.red, Icon: XCircle, label: "FIX" },
};

export function AtsReport({ ats, tips = [] }) {
  if (!ats) {
    return (
      <div style={{ color: theme.dim, fontSize: 14, padding: 24 }}>
        ATS scan data is unavailable for this analysis.
      </div>
    );
  }

  return (
    <div>
      <div
        style={{
          display: "flex",
          gap: 28,
          alignItems: "center",
          background: theme.panel,
          border: `1px solid ${theme.border}`,
          borderRadius: 16,
          padding: 28,
          marginBottom: 20,
          flexWrap: "wrap",
        }}
      >
        <ScoreRing score={ats.score} label="ATS" />
        <div style={{ flex: 1, minWidth: 260 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <ShieldCheck size={18} style={{ color: theme.accent }} />
            <span style={{ fontSize: 15, fontWeight: 700 }}>Deterministic ATS Scan</span>
          </div>
          <p style={{ fontSize: 13.5, lineHeight: 1.6, color: theme.dim, margin: "0 0 16px" }}>
            Computed by a parser — not the AI — so it is exact and reproducible. It mirrors how a
            real applicant tracking system reads your resume against this job.
          </p>
          <ScoreBar label="Keyword Coverage (weighted by JD importance)" value={ats.keywordCoverage} />
          <ScoreBar label="Formatting & Parseability" value={ats.formattingScore} />
        </div>
      </div>

      <Section icon={ShieldCheck} title="ATS Compatibility Checks" count={ats.formatChecks?.length}>
        {ats.formatChecks?.map((check) => {
          const s = STATUS[check.status] || STATUS.warn;
          return (
            <div
              key={check.id}
              style={{
                display: "flex",
                gap: 12,
                alignItems: "flex-start",
                padding: "11px 0",
                borderBottom: `1px solid ${theme.border}`,
              }}
            >
              <s.Icon size={17} style={{ color: s.color, flexShrink: 0, marginTop: 1 }} />
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 13.5, fontWeight: 600, color: theme.text }}>{check.label}</span>
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      letterSpacing: 0.5,
                      color: s.color,
                      border: `1px solid ${s.color}`,
                      borderRadius: 5,
                      padding: "1px 6px",
                    }}
                  >
                    {s.label}
                  </span>
                </div>
                <div style={{ fontSize: 12.5, color: theme.dim, marginTop: 3, lineHeight: 1.5 }}>
                  {check.detail}
                </div>
              </div>
            </div>
          );
        })}
      </Section>

      {tips?.length > 0 && (
        <Section icon={Lightbulb} title="AI ATS Recommendations" count={tips.length}>
          {tips.map((tip, index) => (
            <div key={index} style={{ display: "flex", gap: 9, marginBottom: 10, fontSize: 13.5, lineHeight: 1.5 }}>
              <span style={{ color: theme.accent }}>›</span>
              <span style={{ color: theme.dim }}>{tip}</span>
            </div>
          ))}
        </Section>
      )}

      {ats.keywordTable?.length > 0 && (
        <Section icon={ShieldCheck} title="JD Keyword Coverage Map" count={ats.keywordTable.length}>
          <div style={{ fontSize: 12, color: theme.faint, marginBottom: 10 }}>
            Exact keyword overlap. High-importance terms are mentioned most often in the job description.
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {ats.keywordTable.map((row, i) => (
              <div
                key={i}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr auto auto",
                  gap: 12,
                  alignItems: "center",
                  padding: "8px 10px",
                  borderRadius: 8,
                  background: i % 2 ? "transparent" : theme.panel2,
                }}
              >
                <span style={{ fontSize: 13, color: row.matched ? theme.text : theme.dim }}>
                  {row.matched ? "✓ " : "✕ "}
                  {row.keyword}
                </span>
                <span
                  style={{
                    fontSize: 10.5,
                    fontWeight: 700,
                    letterSpacing: 0.4,
                    color:
                      row.importance === "high"
                        ? theme.red
                        : row.importance === "medium"
                          ? theme.amber
                          : theme.faint,
                  }}
                >
                  {row.importance.toUpperCase()}
                </span>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: row.matched ? theme.green : theme.red,
                    minWidth: 64,
                    textAlign: "right",
                  }}
                >
                  {row.matched ? "in CV" : "MISSING"}
                </span>
              </div>
            ))}
          </div>
        </Section>
      )}
    </div>
  );
}
