import {
  Sparkles,
  FileText,
  Zap,
  AlertCircle,
  Loader2,
  BarChart3,
  FileCheck,
  ShieldCheck,
  Target,
  PenLine,
  CheckCircle2,
} from "lucide-react";
import { theme, gradientText } from "../styles/theme";
import { FileDropZone } from "./FileDropZone";
import { JobDescriptionInput } from "./JobDescriptionInput";
import { MatchReport } from "./MatchReport";
import { OptimizedCVView } from "./OptimizedCVView";
import { AtsReport } from "./AtsReport";
import { Scorecards } from "./ui/Scorecards";
import { useCVOptimizer } from "../hooks/useCVOptimizer";

const TABS = [
  { id: "report", label: "Match Report", icon: BarChart3 },
  { id: "ats", label: "ATS Scan", icon: ShieldCheck },
  { id: "cv", label: "Optimized CV", icon: FileCheck },
];

export default function CVOptimizer() {
  const {
    cvFile,
    cvText,
    jdText,
    jdFile,
    parsingCv,
    parsingJd,
    analyzing,
    phase,
    apiReady,
    error,
    result,
    activeTab,
    setActiveTab,
    handleCvFile,
    handleJdFile,
    handleJdTextChange,
    runAnalysis,
  } = useCVOptimizer();

  const cvWords = cvText ? cvText.trim().split(/\s+/).length : 0;

  return (
    <div style={{ minHeight: "100vh", padding: "26px 22px 64px", fontFamily: theme.fontBody }}>
      <div style={{ maxWidth: 1240, margin: "0 auto" }}>
        {/* Top bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 22,
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 11,
                background: theme.gradGold,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 4px 14px rgba(224,177,94,.3)",
              }}
            >
              <Sparkles size={20} style={{ color: "#23170a" }} />
            </div>
            <div>
              <div style={{ fontSize: 17, fontWeight: 800, fontFamily: theme.fontHead, lineHeight: 1.1 }}>
                CV <span style={gradientText}>Optimizer</span>
              </div>
              <div style={{ fontSize: 11.5, color: theme.faint }}>Recruiter-grade analysis &amp; ATS scan</div>
            </div>
          </div>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 7,
              padding: "6px 13px",
              background: theme.accentSoft,
              border: `1px solid rgba(224,177,94,.3)`,
              borderRadius: 30,
              fontSize: 11.5,
              fontWeight: 600,
              color: theme.accent,
            }}
          >
            <ShieldCheck size={13} /> Integrity-checked AI
          </div>
        </div>

        {/* Workspace: left control rail + right canvas */}
        <div className="workspace">
          {/* Left rail */}
          <aside className="rail">
            <div
              style={{
                background: theme.panel,
                border: `1px solid ${theme.border}`,
                borderRadius: 18,
                padding: 18,
                boxShadow: theme.shadowSoft,
              }}
            >
              <FieldLabel icon={FileText}>YOUR CV</FieldLabel>
              <FileDropZone
                onFile={handleCvFile}
                file={cvFile}
                parsing={parsingCv}
                label="Drop your CV here"
                hint="PDF, DOCX or TXT"
              />
              {cvText && <Hint>✓ {cvWords.toLocaleString()} words extracted</Hint>}

              <div style={{ height: 18 }} />

              <JobDescriptionInput
                value={jdText}
                onChange={handleJdTextChange}
                onFileUpload={handleJdFile}
                jdFile={jdFile}
                parsingJd={parsingJd}
              />

              {error && (
                <div style={{ marginTop: 14 }}>
                  <Banner color={theme.red} icon>
                    {error}
                  </Banner>
                </div>
              )}

              {!apiReady && (
                <div style={{ marginTop: 14 }}>
                  <Banner color={theme.amber} icon>
                    No API key on the server — you'll get the free ATS scan only.
                  </Banner>
                </div>
              )}

              <button
                className="cta"
                onClick={runAnalysis}
                disabled={analyzing || parsingCv || parsingJd}
                style={{
                  width: "100%",
                  marginTop: 16,
                  padding: "15px",
                  background: analyzing ? theme.panel2 : theme.gradGold,
                  color: analyzing ? theme.dim : "#23170a",
                  border: "none",
                  borderRadius: 13,
                  fontSize: 15,
                  fontWeight: 700,
                  fontFamily: theme.fontHead,
                  cursor: analyzing || parsingCv || parsingJd ? "default" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 9,
                  boxShadow: analyzing ? "none" : "0 6px 22px rgba(224,177,94,.22)",
                }}
              >
                {analyzing ? (
                  <>
                    <Loader2 size={17} className="spin" /> Working…
                  </>
                ) : (
                  <>
                    <Zap size={17} /> {result ? "Re-run Analysis" : "Optimize My CV"}
                  </>
                )}
              </button>
              {analyzing && phase && (
                <div style={{ marginTop: 10, fontSize: 12, color: theme.dim, textAlign: "center", lineHeight: 1.4 }}>
                  {phase}
                </div>
              )}
            </div>
          </aside>

          {/* Right canvas */}
          <main style={{ minWidth: 0 }}>
            {result ? (
              <div className="fade">
                {result.degraded && (
                  <Banner color={theme.amber} icon>
                    {result.notice}
                  </Banner>
                )}

                <Scorecards result={result} />

                <div
                  className="sticky-tabs"
                  style={{
                    display: "flex",
                    gap: 6,
                    marginBottom: 22,
                    background: "rgba(20,24,31,.85)",
                    border: `1px solid ${theme.border}`,
                    borderRadius: 14,
                    padding: 5,
                    boxShadow: theme.shadowSoft,
                  }}
                >
                  {TABS.map((tab) => {
                    const active = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        style={{
                          flex: 1,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 8,
                          padding: "11px 14px",
                          border: "none",
                          borderRadius: 10,
                          cursor: "pointer",
                          fontSize: 13.5,
                          fontWeight: 600,
                          background: active ? theme.gradGold : "transparent",
                          color: active ? "#23170a" : theme.dim,
                          transition: "all .18s ease",
                        }}
                      >
                        <tab.icon size={15} style={{ color: active ? "#23170a" : theme.faint }} />
                        {tab.label}
                      </button>
                    );
                  })}
                </div>

                {activeTab === "report" && <MatchReport result={result} />}
                {activeTab === "ats" && <AtsReport ats={result.ats} tips={result.atsTips} />}
                {activeTab === "cv" && <OptimizedCVView result={result} />}
              </div>
            ) : (
              <EmptyState analyzing={analyzing} phase={phase} />
            )}
          </main>
        </div>

        <footer style={{ textAlign: "center", color: theme.faint, fontSize: 11.5, marginTop: 40 }}>
          Files are parsed privately in your browser. Analysis runs securely via the server API.
        </footer>
      </div>
    </div>
  );
}

