import {
  Sparkles,
  FileText,
  Briefcase,
  Zap,
  AlertCircle,
  Loader2,
  BarChart3,
  FileCheck,
  ShieldCheck,
} from "lucide-react";
import { theme } from "../styles/theme";
import { FileDropZone } from "./FileDropZone";
import { JobDescriptionInput } from "./JobDescriptionInput";
import { MatchReport } from "./MatchReport";
import { OptimizedCVView } from "./OptimizedCVView";
import { AtsReport } from "./AtsReport";
import { useCVOptimizer } from "../hooks/useCVOptimizer";

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

  return (
    <div
      style={{
        minHeight: "100vh",
        background: theme.bg,
        color: theme.text,
        padding: "32px 20px",
        fontFamily: "'Inter', system-ui, sans-serif",
      }}
    >
      <div style={{ maxWidth: 920, margin: "0 auto" }}>
        <header style={{ textAlign: "center", marginBottom: 32 }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "5px 14px",
              background: "rgba(212,160,86,.1)",
              border: "1px solid rgba(212,160,86,.3)",
              borderRadius: 30,
              fontSize: 12,
              color: theme.accent,
              marginBottom: 16,
            }}
          >
            <Sparkles size={13} /> AI-Powered CV Optimizer Agent
          </div>
          <h1
            style={{
              fontSize: 34,
              fontWeight: 700,
              margin: 0,
              fontFamily: "Georgia, serif",
              letterSpacing: -0.5,
            }}
          >
            CV <span style={{ color: theme.accent }}>Optimizer</span>
          </h1>
          <p
            style={{
              color: theme.dim,
              fontSize: 15,
              marginTop: 10,
              maxWidth: 560,
              margin: "10px auto 0",
            }}
          >
            Recruiter-grade analysis against the job description, a deterministic ATS scan, and a
            fully optimized CV — like having a Head of Hiring review your profile.
          </p>
        </header>

        {!apiReady && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 9,
              background: "rgba(224,168,61,.1)",
              border: "1px solid rgba(224,168,61,.35)",
              color: theme.amber,
              padding: "12px 16px",
              borderRadius: 10,
              fontSize: 13.5,
              marginBottom: 16,
            }}
          >
            <AlertCircle size={16} /> No ANTHROPIC_API_KEY on the server — you'll get the free
            deterministic ATS scan only. Add a key to <code>.env</code> and restart for the full
            recruiter analysis, bullet rewrites, and optimized CV.
          </div>
        )}

        <div
          className="cv-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 16,
            marginBottom: 16,
          }}
        >
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 7,
                marginBottom: 10,
                fontSize: 13,
                color: theme.dim,
              }}
            >
              <FileText size={15} style={{ color: theme.accent }} /> YOUR CV
            </div>
            <FileDropZone
              onFile={handleCvFile}
              file={cvFile}
              parsing={parsingCv}
              label="Drop your CV here"
              hint="PDF, DOCX or TXT"
            />
            {cvText && (
              <div style={{ marginTop: 8, fontSize: 11.5, color: theme.faint }}>
                ✓ {cvText.split(/\s+/).length} words extracted
              </div>
            )}
          </div>

          <JobDescriptionInput
            value={jdText}
            onChange={handleJdTextChange}
            onFileUpload={handleJdFile}
            jdFile={jdFile}
            parsingJd={parsingJd}
          />
        </div>

        {error && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 9,
              background: "rgba(232,103,91,.1)",
              border: "1px solid rgba(232,103,91,.35)",
              color: "#f0918a",
              padding: "12px 16px",
              borderRadius: 10,
              fontSize: 13.5,
              marginBottom: 16,
            }}
          >
            <AlertCircle size={16} /> {error}
          </div>
        )}

        <button
          onClick={runAnalysis}
          disabled={analyzing || parsingCv || parsingJd}
          style={{
            width: "100%",
            padding: "15px",
            background: analyzing ? theme.panel2 : theme.accent,
            color: analyzing ? theme.dim : "#1a1205",
            border: "none",
            borderRadius: 12,
            fontSize: 15,
            fontWeight: 700,
            cursor: analyzing ? "default" : "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 9,
            transition: "all .2s",
          }}
        >
          {analyzing ? (
            <>
              <Loader2 size={18} className="spin" /> {phase || "Analyzing and optimizing your CV…"}
            </>
          ) : (
            <>
              <Zap size={18} /> Optimize My CV
            </>
          )}
        </button>

        {result && (
          <div className="fade" style={{ marginTop: 32 }}>
            {result.degraded && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 9,
                  background: "rgba(224,168,61,.1)",
                  border: "1px solid rgba(224,168,61,.35)",
                  color: theme.amber,
                  padding: "12px 16px",
                  borderRadius: 10,
                  fontSize: 13.5,
                  marginBottom: 16,
                }}
              >
                <AlertCircle size={16} style={{ flexShrink: 0 }} /> {result.notice}
              </div>
            )}
            <div
              style={{
                display: "flex",
                gap: 8,
                marginBottom: 24,
                background: theme.panel2,
                border: `1px solid ${theme.border}`,
                borderRadius: 12,
                padding: 4,
              }}
            >
              {[
                { id: "report", label: "Match Report", icon: BarChart3 },
                { id: "ats", label: "ATS Scan", icon: ShieldCheck },
                { id: "cv", label: "Optimized CV", icon: FileCheck },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    padding: "12px 16px",
                    border: "none",
                    borderRadius: 9,
                    cursor: "pointer",
                    fontSize: 14,
                    fontWeight: 600,
                    background: activeTab === tab.id ? theme.panel : "transparent",
                    color: activeTab === tab.id ? theme.text : theme.dim,
                    boxShadow: activeTab === tab.id ? "0 1px 3px rgba(0,0,0,.3)" : "none",
                  }}
                >
                  <tab.icon size={16} style={{ color: activeTab === tab.id ? theme.accent : theme.faint }} />
                  {tab.label}
                </button>
              ))}
            </div>

            {activeTab === "report" && <MatchReport result={result} />}
            {activeTab === "ats" && <AtsReport ats={result.ats} tips={result.atsTips} />}
            {activeTab === "cv" && <OptimizedCVView result={result} />}
          </div>
        )}

        <footer style={{ textAlign: "center", color: theme.faint, fontSize: 11.5, marginTop: 32 }}>
          Files are parsed in your browser. Analysis runs securely via the server API.
        </footer>
      </div>
    </div>
  );
}
