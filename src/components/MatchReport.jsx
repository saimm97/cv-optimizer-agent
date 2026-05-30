import {
  Target,
  Award,
  AlertCircle,
  Sparkles,
  TrendingUp,
  Zap,
  CheckCircle2,
  XCircle,
  Download,
  ClipboardList,
  Gauge,
  HelpCircle,
  MinusCircle,
} from "lucide-react";
import { theme, scoreColor } from "../styles/theme";
import { Section } from "./ui/Section";
import { ScoreRing, ScoreBar } from "./ui/ScoreRing";
import { KeywordPill } from "./ui/KeywordPill";
import { CopyButton } from "./ui/CopyButton";
import { exportReport } from "../utils/export";

const SCREENING_STYLE = {
  "Advance to Interview": theme.green,
  "Maybe / Phone Screen": theme.amber,
  "Likely Reject": theme.red,
};

const REQ_STATUS = {
  met: { color: theme.green, Icon: CheckCircle2 },
  partial: { color: theme.amber, Icon: MinusCircle },
  missing: { color: theme.red, Icon: XCircle },
};

export function MatchReport({ result }) {
  const screeningColor = SCREENING_STYLE[result.screening?.decision] || theme.amber;

  return (
    <div>
      {/* Hero */}
      <div
        style={{
          display: "flex",
          gap: 28,
          alignItems: "center",
          background: theme.panel,
          border: `1px solid ${theme.border}`,
          borderRadius: 16,
          padding: 28,
          marginBottom: 16,
          flexWrap: "wrap",
        }}
      >
        <ScoreRing score={result.matchScore} />
        <div style={{ flex: 1, minWidth: 260 }}>
          <div
            style={{
              display: "inline-block",
              fontSize: 12.5,
              fontWeight: 700,
              letterSpacing: 1,
              color: scoreColor(result.matchScore),
              border: `1px solid ${scoreColor(result.matchScore)}`,
              padding: "4px 12px",
              borderRadius: 20,
              marginBottom: 12,
              textTransform: "uppercase",
            }}
          >
            {result.verdict}
          </div>
          <p style={{ fontSize: 14.5, lineHeight: 1.65, color: theme.text, margin: "0 0 16px" }}>
            {result.summary}
          </p>
          <ScoreBar label="Skills Match" value={result.subScores.skillsMatch} />
          <ScoreBar label="Experience Match" value={result.subScores.experienceMatch} />
          <ScoreBar label="Keyword Coverage" value={result.subScores.keywordCoverage} />
          <ScoreBar label="Seniority Fit" value={result.subScores.seniorityFit} />
          <ScoreBar label="Impact / Evidence" value={result.subScores.impactEvidence} />
        </div>
      </div>

      {/* Screening decision */}
      {result.screening?.decision && (
        <div
          style={{
            display: "flex",
            gap: 14,
            alignItems: "center",
            background: theme.panel,
            border: `1px solid ${screeningColor}`,
            borderLeft: `4px solid ${screeningColor}`,
            borderRadius: 12,
            padding: "16px 20px",
            marginBottom: 16,
            flexWrap: "wrap",
          }}
        >
          <Gauge size={22} style={{ color: screeningColor, flexShrink: 0 }} />
          <div style={{ flex: 1, minWidth: 220 }}>
            <div style={{ fontSize: 11.5, color: theme.faint, letterSpacing: 0.5, textTransform: "uppercase" }}>
              Recruiter Screening Decision
            </div>
            <div style={{ fontSize: 17, fontWeight: 700, color: screeningColor }}>
              {result.screening.decision}
              <span style={{ fontSize: 12, fontWeight: 500, color: theme.dim, marginLeft: 10 }}>
                {result.screening.confidence} confidence
              </span>
            </div>
            {result.screening.rationale && (
              <div style={{ fontSize: 13, color: theme.dim, marginTop: 4, lineHeight: 1.5 }}>
                {result.screening.rationale}
              </div>
            )}
          </div>
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
        <button
          onClick={() => exportReport(result)}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 7,
            fontSize: 13,
            background: theme.panel2,
            border: `1px solid ${theme.border}`,
            color: theme.text,
            padding: "9px 15px",
            borderRadius: 9,
            cursor: "pointer",
          }}
        >
          <Download size={15} /> Export Report
        </button>
      </div>

      {/* Seniority */}
      {result.seniorityAssessment?.note && (
        <Section icon={Gauge} title="Seniority Assessment" defaultOpen={false}>
          <div style={{ display: "flex", gap: 24, flexWrap: "wrap", marginBottom: 10 }}>
            <Stat label="Role targets" value={result.seniorityAssessment.jdLevel || "—"} />
            <Stat label="CV demonstrates" value={result.seniorityAssessment.candidateLevel || "—"} />
          </div>
          <div style={{ fontSize: 13.5, color: theme.dim, lineHeight: 1.5 }}>
            {result.seniorityAssessment.note}
          </div>
        </Section>
      )}

      {/* Requirements coverage */}
      {result.requirementsCoverage?.length > 0 && (
        <Section
          icon={ClipboardList}
          title="Requirements Coverage"
          count={`${result.requirementsCoverage.filter((r) => r.status === "met").length}/${result.requirementsCoverage.length} met`}
        >
          {result.requirementsCoverage.map((req, index) => {
            const s = REQ_STATUS[req.status] || REQ_STATUS.partial;
            return (
              <div
                key={index}
                style={{
                  display: "flex",
                  gap: 11,
                  alignItems: "flex-start",
                  padding: "10px 0",
                  borderBottom: `1px solid ${theme.border}`,
                }}
              >
                <s.Icon size={17} style={{ color: s.color, flexShrink: 0, marginTop: 1 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 13.5, color: theme.text, fontWeight: 500 }}>{req.requirement}</span>
                    {req.type === "must-have" && (
                      <span
                        style={{
                          fontSize: 9.5,
                          fontWeight: 700,
                          letterSpacing: 0.5,
                          color: theme.accent,
                          border: `1px solid ${theme.accent}`,
                          borderRadius: 4,
                          padding: "0 5px",
                        }}
                      >
                        MUST-HAVE
                      </span>
                    )}
                  </div>
                  {req.evidence && (
                    <div style={{ fontSize: 12.5, color: theme.dim, marginTop: 3, lineHeight: 1.5 }}>
                      {req.evidence}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </Section>
      )}

      {/* Keyword analysis */}
      <Section
        icon={Target}
        title="Keyword Analysis"
        count={`${result.matchedKeywords.length} / ${result.matchedKeywords.length + result.missingKeywords.length}`}
      >
        <div style={{ fontSize: 12.5, color: theme.dim, marginBottom: 8 }}>Matched — present in your CV</div>
        <div style={{ marginBottom: 18 }}>
          {result.matchedKeywords.length ? (
            result.matchedKeywords.map((keyword, index) => (
              <KeywordPill key={index} text={keyword} kind="matched" />
            ))
          ) : (
            <span style={{ color: theme.faint, fontSize: 13 }}>None detected.</span>
          )}
        </div>
        <div style={{ fontSize: 12.5, color: theme.dim, marginBottom: 8 }}>Missing — in the JD but not your CV</div>
        <div>
          {result.missingKeywords.length ? (
            result.missingKeywords.map((keyword, index) => (
              <KeywordPill key={index} text={keyword} kind="missing" />
            ))
          ) : (
            <span style={{ color: theme.green, fontSize: 13 }}>Great — no critical keywords missing.</span>
          )}
        </div>
      </Section>

      {/* Strengths & gaps */}
      <div className="cv-two-col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <Section icon={Award} title="Strengths" count={result.strengths.length}>
          {result.strengths.map((item, index) => (
            <div key={index} style={{ display: "flex", gap: 9, marginBottom: 11, fontSize: 13.5, lineHeight: 1.5 }}>
              <CheckCircle2 size={16} style={{ color: theme.green, flexShrink: 0, marginTop: 2 }} />
              <span style={{ color: theme.text }}>{item}</span>
            </div>
          ))}
        </Section>

        <Section icon={AlertCircle} title="Gaps" count={result.gaps.length}>
          {result.gaps.map((item, index) => (
            <div key={index} style={{ display: "flex", gap: 9, marginBottom: 11, fontSize: 13.5, lineHeight: 1.5 }}>
              <XCircle size={16} style={{ color: theme.red, flexShrink: 0, marginTop: 2 }} />
              <span style={{ color: theme.text }}>{item}</span>
            </div>
          ))}
        </Section>
      </div>

      {result.redFlags?.length > 0 && (
        <Section icon={AlertCircle} title="Recruiter Red Flags" count={result.redFlags.length}>
          {result.redFlags.map((item, index) => (
            <div key={index} style={{ display: "flex", gap: 9, marginBottom: 11, fontSize: 13.5, lineHeight: 1.5 }}>
              <span style={{ color: theme.amber }}>⚑</span>
              <span style={{ color: theme.dim }}>{item}</span>
            </div>
          ))}
        </Section>
      )}

      {/* Tailored summary */}
      <Section icon={Sparkles} title="Tailored Professional Summary">
        <div
          style={{
            background: theme.panel2,
            border: `1px solid ${theme.border}`,
            borderRadius: 10,
            padding: 16,
            fontSize: 14,
            lineHeight: 1.7,
            color: theme.text,
            marginBottom: 12,
            fontStyle: "italic",
          }}
        >
          {result.tailoredSummary}
        </div>
        <CopyButton text={result.tailoredSummary} />
      </Section>

      {/* Bullet rewrites */}
      <Section icon={TrendingUp} title="Bullet Point Rewrites" count={result.bulletRewrites.length}>
        {result.bulletRewrites.map((bullet, index) => (
          <div
            key={index}
            style={{
              background: theme.panel2,
              border: `1px solid ${theme.border}`,
              borderRadius: 10,
              padding: 14,
              marginBottom: 12,
            }}
          >
            <Label color={theme.faint}>Before</Label>
            <div
              style={{
                fontSize: 13.5,
                color: theme.dim,
                marginBottom: 12,
                lineHeight: 1.5,
                textDecoration: "line-through",
                textDecorationColor: "rgba(232,103,91,.4)",
              }}
            >
              {bullet.original}
            </div>
            <Label color={theme.green}>After</Label>
            <div style={{ fontSize: 13.5, color: theme.text, marginBottom: 10, lineHeight: 1.55 }}>
              {bullet.improved}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
              <div style={{ fontSize: 12, color: theme.faint, fontStyle: "italic" }}>{bullet.why}</div>
              <CopyButton text={bullet.improved} />
            </div>
          </div>
        ))}
      </Section>

      {/* Quantification opportunities */}
      {result.quantificationOpportunities?.length > 0 && (
        <Section icon={TrendingUp} title="Add Metrics Here" count={result.quantificationOpportunities.length} defaultOpen={false}>
          {result.quantificationOpportunities.map((item, index) => (
            <div key={index} style={{ display: "flex", gap: 9, marginBottom: 10, fontSize: 13.5, lineHeight: 1.5 }}>
              <span style={{ color: theme.accent }}>#</span>
              <span style={{ color: theme.dim }}>{item}</span>
            </div>
          ))}
        </Section>
      )}

      {/* Action plan */}
      <Section icon={Zap} title="Prioritized Action Plan" count={result.actionPlan.length}>
        {result.actionPlan.map((item, index) => (
          <div key={index} style={{ display: "flex", gap: 12, marginBottom: 14, alignItems: "flex-start" }}>
            <div
              style={{
                flexShrink: 0,
                width: 24,
                height: 24,
                borderRadius: 7,
                background: theme.accent,
                color: "#1a1205",
                fontSize: 12.5,
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {index + 1}
            </div>
            <div style={{ flex: 1, paddingTop: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                <span style={{ color: theme.text, fontSize: 14, lineHeight: 1.5 }}>{item.action}</span>
                <PriorityPill priority={item.priority} />
              </div>
              {item.impact && (
                <div style={{ fontSize: 12.5, color: theme.faint, marginTop: 3 }}>{item.impact}</div>
              )}
            </div>
          </div>
        ))}
      </Section>

      {/* Interview prep */}
      {result.interviewPrep?.length > 0 && (
        <Section icon={HelpCircle} title="Likely Interview Probes" count={result.interviewPrep.length} defaultOpen={false}>
          {result.interviewPrep.map((item, index) => (
            <div key={index} style={{ display: "flex", gap: 9, marginBottom: 10, fontSize: 13.5, lineHeight: 1.5 }}>
              <span style={{ color: theme.accent2 }}>?</span>
              <span style={{ color: theme.dim }}>{item}</span>
            </div>
          ))}
        </Section>
      )}
    </div>
  );
}

function Label({ children, color }) {
  return (
    <div style={{ fontSize: 11.5, color, marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.5 }}>
      {children}
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div>
      <div style={{ fontSize: 11.5, color: theme.faint, textTransform: "uppercase", letterSpacing: 0.5 }}>
        {label}
      </div>
      <div style={{ fontSize: 15, fontWeight: 600, color: theme.text, marginTop: 2 }}>{value}</div>
    </div>
  );
}

function PriorityPill({ priority }) {
  const color = priority === "high" ? theme.red : priority === "low" ? theme.faint : theme.amber;
  return (
    <span
      style={{
        fontSize: 9.5,
        fontWeight: 700,
        letterSpacing: 0.5,
        color,
        border: `1px solid ${color}`,
        borderRadius: 4,
        padding: "0 5px",
        textTransform: "uppercase",
      }}
    >
      {priority}
    </span>
  );
}
