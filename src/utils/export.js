function line(label, value) {
  return `${label}${value}`;
}

export function buildReportText(result) {
  const lines = [
    "CV OPTIMIZATION REPORT",
    "========================",
    "",
    `Overall Match: ${result.matchScore}/100 — ${result.verdict}`,
  ];

  if (result.screening?.decision) {
    lines.push(
      `Screening Decision: ${result.screening.decision} (${result.screening.confidence} confidence)`,
      result.screening.rationale ? `  ${result.screening.rationale}` : ""
    );
  }

  lines.push(
    "",
    "Recruiter Verdict:",
    result.summary,
    "",
    "Sub-scores:",
    line("  Skills Match:      ", result.subScores.skillsMatch),
    line("  Experience Match:  ", result.subScores.experienceMatch),
    line("  Keyword Coverage:  ", result.subScores.keywordCoverage),
    line("  Seniority Fit:     ", result.subScores.seniorityFit),
    line("  Impact / Evidence: ", result.subScores.impactEvidence)
  );

  if (result.ats) {
    lines.push(
      "",
      "ATS SCAN (deterministic):",
      `  ATS Score:         ${result.ats.score}/100`,
      `  Keyword Coverage:  ${result.ats.keywordCoverage}/100`,
      `  Formatting:        ${result.ats.formattingScore}/100`,
      ...(result.ats.formatChecks || []).map(
        (c) => `  [${c.status.toUpperCase()}] ${c.label} — ${c.detail}`
      )
    );
  }

  if (result.requirementsCoverage?.length) {
    lines.push(
      "",
      "REQUIREMENTS COVERAGE:",
      ...result.requirementsCoverage.map(
        (r) => `  [${r.status.toUpperCase()}] (${r.type}) ${r.requirement}${r.evidence ? ` — ${r.evidence}` : ""}`
      )
    );
  }

  lines.push(
    "",
    `Matched Keywords: ${result.matchedKeywords.join(", ")}`,
    `Missing Keywords: ${result.missingKeywords.join(", ")}`,
    "",
    "STRENGTHS:",
    ...result.strengths.map((s) => `  + ${s}`),
    "",
    "GAPS:",
    ...result.gaps.map((s) => `  - ${s}`)
  );

  if (result.redFlags?.length) {
    lines.push("", "RED FLAGS:", ...result.redFlags.map((s) => `  ! ${s}`));
  }

  lines.push(
    "",
    "TAILORED SUMMARY:",
    result.tailoredSummary,
    "",
    "BULLET REWRITES:",
    ...result.bulletRewrites.flatMap((b) => [
      `  Original: ${b.original}`,
      `  Improved: ${b.improved}`,
      `  Why:      ${b.why}`,
      "",
    ])
  );

  if (result.quantificationOpportunities?.length) {
    lines.push("ADD METRICS HERE:", ...result.quantificationOpportunities.map((s) => `  # ${s}`), "");
  }

  lines.push(
    "CHANGES IN OPTIMIZED CV:",
    ...(result.changesSummary || []).map((s) => `  • ${s}`),
    "",
    "ATS TIPS:",
    ...result.atsTips.map((s) => `  • ${s}`),
    "",
    "ACTION PLAN:",
    ...result.actionPlan.map((a, i) =>
      typeof a === "string"
        ? `  ${i + 1}. ${a}`
        : `  ${i + 1}. [${(a.priority || "").toUpperCase()}] ${a.action}${a.impact ? ` — ${a.impact}` : ""}`
    )
  );

  if (result.interviewPrep?.length) {
    lines.push("", "LIKELY INTERVIEW PROBES:", ...result.interviewPrep.map((s) => `  ? ${s}`));
  }

  return lines.filter((l) => l !== undefined).join("\n");
}

export function downloadText(content, filename) {
  const blob = new Blob([content], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function exportReport(result) {
  downloadText(buildReportText(result), "cv-optimization-report.txt");
}

export function exportOptimizedCV(optimizedCV) {
  downloadText(optimizedCV, "optimized-cv.txt");
}
