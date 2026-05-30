/**
 * No-key / offline fallback.
 *
 * When there is no ANTHROPIC_API_KEY (or the LLM stage fails), we still produce
 * a genuinely useful report from the deterministic ATS engine alone — keyword
 * coverage, formatting checks, and rule-based suggestions. This means the
 * product never hard-fails; it just degrades to "ATS scan" mode.
 *
 * The LLM-only deliverables (recruiter narrative, bullet rewrites, fully
 * optimized CV) are intentionally left empty and the UI flags the limited mode.
 */
import { normalizeResult } from "./normalize.js";

function verdictForScore(score) {
  if (score >= 80) return "Strong Match";
  if (score >= 65) return "Good Match";
  if (score >= 50) return "Moderate Match";
  if (score >= 35) return "Weak Match";
  return "Poor Match";
}

function screeningForScore(score) {
  if (score >= 70) return { decision: "Advance to Interview", confidence: "Low" };
  if (score >= 50) return { decision: "Maybe / Phone Screen", confidence: "Low" };
  return { decision: "Likely Reject", confidence: "Low" };
}

export function buildHeuristicResult(ats, { reason } = {}) {
  const score = ats.atsScore;
  const high = ats.keywordTable.filter((k) => k.importance === "high");
  const missingHigh = high.filter((k) => !k.matched).map((k) => k.keyword);
  const matchedHigh = high.filter((k) => k.matched).map((k) => k.keyword);

  const failed = ats.formatChecks.filter((c) => c.status === "fail");
  const warned = ats.formatChecks.filter((c) => c.status === "warn");
  const passed = ats.formatChecks.filter((c) => c.status === "pass");

  // Synthesize strengths from objective signals.
  const strengths = [];
  if (ats.matchedKeywords.length) {
    strengths.push(
      `Your CV already contains ${ats.matchedKeywords.length} of the job's key terms${
        matchedHigh.length ? ` (including high-priority: ${matchedHigh.slice(0, 5).join(", ")})` : ""
      }.`
    );
  }
  passed.slice(0, 3).forEach((c) => strengths.push(`${c.label}: ${c.detail}`));

  // Synthesize gaps from objective signals.
  const gaps = [];
  if (missingHigh.length) {
    gaps.push(`Missing high-importance keywords from the JD: ${missingHigh.join(", ")}.`);
  } else if (ats.missingKeywords.length) {
    gaps.push(`Missing some JD keywords: ${ats.missingKeywords.slice(0, 8).join(", ")}.`);
  }
  failed.forEach((c) => gaps.push(`${c.label}: ${c.detail}`));

  // ATS tips from anything that isn't a clean pass.
  const atsTips = [...failed, ...warned].map((c) => c.detail);

  // Prioritized, rule-based action plan.
  const actionPlan = [];
  if (missingHigh.length) {
    actionPlan.push({
      action: `Weave these high-priority keywords into your CV where you have real experience: ${missingHigh.join(", ")}.`,
      priority: "high",
      impact: "Directly raises ATS keyword coverage and recruiter match.",
    });
  }
  failed.forEach((c) =>
    actionPlan.push({ action: `Fix: ${c.label}. ${c.detail}`, priority: "high", impact: "Improves ATS parseability." })
  );
  warned.forEach((c) =>
    actionPlan.push({ action: `Improve: ${c.label}. ${c.detail}`, priority: "medium", impact: "Strengthens recruiter impression." })
  );
  if (ats.missingKeywords.length && !missingHigh.length) {
    actionPlan.push({
      action: `Consider adding relevant JD terms you can back up: ${ats.missingKeywords.slice(0, 8).join(", ")}.`,
      priority: "medium",
      impact: "Broadens keyword coverage.",
    });
  }

  const quantRate = ats.stats.bulletCount ? ats.stats.quantifiedBullets / ats.stats.bulletCount : 0;
  const impactEvidence = Math.round(Math.min(100, quantRate * 100 + 20));

  const llmLike = {
    matchScore: score,
    verdict: verdictForScore(score),
    summary:
      "Offline ATS-only assessment (no AI key configured). This score reflects keyword coverage against the job description and resume formatting. Add an ANTHROPIC_API_KEY to unlock the full recruiter analysis, bullet rewrites, and a tailored optimized CV.",
    screening: {
      ...screeningForScore(score),
      rationale: "Heuristic estimate from keyword overlap and formatting only — not a recruiter judgment.",
    },
    subScores: {
      skillsMatch: ats.keywordCoverage,
      experienceMatch: ats.keywordCoverage,
      keywordCoverage: ats.keywordCoverage,
      seniorityFit: ats.keywordCoverage,
      impactEvidence,
    },
    strengths,
    gaps,
    redFlags: [],
    bulletRewrites: [],
    quantificationOpportunities:
      quantRate < 0.4
        ? ["Several bullets lack numbers — add scale, %, $ or time-saved wherever you can quantify impact."]
        : [],
    tailoredSummary: "",
    optimizedCV: "",
    changesSummary: [],
    atsTips,
    actionPlan,
    interviewPrep: [],
  };

  const result = normalizeResult(llmLike, ats, null);
  result.degraded = true;
  result.notice =
    reason === "llm-failed"
      ? "The AI analysis step failed, so this is a deterministic ATS-only report. Bullet rewrites and the optimized CV are unavailable."
      : "No AI key is configured, so this is a free deterministic ATS-only report. Add an ANTHROPIC_API_KEY for the full recruiter analysis and an optimized CV.";
  return result;
}
