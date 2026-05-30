import { ShieldCheck, ShieldAlert, AlertTriangle } from "lucide-react";
import { theme, scoreColor } from "../styles/theme";
import { Section } from "./ui/Section";

/**
 * Shows the deterministic optimization-integrity check: did the AI invent any
 * metrics/contacts, and are all "matched" keywords actually in the rewrite.
 * This is the accuracy guardrail surfaced to the user.
 */
export function IntegrityPanel({ integrity }) {
  if (!integrity) return null;

  const clean = integrity.clean;
  const color = clean ? theme.green : scoreColor(integrity.score);

  return (
    <Section
      icon={clean ? ShieldCheck : ShieldAlert}
      title="Optimization Integrity Check"
      count={`${integrity.score}/100`}
      defaultOpen={!clean}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "10px 14px",
          borderRadius: 10,
          background: clean ? "rgba(70,201,139,.1)" : "rgba(242,109,98,.08)",
          border: `1px solid ${color}55`,
          marginBottom: integrity.flags.length || integrity.unverifiedKeywords.length ? 14 : 0,
        }}
      >
        {clean ? (
          <ShieldCheck size={18} style={{ color: theme.green }} />
        ) : (
          <AlertTriangle size={18} style={{ color }} />
        )}
        <span style={{ fontSize: 13.5, color: theme.text }}>
          {clean
            ? "No fabricated facts detected — the rewrite reframes only what was in your original CV."
            : "Review the items below before using this CV. The optimizer should never invent facts."}
        </span>
      </div>

      {integrity.flags.map((flag, i) => (
        <div
          key={i}
          style={{
            display: "flex",
            gap: 11,
            alignItems: "flex-start",
            padding: "10px 0",
            borderBottom: `1px solid ${theme.border}`,
          }}
        >
          <AlertTriangle
            size={16}
            style={{ color: flag.severity === "high" ? theme.red : theme.amber, flexShrink: 0, marginTop: 2 }}
          />
          <div>
            <div style={{ fontSize: 13.5, fontWeight: 600, color: theme.text }}>{flag.type}</div>
            <div style={{ fontSize: 12.5, color: theme.dim, marginTop: 2, lineHeight: 1.5 }}>{flag.detail}</div>
          </div>
        </div>
      ))}

      {integrity.unverifiedKeywords.length > 0 && (
        <div style={{ marginTop: 12, fontSize: 13, color: theme.dim, lineHeight: 1.6 }}>
          <strong style={{ color: theme.amber }}>Keywords to weave in:</strong> these were reported as matched but
          aren't actually present in the optimized CV text — add them where you have real experience:{" "}
          <span style={{ color: theme.text }}>{integrity.unverifiedKeywords.join(", ")}</span>
        </div>
      )}
    </Section>
  );
}
