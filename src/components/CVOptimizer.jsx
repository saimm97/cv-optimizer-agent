import { useEffect, useState } from "react";
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
  LayoutTemplate,
  X,
  Pencil,
  Lock,
  Sun,
  Moon,
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

const FEATURES = [
  { icon: Target, text: "Recruiter match score & screening verdict" },
  { icon: ShieldCheck, text: "Deterministic ATS keyword scan" },
  { icon: PenLine, text: "Optimized CV with integrity check" },
];

export default function CVOptimizer() {
  const {
    cvFile,
    cvText,
    jdText,
    jdFile,
    templateFile,
    parsingCv,
    parsingJd,
    parsingTemplate,
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
    handleTemplateFile,
    clearTemplate,
    runAnalysis,
  } = useCVOptimizer();

  const [editing, setEditing] = useState(false);
  const [mode, setMode] = useState(getInitialThemeMode);
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", mode);
    try {
      localStorage.setItem("cvo-theme", mode);
    } catch {
      /* storage unavailable — ignore */
    }
  }, [mode]);
  const toggleMode = () => setMode((m) => (m === "dark" ? "light" : "dark"));

  const showSetup = !result || editing;
  const cvWords = cvText ? cvText.trim().split(/\s+/).length : 0;
  const jdWords = jdText ? jdText.trim().split(/\s+/).length : 0;
  const busy = analyzing || parsingCv || parsingJd || parsingTemplate;

  const handleRun = () => {
    setEditing(false);
    runAnalysis();
  };

  return (
    <div style={{ minHeight: "100vh", padding: "28px 22px 64px", fontFamily: theme.fontBody }}>
      <div style={{ maxWidth: 1080, margin: "0 auto" }}>
        {/* Brand bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: result ? 22 : 36,
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                background: theme.gradPrimary,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 4px 16px rgba(124,108,255,.35)",
              }}
            >
              <Sparkles size={21} style={{ color: "#fff" }} />
            </div>
            <div>
              <div style={{ fontSize: 18, fontWeight: 800, fontFamily: theme.fontHead, lineHeight: 1.1 }}>
                CV <span style={gradientText}>Optimizer</span>
              </div>
              <div style={{ fontSize: 11.5, color: theme.faint }}>Recruiter-grade analysis &amp; ATS scan</div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Pill icon={Lock}>Private — parsed in your browser</Pill>
            <Pill icon={ShieldCheck} accent>
              Integrity-checked AI
            </Pill>
            <ThemeToggle mode={mode} onToggle={toggleMode} />
          </div>
        </div>

        {/* Hero (only before first analysis) */}
        {!result && (
          <header style={{ textAlign: "center", marginBottom: 26 }}>
            <h1
              style={{
                fontSize: 44,
                fontWeight: 800,
                margin: 0,
                fontFamily: theme.fontHead,
                letterSpacing: -1.2,
                lineHeight: 1.08,
              }}
            >
              Land the <span style={gradientText}>interview</span>.
            </h1>
            <p
              style={{
                color: theme.dim,
                fontSize: 16,
                lineHeight: 1.6,
                maxWidth: 600,
                margin: "16px auto 0",
              }}
            >
              A complete AI agent that reviews your CV the way a Head of Hiring would — then rewrites it to
              match the role, in your own template, without inventing a thing.
            </p>
          </header>
        )}

        {/* Setup panel */}
        {showSetup ? (
          <div
            className="fade"
            style={{
              background: theme.panel,
              border: `1px solid ${theme.border}`,
              borderRadius: 20,
              padding: 26,
              boxShadow: theme.shadow,
            }}
          >
            <div className="cv-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 22 }}>
              <div>
                <SectionLabel icon={FileText} step="1">
                  Your CV
                </SectionLabel>
                <FileDropZone
                  onFile={handleCvFile}
                  file={cvFile}
                  parsing={parsingCv}
                  label="Drop your CV here"
                  hint="PDF, DOCX or TXT — click to browse"
                  minHeight={196}
                />
                {cvText && <Hint>✓ {cvWords.toLocaleString()} words extracted</Hint>}
              </div>

              <div>
                <SectionLabel icon={Target} step="2">
                  Job Description
                </SectionLabel>
                <JobDescriptionInput
                  value={jdText}
                  onChange={handleJdTextChange}
                  onFileUpload={handleJdFile}
                  jdFile={jdFile}
                  parsingJd={parsingJd}
                  hideLabel
                />
              </div>
            </div>

            {/* Template (optional) */}
            <div style={{ marginTop: 22 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                <SectionLabel icon={LayoutTemplate} step="3" noMargin>
                  CV Template
                </SectionLabel>
                <span
                  style={{
                    fontSize: 10.5,
                    fontWeight: 700,
                    letterSpacing: 0.3,
                    color: theme.faint,
                    border: `1px solid ${theme.border}`,
                    borderRadius: 20,
                    padding: "2px 9px",
                  }}
                >
                  OPTIONAL
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "stretch", gap: 12, flexWrap: "wrap" }}>
                <div style={{ flex: 1, minWidth: 240 }}>
                  <FileDropZone
                    onFile={handleTemplateFile}
                    file={templateFile}
                    parsing={parsingTemplate}
                    label="Drop a CV template (optional)"
                    hint="Your optimized CV will follow its layout, sections & style"
                  />
                </div>
              </div>
              {templateFile && (
                <button
                  onClick={clearTemplate}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 5,
                    marginTop: 8,
                    background: "transparent",
                    border: "none",
                    color: theme.faint,
                    fontSize: 11.5,
                    cursor: "pointer",
                  }}
                >
                  <X size={12} /> Remove template
                </button>
              )}
            </div>

            {error && (
              <div style={{ marginTop: 18 }}>
                <Banner color={theme.red} icon>
                  {error}
                </Banner>
              </div>
            )}
            {!apiReady && (
              <div style={{ marginTop: 14 }}>
                <Banner color={theme.amber} icon>
                  No ANTHROPIC_API_KEY on the server — you'll get the free deterministic ATS scan only. Add a key
                  to <code>.env</code> for the full recruiter analysis and optimized CV.
                </Banner>
              </div>
            )}

            <button
              className="cta"
              onClick={handleRun}
              disabled={busy}
              style={{
                width: "100%",
                marginTop: 20,
                padding: "16px",
                background: analyzing ? theme.panel2 : theme.gradPrimary,
                color: analyzing ? theme.dim : theme.onPrimary,
                border: "none",
                borderRadius: 14,
                fontSize: 15.5,
                fontWeight: 700,
                fontFamily: theme.fontHead,
                cursor: busy ? "default" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
                boxShadow: analyzing ? "none" : "0 10px 30px rgba(124,108,255,.32)",
              }}
            >
              {analyzing ? (
                <>
                  <Loader2 size={18} className="spin" /> {phase || "Analyzing…"}
                </>
              ) : (
                <>
                  <Zap size={18} /> {result ? "Re-run Analysis" : "Optimize My CV"}
                </>
              )}
            </button>

            {!result && (
              <div
                className="cv-two-col"
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: 10,
                  marginTop: 18,
                }}
              >
                {FEATURES.map((f, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, color: theme.dim, fontSize: 12.5 }}>
                    <f.icon size={15} style={{ color: theme.accent, flexShrink: 0 }} />
                    {f.text}
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <InputsSummary
            cvFile={cvFile}
            cvWords={cvWords}
            jdWords={jdWords}
            templateFile={templateFile}
            onEdit={() => setEditing(true)}
            onRerun={handleRun}
            analyzing={analyzing}
          />
        )}

        {/* Results */}
        {result && (
          <div className="fade" style={{ marginTop: 28 }}>
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
                background: "var(--glass)",
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
                      padding: "12px 16px",
                      border: "none",
                      borderRadius: 10,
                      cursor: "pointer",
                      fontSize: 14,
                      fontWeight: 600,
                      background: active ? theme.gradPrimary : "transparent",
                      color: active ? theme.onPrimary : theme.dim,
                      transition: "all .18s ease",
                    }}
                  >
                    <tab.icon size={16} style={{ color: active ? theme.onPrimary : theme.faint }} />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {activeTab === "report" && <MatchReport result={result} />}
            {activeTab === "ats" && <AtsReport ats={result.ats} tips={result.atsTips} />}
            {activeTab === "cv" && <OptimizedCVView result={result} />}
          </div>
        )}

        <footer style={{ textAlign: "center", color: theme.faint, fontSize: 11.5, marginTop: 40 }}>
          Files are parsed privately in your browser. Analysis runs securely via the server API.
        </footer>
      </div>
    </div>
  );
}

