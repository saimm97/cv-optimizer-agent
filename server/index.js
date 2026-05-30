import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "node:path";
import { fileURLToPath } from "node:url";
import fs from "node:fs";
import analyzeRouter from "./routes/analyze.js";
import { hasApiKey, activeModel } from "./services/anthropic.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: "2mb" }));

// Lightweight request logging.
app.use((req, _res, next) => {
  if (req.path.startsWith("/api")) {
    console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
  }
  next();
});

// Very small in-memory rate limiter for the analyze endpoint (per IP).
const RATE_WINDOW_MS = 60_000;
const RATE_MAX = Number(process.env.RATE_LIMIT_PER_MIN) || 20;
const hits = new Map();
app.use("/api/analyze", (req, res, next) => {
  const ip = req.ip || req.socket.remoteAddress || "unknown";
  const now = Date.now();
  const entry = hits.get(ip) || { count: 0, reset: now + RATE_WINDOW_MS };
  if (now > entry.reset) {
    entry.count = 0;
    entry.reset = now + RATE_WINDOW_MS;
  }
  entry.count += 1;
  hits.set(ip, entry);
  if (entry.count > RATE_MAX) {
    return res.status(429).json({ error: "Too many requests. Please wait a moment and try again." });
  }
  next();
});

app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    hasApiKey: hasApiKey(),
    model: activeModel(),
  });
});

app.use("/api/analyze", analyzeRouter);

// In production, serve the built SPA from the same server so there is a single
// deployable artifact (the original setup required a separate static server).
const distDir = path.join(ROOT, "dist");
if (fs.existsSync(distDir)) {
  app.use(express.static(distDir));
  app.get(/^(?!\/api).*/, (_req, res) => {
    res.sendFile(path.join(distDir, "index.html"));
  });
}

app.listen(PORT, () => {
  console.log(`CV Optimizer API running on http://localhost:${PORT}`);
  if (!hasApiKey()) {
    console.warn("⚠  ANTHROPIC_API_KEY is not set — analysis requests will fail.");
  }
});
