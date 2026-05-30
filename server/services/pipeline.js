/**
 * The CV optimization agent pipeline.
 *
 * Stages:
 *   1. (local)  Deterministic ATS analysis  — exact keyword/format ground truth
 *   1. (LLM)    JD requirement extraction    — structured hiring rubric
 *      ^ these two run in parallel
 *   2. (LLM)    Grounded analysis + rewrite  — uses (1) as context
 *   3. (local)  Normalize + merge            — stable shape, ATS authoritative
 *
 * Splitting requirement extraction from the main analysis, and grounding the
 * analysis in deterministic findings, is what makes the output materially more
 * accurate and recruiter-like than a single unconstrained prompt.
 */
import { callClaudeJson, hasApiKey } from "./anthropic.js";
import { runAtsAnalysis } from "./ats.js";
import { normalizeResult } from "./normalize.js";
import { buildHeuristicResult } from "./heuristics.js";
import { verifyOptimization } from "./verify.js";
import { REQUIREMENTS_SYSTEM_PROMPT, buildRequirementsMessage } from "../prompts/requirements.js";
import { SYSTEM_PROMPT, buildAnalysisMessage } from "../prompts/analysis.js";

async function extractRequirements(jdText) {
  try {
    return await callClaudeJson({
      system: REQUIREMENTS_SYSTEM_PROMPT,
      message: buildRequirementsMessage(jdText),
      label: "JD requirement extraction",
    });
  } catch {
    // Non-fatal: the analysis stage can still derive requirements itself.
    return null;
  }
}

export async function optimizeCv(cvText, jdText) {
  // The deterministic ATS scan always runs — it needs no API key.
  const atsFindings = runAtsAnalysis(cvText, jdText);

  // No key → free, offline ATS-only report instead of failing.
  if (!hasApiKey()) {
    return buildHeuristicResult(atsFindings, { reason: "no-key" });
  }

  try {
    // Stage 1: requirement extraction (LLM).
    const requirements = await extractRequirements(jdText);

    // Stage 2: grounded analysis + optimized CV.
    const llm = await callClaudeJson({
      system: SYSTEM_PROMPT,
      message: buildAnalysisMessage(cvText, jdText, requirements, atsFindings),
      label: "CV analysis",
    });

    // Stage 3: normalize + merge (ATS authoritative on keywords/formatting).
    const result = normalizeResult(llm, atsFindings, requirements);

    // Stage 4: deterministic integrity check on the optimized CV.
    result.integrity = verifyOptimization(cvText, result.optimizedCV, result.matchedKeywords);

    return result;
  } catch (err) {
    // The AI step failed (rate limit, outage, bad key). Rather than 500-ing,
    // degrade to the deterministic report so the user still gets value.
    console.error("LLM stage failed, falling back to ATS-only report:", err?.message || err);
    return buildHeuristicResult(atsFindings, { reason: "llm-failed" });
  }
}
