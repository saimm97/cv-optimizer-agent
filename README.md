# CV Optimizer Agent

Upload your CV and a target job description to get a **recruiter-grade match report**, a **deterministic ATS scan**, and a **fully optimized CV** tailored to the role — as if a Head of Hiring reviewed your profile.

## How it works (the agent pipeline)

The analysis is not a single black-box prompt. It runs as a multi-stage agent so the output is accurate, grounded, and reproducible:

```
CV + JD
   │
   ├─▶ [local]  Deterministic ATS engine   → exact keyword overlap + formatting checks (ground truth)
   ├─▶ [LLM]    JD requirement extraction   → structured must-have / nice-to-have rubric
   │                 (these two run in parallel)
   ▼
[LLM] Grounded analysis + CV rewrite        → reconciled against the ATS findings & rubric
   ▼
[local] Normalize + merge                   → stable schema, ATS authoritative on keywords/formatting
   ▼
Report  •  ATS Scan  •  Optimized CV
```

Why this matters:

- **Accuracy** — keyword matching and formatting are computed by a parser (`server/services/ats.js`), not guessed by the model. The LLM is explicitly grounded against those findings and cannot contradict them.
- **Honest screening** — the report includes a recruiter screening decision (Advance / Phone Screen / Reject), requirement-by-requirement coverage, seniority assessment, and red flags.
- **No fabrication** — the optimizer reframes only real experience and inserts `[X]` placeholders rather than inventing metrics.
- **Resilience** — Claude calls retry on transient errors and self-repair malformed JSON; the output is normalized so the UI never crashes on a missing field.

## Features

- **CV upload** — PDF, DOCX, or TXT (parsed in the browser)
- **Job description input** — paste text or upload a file
- **Match report** — overall + sub-scores, screening decision, requirements coverage, strengths/gaps, red flags, bullet rewrites, quantification opportunities, prioritized action plan, interview probes
- **ATS Scan** — deterministic ATS score, weighted keyword-coverage map, and compatibility checks (contact parseability, sections, bullets, metrics, action verbs, layout)
- **Optimized CV** — complete ATS-safe rewrite aligned to the JD, with copy and download
- **Secure API** — the Anthropic API key stays on the server; basic rate limiting included

## Project Structure

```
cv-optimizer-agent/
├── server/                       # Express API + agent
│   ├── index.js                  # Server entry (also serves built SPA in prod)
│   ├── routes/analyze.js         # POST /api/analyze
│   ├── services/
│   │   ├── pipeline.js           # Orchestrates the agent stages
│   │   ├── ats.js                # Deterministic ATS engine (pure, tested)
│   │   ├── anthropic.js          # Robust Claude client (retry + JSON repair)
│   │   ├── normalize.js          # Output validation / merge
│   │   └── ats.test.js           # Vitest unit tests
│   └── prompts/
│       ├── requirements.js       # Stage 1: JD → rubric
│       └── analysis.js           # Stage 2: grounded analysis + rewrite
├── src/                          # React frontend
└── vite.config.js
```

## Setup

1. Install dependencies:

```bash
npm install
```

2. Copy the environment file and add your Anthropic API key:

```bash
cp .env.example .env
```

3. Start the dev server (frontend + backend):

```bash
npm run dev
```

- Frontend: http://localhost:5173
- API: http://localhost:3001

## Testing

```bash
npm test
```

Unit tests cover the deterministic ATS engine (keyword matching, formatting checks, scoring), the output normalizer, and JSON extraction.

## Production

```bash
npm run build   # builds the SPA into dist/
npm start       # serves the API AND the built SPA on PORT (default 3001)
```

A single process now serves both the API and the static frontend.

## Configuration

| Variable | Default | Purpose |
|----------|---------|---------|
| `ANTHROPIC_API_KEY` | — | Required. Server-side Anthropic key. |
| `PORT` | `3001` | API/SPA port. |
| `ANTHROPIC_MODEL` | `claude-sonnet-4-20250514` | Model used for both agent stages. |
| `ANTHROPIC_MAX_TOKENS` | `8000` | Max output tokens. |
| `ANTHROPIC_TIMEOUT_MS` | `120000` | Per-call timeout. |
| `RATE_LIMIT_PER_MIN` | `20` | Per-IP analyze requests/minute. |
