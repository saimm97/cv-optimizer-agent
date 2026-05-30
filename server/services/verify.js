/**
 * Deterministic optimization-integrity verifier.
 *
 * The single biggest risk in an AI CV optimizer is silent fabrication — the
 * model "improving" a resume by inventing metrics, employers, degrees or
 * contact details the candidate never had. This module compares the optimized
 * CV against the ORIGINAL and flags anything materially new, plus verifies that
 * keywords the report claims are "matched" actually appear in the output.
 *
 * It is pure and reproducible, so it works as a safety net regardless of which
 * model produced the text (or whether the AI step ran at all).
 */

const PLACEHOLDER = /\[[^\]]*\]|\bx+%?\b|\bxx+\b/i; // [X], [Y%], XX, etc.

function lower(s) {
  return (s || "").toLowerCase();
}

function findAll(text, regex) {
  return (text.match(regex) || []).map((m) => m.trim());
}

// Concrete metrics: percentages, money, and 2+ digit numbers (optionally with
// k/m/bn or unit words). These are the values most damaging if fabricated.
const METRIC_REGEX =
  /(\$\s?\d[\d,.]*\s?(k|m|bn|billion|million)?|\b\d[\d,.]*\s?%|\b\d{2,}[\d,.]*\s?(k|m|bn|x|users|customers|requests|hours|days|people|engineers|clients|projects|countries|million|billion)?)/gi;

const EMAIL_REGEX = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/gi;
const PHONE_REGEX = /\+?\d[\d\s().-]{7,}\d/g;
const URL_REGEX = /(https?:\/\/[^\s]+|(?:www\.|linkedin\.com|github\.com|gitlab\.com)[^\s]*)/gi;
const YEAR_REGEX = /\b(19|20)\d{2}\b/g;

function normalizeMetric(m) {
  return m.toLowerCase().replace(/\s+/g, "").replace(/,/g, "");
}

/**
 * Items present in the optimized CV but absent from the original.
 */
function newItems(originalText, optimizedText, regex, { normalizer = (x) => x, ignorePlaceholders = false } = {}) {
  const origSet = new Set(findAll(originalText, regex).map(normalizer));
  const out = [];
  const seen = new Set();
  for (const raw of findAll(optimizedText, regex)) {
    if (ignorePlaceholders && PLACEHOLDER.test(raw)) continue;
    const norm = normalizer(raw);
    if (!norm || origSet.has(norm) || seen.has(norm)) continue;
    seen.add(norm);
    out.push(raw);
  }
  return out;
}

/**
 * @param {string} originalCV
 * @param {string} optimizedCV
 * @param {string[]} matchedKeywords
 */
export function verifyOptimization(originalCV, optimizedCV, matchedKeywords = []) {
  if (!optimizedCV || optimizedCV.trim().length < 30) {
    return null; // nothing to verify (e.g. offline mode)
  }

  const flags = [];

  const newMetrics = newItems(originalCV, optimizedCV, METRIC_REGEX, {
    normalizer: normalizeMetric,
    ignorePlaceholders: true,
  }).filter((m) => normalizeMetric(m).replace(/[^0-9]/g, "").length >= 2); // ignore trivial single digits
  if (newMetrics.length) {
    flags.push({
      severity: "high",
      type: "Possible fabricated metric",
      detail: `These figures appear in the optimized CV but not the original — verify they are real or replace with placeholders: ${newMetrics
        .slice(0, 8)
        .join(", ")}`,
    });
  }

  const newEmails = newItems(originalCV, optimizedCV, EMAIL_REGEX, { normalizer: lower });
  const newPhones = newItems(originalCV, optimizedCV, PHONE_REGEX, {
    normalizer: (p) => p.replace(/[^\d]/g, ""),
  });
  if (newEmails.length || newPhones.length) {
    flags.push({
      severity: "high",
      type: "Changed contact details",
      detail: `New contact details not in the original: ${[...newEmails, ...newPhones].slice(0, 5).join(", ")}`,
    });
  }

  const newUrls = newItems(originalCV, optimizedCV, URL_REGEX, { normalizer: lower });
  if (newUrls.length) {
    flags.push({
      severity: "medium",
      type: "New links",
      detail: `Links added that weren't in the original — confirm they're yours: ${newUrls.slice(0, 5).join(", ")}`,
    });
  }

  const newYears = newItems(originalCV, optimizedCV, YEAR_REGEX, {});
  if (newYears.length) {
    flags.push({
      severity: "medium",
      type: "New dates",
      detail: `Dates present in the optimized CV but not the original: ${newYears.slice(0, 6).join(", ")}`,
    });
  }

  // Consistency: every keyword the report claims is matched should actually be
  // present in the optimized CV text.
  const optLower = lower(optimizedCV);
  const unverifiedKeywords = matchedKeywords.filter((k) => k && !optLower.includes(lower(k)));

  // Integrity score: start at 100, penalize by severity and inconsistency.
  let score = 100;
  for (const f of flags) score -= f.severity === "high" ? 18 : 9;
  score -= Math.min(20, unverifiedKeywords.length * 3);
  score = Math.max(0, Math.round(score));

  return {
    score,
    clean: flags.length === 0 && unverifiedKeywords.length === 0,
    flags,
    unverifiedKeywords,
    placeholderCount: findAll(optimizedCV, /\[[^\]]*\]/g).length,
  };
}
