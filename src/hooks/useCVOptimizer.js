import { useState, useCallback, useEffect, useRef } from "react";
import { parseFile, MIN_TEXT_LENGTH } from "../utils/fileParser";
import { analyzeCV, checkHealth } from "../services/api";

const MIN_JD_LENGTH = 40;

const PHASES = [
  "Parsing the job description into a hiring rubric…",
  "Running the deterministic ATS keyword scan…",
  "Scoring requirements like a senior recruiter…",
  "Rewriting bullets and tailoring your CV…",
  "Finalizing your report…",
];

export function useCVOptimizer() {
  const [cvFile, setCvFile] = useState(null);
  const [cvText, setCvText] = useState("");
  const [jdText, setJdText] = useState("");
  const [jdFile, setJdFile] = useState(null);
  const [templateFile, setTemplateFile] = useState(null);
  const [templateText, setTemplateText] = useState("");
  const [parsingCv, setParsingCv] = useState(false);
  const [parsingJd, setParsingJd] = useState(false);
  const [parsingTemplate, setParsingTemplate] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [phase, setPhase] = useState("");
  const [apiReady, setApiReady] = useState(true);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [activeTab, setActiveTab] = useState("report");
  const phaseTimer = useRef(null);

  useEffect(() => {
    checkHealth()
      .then((h) => setApiReady(Boolean(h?.hasApiKey)))
      .catch(() => setApiReady(true));
  }, []);

  const handleCvFile = useCallback(async (file) => {
    setError("");
    setParsingCv(true);
    setCvFile(file);
    setResult(null);

    try {
      const text = await parseFile(file);
      if (!text || text.length < MIN_TEXT_LENGTH) {
        throw new Error("Couldn't extract enough text. The PDF may be a scan/image.");
      }
      setCvText(text);
    } catch (err) {
      setError(err.message);
      setCvFile(null);
      setCvText("");
    } finally {
      setParsingCv(false);
    }
  }, []);

  const handleJdFile = useCallback(async (file) => {
    setError("");
    setParsingJd(true);
    setJdFile(file);
    setResult(null);

    try {
      const text = await parseFile(file);
      if (!text || text.length < MIN_JD_LENGTH) {
        throw new Error("Couldn't extract enough text from the job description file.");
      }
      setJdText(text);
    } catch (err) {
      setError(err.message);
      setJdFile(null);
      setJdText("");
    } finally {
      setParsingJd(false);
    }
  }, []);

  const handleJdTextChange = useCallback((text) => {
    setJdText(text);
    setResult(null);
  }, []);

  const handleTemplateFile = useCallback(async (file) => {
    setError("");
    setParsingTemplate(true);
    setTemplateFile(file);
    setResult(null);

    try {
      const text = await parseFile(file);
      if (!text || text.length < 20) {
        throw new Error("Couldn't read this template. Try a different PDF/DOCX/TXT.");
      }
      setTemplateText(text);
    } catch (err) {
      setError(err.message);
      setTemplateFile(null);
      setTemplateText("");
    } finally {
      setParsingTemplate(false);
    }
  }, []);

  const clearTemplate = useCallback(() => {
    setTemplateFile(null);
    setTemplateText("");
    setResult(null);
  }, []);

  const runAnalysis = async () => {
    setError("");
    setResult(null);

    if (!cvText) {
      setError("Please upload your CV first.");
      return;
    }

    if (jdText.trim().length < MIN_JD_LENGTH) {
      setError("Please provide a fuller job description (at least 40 characters).");
      return;
    }

    setAnalyzing(true);

    let i = 0;
    setPhase(PHASES[0]);
    phaseTimer.current = setInterval(() => {
      i = Math.min(i + 1, PHASES.length - 1);
      setPhase(PHASES[i]);
    }, 6000);

    try {
      const analysis = await analyzeCV(cvText, jdText, templateText);
      setResult(analysis);
      setActiveTab("report");
    } catch (err) {
      setError(`Analysis failed: ${err.message}`);
    } finally {
      clearInterval(phaseTimer.current);
      setPhase("");
      setAnalyzing(false);
    }
  };

  return {
    cvFile,
    cvText,
    jdText,
    jdFile,
    templateFile,
    templateText,
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
  };
}
