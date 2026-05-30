/**
 * Defensive normalization of the agent's output.
 *
 * The UI must never crash on a missing/oddly-typed field, and the deterministic
 * ATS findings should be authoritative for the keyword/formatting parts of the
 * report. This module coerces the LLM JSON into a stable, fully-populated shape
 * and merges in the ATS engine results.
 */

const clampScore = (v, fallback = 0) => {
  const n = Number(v);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(0, Math.min(100, Math.round(n)));
};

const asArray = (v) => (Array.isArray(v) ? v : v == null ? [] : [v]);
const asString = (v, fallback = "") => (typeof v === "string" ? v : v == null ? fallback : String(v));

const VERDICTS = ["Strong Match", "Good Match", "Moderate Match", "Weak Match", "Poor Match"];

function normalizeBulletRewrites(raw) {
  return asArray(raw)
    .map((b) => ({
      original: asString(b?.original),
      improved: asString(b?.improved),
      why: asString(b?.why),
    }))
    .filter((b) => b.original && b.improved);
}

function normalizeRequirements(raw) {
  return asArray(raw)
    .map((r) => ({
      requirement: asString(r?.requirement),
      type: ["must-have", "nice-to-have"].includes(r?.type) ? r.type : "must-have",
      status: ["met", "partial", "missing"].includes(r?.status) ? r.status : "partial",
      evidence: asString(r?.evidence),
    }))
    .filter((r) => r.requirement);
}

function normalizeActionPlan(raw) {
  return asArray(raw)
    .map((a) => {
      if (typeof a === "string") return { action: a, priority: "medium", impact: "" };
      return {
        action: asString(a?.action),
        priority: ["high", "medium", "low"].includes(a?.priority) ? a.priority : "medium",
        impact: asString(a?.impact),
      };
    })
    .filter((a) => a.action);
}

/**
 * @param {object} llm     parsed LLM analysis output (may be partial)
 * @param {object} ats     result of runAtsAnalysis()
 * @param {object} reqs    result of stage-1 requirement extraction (may be null)
 */
export function normalizeResult(llm = {}, ats = null, reqs = null) {
  const sub = llm.subScores || {};

  const result = {
    matchScore: clampScore(llm.matchScore, 50),
    verdict: VERDICTS.includes(llm.verdict) ? llm.verdict : "Moderate Match",
    summary: asString(llm.summary, "Analysis completed."),

    screening: {
      decision: asString(llm.screening?.decision, "Maybe / Phone Screen"),
      confidence: ["High", "Medium", "Low"].includes(llm.screening?.confidence)
        ? llm.screening.confidence
        : "Medium",
      rationale: asString(llm.screening?.rationale),
    },

    subScores: {
      skillsMatch: clampScore(sub.skillsMatch, 50),
      experienceMatch: clampScore(sub.experienceMatch, 50),
      // Deterministic keyword coverage wins when available.
      keywordCoverage: ats ? ats.keywordCoverage : clampScore(sub.keywordCoverage, 50),
      seniorityFit: clampScore(sub.seniorityFit, 50),
      impactEvidence: clampScore(sub.impactEvidence, 50),
    },

    seniorityAssessment: {
      jdLevel: asString(llm.seniorityAssessment?.jdLevel, reqs?.seniorityLevel || ""),
      candidateLevel: asString(llm.seniorityAssessment?.candidateLevel),
      note: asString(llm.seniorityAssessment?.note),
    },

    requirementsCoverage: normalizeRequirements(llm.requirementsCoverage),

    // Keyword lists: deterministic engine is authoritative; LLM can add extras.
    matchedKeywords: ats
      ? mergeKeywords(ats.matchedKeywords, llm.matchedKeywords, ats.missingKeywords)
      : asArray(llm.matchedKeywords).map(String),
    missingKeywords: ats ? ats.missingKeywords : asArray(llm.missingKeywords).map(String),

    strengths: asArray(llm.strengths).map(String).filter(Boolean),
    gaps: asArray(llm.gaps).map(String).filter(Boolean),
    redFlags: asArray(llm.redFlags).map(String).filter(Boolean),

    bulletRewrites: normalizeBulletRewrites(llm.bulletRewrites),
    quantificationOpportunities: asArray(llm.quantificationOpportunities).map(String).filter(Boolean),

    tailoredSummary: asString(llm.tailoredSummary),
    optimizedCV: asString(llm.optimizedCV || llm.tailoredSummary),
    changesSummary: asArray(llm.changesSummary).map(String).filter(Boolean),

    atsTips: asArray(llm.atsTips).map(String).filter(Boolean),
    actionPlan: normalizeActionPlan(llm.actionPlan),
    interviewPrep: asArray(llm.interviewPrep).map(String).filter(Boolean),

    // Deterministic ATS report block for the UI.
    ats: ats
      ? {
          score: ats.atsScore,
          keywordCoverage: ats.keywordCoverage,
          formattingScore: ats.formattingScore,
          keywordTable: ats.keywordTable,
          formatChecks: ats.formatChecks,
          stats: ats.stats,
        }
      : null,

    requirements: reqs || null,
    integrity: null,
  };

  return result;
}

// Keep LLM-only matched keywords that the parser didn't catch, but never let a
// keyword the parser marked as "missing" sneak into "matched".
function mergeKeywords(atsMatched, llmMatched, atsMissing) {
  const out = new Set(atsMatched);
  const missingLower = new Set(atsMissing.map((k) => k.toLowerCase()));
  for (const k of asArray(llmMatched).map(String)) {
    if (!missingLower.has(k.toLowerCase())) out.add(k);
  }
  return [...out];
}
