import { Sparkles, Download, CheckCircle2 } from "lucide-react";
import { theme } from "../styles/theme";
import { Section } from "./ui/Section";
import { CopyButton } from "./ui/CopyButton";
import { exportOptimizedCV } from "../utils/export";

export function OptimizedCVView({ result }) {
  const optimizedCV = result.optimizedCV || result.tailoredSummary;

  if (!optimizedCV) {
    return (
      <div
        style={{
          background: theme.panel,
          border: `1px solid ${theme.border}`,
          borderRadius: 12,
          padding: 28,
          textAlign: "center",
          color: theme.dim,
          fontSize: 14,
          lineHeight: 1.7,
        }}
      >
        <Sparkles size={22} style={{ color: theme.accent, marginBottom: 10 }} />
        <div>
          The fully optimized CV rewrite needs the AI step. Configure an{" "}
          <code>ANTHROPIC_API_KEY</code> on the server to generate a tailored, ATS-ready CV here.
          In the meantime, the <strong>ATS Scan</strong> tab shows exactly which keywords and
          formatting fixes to apply.
        </div>
      </div>
    );
  }

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div style={{ fontSize: 14, color: theme.dim }}>
          Your CV rewritten to align with the job description — ready to copy or download.
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <CopyButton text={optimizedCV} label="Copy CV" />
          <button
            onClick={() => exportOptimizedCV(optimizedCV)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 7,
              fontSize: 13,
              background: theme.accent,
              border: "none",
              color: "#1a1205",
              padding: "9px 15px",
              borderRadius: 9,
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            <Download size={15} /> Download CV
          </button>
        </div>
      </div>

      {result.changesSummary?.length > 0 && (
        <Section icon={Sparkles} title="What Changed" count={result.changesSummary.length}>
          {result.changesSummary.map((change, index) => (
            <div
              key={index}
              style={{ display: "flex", gap: 9, marginBottom: 10, fontSize: 13.5, lineHeight: 1.5 }}
            >
              <CheckCircle2 size={16} style={{ color: theme.green, flexShrink: 0, marginTop: 2 }} />
              <span style={{ color: theme.text }}>{change}</span>
            </div>
          ))}
        </Section>
      )}

      <div
        style={{
          background: theme.panel,
          border: `1px solid ${theme.border}`,
          borderRadius: 12,
          padding: 28,
          whiteSpace: "pre-wrap",
          fontSize: 14,
          lineHeight: 1.75,
          color: theme.text,
          fontFamily: "'Inter', system-ui, sans-serif",
        }}
      >
        {optimizedCV}
      </div>
    </div>
  );
}