function InputsSummary({ cvFile, cvWords, jdWords, templateFile, onEdit, onRerun, analyzing }) {
  const Item = ({ icon: Icon, label, value }) => (
    <div style={{ display: "flex", alignItems: "center", gap: 9, minWidth: 0 }}>
      <Icon size={16} style={{ color: theme.accent, flexShrink: 0 }} />
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 10.5, color: theme.faint, textTransform: "uppercase", letterSpacing: 0.4 }}>{label}</div>
        <div style={{ fontSize: 13, color: theme.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {value}
        </div>
      </div>
    </div>
  );

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 16,
        background: theme.panel,
        border: `1px solid ${theme.border}`,
        borderRadius: 16,
        padding: "14px 18px",
        boxShadow: theme.shadowSoft,
        flexWrap: "wrap",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 26, flexWrap: "wrap", minWidth: 0 }}>
        <Item icon={FileText} label="CV" value={cvFile?.name || `${cvWords} words`} />
        <Item icon={Target} label="Job Description" value={`${jdWords} words`} />
        <Item icon={LayoutTemplate} label="Template" value={templateFile?.name || "None"} />
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <button
          onClick={onEdit}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            fontSize: 13,
            background: theme.panel2,
            border: `1px solid ${theme.border}`,
            color: theme.text,
            padding: "9px 14px",
            borderRadius: 10,
            cursor: "pointer",
          }}
        >
          <Pencil size={14} /> Edit inputs
        </button>
        <button
          className="cta"
          onClick={onRerun}
          disabled={analyzing}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 7,
            fontSize: 13,
            background: theme.gradPrimary,
            border: "none",
            color: theme.onPrimary,
            padding: "9px 15px",
            borderRadius: 10,
            cursor: analyzing ? "default" : "pointer",
            fontWeight: 700,
          }}
        >
          {analyzing ? <Loader2 size={14} className="spin" /> : <Zap size={14} />} Re-run
        </button>
      </div>
    </div>
  );
}

