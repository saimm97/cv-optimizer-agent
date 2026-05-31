import express from "express";
import { optimizeCv } from "../services/pipeline.js";

const router = express.Router();

const MIN_CV_LENGTH = 50;
const MIN_JD_LENGTH = 40;

router.post("/", async (req, res) => {
  try {
    const { cvText, jdText, templateText } = req.body || {};

    if (!cvText || typeof cvText !== "string" || cvText.trim().length < MIN_CV_LENGTH) {
      return res
        .status(400)
        .json({ error: `CV text is required and must be at least ${MIN_CV_LENGTH} characters.` });
    }

    if (!jdText || typeof jdText !== "string" || jdText.trim().length < MIN_JD_LENGTH) {
      return res
        .status(400)
        .json({ error: `Job description is required and must be at least ${MIN_JD_LENGTH} characters.` });
    }

    const template = typeof templateText === "string" ? templateText.trim() : "";
    const result = await optimizeCv(cvText.trim(), jdText.trim(), template);
    res.json(result);
  } catch (err) {
    const status = err?.status && err.status >= 400 && err.status < 600 ? err.status : 500;
    console.error("Analysis error:", err?.message || err);
    res.status(status).json({ error: err?.message || "Analysis failed." });
  }
});

export default router;
