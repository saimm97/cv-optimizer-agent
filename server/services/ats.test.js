import { describe, it, expect } from "vitest";
import { runAtsAnalysis, __testables } from "./ats.js";
import { normalizeResult } from "./normalize.js";
import { extractJson } from "./anthropic.js";

const { detectSkills, analyzeFormatting } = __testables;

const SAMPLE_CV = `Jane Doe
jane.doe@example.com | +1 555 123 4567 | linkedin.com/in/janedoe

SUMMARY
Senior backend engineer with 6 years building distributed systems.

EXPERIENCE
Acme Corp — Senior Software Engineer (2020 - 2024)
- Led migration to Kubernetes, reducing deploy time by 40%
- Built REST APIs in Python and Node.js serving 2M requests/day
- Mentored 4 junior engineers

EDUCATION
BSc Computer Science, 2018

SKILLS
Python, JavaScript, AWS, Docker, PostgreSQL`;

const SAMPLE_JD = `We are hiring a Senior Backend Engineer.
Requirements:
- 5+ years of experience with Python and AWS
- Strong experience with Kubernetes and Docker
- Experience designing REST APIs and microservices
- TypeScript and React a plus
- Experience with Kafka preferred`;

describe("detectSkills", () => {
  it("collapses aliases to canonical skills", () => {
    const skills = detectSkills("I use k8s, JS and node.js daily");
    expect(skills.has("Kubernetes")).toBe(true);
    expect(skills.has("JavaScript")).toBe(true);
    expect(skills.has("Node.js")).toBe(true);
  });

  it("does not match substrings across word boundaries", () => {
    const skills = detectSkills("I enjoy gardening and javascripting"); // no real 'js' token
    expect(skills.has("JavaScript")).toBe(false);
  });
});

describe("runAtsAnalysis", () => {
  const result = runAtsAnalysis(SAMPLE_CV, SAMPLE_JD);

  it("is deterministic", () => {
    const again = runAtsAnalysis(SAMPLE_CV, SAMPLE_JD);
    expect(again).toEqual(result);
  });

  it("matches skills present in both CV and JD", () => {
    expect(result.matchedKeywords).toContain("Python");
    expect(result.matchedKeywords).toContain("AWS");
    expect(result.matchedKeywords).toContain("Kubernetes");
  });

  it("flags JD skills missing from the CV", () => {
    expect(result.missingKeywords).toContain("TypeScript");
    expect(result.missingKeywords).toContain("Kafka");
  });

  it("produces a bounded ATS score", () => {
    expect(result.atsScore).toBeGreaterThanOrEqual(0);
    expect(result.atsScore).toBeLessThanOrEqual(100);
    expect(result.keywordCoverage).toBeGreaterThan(0);
  });

  it("ranks missing keywords before matched in the table", () => {
    const firstMatchedIndex = result.keywordTable.findIndex((r) => r.matched);
    const firstMissingIndex = result.keywordTable.findIndex((r) => !r.matched);
    if (firstMissingIndex !== -1 && firstMatchedIndex !== -1) {
      expect(firstMissingIndex).toBeLessThan(firstMatchedIndex);
    }
  });
});

describe("analyzeFormatting", () => {
  const fmt = analyzeFormatting(SAMPLE_CV);
  it("detects contact info", () => {
    expect(fmt.hasEmail).toBe(true);
    expect(fmt.hasPhone).toBe(true);
    expect(fmt.hasLinkedIn).toBe(true);
  });
  it("detects sections and bullets", () => {
    expect(fmt.sectionHeaders.experience).toBe(true);
    expect(fmt.sectionHeaders.education).toBe(true);
    expect(fmt.bulletCount).toBeGreaterThanOrEqual(3);
  });
  it("detects quantified bullets", () => {
    expect(fmt.quantifiedBullets).toBeGreaterThan(0);
  });
});

describe("normalizeResult", () => {
  const ats = runAtsAnalysis(SAMPLE_CV, SAMPLE_JD);

  it("fills safe defaults for a near-empty LLM response", () => {
    const r = normalizeResult({}, ats, null);
    expect(r.matchScore).toBe(50);
    expect(r.verdict).toBe("Moderate Match");
    expect(Array.isArray(r.strengths)).toBe(true);
    expect(r.ats.score).toBe(ats.atsScore);
    expect(r.subScores.keywordCoverage).toBe(ats.keywordCoverage);
  });

  it("clamps out-of-range scores", () => {
    const r = normalizeResult({ matchScore: 250, subScores: { skillsMatch: -10 } }, ats, null);
    expect(r.matchScore).toBe(100);
    expect(r.subScores.skillsMatch).toBe(0);
  });

  it("never lets an ATS-missing keyword appear as matched", () => {
    const r = normalizeResult({ matchedKeywords: ["Kafka"] }, ats, null);
    expect(r.matchedKeywords).not.toContain("Kafka");
  });

  it("coerces string action plans into objects", () => {
    const r = normalizeResult({ actionPlan: ["Add metrics"] }, ats, null);
    expect(r.actionPlan[0]).toMatchObject({ action: "Add metrics", priority: "medium" });
  });
});

describe("extractJson", () => {
  it("parses raw JSON", () => {
    expect(extractJson('{"a":1}')).toEqual({ a: 1 });
  });
  it("strips code fences and preamble", () => {
    expect(extractJson('Here you go:\n```json\n{"a":2}\n```')).toEqual({ a: 2 });
  });
  it("handles braces inside strings", () => {
    expect(extractJson('{"note":"use {curly} braces"}')).toEqual({ note: "use {curly} braces" });
  });
});