function EmptyState({ analyzing, phase }) {
  const steps = [
    { icon: FileText, title: "Add your CV & the job", text: "Upload your resume and paste the target job description on the left." },
    { icon: Target, title: "Get a recruiter verdict", text: "Match score, screening decision, requirement-by-requirement coverage, and gaps." },
    { icon: ShieldCheck, title: "ATS scan", text: "Deterministic keyword coverage map and parseability checks — exact, not guessed." },
    { icon: PenLine, title: "Optimized, honest CV", text: "A tailored rewrite with an integrity check so nothing is ever fabricated." },
  ];

  return (
    <div
      style={{
        background: theme.panel,
        border: `1px solid ${theme.border}`,
        borderRadius: 20,
        padding: "52px 40px",
        boxShadow: theme.shadowSoft,
        minHeight: 420,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
      }}
    >
      {analyzing ? (
        <div style={{ textAlign: "center" }}>
          <Loader2 size={34} className="spin" style={{ color: theme.accent, marginBottom: 16 }} />
          <div style={{ fontSize: 18, fontWeight: 700, fontFamily: theme.fontHead }}>Analyzing your profile…</div>
          <div style={{ color: theme.dim, fontSize: 14, marginTop: 8 }}>{phase}</div>
        </div>
      ) : (
        <>
          <h1
            style={{
              fontSize: 40,
              fontWeight: 800,
              margin: 0,
              fontFamily: theme.fontHead,
              letterSpacing: -1,
              lineHeight: 1.1,
            }}
          >
            Land the <span style={gradientText}>interview</span>.
          </h1>
          <p style={{ color: theme.dim, fontSize: 15.5, lineHeight: 1.6, margin: "14px 0 30px", maxWidth: 560 }}>
            A complete AI agent that reviews your CV the way a Head of Hiring would — then rewrites it to
            match the role, without inventing a thing.
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }} className="cv-two-col">
            {steps.map((s, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  gap: 12,
                  alignItems: "flex-start",
                  background: theme.bgElevated,
                  border: `1px solid ${theme.border}`,
                  borderRadius: 14,
                  padding: 16,
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background: theme.accentSoft,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <s.icon size={18} style={{ color: theme.accent }} />
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 3 }}>{s.title}</div>
                  <div style={{ fontSize: 12.5, color: theme.dim, lineHeight: 1.5 }}>{s.text}</div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 26, color: theme.faint, fontSize: 12.5 }}>
            <CheckCircle2 size={15} style={{ color: theme.green }} /> Your files never leave your browser unparsed.
          </div>
        </>
      )}
    </div>
  );
}

function FieldLabel({ icon: Icon, children }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 7,
        marginBottom: 10,
        fontSize: 12.5,
        fontWeight: 600,
        letterSpacing: 0.3,
        color: theme.dim,
      }}
    >
      <Icon size={15} style={{ color: theme.accent }} /> {children}
    </div>
  );
}

function Hint({ children }) {
  return <div style={{ marginTop: 8, fontSize: 11.5, color: theme.faint }}>{children}</div>;
}

function Banner({ children, color, icon }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 9,
        background: `${color}1a`,
        border: `1px solid ${color}55`,
        color,
        padding: "11px 14px",
        borderRadius: 12,
        fontSize: 13,
        lineHeight: 1.5,
      }}
    >
      {icon && <AlertCircle size={15} style={{ flexShrink: 0, marginTop: 1 }} />}
      <span style={{ color: icon ? color : theme.text }}>{children}</span>
    </div>
  );
}
