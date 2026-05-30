/**
 * Thin, robust Anthropic Messages client.
 *
 * Responsibilities:
 *  - one place that knows about the API (model, key, headers, timeouts)
 *  - resilient JSON extraction from model output
 *  - retry with backoff on transient (429/5xx/network) failures
 *  - one repair retry if the model returns text that doesn't parse as JSON
 */

const DEFAULT_MODEL = "claude-sonnet-4-20250514";
const API_URL = "https://api.anthropic.com/v1/messages";

export class AnthropicError extends Error {
  constructor(message, status) {
    super(message);
    this.name = "AnthropicError";
    this.status = status;
  }
}

function getConfig() {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new AnthropicError("ANTHROPIC_API_KEY is not configured on the server.", 500);
  }
  return {
    apiKey,
    model: process.env.ANTHROPIC_MODEL || DEFAULT_MODEL,
    maxTokens: Number(process.env.ANTHROPIC_MAX_TOKENS) || 8000,
    timeoutMs: Number(process.env.ANTHROPIC_TIMEOUT_MS) || 120000,
  };
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * Extract a JSON object from arbitrary model text. Strips code fences and
 * slices to the outermost balanced braces, which tolerates accidental preamble.
 */
export function extractJson(text) {
  let cleaned = text
    .replace(/^[\s\S]*?```(?:json)?\s*/i, (m) => (m.includes("```") ? "" : m))
    .replace(/```\s*$/i, "")
    .trim();

  const first = cleaned.indexOf("{");
  if (first === -1) throw new SyntaxError("No JSON object found in model output.");

  // Walk braces to find the matching close, ignoring braces inside strings.
  let depth = 0;
  let inString = false;
  let escaped = false;
  for (let i = first; i < cleaned.length; i++) {
    const ch = cleaned[i];
    if (escaped) {
      escaped = false;
      continue;
    }
    if (ch === "\\") {
      escaped = true;
      continue;
    }
    if (ch === '"') inString = !inString;
    if (inString) continue;
    if (ch === "{") depth++;
    if (ch === "}") {
      depth--;
      if (depth === 0) {
        return JSON.parse(cleaned.slice(first, i + 1));
      }
    }
  }
  // Fallback: last brace.
  const last = cleaned.lastIndexOf("}");
  return JSON.parse(cleaned.slice(first, last + 1));
}

async function rawCall({ system, message, model, maxTokens, apiKey, timeoutMs }) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model,
        max_tokens: maxTokens,
        system,
        messages: [{ role: "user", content: message }],
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new AnthropicError(
        `Anthropic API error ${response.status}: ${errorText.slice(0, 300)}`,
        response.status
      );
    }

    const data = await response.json();
    return data.content
      .filter((block) => block.type === "text")
      .map((block) => block.text)
      .join("\n")
      .trim();
  } finally {
    clearTimeout(timeout);
  }
}

function isRetryable(err) {
  if (err.name === "AbortError") return true;
  if (err instanceof AnthropicError) return err.status === 429 || (err.status >= 500 && err.status < 600);
  return true; // network-level errors
}

/**
 * Call Claude and parse a JSON object out of the response.
 * Retries transient failures, and does one "repair" pass if parsing fails.
 */
export async function callClaudeJson({ system, message, label = "request" }) {
  const cfg = getConfig();
  const maxAttempts = 3;

  let lastErr;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const text = await rawCall({ ...cfg, system, message });
      try {
        return extractJson(text);
      } catch (parseErr) {
        // One targeted repair attempt: ask the model to return strict JSON only.
        const repaired = await rawCall({
          ...cfg,
          system: "You convert text into a single strict, valid JSON object. Output ONLY the JSON object, no prose, no code fences.",
          message: `Return ONLY the JSON object contained in or described by the following text:\n\n${text}`,
        });
        return extractJson(repaired);
      }
    } catch (err) {
      lastErr = err;
      if (attempt < maxAttempts && isRetryable(err)) {
        await sleep(500 * attempt * attempt);
        continue;
      }
      break;
    }
  }
  throw new AnthropicError(`${label} failed: ${lastErr?.message || "unknown error"}`, lastErr?.status);
}

export function hasApiKey() {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

export function activeModel() {
  return process.env.ANTHROPIC_MODEL || DEFAULT_MODEL;
}