function SectionLabel({ icon: Icon, step, children, noMargin }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 9,
        marginBottom: noMargin ? 0 : 11,
        fontSize: 13,
        fontWeight: 700,
        color: theme.text,
        fontFamily: theme.fontHead,
      }}
    >
      <span
        style={{
          width: 22,
          height: 22,
          borderRadius: 7,
          background: theme.accentSoft,
          color: theme.accent,
          fontSize: 11.5,
          fontWeight: 700,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {step}
      </span>
      <Icon size={15} style={{ color: theme.accent }} />
      {children}
    </div>
  );
}

function Pill({ icon: Icon, children, accent }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "6px 12px",
        background: accent ? theme.accentSoft : theme.panel2,
        border: `1px solid ${accent ? "rgba(124,108,255,.35)" : theme.border}`,
        borderRadius: 30,
        fontSize: 11.5,
        fontWeight: 600,
        color: accent ? theme.accent : theme.dim,
      }}
    >
      <Icon size={13} /> {children}
    </span>
  );
}

function getInitialThemeMode() {
  if (typeof window === "undefined") return "dark";
  try {
    const saved = localStorage.getItem("cvo-theme");
    if (saved === "light" || saved === "dark") return saved;
  } catch {
    /* storage unavailable — fall through */
  }
  return window.matchMedia?.("(prefers-color-scheme: light)").matches ? "light" : "dark";
}

function ThemeToggle({ mode, onToggle }) {
  const isDark = mode === "dark";
  const Icon = isDark ? Sun : Moon;
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className="lift"
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: 36,
        height: 36,
        borderRadius: 30,
        background: theme.panel2,
        border: `1px solid ${theme.border}`,
        color: theme.dim,
        cursor: "pointer",
      }}
    >
      <Icon size={16} />
    </button>
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
        padding: "12px 15px",
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
